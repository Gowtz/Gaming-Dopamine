import prisma from "@/lib/prisma";
import {
    Users,
    Gamepad2,
    DollarSign,
    TrendingUp,
    CalendarCheck,
    Activity,
    AlertCircle
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateSlotModal from "@/components/admin/CreateSlotModal";
import { ActiveSlotsList } from "@/components/admin/ActiveSlotsList";
import { FinishedSessionsList } from "@/components/admin/FinishedSessionsList";
import PlayerSearchModal from "@/components/admin/PlayerSearchModal";
import OfflineBookingModal from "@/components/admin/OfflineBookingModal";
import { UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function AdminOverview() {
    // Real stats from DB
    const totalPlayers = await prisma.user.count();
    const activeBookings = await prisma.booking.count({ where: { status: "Upcoming" } });
    const slotUtilization = 68; // Mock percentage

    // Calculate Realtime Revenue from Completed bookings
    const completedBookings = await prisma.booking.findMany({
        where: { status: "Completed" },
        include: { slot: true }
    });

    const totalRevenue = completedBookings.reduce((acc, booking) => {
        const pricePerHour = booking.slot?.price || 100; // Fallback price
        const cost = Math.ceil((booking.duration / 60) * pricePerHour);
        return acc + cost;
    }, 0);

    const [users, slots] = await Promise.all([
        prisma.user.findMany({ select: { id: true, name: true, email: true, image: true, membership: true } }),
        prisma.slot.findMany({ where: { status: "AVAILABLE" } })
    ]);

    const stats = [
        { label: "Total Players", value: totalPlayers, icon: Users, desc: "+12% from last month" },
        { label: "Upcoming Bookings", value: activeBookings, icon: CalendarCheck, desc: "+5% from last week" },
        { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: DollarSign, desc: "+18% from last month" },
        { label: "Slot Utilization", value: `${slotUtilization}%`, icon: Gamepad2, desc: "-2% from last hour" },
    ];

    const recentBookings = await prisma.booking.findMany({
        take: 7,
        orderBy: { createdAt: 'desc' },
        include: { user: true, slot: true }
    });

    // Get currently active bookings (happening right now)
    const now = new Date();

    const allUpcomingBookings = await prisma.booking.findMany({
        where: {
            status: "Upcoming",
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    membership: {
                        select: {
                            isSubscriber: true,
                            totalHours: true,
                            utilizedHours: true,
                        }
                    }
                }
            },
            slot: true
        },
        orderBy: {
            date: 'asc' // Order by start time
        }
    });

    // Filter Active Sessions (Start <= Now < End)
    const activeSlots = allUpcomingBookings.filter(booking => {
        const startTime = new Date(booking.date);
        const endTime = new Date(booking.date);
        endTime.setMinutes(endTime.getMinutes() + booking.duration);
        return startTime <= now && endTime > now;
    });

    // Filter Finished Sessions (End <= Now) - Pending Checkout
    const finishedSlots = allUpcomingBookings.filter(booking => {
        const endTime = new Date(booking.date);
        endTime.setMinutes(endTime.getMinutes() + booking.duration);
        return endTime <= now;
    });




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
                    // Extract percentage and determine color
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
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
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

                    {/* Finished Sessions Section (High Priority) - Always Visible */}
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <CardTitle className="text-red-600">Finished Sessions</CardTitle>
                            </div>
                            <CardDescription>
                                Sessions that have ended. Please process payment or checkout.
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
                            <OfflineBookingModal users={users} slots={slots} />
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
