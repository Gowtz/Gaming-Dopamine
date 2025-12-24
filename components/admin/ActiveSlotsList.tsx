"use client";

import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extendBooking } from "@/lib/actions/booking-actions";
import { useRouter } from "next/navigation";

interface ActiveSlot {
    id: string;
    user: {
        name: string | null;
        email: string | null;
    };
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
                                    {slot.user.name || "Unknown User"}
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
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExtend(slot.id)}
                            disabled={extending === slot.id}
                            className="ml-2 shrink-0"
                        >
                            {extending === slot.id ? (
                                "Extending..."
                            ) : (
                                <>
                                    <Plus className="h-3 w-3 mr-1" />
                                    30m
                                </>
                            )}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
