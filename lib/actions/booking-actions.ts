"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function extendBooking(bookingId: string, additionalMinutes: number = 30) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        // Extend the duration
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                duration: booking.duration + additionalMinutes,
            },
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error extending booking:", error);
        return { success: false, error: "Failed to extend booking" };
    }
}

export async function deleteBooking(bookingId: string) {
    try {
        await prisma.booking.delete({
            where: { id: bookingId },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting booking:", error);
        return { success: false, error: "Failed to delete booking" };
    }
}
