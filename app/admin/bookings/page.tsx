import prisma from "@/lib/prisma";
import { Filter, Search, Calendar as CalendarIcon, Download, Clock } from "lucide-react";
import BookingList from "@/components/admin/BookingList";
import OfflineBookingModal from "@/components/admin/OfflineBookingModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveSlotsList } from "@/components/admin/ActiveSlotsList";
import { FinishedSessionsList } from "@/components/admin/FinishedSessionsList";

interface BookingsPageProps {
    searchParams: {
        type?: string;
        status?: string;
        date?: string;
    };
}

export default async function AdminBookingsPage(props: { searchParams: Promise<BookingsPageProps["searchParams"] & { search?: string }> }) {
    const searchParams = await props.searchParams;

    // Data fetching
    const [totalBookings, completedBookings, upcomingCount, users, slots, allBookings] = await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "Completed" } }),
        prisma.booking.count({ where: { status: "Upcoming" } }),
        prisma.user.findMany({ select: { id: true, name: true, email: true, image: true, membership: true } }),
        prisma.slot.findMany({ where: { status: "AVAILABLE" } }),
        prisma.booking.findMany({
            where: { status: "Upcoming" },
            include: { user: { include: { membership: true } }, slot: true },
            orderBy: { date: 'asc' }
        })
    ]);

    const now = new Date();

    // Active Sessions (Start <= Now < End)
    const activeSlots = allBookings.filter(booking => {
        const startTime = new Date(booking.date);
        const endTime = new Date(booking.date);
        endTime.setMinutes(endTime.getMinutes() + booking.duration);
        return startTime <= now && endTime > now;
    });

    // Finished Sessions (End <= Now) - Pending Checkout
    const finishedSlots = allBookings.filter(booking => {
        const endTime = new Date(booking.date);
        endTime.setMinutes(endTime.getMinutes() + booking.duration);
        return endTime <= now;
    });

    // Upcoming (Now < Start)
    const futureBookings = allBookings.filter(booking => {
        const startTime = new Date(booking.date);
        return startTime > now;
    });

    // History Bookings (Filtered)
    const historyBookings = await prisma.booking.findMany({
        where: {
            status: { in: ["Completed", "Cancelled"] },
            ...(searchParams.status ? { status: searchParams.status } : {}),
            ...(searchParams.type ? { type: searchParams.type } : {}),
            ...(searchParams.date ? {
                date: {
                    gte: new Date(new Date(searchParams.date).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(searchParams.date).setHours(23, 59, 59, 999)),
                }
            } : {}),
            ...(searchParams.search ? {
                OR: [
                    { user: { name: { contains: searchParams.search, mode: 'insensitive' } } },
                    { user: { email: { contains: searchParams.search, mode: 'insensitive' } } },
                ]
            } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            user: true,
            slot: true
        },
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
                    <OfflineBookingModal users={users} slots={slots} existingBookings={allBookings} />
                    <Button variant="outline" disabled={true} >
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
                        <div className="text-2xl font-bold">{upcomingCount}</div>
                    </CardContent>
                </Card>
            </div>


            {/* Tabs for Booking Management */}
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="active">Active Sessions</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="history">Booking History</TabsTrigger>
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
                            <BookingList initialBookings={futureBookings} />
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
                                <form className="contents">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input
                                            type="text"
                                            name="search"
                                            placeholder="Search players..."
                                            className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                                            defaultValue={searchParams.search}
                                        />
                                    </div>

                                    <select
                                        name="status"
                                        defaultValue={searchParams.status || ""}
                                        className="flex h-10 w-[160px] items-center justify-between rounded-md border-none bg-muted/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="">Status: All History</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>

                                    <div className="relative w-[180px]">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            type="date"
                                            name="date"
                                            defaultValue={searchParams.date}
                                            className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10 w-full"
                                        />
                                    </div>

                                    <Button type="submit" variant="default" size="sm" className="h-10 px-6 font-semibold">
                                        Apply Filters
                                    </Button>

                                    {(searchParams.status || searchParams.date || searchParams.search) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-10 px-4 text-muted-foreground hover:text-foreground"
                                            onClick={() => window.location.href = '/admin/bookings'}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking List */}
                    <div className="bg-background rounded-lg shadow-sm border overflow-hidden">
                        <BookingList initialBookings={historyBookings} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
