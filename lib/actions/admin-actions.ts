"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, BookingSource, Platform } from "@prisma/client";

export async function updateBookingStatus(id: string, status: string) {
    await prisma.booking.update({
        where: { id },
        data: { status },
    });
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

export async function createOfflineBooking(userId: string | null, slotId: string, duration?: number, startTime?: string, source: BookingSource = BookingSource.OFFLINE) {
    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
    });

    if (!slot) throw new Error("Slot not found");

    const bookingStartTimeStr = startTime || slot.startTime;
    const bookingDuration = duration || slot.duration;

    // 1. Validation: Skipped for Admin (Start Now)
    const now = new Date();
    const [startH, startM] = bookingStartTimeStr.split(':').map(Number);
    // Validation removed to allow backfilling/start-now

    // 2. Validation: Must fit within slot timing
    const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number);
    const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);

    const slotStartVal = slotStartH * 60 + slotStartM;
    const slotEndVal = slotEndH * 60 + slotEndM;
    const bookingStartVal = startH * 60 + startM;
    const bookingEndVal = bookingStartVal + bookingDuration;

    if (bookingStartVal < slotStartVal || bookingEndVal > slotEndVal) {
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
            status: "Upcoming",
        },
    });

    for (const b of existingBookings) {
        const [bStartH, bStartM] = (b.startTime as string).split(':').map(Number);
        const bStartVal = bStartH * 60 + bStartM;
        const bEndVal = bStartVal + b.duration;

        // Check for overlap [start, end]
        if (
            (bookingStartVal >= bStartVal && bookingStartVal < bEndVal) ||
            (bookingEndVal > bStartVal && bookingEndVal <= bEndVal) ||
            (bookingStartVal <= bStartVal && bookingEndVal >= bEndVal)
        ) {
            throw new Error("Time conflict: This range overlaps with an existing booking.");
        }
    }

    await (prisma.booking as any).create({
        data: {
            userId: (userId || null) as any,
            slotId,
            date: new Date(),
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
