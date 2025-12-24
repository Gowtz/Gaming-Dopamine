"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Platform, SlotStatus } from "@prisma/client";

export async function createSlot(data: {
    title?: string;
    type: Platform;
    startTime: string;
    endTime: string;
    price: number;
    maxPlayers: number;
    isPublic: boolean;
    gameIds?: string[];
}) {
    const duration = calculateDuration(data.startTime, data.endTime);
    const { gameIds, ...slotData } = data;

    const slot = await prisma.slot.create({
        data: {
            ...slotData,
            duration,
            supportedGames: gameIds ? {
                connect: gameIds.map(id => ({ id }))
            } : undefined
        },
    });

    revalidatePath("/admin/slots");
    return slot;
}

export async function getGames() {
    return await prisma.game.findMany({
        orderBy: { title: "asc" }
    });
}

export async function bulkCreateSlots(data: {
    type: Platform;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    price: number;
    maxPlayers: number;
    frequency: "daily" | "weekdays";
}) {
    const slots = [];
    const current = new Date(data.startDate);
    const end = new Date(data.endDate);
    const duration = calculateDuration(data.startTime, data.endTime);

    while (current <= end) {
        const day = current.getDay();
        const isWeekday = day !== 0 && day !== 6;

        if (data.frequency === "daily" || (data.frequency === "weekdays" && isWeekday)) {
            slots.push({
                type: data.type,
                date: new Date(current),
                startTime: data.startTime,
                endTime: data.endTime,
                duration,
                price: data.price,
                maxPlayers: data.maxPlayers,
                status: SlotStatus.AVAILABLE,
            });
        }
        current.setDate(current.getDate() + 1);
    }

    await prisma.slot.createMany({ data: slots });
    revalidatePath("/admin/slots");
    return { count: slots.length };
}

export async function updateSlot(id: string, data: any) {
    if (data.startTime && data.endTime) {
        data.duration = calculateDuration(data.startTime, data.endTime);
    }

    const slot = await prisma.slot.update({
        where: { id },
        data,
    });

    revalidatePath("/admin/slots");
    return slot;
}

export async function deleteSlot(id: string) {
    await prisma.slot.delete({ where: { id } });
    revalidatePath("/admin/slots");
}

export async function toggleSlotVisibility(id: string, isPublic: boolean) {
    await prisma.slot.update({
        where: { id },
        data: { isPublic },
    });
    revalidatePath("/admin/slots");
}

export async function toggleSlotStatus(id: string, status: SlotStatus) {
    await prisma.slot.update({
        where: { id },
        data: { status },
    });
    revalidatePath("/admin/slots");
    revalidatePath("/admin");
}

function calculateDuration(start: string, end: string) {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60; // Handle overnight slots

    return diff;
}
