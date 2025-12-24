import prisma from "@/lib/prisma";
import { Clock, Calendar, CheckCircle, XCircle, MoreVertical } from "lucide-react";
import { updateBookingStatus } from "@/lib/actions/admin-actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingListProps {
    searchParams: {
        type?: string;
        status?: string;
        date?: string;
    };
}

export default async function BookingList({ searchParams }: BookingListProps) {
    const where: any = {};
    if (searchParams.type) where.type = searchParams.type;
    if (searchParams.status) where.status = searchParams.status;
    if (searchParams.date) {
        const date = new Date(searchParams.date);
        where.date = {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const bookings = await prisma.booking.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
            user: true,
            slot: true
        },
    });

    if (bookings.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No bookings found matching your criteria.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Upcoming": return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Upcoming</Badge>;
            case "Completed": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Completed</Badge>;
            case "Cancelled": return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Session Details</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={booking.user.image || ""} />
                                        <AvatarFallback>{booking.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{booking.user.name}</span>
                                        <span className="text-xs text-muted-foreground">{booking.user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{booking.type}</span>
                                    {booking.slot && (
                                        <span className="text-xs text-muted-foreground">
                                            {booking.slot.title || "Standard Session"}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                        {new Date(booking.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5" />
                                        {booking.duration} Minutes
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(booking.status)}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <form action={async () => {
                                            "use server";
                                            await updateBookingStatus(booking.id, "Completed");
                                        }}>
                                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Mark Completed
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            "use server";
                                            await updateBookingStatus(booking.id, "Cancelled");
                                        }}>
                                            <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2 text-destructive">
                                                <XCircle className="w-4 h-4" /> Cancel Booking
                                            </button>
                                        </form>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
