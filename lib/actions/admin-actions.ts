"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, BookingSource, Platform } from "@prisma/client";

export async function updateBookingStatus(
    id: string,
    status: string,
    totalPrice?: number,
    paymentMethod?: string
) {
    try {
        // 1. Update status via ORM
        await prisma.booking.update({
            where: { id },
            data: { status }
        });

        // 2. Direct SQL update for potentially out-of-sync fields
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
            // Try 12h format first
            if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
                const date = parse(timeStr.toUpperCase(), "hh:mm a", new Date());
                if (!isNaN(date.getTime())) return date.getHours() * 60 + date.getMinutes();
            }
            // Try 24h format
            const date = parse(timeStr, "HH:mm", new Date());
            if (!isNaN(date.getTime())) return date.getHours() * 60 + date.getMinutes();

            // Fallback: manual split
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
    console.log(`[BOOKING DEBUG] Server Time: ${format(serverNow, "HH:mm")}, Attempt: ${bookingStartTimeStr} (${bookingStartVal}m), Duration: ${bookingDuration}m`);

    if (!force && (bookingStartVal < slotStartVal || bookingEndVal > slotEndVal)) {
        throw new Error(`Booking must fit within slot window (${slot.startTime} - ${slot.endTime})`);
    }

    // 3. Conflict Rules: No partial overlaps
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

        // Check for overlap [start, end]
        // True overlap: (StartA < EndB) && (EndA > StartB)
        if (bookingStartVal < bEndVal && bookingEndVal > bStartVal) {
            console.warn(`[CONFLICT] ID: ${b.id}, Attempt: ${bookingStartVal}-${bookingEndVal}, Existing: ${bStartVal}-${bEndVal}`);
            if (!force) {
                const conflictTime = b.startTime || "another session";
                throw new Error(`Time conflict with session at ${conflictTime} (${b.duration} mins)`);
            }
        }
    }
    // Even when you selected "Start @ {time}", the server was saving the session's main date field as "Right Now". Because the system looks at that date to decide if a session is active, it would immediately mark the booking as "In Progress" because "Now" is technically within the start/end window of a session you just created.


    // Final Date calculation: Combine today's date with the chosen start time
    const finalDate = new Date();
    const [h, m] = [Math.floor(bookingStartVal / 60), bookingStartVal % 60];
    finalDate.setHours(h, m, 0, 0);

    await (prisma.booking as any).create({
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
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
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
        // Set to one month from today minus one day
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
