"use client";

import { Clock, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UpcomingSlot {
    id: string;
    userId?: string | null;
    user?: {
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
    type: string;
    duration: number;
    date: Date;
    source: string;
}

interface UpcomingSessionsListProps {
    slots: UpcomingSlot[];
}

export function UpcomingSessionsList({ slots }: UpcomingSessionsListProps) {
    if (slots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                <p>No upcoming sessions scheduled.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {slots.map((slot) => {
                const startTime = new Date(slot.date);

                return (
                    <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 rounded-xl border bg-card transition-all hover:shadow-sm"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0">
                                {slot.user ? (
                                    <Avatar className="h-10 w-10 border shadow-sm">
                                        <AvatarImage src={slot.user.image || ""} />
                                        <AvatarFallback className="text-xs font-bold text-blue-600 bg-blue-100">
                                            {slot.user.name?.[0]?.toUpperCase() || "P"}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="font-semibold text-sm truncate">
                                        {slot.user?.name || "Guest Player"}
                                    </h4>
                                    <Badge variant="outline" className="text-[10px] font-normal py-0 h-4">
                                        {slot.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{format(startTime, "hh:mm a")}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(startTime, "MMM d")}</span>
                                    </div>
                                    <span>• {slot.duration}m</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase tracking-tight">
                                Upcoming
                            </Badge>
                            {slot.source === 'OFFLINE' && (
                                <span className="text-[9px] text-muted-foreground italic">Offline Booking</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
