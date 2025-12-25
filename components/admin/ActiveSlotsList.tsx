"use client";

import { useState } from "react";
import { Clock, Plus, Trash2, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extendBooking, deleteBooking } from "@/lib/actions/booking-actions";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

interface ActiveSlot {
    id: string;
    userId?: string | null;
    user?: {
        id: string;
        name: string | null;
        email: string | null;
        membership?: {
            isSubscriber: boolean;
            totalHours: number;
            utilizedHours: number;
        } | null;
    } | null;
    type: string;
    duration: number;
    date: Date;
    source: string;
    isAdminExtended: boolean;
    price?: number;
    slot?: {
        price: number;
        title: string;
    } | null;
}

interface ActiveSlotsListProps {
    slots: any[]; // Using any to avoid drift with prisma types in linter
}

export function ActiveSlotsList({ slots }: ActiveSlotsListProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [extending, setExtending] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: "extend" | "delete", id: string } | null>(null);

    // New State for Dialogs
    const [extensionData, setExtensionData] = useState<{
        bookingId: string;
        reason: string;
        paymentMethod: "OFFLINE_CASH" | "SUBSCRIPTION_HOURS";
        minutes: number;
    } | null>(null);

    // State for End Session
    const [endSessionData, setEndSessionData] = useState<{
        bookingId: string;
        user: ActiveSlot['user'];
        source: string;
        duration: number;
        price?: number;
    } | null>(null);

    const calculateEndTime = (startDate: Date, duration: number) => {
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + duration);
        return endDate;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getTimeRemaining = (endTime: Date) => {
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 0) return "Ended";
        if (minutes < 60) return `${minutes}m left`;

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m left`;
    };

    const handleExtend = async () => {
        if (!extensionData || !session?.user) return;
        setExtending(extensionData.bookingId);
        try {
            const adminId = (session.user as any).id || "admin";
            const result = await extendBooking(
                extensionData.bookingId,
                extensionData.minutes,
                adminId,
                extensionData.reason,
                extensionData.paymentMethod
            );
            if (result.success) {
                router.refresh();
                setExtensionData(null);
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error("Failed to extend booking:", error);
        } finally {
            setExtending(null);
        }
    };

    const handleDelete = async (bookingId: string) => {
        setDeleting(bookingId);
        try {
            const result = await deleteBooking(bookingId);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to delete booking:", error);
        } finally {
            setDeleting(null);
            setConfirmAction(null);
            setEndSessionData(null); // Ensure end session dialog is closed if deleting
        }
    };

    // Calculate dynamic pricing
    const getSessionCost = (duration: number, slotPrice?: number) => {
        const pricePerHour = slotPrice || 100;
        return Math.ceil((duration / 60) * pricePerHour);
    };

    return (
        <>
            <div className="space-y-3">
                {slots.map((slot) => {
                    const endTime = calculateEndTime(new Date(slot.date), slot.duration);
                    const timeRemaining = getTimeRemaining(endTime);
                    const isEnding = timeRemaining.includes("m left") && !timeRemaining.includes("h");
                    const hasEnded = timeRemaining === "Ended";

                    return (
                        <div
                            key={slot.id}
                            className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${hasEnded ? 'border-red-500/50 bg-red-500/5' : ''}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm truncate">
                                        {slot.user?.name || "Guest Player"}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                        {slot.type}
                                    </Badge>
                                    {slot.isAdminExtended && (
                                        <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                                            Admin Extended
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Ends at {formatTime(endTime)}</span>
                                    <span className={hasEnded ? "text-red-600 font-bold" : isEnding ? "text-orange-600 font-medium" : ""}>
                                        • {timeRemaining}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                {hasEnded && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 shadow-sm"
                                        onClick={() => setEndSessionData({
                                            bookingId: slot.id,
                                            user: slot.user,
                                            source: slot.source || "OFFLINE",
                                            duration: slot.duration,
                                            price: slot.slot?.price || 100
                                        })}
                                    >
                                        <StopCircle className="h-3 w-3 mr-1" />
                                        End
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setExtensionData({
                                        bookingId: slot.id,
                                        minutes: 30,
                                        reason: "",
                                        paymentMethod: "OFFLINE_CASH" // Default
                                    })}
                                    disabled={extending === slot.id}
                                    className="shrink-0 h-8"
                                >
                                    {extending === slot.id ? (
                                        "..."
                                    ) : (
                                        <>
                                            <Plus className="h-3 w-3 mr-1" />
                                            30m
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConfirmAction({ type: "delete", id: slot.id })}
                                    disabled={deleting === slot.id}
                                    className="shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Delete Confirmation */}
            <AlertDialog open={!!confirmAction && confirmAction.type === 'delete'} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent className="admin-theme">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Booking?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this active booking. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (confirmAction?.id) handleDelete(confirmAction.id);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Extension Dialog */}
            <Dialog open={!!extensionData} onOpenChange={(open) => !open && setExtensionData(null)}>
                <DialogContent className="admin-theme sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Extend Booking</DialogTitle>
                        <DialogDescription>
                            Add time to this session. Requires a valid reason and payment method.
                        </DialogDescription>
                    </DialogHeader>
                    {extensionData && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Reason</Label>
                                <Input
                                    id="reason"
                                    className="col-span-3"
                                    placeholder="e.g. Requested more time"
                                    value={extensionData.reason}
                                    onChange={(e) => setExtensionData({ ...extensionData, reason: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Payment</Label>
                                <Select
                                    value={extensionData.paymentMethod}
                                    onValueChange={(val: any) => setExtensionData({ ...extensionData, paymentMethod: val })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OFFLINE_CASH">Offline Cash</SelectItem>
                                        <SelectItem value="SUBSCRIPTION_HOURS">Subscription Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" onClick={handleExtend} disabled={!extensionData?.reason || extending !== null}>
                            {extending ? "Extending..." : "Confirm Extension"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* End Session Dialog */}
            <Dialog open={!!endSessionData} onOpenChange={(open) => !open && setEndSessionData(null)}>
                <DialogContent className="admin-theme sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>End Session Receipt</DialogTitle>
                        <DialogDescription>
                            Review session details before closing.
                        </DialogDescription>
                    </DialogHeader>
                    {endSessionData && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-md bg-muted p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Player</span>
                                    <span className="font-medium">{endSessionData.user?.name || "Guest"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">{endSessionData.duration} mins</span>
                                </div>
                                {endSessionData.user?.membership?.isSubscriber ? (
                                    <>
                                        <div className="flex justify-between border-t pt-2 mt-2">
                                            <span className="text-muted-foreground">Used Hours</span>
                                            <span className="font-medium">{endSessionData.user.membership.utilizedHours.toFixed(1)}h</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Hours</span>
                                            <span className="font-medium">{endSessionData.user.membership.totalHours}h</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between border-t pt-2 mt-2 text-lg font-bold">
                                        <span>Total Due</span>
                                        <span className="text-green-600">₹{getSessionCost(endSessionData.duration, endSessionData.price)}</span>
                                    </div>
                                )}
                            </div>

                            {!endSessionData.user?.membership?.isSubscriber && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" className="w-full">UPI Payment</Button>
                                    <Button variant="outline" className="w-full">Cash Received</Button>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="default" className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                            // In real app, call action to mark as Completed
                            deleteBooking(endSessionData?.bookingId!).then(() => {
                                setEndSessionData(null);
                                router.refresh();
                            })
                        }}>
                            Confim & Close Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
