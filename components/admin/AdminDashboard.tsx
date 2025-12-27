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
        setLoading
    } = useAdminStore();

    useEffect(() => {
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

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = iconMap[stat.iconName as string] || Users;
                    const isPositive = stat.desc.startsWith('+');
                    const isNegative = stat.desc.startsWith('-');
                    const percentageMatch = stat.desc.match(/^([+-]\d+%)/);
                    const percentage = percentageMatch ? percentageMatch[1] : '';
                    const restOfDesc = stat.desc.replace(/^[+-]\d+%/, '').trim();

                    return (
                        <Card key={stat.label}>
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Left Column: Active & Finished Sessions (Big) */}
                <div className="col-span-4 space-y-6">

                    {/* Finished Sessions Section (High Priority) */}
                    <Card className={finishedSlots.length > 0 ? "border-red-500/20 bg-red-500/5" : "bg-muted/30 border-muted"}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className={finishedSlots.length > 0 ? "h-5 w-5 text-red-600" : "h-5 w-5 text-muted-foreground"} />
                                <CardTitle className={finishedSlots.length > 0 ? "text-red-600" : "text-muted-foreground"}>Finished Sessions</CardTitle>
                            </div>
                            <CardDescription>
                                {finishedSlots.length > 0
                                    ? "Sessions that have ended. Please process payment or checkout."
                                    : "No sessions currently pending checkout."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FinishedSessionsList slots={finishedSlots} />
                        </CardContent>
                    </Card>

                    {/* Active Slots */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Slots</CardTitle>
                            <CardDescription>Currently running sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActiveSlotsList slots={activeSlots} />
                        </CardContent>
                    </Card>

                    {/* Upcoming Sessions */}
                    <Card className="bg-blue-50/10 border-blue-500/10">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-blue-600">Upcoming Sessions</CardTitle>
                            </div>
                            <CardDescription>Scheduled sessions starting soon.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UpcomingSessionsList slots={upcomingSlots} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Recent Bookings & Actions (Small) */}
                <div className="col-span-3 space-y-4">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage your café efficiently.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 w-full">
                                <PlayerSearchModal
                                    users={users}
                                    trigger={
                                        <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2">
                                            <UserPlus className="w-4 h-4" /> Create Subscriber
                                        </Button>
                                    }
                                />
                            </div>
                            <OfflineBookingModal users={users} slots={slots} existingBookings={[...activeSlots, ...upcomingSlots, ...finishedSlots]} />
                        </CardContent>
                    </Card>

                    {/* Recent Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>
                                Latest reservations made.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Player Info</TableHead>
                                        <TableHead className="text-right">Details</TableHead>
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
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {isOnline && booking.user ? (
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={booking.user.image || ""} />
                                                                    <AvatarFallback>{booking.user.name?.[0] || "P"}</AvatarFallback>
                                                                </Avatar>
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {isOnline ? booking.user?.name : "Walk-in Guest"}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {isOnline ? "Online Booking" : "Offline Booking"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <div className="text-xs font-medium">
                                                                For {startTimeStr}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                Booked {formatDistanceToNow(new Date(booking.createdAt), { addSuffix: true })}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
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
