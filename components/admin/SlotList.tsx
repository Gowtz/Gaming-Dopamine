import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import { Clock, Users, MoreVertical, ShieldCheck, ArrowRight, Wrench, Ban } from "lucide-react";
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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Platform / Title</TableHead>
                        <TableHead>Time Slot</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {slots.map((slot) => (
                        <TableRow key={slot.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-md bg-muted">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{slot.type}</span>
                                        <span className="text-xs text-muted-foreground">{slot.title || "Standard Session"}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(slot.date).toLocaleDateString()}</span>
                                </div>
                            </TableCell>
                            <TableCell>${slot.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span>{slot.bookings.length} / {slot.maxPlayers}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(slot.status)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={slot.isPublic ? "outline" : "secondary"}>
                                    {slot.isPublic ? "Public" : "Hidden"}
                                </Badge>
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
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit details</DropdownMenuItem>
                                        <DropdownMenuItem>View bookings</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete slot</DropdownMenuItem>
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
