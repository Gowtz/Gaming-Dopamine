"use server";

import prisma from "@/lib/prisma";

export async function getUserProfile(email: string) {
    if (!email) return null;

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            stats: true,
            wallet: true,
            membership: true,
            preferences: true,
            bookings: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });

    if (!user) return null;

    // Calculate Total Playtime from Completed Bookings
    const totalPlaytimeAgg = await prisma.booking.aggregate({
        where: {
            userId: user.id,
            status: "Completed",
        },
        _sum: {
            duration: true,
        },
    });

    const realTotalPlaytimeMinutes = totalPlaytimeAgg._sum?.duration || 0;

    // Defaults for missing data
    const stats = user.stats || { totalPlaytime: 0, mostPlayedGame: "None" };
    const wallet = user.wallet || { balance: 0, credits: 0 };
    const membership = user.membership || {
        tier: "Bronze",
        points: 0,
        isSubscriber: false,
        totalHours: 0,
        utilizedHours: 0,
    };
    const preferences = user.preferences || {
        favoriteGames: [],
        hasPS5: false,
        hasVR: false,
        hasRacingSim: false,
    };

    // Calculate Available Hours
    let availableHours = 0;
    if (membership.isSubscriber) {
        availableHours = (membership.totalHours || 0) - (membership.utilizedHours || 0);
    }

    return {
        user,
        stats,
        wallet,
        membership,
        preferences,
        realTotalPlaytimeMinutes,
        availableHours,
    };
}
