import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import { Clock, Users, MoreVertical, ShieldCheck, ArrowRight, Wrench, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SlotListProps {
    searchParams: {
        platform?: Platform;
        status?: SlotStatus;
        date?: string;
    };
}

export default async function SlotList({ searchParams }: SlotListProps) {
    const where: any = {};
    if (searchParams.platform) where.type = searchParams.platform;
    if (searchParams.status) where.status = searchParams.status;
    if (searchParams.date) {
        const date = new Date(searchParams.date);
        where.date = {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const slots = await prisma.slot.findMany({
        where,
        orderBy: { date: "asc" },
        include: { bookings: true },
    });

    if (slots.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No slots found matching your criteria.</p>
            </div>
        );
    }

    const getStatusBadge = (status: SlotStatus) => {
        switch (status) {
            case "AVAILABLE": return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
            case "BOOKED": return <Badge variant="secondary">Booked</Badge>;
            case "MAINTENANCE": return <Badge variant="destructive">Maintenance</Badge>;
            case "BLOCKED": return <Badge variant="outline">Blocked</Badge>;
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
                <div key={slot.id} className="group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold leading-none tracking-tight">{slot.type}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{slot.title || "Standard Session"}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 text-muted-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>Edit details</DropdownMenuItem>
                                    <DropdownMenuItem>View bookings</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete slot</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Time</span>
                                <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-right">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{new Date(slot.date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{slot.bookings.length} / {slot.maxPlayers}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">${slot.price.toFixed(2)}</span>
                                {getStatusBadge(slot.status)}
                            </div>
                        </div>

                        {/* Visibility Badge overlaid or integrated */}
                        <div className="absolute -top-3 left-4">
                            {/* Optional: could put visibility here, or just keep it minimal */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
