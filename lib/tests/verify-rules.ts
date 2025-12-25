
import { PrismaClient, BookingSource, Platform, SlotStatus } from '@prisma/client';
import { createOfflineBooking } from '@/lib/actions/admin-actions';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Verification...");

    const now = new Date();
    const nextHour = now.getHours() + 1;
    const nextHourStr = `${nextHour}:00`;
    const nextHourEndStr = `${nextHour + 2}:00`;

    // 1. Setup Data
    console.log("Setting up test data...");
    const user = await prisma.user.create({ data: { name: "Test User", email: `test-${Date.now()}@example.com` } });
    const slot = await prisma.slot.create({
        data: {
            title: "Test Slot",
            type: Platform.PS5,
            startTime: nextHourStr,
            endTime: nextHourEndStr, // 2 hours duration
            duration: 60,
            price: 100,
            status: SlotStatus.AVAILABLE
        }
    });

    // Helper to ignore revalidate error
    const runAction = async (fn: any) => {
        try {
            await fn;
            return true;
        } catch (e: any) {
            if (e.message.includes("static generation store missing")) return true; // Passed logic, failed revalidate
            throw e;
        }
    }

    try {
        // 2. Test Booking in Past
        console.log("Test: Booking in past...");
        try {
            await runAction(createOfflineBooking(user.id, slot.id, 60, "00:00"));
            if (new Date().getHours() > 0) console.error("FAIL: Allowed past booking");
            else console.log("SKIP: Midnight run prevents past test");
        } catch (e: any) {
            if (e.message.includes("past")) console.log("PASS: Blocked past booking");
            else console.log("FAIL: Wrong error for past booking:", e.message);
        }

        // 3. Test Booking Out of Bounds
        console.log("Test: Booking out of bounds...");
        try {
            // Slot ends at nextHour + 2. Try booking at nextHour + 1:30 for 60 mins -> ends nextHour + 2:30
            const oobTime = `${nextHour + 1}:30`;
            await runAction(createOfflineBooking(user.id, slot.id, 60, oobTime));
            console.error("FAIL: Allowed out of bounds booking");
        } catch (e: any) {
            if (e.message.includes("fit within slot")) console.log("PASS: Blocked out of bounds booking");
            else console.log("FAIL: Wrong error for bounds:", e.message);
        }

        // 4. Create Valid Booking
        console.log("Test: Create valid booking...");
        try {
            await runAction(createOfflineBooking(user.id, slot.id, 60, nextHourStr));
            console.log("PASS: Created valid booking");
        } catch (e: any) {
            console.error("FAIL: Valid booking failed:", e.message);
        }

        // 5. Test Conflict (Should Fail)
        console.log("Test: Conflict detection...");
        try {
            await runAction(createOfflineBooking(user.id, slot.id, 60, nextHourStr)); // Overlap with previous
            console.error("FAIL: Allowed conflicting booking");
        } catch (e: any) {
            if (e.message.includes("conflict")) console.log("PASS: Blocked conflicting booking");
            else console.error("FAIL: Wrong error for conflict:", e.message);
        }

    } catch (err) {
        console.error("Verification failed with unexpected error:", err);
    } finally {
        // Cleanup
        await prisma.booking.deleteMany({ where: { slotId: slot.id } });
        await prisma.slot.delete({ where: { id: slot.id } });
        await prisma.user.delete({ where: { id: user.id } });
        await prisma.$disconnect();
    }
}

main();
