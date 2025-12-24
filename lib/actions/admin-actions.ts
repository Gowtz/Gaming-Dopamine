"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

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

export async function updateUserRole(userId: string, role: Role) {
    await prisma.user.update({
        where: { id: userId },
        data: { role },
    });
    revalidatePath("/admin/players");
    revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
    // Note: This might need to delete related records or handle cascades
    await prisma.user.delete({
        where: { id: userId },
    });
    revalidatePath("/admin/players");
    revalidatePath("/admin");
}

export async function updateSettings(data: {
    siteName?: string;
    maintenanceMode?: boolean;
}) {
    // This is a placeholder as we don't have a Settings model yet
    // Usually settings are stored in a key-value table or a single record table
    console.log("Settings update:", data);
    revalidatePath("/admin/settings");
    return { success: true };
}
