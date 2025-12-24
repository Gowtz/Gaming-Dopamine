import prisma from "@/lib/prisma";
import { Filter, Search, Calendar as CalendarIcon, Download } from "lucide-react";
import BookingList from "@/components/admin/BookingList";
import OfflineBookingModal from "@/components/admin/OfflineBookingModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

interface BookingsPageProps {
    searchParams: {
        type?: string;
        status?: string;
        date?: string;
    };
}

export default async function AdminBookingsPage(props: { searchParams: Promise<BookingsPageProps["searchParams"]> }) {
    const searchParams = await props.searchParams;

    const [totalBookings, completedBookings, upcomingBookings, users, slots] = await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "Completed" } }),
        prisma.booking.count({ where: { status: "Upcoming" } }),
        prisma.user.findMany({ select: { id: true, name: true, email: true, image: true, membership: true } }),
        prisma.slot.findMany({ where: { status: "AVAILABLE" } })
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Booking History</h1>
                    <p className="text-muted-foreground">Review and manage all player reservations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <OfflineBookingModal users={users} slots={slots} />
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBookings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedBookings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingBookings}</div>
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
                        <form className="contents">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search players..."
                                    className="pl-10"
                                />
                            </div>

                            <select
                                name="type"
                                defaultValue={searchParams.type || ""}
                                className="flex h-10 w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Types</option>
                                <option value="PS5">PS5</option>
                                <option value="VR">VR</option>
                                <option value="Racing">Racing</option>
                            </select>

                            <select
                                name="status"
                                defaultValue={searchParams.status || ""}
                                className="flex h-10 w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">All Status</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            <Input
                                type="date"
                                name="date"
                                defaultValue={searchParams.date}
                                className="w-[160px]"
                            />

                            <Button type="submit" variant="secondary" size="sm">
                                Apply
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>

            {/* Booking List */}
            <BookingList searchParams={searchParams} />
        </div>
    );
}
