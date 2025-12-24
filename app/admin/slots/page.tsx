import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import { Plus, Filter, Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";
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
                    <Button asChild>
                        <Link href="/admin/slots/new">
                            <Plus className="mr-2 h-4 w-4" />
                            New Slot
                        </Link>
                    </Button>
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

            {/* Filters Bar */}
            <Card>
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground mr-2 border-r pr-4">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                    </div>

                    <div className="flex flex-1 flex-wrap items-center gap-4">
                        {/* Note: Shadcn Select requires client-side state handling for full interactivity 
                             if used as a controlled component, or simple usage here for UI structure. 
                             Ideally filters should be a separate Client Component to handle router.push on change.
                             For now, keeping input logic simple or wrapping in a Client Component is best.
                             Given this is a Server Component page, we can use a Form or Links, 
                             or standard inputs styled as Shadcn. 
                             
                             However, strict Shadcn replacement requires functional components. 
                             I will use standard HTML select styled as Shadcn Input for simplicity 
                             rendering server-side params logic, or just a form.
                         */}

                        {/* To properly implement Filters with Shadcn Select, we need a client component.
                             For the sake of visual consistency first, I'll use standard inputs with proper styling classes 
                             OR wrap this section in a client component. 
                             Let's stick to standard clean styling for now to avoid large refactors,
                             but using Input component class. */}

                        <form className="contents">
                            <select
                                name="platform"
                                defaultValue={searchParams.platform || ""}
                                className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Platforms</option>
                                <option value="PS5">PS5</option>
                                <option value="VR">VR</option>
                                <option value="RACING_SIM">Racing Sim</option>
                            </select>

                            <select
                                name="status"
                                defaultValue={searchParams.status || ""}
                                className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="BOOKED">Booked</option>
                                <option value="BLOCKED">Blocked</option>
                                <option value="MAINTENANCE">Maintenance</option>
                            </select>

                            <Input
                                type="date"
                                name="date"
                                defaultValue={searchParams.date}
                                className="w-[180px]"
                            />

                            <Button type="submit" variant="secondary" size="sm">
                                Apply
                            </Button>
                        </form>
                    </div>

                    <div className="flex items-center gap-1 border p-1 rounded-md bg-muted/50">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ListIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Slot List */}
            <SlotList searchParams={searchParams} />
        </div>
    );
}
