"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { getAdminDashboardData } from "@/lib/actions/admin-actions";
import { TableSkeleton } from "@/components/admin/skeletons";
import SlotListClient from "@/components/admin/SlotListClient";
import CreateSlotModal from "@/components/admin/CreateSlotModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSlotsPage() {
    const {
        isLoading,
        slots,
        setData,
        setLoading
    } = useAdminStore();

    useEffect(() => {
        if (slots.length === 0) {
            const fetchData = async () => {
                try {
                    const data = await getAdminDashboardData();
                    setData(data);
                } catch (error) {
                    console.error("Failed to fetch data", error);
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [slots.length, setData, setLoading]);

    if (isLoading) {
        return <TableSkeleton />;
    }

    const totalSlots = slots.length;
    const available = slots.filter(s => s.status === 'AVAILABLE').length;
    const booked = slots.filter(s => s.status === 'BOOKED').length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Slot Management</h1>
                    <p className="text-muted-foreground">Create and monitor gaming sessions for your players.</p>
                </div>
                <div className="flex gap-4">
                    <CreateSlotModal />
                </div>
            </div>

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
                        <div className="text-2xl font-bold">{available}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booked Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{booked}</div>
                    </CardContent>
                </Card>
            </div>

            <SlotListClient slots={slots} />
        </div>
    );
}
