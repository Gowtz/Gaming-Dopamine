"use client";

import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
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

interface ActiveSlot {
    id: string;
    user?: {
        name: string | null;
        email: string | null;
    } | null;
    type: string;
    duration: number;
    date: Date;
}

interface ActiveSlotsListProps {
    slots: ActiveSlot[];
}

export function ActiveSlotsList({ slots }: ActiveSlotsListProps) {
    const router = useRouter();
    const [extending, setExtending] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: "extend" | "delete", id: string } | null>(null);

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

    const handleExtend = async (bookingId: string) => {
        setExtending(bookingId);
        try {
            const result = await extendBooking(bookingId, 30);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to extend booking:", error);
        } finally {
            setExtending(null);
            setConfirmAction(null);
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
            <div className="text-center py-8 text-sm text-muted-foreground">
                No active slots at the moment
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {slots.map((slot) => {
                    const endTime = calculateEndTime(new Date(slot.date), slot.duration);
                    const timeRemaining = getTimeRemaining(endTime);
                    const isEnding = timeRemaining.includes("m left") && !timeRemaining.includes("h");

                    return (
                        <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm truncate">
                                        {slot.user?.name || "Guest Player"}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                        {slot.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>Ends at {formatTime(endTime)}</span>
                                    <span className={isEnding ? "text-orange-600 font-medium" : ""}>
                                        • {timeRemaining}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmAction({ type: "extend", id: slot.id })}
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

            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent className="admin-theme">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction?.type === "extend" ? "Extend Booking?" : "Delete Booking?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction?.type === "extend"
                                ? "Are you sure you want to add 30 minutes to this booking?"
                                : "This will permanently remove this active booking. This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (confirmAction?.type === "extend") handleExtend(confirmAction.id);
                                else if (confirmAction?.type === "delete") handleDelete(confirmAction.id);
                            }}
                            className={confirmAction?.type === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
