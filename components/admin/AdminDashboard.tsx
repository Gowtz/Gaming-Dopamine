"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { getAdminDashboardData } from "@/lib/actions/admin-actions";
import {
    Users,
    Gamepad2,
    DollarSign,
    CalendarCheck,
    AlertCircle,
    UserPlus,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/admin/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActiveSlotsList } from "@/components/admin/ActiveSlotsList";
import { FinishedSessionsList } from "@/components/admin/FinishedSessionsList";
import { UpcomingSessionsList } from "@/components/admin/UpcomingSessionsList";
import PlayerSearchModal from "@/components/admin/PlayerSearchModal";
import OfflineBookingModal from "@/components/admin/OfflineBookingModal";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminDashboard() {
    const {
        isLoading,
        stats,
        activeSlots,
        finishedSlots,
        upcomingSlots,
        recentBookings,
        users,
        slots,
        setData,
        setLoading,
        refreshBookingStatuses
    } = useAdminStore();

    useEffect(() => {
        // Quick 1-minute interval to move bookings between tabs (Upcoming -> Active) locally
        // This runs often to give immediate feedback when time passes scheduled start
        const statusCheckInterval = setInterval(() => {
            refreshBookingStatuses();
        }, 10 * 1000); // Check every 10 seconds for responsiveness

        const fetchData = async () => {
            try {
                const data = await getAdminDashboardData();
                setData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setLoading(false);
            }
        };

        fetchData();

        // Alignment logic for 5-minute intervals
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        // Calculate ms until next 5-minute mark
        // (5 - (minutes % 5)) gives minutes to next mark (1-5)
        // We subtract seconds and ms to align exactly
        const msUntilNextMultiple = (
            (5 - (minutes % 5)) * 60 * 1000
            - seconds * 1000
            - milliseconds
            + 2000 // Add 2-second buffer to ensure server time has passed the minute mark
        );

        let timeoutId: NodeJS.Timeout;
        let intervalId: NodeJS.Timeout;

        timeoutId = setTimeout(() => {
            fetchData();

            // Use setInterval to repeat every 5 mins after alignment
            intervalId = setInterval(() => {
                fetchData();
            }, 5 * 60 * 1000);

        }, msUntilNextMultiple);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
            clearInterval(statusCheckInterval); // Cleanup status checker
        };
    }, []);

    const iconMap: Record<string, any> = {
        Users,
        CalendarCheck,
        DollarSign,
        Gamepad2
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your gaming café performance.</p>
            </div>

            {/* Stats Grid - Now 5 columns to include Quick Actions */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = iconMap[stat.iconName as string] || Users;
                    const isPositive = stat.desc.startsWith('+');
                    const isNegative = stat.desc.startsWith('-');
                    const percentageMatch = stat.desc.match(/^([+-]\d+%)/);
                    const percentage = percentageMatch ? percentageMatch[1] : '';
                    const restOfDesc = stat.desc.replace(/^[+-]\d+%/, '').trim();

                    // Hide Total Players on mobile
                    const isTotalPlayers = stat.label === "Total Players";
                    const visibilityClass = isTotalPlayers ? "hidden md:flex flex-col" : "flex flex-col";

                    return (
                        <Card key={stat.label} className={visibilityClass}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.label}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={isPositive ? "text-green-600 font-medium" : isNegative ? "text-red-600 font-medium" : ""}>
                                        {percentage}
                                    </span>
                                    {percentage && ' '}
                                    {restOfDesc}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Quick Actions - Moved to Top Row */}
                <Card className="flex flex-col justify-between border-primary/20 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Gamepad2 className="w-12 h-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 z-10">
                        <OfflineBookingModal
                            users={users}
                            slots={slots}
                            existingBookings={[...activeSlots, ...upcomingSlots, ...finishedSlots]}
                            trigger={
                                <Button size="sm" className="w-full justify-start gap-2 h-8 text-xs shadow-sm">
                                    <CalendarCheck className="w-3.5 h-3.5" /> New Booking
                                </Button>
                            }
                        />
                        <PlayerSearchModal
                            users={users}
                            trigger={
                                <Button size="sm" className="w-full justify-start gap-2 h-8 text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-medium shadow-sm">
                                    <UserPlus className="w-3.5 h-3.5" /> Create Subscriber
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                {/* Left Column: Active Slots (Main workspace) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-[500px] flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Active Booking</CardTitle>
                                    <CardDescription>Currently running sessions.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto">
                            <ActiveSlotsList slots={activeSlots} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Upcoming, Finished & Recent */}
                <div className="space-y-4">
                    {/* Upcoming Sessions */}
                    <Card className="h-[300px] flex flex-col bg-blue-50/10 border-blue-500/10">
                        <CardHeader className="py-4">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4 text-blue-600" />
                                <CardTitle className="text-sm font-medium text-blue-600">Upcoming</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto py-0 pb-4">
                            <UpcomingSessionsList slots={upcomingSlots} />
                        </CardContent>
                    </Card>

                    {/* Finished Sessions Section */}
                    <Card className={`h-[300px] flex flex-col ${finishedSlots.length > 0 ? "border-red-500/20 bg-red-500/5" : "bg-muted/30 border-muted"}`}>
                        <CardHeader className="py-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className={finishedSlots.length > 0 ? "h-4 w-4 text-red-600" : "h-4 w-4 text-muted-foreground"} />
                                <CardTitle className={`text-sm font-medium ${finishedSlots.length > 0 ? "text-red-600" : "text-muted-foreground"}`}>Finished</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto py-0 pb-4">
                            <FinishedSessionsList slots={finishedSlots} />
                        </CardContent>
                    </Card>

                    {/* Recent Bookings */}
                    <Card className="h-[300px] flex flex-col">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium">Recent</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto py-0 pb-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentBookings.length > 0 ? (
                                        recentBookings.map((booking) => {
                                            const isOnline = booking.source === 'ONLINE';
                                            const bookingTime = new Date(booking.date);
                                            const startTimeStr = bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                            return (
                                                <TableRow key={booking.id}>
                                                    <TableCell className="font-medium py-2">
                                                        <div className="flex items-center gap-2">
                                                            {isOnline && booking.user ? (
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage src={booking.user.image || ""} />
                                                                    <AvatarFallback className="text-[10px]">{booking.user.name?.[0] || "P"}</AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                                    <Users className="h-3 w-3 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium truncate max-w-[80px]">
                                                                    {isOnline ? booking.user?.name : "Guest"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right py-2">
                                                        <div className="text-xs whitespace-nowrap">
                                                            {startTimeStr}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-16 text-center text-xs text-muted-foreground">
                                                No recent bookings.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
