"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { getAdminDashboardData } from "@/lib/actions/admin-actions";
import { TableSkeleton } from "@/components/admin/skeletons";
import BookingList from "@/components/admin/BookingList";
import OfflineBookingModal from "@/components/admin/OfflineBookingModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveSlotsList } from "@/components/admin/ActiveSlotsList";
import { FinishedSessionsList } from "@/components/admin/FinishedSessionsList";
import { Filter, Search, Calendar as CalendarIcon, Download, Clock } from "lucide-react";

import { format, isSameDay, isToday, isSameWeek, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function AdminBookingsPage() {
    const {
        isLoading,
        historyBookings,
        activeSlots,
        finishedSlots,
        upcomingSlots,
        users,
        slots,
        setData,
        setLoading
    } = useAdminStore();

    const [filterSearch, setFilterSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (!historyBookings.length) {
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
    }, [historyBookings.length, setData, setLoading]);

    const [timeRange, setTimeRange] = useState("day");

    // Stats Filter Logic
    const filterByTimeRange = (bookings: any[]) => {
        if (timeRange === "all") return bookings;

        const now = new Date();
        return bookings.filter(b => {
            const date = new Date(b.date);
            if (timeRange === "day") return isToday(date);
            if (timeRange === "week") return isSameWeek(date, now, { weekStartsOn: 1 }); // Monday start
            if (timeRange === "month") return isSameMonth(date, now);
            return true;
        });
    };

    const statsBookings = filterByTimeRange(historyBookings);
    const statsUpcoming = filterByTimeRange(upcomingSlots);

    if (isLoading) {
        return <TableSkeleton />;
    }

    // Filter Logic
    const filteredHistory = historyBookings.filter(b => {
        const matchesSearch = !filterSearch ||
            b.user?.name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
            b.user?.email?.toLowerCase().includes(filterSearch.toLowerCase());
        const matchesStatus = !filterStatus || filterStatus === "all" || b.status === filterStatus;
        const matchesDate = !filterDate || isSameDay(new Date(b.date), filterDate);
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Booking History</h1>
                    <p className="text-muted-foreground">Review and manage all player reservations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <OfflineBookingModal users={users} slots={slots} existingBookings={[...activeSlots, ...upcomingSlots, ...finishedSlots]} />
                    <Button variant="outline" disabled={true} >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {/* Time Range Filter & Stats */}
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px] bg-background">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="day">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsBookings.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsBookings.filter(b => b.status === 'Completed').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statsUpcoming.length}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tabs for Booking Management */}
            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="history">Booking History</TabsTrigger>
                    <TabsTrigger value="active">Active Sessions</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6 space-y-6">
                    {/* Finished Sessions Section (Pending Checkout) */}
                    {finishedSlots.length > 0 && (
                        <Card className="border-red-500/20 bg-red-500/5 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-red-500 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Finished - Pending Checkout
                                </CardTitle>
                                <CardDescription className="text-red-600/80">
                                    Sessions that have ended. Please collect payment to finalize.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FinishedSessionsList slots={finishedSlots as any} />
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Currently Playing</CardTitle>
                            <CardDescription>
                                Live sessions in progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActiveSlotsList slots={activeSlots} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Reservations</CardTitle>
                            <CardDescription>
                                Bookings scheduled for the future.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingList initialBookings={upcomingSlots as any} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    {/* Filters Bar */}
                    <Card className="mb-6">
                        <CardContent className="p-4 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground mr-2 border-r pr-4">
                                <Filter className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                            </div>

                            <div className="flex flex-1 flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        type="text"
                                        placeholder="Search players..."
                                        value={filterSearch}
                                        onChange={(e) => setFilterSearch(e.target.value)}
                                        className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                                    />
                                </div>

                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-[180px] bg-muted/50 border-none h-10">
                                        <SelectValue placeholder="Status: All History" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Status: All History</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal bg-muted/50 border-none h-10 justify-start",
                                                !filterDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={filterDate}
                                            onSelect={setFilterDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>

                                {(filterSearch || (filterStatus && filterStatus !== "all") || filterDate) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-4 text-muted-foreground hover:text-foreground"
                                        onClick={() => { setFilterSearch(""); setFilterStatus(""); setFilterDate(undefined); }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking List */}
                    <div className="bg-background rounded-lg shadow-sm border overflow-hidden">
                        <BookingList initialBookings={filteredHistory as any} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
