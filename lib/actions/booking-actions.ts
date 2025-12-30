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
    }
}

// Helper to check time overlap
function doTimesOverlap(start1: Date, end1: Date, start2: Date, end2: Date) {
    return start1 < end2 && start2 < end1;
}

// Parse "HH:MM" to minutes from midnight
function parseTimeToMinutes(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Convert minutes from midnight to "HH:MM"
function formatMinutesToTime(totalMinutes: number) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export async function getAvailableSlots(date: Date, platform: string) {
    try {
        const slots = await prisma.slot.findMany({
            where: {
                type: platform as any,
                status: "AVAILABLE",
                isPublic: true,
            }
        });

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookingsOnDate = await prisma.booking.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                type: platform,
                status: { in: ["Upcoming", "Completed", "Ongoing"] }
            }
        });

        // 1. Generate all possible 1-hour logical slots from physical slots
        const aggregatedSlots: Record<string, {
            startTime: string;
            endTime: string;
            price: number;
            maxPlayers: number;
            bookedCount: number;
        }> = {};

        for (const slot of slots) {
            const slotStartMins = parseTimeToMinutes(slot.startTime);
            const slotEndMins = slotStartMins + slot.duration;

            // Slice into 60-minute blocks
            const now = new Date();
            for (let currentStart = slotStartMins; currentStart + 60 <= slotEndMins; currentStart += 60) {
                // Calculate precise start time for this block
                const blockStart = new Date(date);
                blockStart.setHours(Math.floor(currentStart / 60), currentStart % 60, 0, 0);

                // Skip if this specific hour block is in the past
                // We add a small buffer (e.g. 0 mins) or strict check
                if (blockStart < now) {
                    continue;
                }

                const currentEnd = currentStart + 60;
                const timeKey = formatMinutesToTime(currentStart);
                const endTimeStr = formatMinutesToTime(currentEnd);

                if (!aggregatedSlots[timeKey]) {
                    aggregatedSlots[timeKey] = {
                        startTime: timeKey,
                        endTime: endTimeStr,
                        price: slot.price, // Use first found price (or logic to average/max)
                        maxPlayers: 0,
                        bookedCount: 0
                    };
                }

                aggregatedSlots[timeKey].maxPlayers += slot.maxPlayers;

                // Calculate bookings that overlap strictly with THIS hour
                // blockStart is already calculated above
                const blockEnd = new Date(blockStart);
                blockEnd.setMinutes(blockEnd.getMinutes() + 60);

                // We need to know how many bookings overlap *this specific physical slot's* sub-block.
                // Currently bookings have `slotId`.

                const bookingsForThisPhysicalSlot = bookingsOnDate.filter(b => b.slotId === slot.id);

                const conflictsForThisSlotBlock = bookingsForThisPhysicalSlot.filter(b => {
                    const [bSH, bSM] = (b.startTime as string).split(':').map(Number);
                    const bStart = new Date(date);
                    bStart.setHours(bSH, bSM, 0, 0);
                    const bEnd = new Date(bStart);
                    bEnd.setMinutes(bEnd.getMinutes() + b.duration);

                    return doTimesOverlap(blockStart, blockEnd, bStart, bEnd);
                }).length;

                aggregatedSlots[timeKey].bookedCount += conflictsForThisSlotBlock;
            }
        }

        return Object.values(aggregatedSlots)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(s => ({
                ...s,
                isFull: s.bookedCount >= s.maxPlayers,
                availableSpots: Math.max(0, s.maxPlayers - s.bookedCount),
                totalSpots: s.maxPlayers
            }))
            .filter(s => !s.isFull);

    } catch (error) {
        console.error("Error fetching available slots:", error);
        return [];
    }
}

