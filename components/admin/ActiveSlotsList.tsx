"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, Plus, Trash2, AlertTriangle, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extendBooking, deleteBooking } from "@/lib/actions/booking-actions";
import { updateBookingStatus } from "@/lib/actions/admin-actions";
import { useAdminStore } from "@/hooks/useAdminStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
    slots: any[];
}

export function ActiveSlotsList({ slots }: ActiveSlotsListProps) {
    const {
        updateBookingStatus: updateStoreBooking,
        deleteBooking: removeStoreBooking,
        updateBookingFields
    } = useAdminStore();
    const { data: session } = useSession();
    const [extending, setExtending] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: "extend" | "delete", id: string } | null>(null);
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    const [extensionData, setExtensionData] = useState<{
        bookingId: string;
        reason: string;
        paymentMethod: "OFFLINE_CASH" | "SUBSCRIPTION_HOURS";
        minutes: number;
    } | null>(null);
    const [conflictData, setConflictData] = useState<{ user: any } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [paymentModal, setPaymentModal] = useState<{
        slot: any;
        amount: number;
        isCustom?: boolean;
    } | null>(null);
    const customInputRef = useRef<HTMLInputElement>(null);
    const [override, setOverride] = useState(false);

    useEffect(() => {
        if (paymentModal?.isCustom) {
            customInputRef.current?.focus();
            customInputRef.current?.select();
        }
    }, [paymentModal?.isCustom]);

    const resetState = () => {
        setExtensionData(null);
        setConflictData(null);
        setErrorMsg(null);
        setOverride(false);
    };

    const calculateEndTime = (startDate: Date, duration: number) => {
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + duration);
        return endDate;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
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

    const getProgress = (startDate: Date, duration: number) => {
        const now = new Date();
        const start = startDate.getTime();
        const end = start + duration * 60000;
        const total = end - start;
        const elapsed = now.getTime() - start;
        const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
        return percentage;
    }

    const handleComplete = async (bookingId: string, amount?: number, method: string = "CASH") => {
        setExtending(bookingId);
        try {
            await updateBookingStatus(bookingId, "Completed", amount, method);
            // Optimistic Update - Positional Args fixed
            updateStoreBooking(bookingId, "Completed", amount, method);
            setPaymentModal(null);
        } catch (error) {
            console.error("Failed to complete session:", error);
        } finally {
            setExtending(null);
        }
    };

    const getSessionCost = (duration: number, slotPrice?: number) => {
        const pricePerHour = slotPrice || 100;
        return Math.ceil((duration / 60) * pricePerHour);
    };

    const handleExtend = async () => {
        if (!extensionData) return;

        console.log("Attempting extension:", { extensionData, override, sessionUser: session?.user });

        setExtending(extensionData.bookingId);

        try {
            const adminId = (session?.user as any)?.id || "admin";

            const result = await extendBooking(
                extensionData.bookingId,
                extensionData.minutes,
                adminId,
                "Extended via Admin UI",
                extensionData.paymentMethod,
                override
            );

            console.log("Extension result:", result);

            if (result.success) {
                const currentSlot = slots.find(s => s.id === extensionData.bookingId);
                if (currentSlot) {
                    // Use updateBookingFields for generic updates
                    updateBookingFields(extensionData.bookingId, {
                        duration: currentSlot.duration + extensionData.minutes,
                        isAdminExtended: true
                    });
                }
                resetState();
            } else {
                if (result.conflict) {
                    setConflictData({ user: result.conflict.user });
                } else {
                    setErrorMsg(result.error || "Unknown error");
                }
            }
        } catch (error) {
            console.error("Failed to extend booking:", error);
            setErrorMsg("Unexpected error occurred.");
        } finally {
            setExtending(null);
        }
    };

    const handleDelete = async (bookingId: string) => {
        setDeleting(bookingId);
        try {
            const result = await deleteBooking(bookingId);
            if (result.success) {
                removeStoreBooking(bookingId);
            }
        } catch (error) {
            console.error("Failed to delete booking:", error);
        } finally {
            setDeleting(null);
            setConfirmAction(null);
        }
    };

    if (slots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>No active sessions right now.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {slots.map((slot) => {
                    const startDate = new Date(slot.date);
                    const endTime = calculateEndTime(startDate, slot.duration);
                    const timeRemaining = getTimeRemaining(endTime);
                    const isEnding = timeRemaining.includes("m left") && !timeRemaining.includes("h");
                    const progress = getProgress(startDate, slot.duration);
                    const progressColor = isEnding ? "rgba(234, 179, 8, 0.15)" : "rgba(34, 197, 94, 0.15)";

                    return (
                        <div
                            key={slot.id}
                            className="relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md gap-4 md:gap-0"
                            style={{
                                background: `linear-gradient(90deg, ${progressColor} ${progress}%, transparent ${progress}%)`
                            }}
                        >
                            <div className="relative z-10 flex-1 min-w-0 w-full">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Avatar className="h-8 w-8 border shadow-sm">
                                        <AvatarImage src={slot.user?.image || ""} />
                                        <AvatarFallback>
                                            {slot.user?.name?.[0] || "G"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold text-base truncate max-w-[120px] md:max-w-none">
                                        {slot.user?.name || "Guest Player"}
                                    </p>
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 whitespace-nowrap">
                                        Ongoing
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-normal whitespace-nowrap">
                                        {slot.slot?.title || slot.type}
                                    </Badge>
                                    {slot.isAdminExtended && (
                                        <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 whitespace-nowrap">
                                            Extended
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground pl-1">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>Ends {formatTime(endTime)}</span>
                                    </div>
                                    <span className={isEnding ? "text-amber-600 font-bold" : "font-medium"}>
                                        {timeRemaining}
                                    </span>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 w-full md:w-auto md:ml-4">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const isSubscriber = slot.user?.membership?.isSubscriber;
                                        if (isSubscriber) {
                                            handleComplete(slot.id, 0, "SUBSCRIPTION");
                                        } else {
                                            setPaymentModal({
                                                slot,
                                                amount: getSessionCost(slot.duration, slot.slot?.price)
                                            });
                                        }
                                    }}
                                    className="flex-1 md:flex-none h-9 bg-background/80 hover:bg-background border shadow-sm text-green-600"
                                >
                                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                    Checkout
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setExtensionData({
                                        bookingId: slot.id,
                                        minutes: 30,
                                        reason: "",
                                        paymentMethod: "OFFLINE_CASH"
                                    })}
                                    disabled={extending === slot.id}
                                    className="flex-1 md:flex-none h-9 bg-background/80 hover:bg-background border shadow-sm"
                                >
                                    {extending === slot.id ? (
                                        "..."
                                    ) : (
                                        <>
                                            <Plus className="h-3 w-3 mr-1.5" />
                                            Extend
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="shrink-0 h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                    onClick={() => setConfirmAction({ type: "delete", id: slot.id })}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the booking
                            {confirmAction?.id && slots.find(s => s.id === confirmAction.id)?.user?.name ?
                                ` for ${(slots.find(s => s.id === confirmAction.id)?.user?.name)}` : ""}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => confirmAction && handleDelete(confirmAction.id)}
                            disabled={!!deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Booking"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!extensionData} onOpenChange={(open) => !open && resetState()}>
                <DialogContent className="admin-theme sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Extend Booking</DialogTitle>
                        <DialogDescription>
                            Add time to this session.
                        </DialogDescription>
                    </DialogHeader>
                    {extensionData && (
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <div className="flex gap-2">
                                    {[30, 60, 120].map((mins) => (
                                        <Button
                                            key={mins}
                                            size="sm"
                                            variant={extensionData.minutes === mins ? "default" : "outline"}
                                            onClick={() => setExtensionData({ ...extensionData, minutes: mins })}
                                            className="flex-1"
                                        >
                                            +{mins === 60 ? "1 hr" : mins === 120 ? "2 hrs" : "30 mins"}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {slots.find(s => s.id === extensionData.bookingId)?.source !== "OFFLINE" && (
                                <div className="space-y-2">
                                    <Label>Payment Method</Label>
                                    <Select
                                        value={extensionData.paymentMethod}
                                        onValueChange={(val: any) => setExtensionData({ ...extensionData, paymentMethod: val })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent className="admin-theme">
                                            <SelectItem value="OFFLINE_CASH">Offline Cash</SelectItem>
                                            {slots.find(s => s.id === extensionData.bookingId)?.userId && (
                                                <SelectItem value="SUBSCRIPTION_HOURS">Subscription Hours</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {conflictData && (
                                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 space-y-3">
                                    <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>Slot Blocked</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-background/50 p-2 rounded border border-border/50">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={conflictData.user?.image || ""} />
                                            <AvatarFallback>{conflictData.user?.name?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-xs">
                                            <div className="font-medium">{conflictData.user?.name || "Upcoming Guest"}</div>
                                            <div className="text-muted-foreground">Conflicts with this extension</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="override" className="text-sm font-medium">Override Conflict?</Label>
                                        <Switch
                                            id="override"
                                            checked={!!override}
                                            onCheckedChange={setOverride}
                                        />
                                    </div>
                                </div>
                            )}
                            {!conflictData && errorMsg && (
                                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 flex flex-col gap-2">
                                    <div className="text-sm text-destructive font-medium">{errorMsg}</div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="override-generic" className="text-sm font-medium">Force Extend?</Label>
                                        <Switch
                                            id="override-generic"
                                            checked={!!override}
                                            onCheckedChange={setOverride}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={handleExtend}
                            disabled={extending !== null || ((!!conflictData || !!errorMsg) && !override)}
                            variant={conflictData || errorMsg ? "destructive" : "default"}
                        >
                            {extending ? "Extending..." : (conflictData || errorMsg) ? "Confirm Override" : "Confirm Extension"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!paymentModal} onOpenChange={(open) => !open && setPaymentModal(null)}>
                <DialogContent className="admin-theme">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Select payment method for <b>{paymentModal?.slot.user?.name || "Guest"}</b>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-2 w-full py-2">
                            {paymentModal?.isCustom ? (
                                <div className="relative w-full flex flex-col items-center">
                                    <div className="flex items-center justify-center">
                                        <span className="text-4xl font-bold text-green-600 mr-2">₹</span>
                                        <Input
                                            ref={customInputRef}
                                            type="number"
                                            value={paymentModal.amount}
                                            onChange={(e) => setPaymentModal({ ...paymentModal, amount: Number(e.target.value) })}
                                            className="text-7xl font-black text-green-600 h-24 text-center bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-48"
                                        />
                                    </div>
                                    <Badge variant="outline" className="text-green-600 border-green-200">Custom Amount</Badge>
                                </div>
                            ) : (
                                <div className="text-8xl font-black text-green-600 py-4 flex items-center">
                                    <span className="text-4xl mr-2">₹</span>{paymentModal?.amount}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">Session Duration: {paymentModal?.slot.duration} mins</p>
                        </div>

                        <div className="w-full space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Payment Type</span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={!paymentModal?.isCustom ? "default" : "outline"}
                                        onClick={() => setPaymentModal(prev => prev ? { ...prev, amount: getSessionCost(prev.slot.duration, prev.slot.slot?.price || 100), isCustom: false } : null)}
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
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                                    onClick={() => paymentModal && handleComplete(paymentModal.slot.id, paymentModal.amount, "CASH")}
                                    disabled={extending === paymentModal?.slot.id}>
                                    <Wallet className="h-6 w-6" />
                                    Cash Received
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                                    onClick={() => paymentModal && handleComplete(paymentModal.slot.id, paymentModal.amount, "UPI")}
                                    disabled={extending === paymentModal?.slot.id}>
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
        </>
    );
}
