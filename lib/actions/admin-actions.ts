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

export async function createOfflineBooking(userId: string | null, slotId: string, duration?: number, startTime?: string) {
    const slot = await prisma.slot.findUnique({
        where: { id: slotId },
    });

    if (!slot) throw new Error("Slot not found");

    await (prisma.booking as any).create({
        data: {
            userId: (userId || null) as any, // Now optional in schema
            slotId,
            date: new Date(),
            startTime: startTime || slot.startTime,
            duration: duration || slot.duration,
            type: slot.type,
            status: "Upcoming",
            source: BookingSource.OFFLINE,
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
        // Set to end of current month
        const now = new Date();
        expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    await (prisma.membership as any).upsert({
        where: { userId },
        update: { isSubscriber, expiresAt },
        create: { userId, isSubscriber, tier: "Gold", expiresAt },
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
    maintenanceMode?: boolean;
}) {
    await (prisma as any).systemSettings.update({
        where: { id: "global" },
        data,
    });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
}