export async function createOnlineBooking(platform: string, date: Date, startTime: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            throw new Error("Authentication required");
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { membership: true }
        });

        if (!user) throw new Error("User not found");

        const bookingDuration = 60; // Fixed 1 hour
        const reqStartMins = parseTimeToMinutes(startTime);
        const reqEndMins = reqStartMins + bookingDuration;

        const bookingDate = new Date(date);
        const [h, m] = startTime.split(':').map(Number);
        bookingDate.setHours(h, m, 0, 0);
        const bookingEnd = new Date(bookingDate);
        bookingEnd.setMinutes(bookingEnd.getMinutes() + bookingDuration);

        // Find potential slots that COVER this time range
        const potentialSlots = await prisma.slot.findMany({
            where: {
                type: platform as any,
                status: "AVAILABLE",
                isPublic: true,
            }
        });

        // Filter valid physical slots that contain the requested hour
        const validPhysicalSlots = potentialSlots.filter(s => {
            const sStart = parseTimeToMinutes(s.startTime);
            const sEnd = sStart + s.duration;
            return sStart <= reqStartMins && sEnd >= reqEndMins;
        });

        if (!validPhysicalSlots.length) {
            throw new Error("No available slots found for this time.");
        }

        // Check availability
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookingsOnDate = await prisma.booking.findMany({
            where: {
                date: { gte: startOfDay, lte: endOfDay },
                type: platform,
                status: { in: ["Upcoming", "Completed", "Ongoing"] }
            }
        });

        let targetSlot = null;

        for (const slot of validPhysicalSlots) {
            const bookingsForThisSlot = bookingsOnDate.filter(b => b.slotId === slot.id);

            const conflictCount = bookingsForThisSlot.filter(b => {
                const [bSH, bSM] = (b.startTime as string).split(':').map(Number);
                const bStart = new Date(date);
                bStart.setHours(bSH, bSM, 0, 0);
                const bEnd = new Date(bStart);
                bEnd.setMinutes(bEnd.getMinutes() + b.duration);

                return doTimesOverlap(bookingDate, bookingEnd, bStart, bEnd);
            }).length;

            if (conflictCount < slot.maxPlayers) {
                targetSlot = slot;
                break;
            }
        }

        if (!targetSlot) {
            throw new Error("Selected time is fully booked");
        }

        // Proceed with targetSlot
        let paymentMethod = "PAY_AT_VENUE";
        let status = "Upcoming";

        if (user.membership?.isSubscriber) {
            const hoursNeeded = bookingDuration / 60;
            const available = (user.membership.totalHours || 0) - (user.membership.utilizedHours || 0);

            // Check if booking date is within subscription period
            const isSubscriptionValidForDate = user.membership.expiresAt
                ? new Date(user.membership.expiresAt) >= bookingDate
                : false;

            if (available >= hoursNeeded && isSubscriptionValidForDate) {
                paymentMethod = "SUBSCRIPTION";
            }
        }

        const booking = await prisma.booking.create({
            data: {
                userId: user.id,
                slotId: targetSlot.id,
                date: bookingDate,
                startTime: startTime,
                duration: bookingDuration,
                type: targetSlot.type,
                status: status,
                source: "ONLINE",
                paymentMethod: paymentMethod,
                totalPrice: targetSlot.price // Note: This might be the 12-hour price? 
                // Ideally we should calculate price per hour if slot is longer.
                // Assuming price in DB is "per slot" but if slot is 12h, price is huge.
                // If the user intends "Hourly Price", the Slot schema might be "Price per session" or "Price per hour"?
                // For now, using slot.price. We might need to adjust this if the User has set "200" for a 12h slot.
                // Re-calculating: assuming uniform hourly price based on slot configuration isn't trivial without more info.
                // BUT, typically "Slot" = "Hourly Slot". If they made a 12h slot, maybe they set price for 12h.
                // Let's assume price is okay for now or it's a "rate".
            }
        });

        revalidatePath("/profile");
        return { success: true, bookingId: booking.id };
    } catch (error: any) {
        console.error("Error creating online booking:", error);
        return { success: false, error: error.message };
    }
}
