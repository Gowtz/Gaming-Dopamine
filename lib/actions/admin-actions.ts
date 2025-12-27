"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, BookingSource, Platform } from "@prisma/client";
import { Users, DollarSign, CalendarCheck, Gamepad2 } from "lucide-react";

export async function getAdminDashboardData() {
    try {
        const now = new Date();

        // 1. Parallel Fetching for Efficiency
        const [
            // Stats
            userCount,
            activeBookingsCount,
            totalRevenueAgg,

            // Lists
            finishedSessions, // "Completed" status in DB
            allUpcomingBookings, // "Upcoming" status (includes currently running and future)
            users,
            slots, // Available slots
            allSlots,
            games,
            historyBookings
        ] = await Promise.all([
            prisma.user.count({ where: { role: "USER" } }),
            prisma.booking.count({ where: { status: "Upcoming" } }),
            prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: { status: "Completed" }
            }),
            prisma.booking.findMany({
                where: { status: "Completed" },
                include: { slot: true }
            }),
            prisma.booking.findMany({
                where: { status: "Upcoming" },
                include: {
                    user: {
                        select: {
                            id: true, name: true, email: true, image: true,
                            membership: { select: { isSubscriber: true, totalHours: true, utilizedHours: true } }
                        }
                    },
                    slot: true
                },
                orderBy: { date: 'asc' }
            }),
            prisma.user.findMany({
                include: {
                    membership: true,
                    bookings: { take: 1, orderBy: { createdAt: 'desc' } }
                }
            }),
            prisma.slot.findMany({ where: { status: "AVAILABLE" } }),
            prisma.slot.findMany({ orderBy: { startTime: 'asc' } }),
            prisma.game.findMany({ orderBy: { title: 'asc' } }),
            prisma.booking.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: { user: true, slot: true }
            })
        ]);

        // 2. Calculate Revenue
        const totalRevenue = finishedSessions.reduce((acc, booking) => {
            const price = (booking as any).totalPrice !== null ? Number((booking as any).totalPrice) : 0;
            if (price > 0) return acc + price;

            // Fallback estimation
            const pricePerHour = booking.slot?.price || 100;
            return acc + Math.ceil((booking.duration / 60) * pricePerHour);
        }, 0);

        const slotUtilization = 68; // Mock/Calculation

        // 3. Process Bookings Lists
        const activeSlots = allUpcomingBookings.filter(booking => {
            const startTime = new Date(booking.date);
            const endTime = new Date(booking.date);
            endTime.setMinutes(endTime.getMinutes() + booking.duration);
            return startTime <= now && endTime > now;
        });

        const finishedSlots = allUpcomingBookings.filter(booking => {
            const endTime = new Date(booking.date);
            endTime.setMinutes(endTime.getMinutes() + booking.duration);
            return endTime <= now;
        });

        const upcomingSlots = allUpcomingBookings.filter(booking => {
            const startTime = new Date(booking.date);
            return startTime > now;
        });

        const recentBookings = historyBookings.slice(0, 7);

        return {
            stats: [
                { label: "Total Players", value: userCount, desc: "+12% from last month", iconName: "Users" },
                { label: "Upcoming Bookings", value: activeBookingsCount, desc: "+5% from last week", iconName: "CalendarCheck" },
                { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, desc: "+18% from last month", iconName: "DollarSign" },
                { label: "Slot Utilization", value: `${slotUtilization}%`, desc: "-2% from last hour", iconName: "Gamepad2" },
            ],
            totalPlayers: userCount,
            activeBookings: activeBookingsCount,
            totalRevenue: `₹${totalRevenue.toFixed(2)}`,
            slotUtilization,
            activeSlots,
            finishedSlots,
            upcomingSlots,
            recentBookings,
            users,
            slots: allSlots, // Passing ALL slots to store as 'slots'
            games,
            historyBookings
        };

    } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
        throw new Error("Failed to load dashboard data");
    }
}

