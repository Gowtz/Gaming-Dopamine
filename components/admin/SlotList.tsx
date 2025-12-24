import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import SlotListClient from "./SlotListClient";

interface SlotListProps {
    searchParams: {
        platform?: Platform;
        status?: SlotStatus;
        date?: string;
    };
}

export default async function SlotList({ searchParams }: SlotListProps) {
    const where: any = {};
    if (searchParams.platform) where.type = searchParams.platform;
    if (searchParams.status) where.status = searchParams.status;
    // Date filtering removed - slots are now templates

    const slots = await prisma.slot.findMany({
        where,
        orderBy: { startTime: "asc" },
        include: {
            bookings: true,
            supportedGames: true
        },
    });

    return <SlotListClient slots={slots} />;
}
