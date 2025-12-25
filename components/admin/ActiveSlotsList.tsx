"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extendBooking, deleteBooking } from "@/lib/actions/booking-actions";
import { useRouter } from "next/navigation";
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
    slots: any[]; // Using any to avoid drift with prisma types in linter
}

export function ActiveSlotsList({ slots }: ActiveSlotsListProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [extending, setExtending] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: "extend" | "delete", id: string } | null>(null);
    // Force re-render every minute to update progress bars
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    // New State for Dialogs
    const [extensionData, setExtensionData] = useState<{
        bookingId: string;
        reason: string;
        paymentMethod: "OFFLINE_CASH" | "SUBSCRIPTION_HOURS";
        minutes: number;
    } | null>(null);
    const [conflictData, setConflictData] = useState<{ user: any } | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [override, setOverride] = useState(false);

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

    const getProgress = (startDate: Date, duration: number) => {
        const now = new Date();
        const start = startDate.getTime();
        const end = start + duration * 60000;
        const total = end - start;
        const elapsed = now.getTime() - start;
        const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
        return percentage;
    }

    const handleExtend = async () => {
        if (!extensionData) return;

        // Log attempt
        console.log("Attempting extension:", { extensionData, override, sessionUser: session?.user });

        setExtending(extensionData.bookingId);

        try {
            // Use safe access for adminId, fallback to "admin" if session not fully hydrated
            const adminId = (session?.user as any)?.id || "admin";

            const result = await extendBooking(
                extensionData.bookingId,
                extensionData.minutes,
                adminId,
                "Extended via Admin UI", // Default reason
                extensionData.paymentMethod,
                override // Force logic
            );

            console.log("Extension result:", result);

            if (result.success) {
                router.refresh();
                resetState();
            } else {
                // Handle conflict or error
                if (result.conflict) {
                    setConflictData({ user: result.conflict.user });
                } else {
                    setErrorMsg(result.error || "Unknown error");
                }
                // Don't close dialog, let user override
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
                router.refresh();
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

                    // Progress bar color logic
                    const progressColor = isEnding ? "rgba(234, 179, 8, 0.15)" : "rgba(34, 197, 94, 0.15)"; // Yellow if ending, Green otherwise

                    return (
                        <div
                            key={slot.id}
                            className="relative flex items-center justify-between p-4 rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md"
                            style={{
                                background: `linear-gradient(90deg, ${progressColor} ${progress}%, transparent ${progress}%)`
                            }}
                        >
                            <div className="relative z-10 flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <p className="font-semibold text-base truncate">
                                        {slot.user?.name || "Guest Player"}
                                    </p>
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {slot.slot?.title || slot.type}
                                    </Badge>
                                    {slot.isAdminExtended && (
                                        <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                                            Extended
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>Ends {formatTime(endTime)}</span>
                                    </div>
                                    <span className={isEnding ? "text-amber-600 font-bold" : "font-medium"}>
                                        {timeRemaining}
                                    </span>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center gap-2 ml-4">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setExtensionData({
                                        bookingId: slot.id,
                                        minutes: 30,
                                        reason: "",
                                        paymentMethod: "OFFLINE_CASH" // Default
                                    })}
                                    disabled={extending === slot.id}
                                    className="shrink-0 h-9 bg-background/80 hover:bg-background border shadow-sm"
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
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Extension Dialog */}
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
                            {/* Duration Chips */}
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

                            {/* Conflict Warning */}
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
                            {/* Generic Error Warning if just text */}
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
        </>
    );
}
