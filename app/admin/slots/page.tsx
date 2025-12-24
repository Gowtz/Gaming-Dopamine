import CreateSlotModal from "@/components/admin/CreateSlotModal";
import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import { Filter, Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import SlotList from "@/components/admin/SlotList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SlotsPageProps {
    searchParams: {
        platform?: Platform;
        status?: SlotStatus;
        date?: string;
    };
}

export default async function SlotsDashboard(props: { searchParams: Promise<SlotsPageProps["searchParams"]> }) {
    const searchParams = await props.searchParams;

    // Stats
    const totalSlots = await prisma.slot.count();
    const availableSlots = await prisma.slot.count({ where: { status: "AVAILABLE" } });
    const bookedSlots = await prisma.slot.count({ where: { status: "BOOKED" } });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Slot Management</h1>
                    <p className="text-muted-foreground">Create and monitor gaming sessions for your players.</p>
                </div>
                <div className="flex gap-4">
                    <CreateSlotModal />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSlots}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableSlots}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booked Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bookedSlots}</div>
                    </CardContent>
                </Card>
            </div>


            {/* Slot List */}
            <SlotList searchParams={searchParams} />
        </div>
    );
}