export async function updateBookingStatus(
    id: string,
    status: string,
    totalPrice?: number,
    paymentMethod?: string
) {
    try {
        await prisma.booking.update({
            where: { id },
            data: { status }
        });

        if (totalPrice !== undefined && paymentMethod !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "totalPrice" = $1, "paymentMethod" = $2 WHERE id = $3`, totalPrice, paymentMethod, id);
        } else if (totalPrice !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "totalPrice" = $1 WHERE id = $2`, totalPrice, id);
        } else if (paymentMethod !== undefined) {
            await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "paymentMethod" = $1 WHERE id = $2`, paymentMethod, id);
        }
    } catch (err: any) {
        console.error(`[PAYMENT ERROR] Update failed: ${err.message}`);
        throw err;
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
}

export async function deleteBooking(id: string) {
    await prisma.booking.delete({
        where: { id },
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
}

import { format, parse, addMinutes, isAfter, isBefore } from "date-fns";

export async function createOfflineBooking(
    userId: string | null,
    slotId: string,
    duration?: number,
    startTime?: string,
    source: BookingSource = BookingSource.OFFLINE,
    force: boolean = false
) {
    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
    });

    if (!slot) throw new Error("Slot not found");

    const bookingStartTimeStr = startTime || (source === BookingSource.OFFLINE ? format(new Date(), "HH:mm") : slot.startTime);
    const bookingDuration = duration || slot.duration;

    const parseTimeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        try {
            if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
                const date = parse(timeStr.toUpperCase(), "hh:mm a", new Date());
                if (!isNaN(date.getTime())) return date.getHours() * 60 + date.getMinutes();
            }
            const date = parse(timeStr, "HH:mm", new Date());
            if (!isNaN(date.getTime())) return date.getHours() * 60 + date.getMinutes();

            const clean = timeStr.replace(/[^0-9:]/g, '');
            const [h, m] = clean.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        } catch (e) {
            console.error(`Failed to parse time: ${timeStr}`, e);
            return 0;
        }
    };

    const slotStartVal = parseTimeToMinutes(slot.startTime);
    const slotEndVal = parseTimeToMinutes(slot.endTime);
    const bookingStartVal = parseTimeToMinutes(bookingStartTimeStr);
    const bookingEndVal = bookingStartVal + bookingDuration;

    const serverNow = new Date();

    if (!force && (bookingStartVal < slotStartVal || bookingEndVal > slotEndVal)) {
        throw new Error(`Booking must fit within slot window (${slot.startTime} - ${slot.endTime})`);
    }

    const existingBookings = await prisma.booking.findMany({
        where: {
            slotId,
            date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        },
    });

    for (const b of existingBookings) {
        if (b.status !== "Upcoming") continue;

        const bStartVal = parseTimeToMinutes(b.startTime as string);
        const bEndVal = bStartVal + b.duration;

        if (bookingStartVal < bEndVal && bookingEndVal > bStartVal) {
            if (!force) {
                const conflictTime = b.startTime || "another session";
                throw new Error(`Time conflict with session at ${conflictTime} (${b.duration} mins)`);
            }
        }
    }

    const finalDate = new Date();
    const [h, m] = [Math.floor(bookingStartVal / 60), bookingStartVal % 60];
    finalDate.setHours(h, m, 0, 0);

    const booking = await (prisma.booking as any).create({
        data: {
            userId: (userId || null) as any,
            slotId,
            date: finalDate,
            startTime: bookingStartTimeStr,
            duration: bookingDuration,
            type: slot.type,
            status: "Upcoming",
            source: source,
        },
        include: {
            user: {
                select: {
                    id: true, name: true, email: true, image: true,
                    membership: { select: { isSubscriber: true, totalHours: true, utilizedHours: true } }
                }
            },
            slot: true
        }
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return booking;
}

export async function updateUserRole(userId: string, role: Role) {
    await prisma.user.update({
        where: { id: userId },
        data: { role },
    });
    revalidatePath("/admin/players");
    revalidatePath("/admin");
}

export async function toggleUserBlock(userId: string, isBlocked: boolean) {
    await prisma.user.update({
        where: { id: userId },
        data: { isBlocked },
    });
    revalidatePath("/admin/players");
    revalidatePath("/admin");
}

export async function toggleUserSubscription(userId: string, isSubscriber: boolean) {
    let expiresAt = null;
    if (isSubscriber) {
        const now = new Date();
        expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() - 1, 23, 59, 59);
    }

    await (prisma.membership as any).upsert({
        where: { userId },
        update: { isSubscriber, expiresAt, totalHours: isSubscriber ? 50 : 0 },
        create: { userId, isSubscriber, tier: "Gold", expiresAt, totalHours: isSubscriber ? 50 : 0 },
    });
    revalidatePath("/admin/players");
    revalidatePath("/admin");
    revalidatePath("/profile");
}

export async function deleteUser(userId: string) {
    await prisma.user.delete({
        where: { id: userId },
    });
    revalidatePath("/admin/players");
    revalidatePath("/admin");
}

export async function addGame(data: { title: string; image: string; genre: string; platform: Platform }) {
    const game = await prisma.game.create({
        data,
    });
    revalidatePath("/admin/games");
    return game;
}

export async function deleteGame(id: string) {
    await prisma.game.delete({
        where: { id },
    });
    revalidatePath("/admin/games");
}

export async function getSettings() {
    return await (prisma as any).systemSettings.upsert({
        where: { id: "global" },
        update: {},
        create: { id: "global" },
    });
}

export async function updateSettings(data: {
    siteName?: string;
    supportEmail?: string;
    maintenanceMode?: boolean;
    emailNotifications?: boolean;
}) {
    await (prisma as any).systemSettings.update({
        where: { id: "global" },
        data,
    });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
}
