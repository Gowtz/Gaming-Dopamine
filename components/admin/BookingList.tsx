"use client";

import { useState } from "react";
import { Clock, Calendar, CheckCircle, XCircle, MoreVertical, Trash2, Globe, Laptop, CheckCircle2, DollarSign, Wallet, Edit2 } from "lucide-react";
import { updateBookingStatus, deleteBooking } from "@/lib/actions/admin-actions";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface BookingListProps {
    initialBookings: any[];
}

export default function BookingList({ initialBookings: bookings }: BookingListProps) {
    const router = useRouter();
    const [confirming, setConfirming] = useState<string | null>(null);
    const [paymentModal, setPaymentModal] = useState<{
        booking: any;
        amount: number;
        isCustom?: boolean;
    } | null>(null);
    const customInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (paymentModal?.isCustom) {
            customInputRef.current?.focus();
            customInputRef.current?.select();
        }
    }, [paymentModal?.isCustom]);

    const getStatusBadge = (status: string, booking: any) => {
        switch (status) {
            case "Upcoming": return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Upcoming</Badge>;
            case "Completed": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Completed</Badge>;
            case "Cancelled": return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getSourceBadge = (source: string) => {
        if (source === "OFFLINE") {
            return (
                <Badge variant="outline" className="gap-1 text-orange-500 border-orange-500/20">
                    <Laptop className="w-3 h-3" /> Offline
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="gap-1 text-blue-500 border-blue-500/20">
                <Globe className="w-3 h-3" /> Online
            </Badge>
        );
    };

    const getSessionCost = (duration: number, slotPrice?: number) => {
        const pricePerHour = slotPrice || 100;
        return Math.ceil((duration / 60) * pricePerHour);
    };

    const handleComplete = async (bookingId: string) => {
        setConfirming(bookingId);
        try {
            await updateBookingStatus(bookingId, "Completed");
            setPaymentModal(null);
            router.refresh();
        } catch (error) {
            console.error("Failed to complete session:", error);
            alert("Failed to close session");
        } finally {
            setConfirming(null);
        }
    };

    const handleDelete = async (bookingId: string) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        try {
            await deleteBooking(bookingId);
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancel = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await updateBookingStatus(bookingId, "Cancelled");
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No bookings found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Session Details</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {booking.source === 'ONLINE' && booking.user ? (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={booking.user.image || ""} />
                                            <AvatarFallback>{booking.user.name?.[0] || "P"}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                            <Laptop className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {booking.source === 'ONLINE' ? booking.user?.name : (booking.user?.name || "Walk-in Guest")}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {booking.source === 'ONLINE' ? "Online Booking" : "Offline / Walk-in"}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{booking.slot?.title || "Standard Session"}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                        {booking.type}
                                    </span>
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
                                <div className="flex flex-col gap-1">
                                    {getStatusBadge(booking.status, booking)}
                                    {getSourceBadge(booking.source)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold text-green-600">
                                    ₹{getSessionCost(booking.duration, booking.slot?.price)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="admin-theme">
                                        {booking.status !== 'Completed' && (
                                            <DropdownMenuItem onClick={() => {
                                                if (booking.user?.membership?.isSubscriber) {
                                                    handleComplete(booking.id);
                                                } else {
                                                    setPaymentModal({
                                                        booking,
                                                        amount: getSessionCost(booking.duration, booking.slot?.price)
                                                    });
                                                }
                                            }}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                                            </DropdownMenuItem>
                                        )}
                                        {booking.status === 'Upcoming' && (
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleCancel(booking.id)}>
                                                <XCircle className="w-4 h-4 mr-2" /> Cancel Booking
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(booking.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Booking
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Payment Modal */}
            <Dialog open={!!paymentModal} onOpenChange={(open) => !open && setPaymentModal(null)}>
                <DialogContent className="admin-theme">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Select payment method for <b>{paymentModal?.booking.user?.name || "Guest"}</b>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-2 w-full py-4">
                            {paymentModal?.isCustom ? (
                                <div className="relative w-full max-w-sm">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-7xl font-bold text-green-600">₹</span>
                                    <Input
                                        ref={customInputRef}
                                        type="number"
                                        value={paymentModal.amount}
                                        onChange={(e) => setPaymentModal({ ...paymentModal, amount: Number(e.target.value) })}
                                        className="text-8xl font-black text-green-600 h-32 text-center bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full !text-8xl"
                                    />
                                </div>
                            ) : (
                                <div className="text-8xl font-black text-green-600 py-6">
                                    ₹{paymentModal?.amount}
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground">Session Duration: {paymentModal?.booking.duration} mins</p>
                        </div>

                        {/* Payment Selection Toggle */}
                        <div className="w-full space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Payment Type</span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={!paymentModal?.isCustom ? "default" : "outline"}
                                        onClick={() => setPaymentModal(prev => prev ? { ...prev, amount: getSessionCost(prev.booking.duration, prev.booking.slot?.price), isCustom: false } : null)}
                                    >
                                        Full
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={paymentModal?.isCustom ? "default" : "outline"}
                                        onClick={() => setPaymentModal(prev => prev ? { ...prev, isCustom: true } : null)}
                                    >
                                        Custom
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700" onClick={() => paymentModal && handleComplete(paymentModal.booking.id)} disabled={!!confirming}>
                                    <Wallet className="h-6 w-6" />
                                    Cash Received
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700" onClick={() => paymentModal && handleComplete(paymentModal.booking.id)} disabled={!!confirming}>
                                    <div className="font-bold text-lg">UPI</div>
                                    Online Transfer
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPaymentModal(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
