"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function extendBooking(
    bookingId: string,
    additionalMinutes: number,
    adminId: string,
    reason: string,
    paymentMethod: "OFFLINE_CASH" | "SUBSCRIPTION_HOURS",
    force: boolean = false
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            throw new Error("Unauthorized. Admin access required.");
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: { include: { membership: true } } }
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        const newDuration = booking.duration + additionalMinutes;
        const [startH, startM] = (booking.startTime as string).split(':').map(Number);
        const bookingStartVal = startH * 60 + startM;
        const bookingEndVal = bookingStartVal + newDuration;

        // 1. Conflict Check: No overlaps with other bookings in same slot
        const otherBookings = await prisma.booking.findMany({
            where: {
                id: { not: bookingId },
                slotId: booking.slotId,
                date: {
                    gte: new Date(new Date(booking.date).setHours(0, 0, 0, 0)),
                    lt: new Date(new Date(booking.date).setHours(23, 59, 59, 999)),
                },
                status: "Upcoming",
            },
            include: { user: true }
        });

        if (!force) {
            for (const b of otherBookings) {
                const [bStartH, bStartM] = (b.startTime as string).split(':').map(Number);
                const bStartVal = bStartH * 60 + bStartM;
                const bEndVal = bStartVal + b.duration;

                if (
                    (bookingStartVal >= bStartVal && bookingStartVal < bEndVal) ||
                    (bookingEndVal > bStartVal && bookingEndVal <= bEndVal) ||
                    (bookingStartVal <= bStartVal && bookingEndVal >= bEndVal)
                ) {
                    return {
                        success: false,
                        error: "Time conflict",
                        conflict: {
                            user: b.user
                        }
                    };
                }
            }

            // 2. Bound Check: Must still fit in slot if applicable
            if (booking.slotId) {
                const slot = await prisma.slot.findUnique({ where: { id: booking.slotId } });
                if (slot) {
                    const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);
                    const slotEndVal = slotEndH * 60 + slotEndM;
                    if (bookingEndVal > slotEndVal) {
                        return { success: false, error: `Extension exceeds slot window (${slot.endTime})` };
                    }
                }
            }
        }

        // 3. Payment Handling for Subscribers
        if (paymentMethod === "SUBSCRIPTION_HOURS") {
            if (!booking.user?.membership?.isSubscriber) {
                throw new Error("User is not a subscriber");
            }
            const hoursToDeduct = additionalMinutes / 60;
            const availableHours = (booking.user.membership.totalHours || 0) - (booking.user.membership.utilizedHours || 0);

            if (availableHours < hoursToDeduct) {
                throw new Error(`Insufficient subscription hours. Available: ${availableHours.toFixed(1)}h`);
            }

            await prisma.membership.update({
                where: { userId: booking.userId! },
                data: { utilizedHours: { increment: hoursToDeduct } }
            });
        }

        // 4. Update Booking and Log Audit
        await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: {
                    duration: newDuration,
                    isAdminExtended: true,
                    extensionReason: reason,
                    extensionAdminId: adminId,
                    extensionPaymentMethod: paymentMethod,
                },
            }),
            prisma.bookingAuditLog.create({
                data: {
                    bookingId,
                    adminId,
                    action: "EXTEND",
                    reason,
                    paymentMethod,
                }
            })
        ]);

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("Error extending booking:", error);
        return { success: false, error: error.message || "Failed to extend booking" };
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
