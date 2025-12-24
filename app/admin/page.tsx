import prisma from "@/lib/prisma";
import {
    Users,
    Gamepad2,
    DollarSign,
    TrendingUp,
    CalendarCheck,
    Activity
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

export default async function AdminOverview() {
    // Real stats from DB
    const totalPlayers = await prisma.user.count();
    const activeBookings = await prisma.booking.count({ where: { status: "Upcoming" } });
    const totalRevenue = 1250.50; // Mock revenue
    const slotUtilization = 68; // Mock percentage

    const stats = [
        { label: "Total Players", value: totalPlayers, icon: Users, desc: "+12% from last month" },
        { label: "Upcoming Bookings", value: activeBookings, icon: CalendarCheck, desc: "+5% from last week" },
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, desc: "+18% from last month" },
        { label: "Slot Utilization", value: `${slotUtilization}%`, icon: Gamepad2, desc: "-2% from last hour" },
    ];

    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { user: true }
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
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>
                            Latest reservations made by players.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Player</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.length > 0 ? (
                                    recentBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={booking.user.image || ""} />
                                                        <AvatarFallback>{booking.user.name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span>{booking.user.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{booking.user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{booking.type}</TableCell>
                                            <TableCell>{booking.duration}m</TableCell>
                                            <TableCell className="text-right">
                                                {new Date(booking.date).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No recent bookings.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions & Status */}
                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage your café efficiently.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <CreateSlotModal />
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
