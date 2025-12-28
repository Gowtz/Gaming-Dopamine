"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Search, Plus, Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createOfflineBooking } from "@/lib/actions/admin-actions";
import { useRouter } from "next/navigation";
import { BookingSource } from "@prisma/client";
import { format, addMinutes, isAfter, isBefore, isEqual, parse, startOfToday } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/hooks/useAdminStore";

interface OfflineBookingModalProps {
    users: any[];
    slots: any[];
    existingBookings?: any[];
    trigger?: React.ReactNode;
}

export default function OfflineBookingModal({ users, slots, existingBookings = [], trigger }: OfflineBookingModalProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedSlotId, setSelectedSlotId] = useState("");
    const [startTimeType, setStartTimeType] = useState<"now" | "after" | "custom">("now");
    const [customStartTime, setCustomStartTime] = useState("");
    const [duration, setDuration] = useState<number>(60);
    const [customDuration, setCustomDuration] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [conflictError, setConflictError] = useState<string | null>(null);
    const [overrideTiming, setOverrideTiming] = useState(false);
    const router = useRouter();

    const durations = [
        { label: "1 hr", value: 60 },
        { label: "1.5 hr", value: 90 },
        { label: "2 hr", value: 120 },
        { label: "3 hr", value: 180 },
        { label: "4 hr", value: 240 },
    ];

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);

    const selectedSlot = slots.find(s => s.id === selectedSlotId);

    // Filter bookings for selected slot and only active/upcoming ones
    const slotBookings = existingBookings.filter(b => b.slotId === selectedSlotId && b.status === "Upcoming");

    // Helper to Convert HH:mm A to absolute Date for today
    const timeToDate = (timeStr: string) => {
        if (!timeStr) return null;
        try {
            const formatStr = timeStr.includes(" ") ? "hh:mm a" : "HH:mm";
            const date = parse(timeStr, formatStr, new Date());
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date;
        } catch (e) {
            return null;
        }
    }

    // Calculate next available time based on end of current/upcoming sessions
    const getNextAvailableTime = () => {
        if (!selectedSlot || slotBookings.length === 0) return null;

        const now = new Date();
        // Find bookings that haven't ended yet
        const activeOrUpcoming = slotBookings.filter(b => {
            const start = timeToDate(b.startTime);
            if (!start) return false;
            const end = addMinutes(start, b.duration);
            return isAfter(end, now);
        });

        if (activeOrUpcoming.length === 0) return null;

        // Get the end time of the latest booking
        const latestBooking = activeOrUpcoming.reduce((prev, current) => {
            const prevStart = timeToDate(prev.startTime);
            const currStart = timeToDate(current.startTime);
            if (!prevStart || !currStart) return current;

            const prevEnd = addMinutes(prevStart, prev.duration);
            const currEnd = addMinutes(currStart, current.duration);
            return isAfter(currEnd, prevEnd) ? current : prev;
        });

        const start = timeToDate(latestBooking.startTime);
        if (!start) return null;
        const endTime = addMinutes(start, latestBooking.duration);
        return format(endTime, "HH:mm");
    };

    const nextTimeStr = getNextAvailableTime();


    const checkConflict = (checkStart?: Date) => {
        if (!selectedSlotId) return null;

        let start: Date | null = null;
        if (checkStart) {
            start = checkStart;
        } else {
            if (startTimeType === "now") start = new Date();
            else if (startTimeType === "after" && nextTimeStr) start = timeToDate(nextTimeStr);
            else if (startTimeType === "custom" && customStartTime) start = timeToDate(customStartTime);
        }

        if (!start) return null;

        // Zero out seconds and ms for comparison
        start.setSeconds(0);
        start.setMilliseconds(0);

        const end = addMinutes(start, customDuration ? parseInt(customDuration) : duration);

        for (const b of slotBookings) {
            const bStart = timeToDate(b.startTime);
            if (!bStart) continue;

            const bEnd = addMinutes(bStart, b.duration);

            // True overlap check (exclusive of boundaries)
            // (StartA < EndB) && (EndA > StartB)
            if (isBefore(start, bEnd) && isAfter(end, bStart)) {
                return `Time conflict with ${b.user?.name || "another player"}'s session (${format(bStart, "hh:mm a")} - ${format(bEnd, "hh:mm a")})`;
            }
        }
        return null;
    };

    const checkSlotTiming = () => {
        if (!selectedSlot) return null;

        let start: Date | null = null;
        if (startTimeType === "now") start = new Date();
        else if (startTimeType === "after" && nextTimeStr) start = timeToDate(nextTimeStr);
        else if (startTimeType === "custom" && customStartTime) start = timeToDate(customStartTime);

        if (!start) return null;

        start.setSeconds(0);
        start.setMilliseconds(0);

        const end = addMinutes(start, customDuration ? parseInt(customDuration) : duration);

        const slotStart = timeToDate(selectedSlot.startTime);
        const slotEnd = timeToDate(selectedSlot.endTime);

        if (!slotStart || !slotEnd) return null;

        if (isBefore(start, slotStart) || isAfter(end, slotEnd)) {
            return `Session is outside slot hours (${selectedSlot.startTime} - ${selectedSlot.endTime})`;
        }
        return null;
    };

    const currentConflict = checkConflict();
    const timingWarning = checkSlotTiming();
    const nowConflict = checkConflict(new Date());

    const { addBooking } = useAdminStore();
    // const router = useRouter(); // Removed for CSR

    // ... (logic)

    const handleCreateBooking = async () => {
        if (!selectedSlotId || (currentConflict && !overrideTiming)) return;
        setLoading(true);
        try {
            const finalDuration = customDuration ? parseInt(customDuration) : duration;
            let finalStartTime: string | undefined = undefined;

            if (startTimeType === "now") {
                // Let backend handle "now" to ensure server time sync
                finalStartTime = undefined;
            } else if (startTimeType === "after") {
                finalStartTime = nextTimeStr || undefined;
            } else if (startTimeType === "custom") {
                finalStartTime = customStartTime;
            }

            const newBooking = await createOfflineBooking(
                selectedUser?.id || null,
                selectedSlotId,
                finalDuration,
                finalStartTime,
                BookingSource.OFFLINE,
                overrideTiming,
                new Date().getTimezoneOffset()
            );

            if (newBooking) {
                addBooking(newBooking);
            }

            setOpen(false);
            setShowConfirm(false);
            // router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" /> Create Offline Booking
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] admin-theme">
                <DialogHeader>
                    <DialogTitle>Create Offline Booking</DialogTitle>
                    <DialogDescription>
                        Manually add a booking for an offline player.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {/* User Search */}
                    <div className="space-y-2">
                        <Label>Select Player</Label>
                        {!selectedUser ? (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search player..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    {search && filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted cursor-pointer"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.image || ""} />
                                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={selectedUser.image || ""} />
                                        <AvatarFallback>{selectedUser.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{selectedUser.name}</span>
                                        <span className="text-xs text-muted-foreground">{selectedUser.email}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Change</Button>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground italic mt-1">* Optional: Leave empty for Guest booking</p>
                    </div>

                    {/* Slot Selection */}
                    <div className="space-y-2">
                        <Label>Select Time Slot</Label>
                        <Select value={selectedSlotId} onValueChange={setSelectedSlotId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose an available slot" />
                            </SelectTrigger>
                            <SelectContent className="admin-theme">
                                {slots.filter(s => s.status === "AVAILABLE").map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id}>
                                        {slot.title || slot.type} ({slot.startTime} - {slot.endTime}) - ₹{slot.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Time Selection */}
                    {selectedSlotId && (
                        <div className="space-y-3">
                            <Label>Start Time</Label>
                            <div className="flex flex-wrap gap-2">
                                {!nowConflict && (
                                    <Button
                                        type="button"
                                        variant={startTimeType === "now" ? "default" : "outline"}
                                        size="sm"
                                        className="flex-1 min-w-[120px]"
                                        onClick={() => setStartTimeType("now")}
                                    >
                                        Start Now
                                    </Button>
                                )}
                                {nextTimeStr && (
                                    <Button
                                        type="button"
                                        variant={startTimeType === "after" ? "default" : "outline"}
                                        size="sm"
                                        className="flex-1 min-w-[120px]"
                                        onClick={() => setStartTimeType("after")}
                                    >
                                        Start @ {nextTimeStr}
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant={startTimeType === "custom" ? "default" : "outline"}
                                    size="sm"
                                    className="flex-1 min-w-[120px]"
                                    onClick={() => setStartTimeType("custom")}
                                >
                                    Custom Time
                                </Button>
                            </div>
                            {startTimeType === "custom" && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        type="time"
                                        className="h-8 w-40"
                                        value={customStartTime}
                                        onChange={(e) => setCustomStartTime(e.target.value)}
                                    />
                                    <span className="text-xs text-muted-foreground italic">(Select start time)</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Duration Selection */}
                    <div className="space-y-3">
                        <Label>Duration</Label>
                        <div className="flex flex-wrap gap-2">
                            {durations.map((d) => (
                                <Button
                                    key={d.value}
                                    type="button"
                                    variant={duration === d.value && !customDuration ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full"
                                    onClick={() => {
                                        setDuration(d.value);
                                        setCustomDuration("");
                                    }}
                                >
                                    {d.label}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                type="number"
                                placeholder="Custom mins..."
                                className="h-8 w-32"
                                value={customDuration}
                                onChange={(e) => setCustomDuration(e.target.value)}
                            />
                            <span className="text-xs text-muted-foreground">mins</span>
                        </div>
                    </div>

                    {(currentConflict || timingWarning) && (
                        <div className="flex flex-col gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-start gap-2 text-amber-600 text-xs text-balance">
                                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-semibold">{currentConflict || timingWarning}</p>
                                    <p>Do you want to proceed anyway? This will force the booking.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="override-timing"
                                    checked={overrideTiming}
                                    onCheckedChange={setOverrideTiming}
                                />
                                <Label htmlFor="override-timing" className="text-xs font-medium cursor-pointer">
                                    Override Constraints (Dangerous)
                                </Label>
                            </div>
                        </div>
                    )}

                    {!showConfirm ? (
                        <Button
                            className="w-full"
                            disabled={!selectedSlotId || loading || (!!(currentConflict || timingWarning) && !overrideTiming)}
                            onClick={() => setShowConfirm(true)}
                        >
                            Review Booking
                        </Button>
                    ) : (
                        <div className="space-y-4 p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                            <div className="text-sm space-y-1">
                                <p><span className="text-muted-foreground">Player:</span> {selectedUser?.name || "Guest"}</p>
                                <p><span className="text-muted-foreground">Slot:</span> {selectedSlot?.title || selectedSlot?.type}</p>
                                <p>
                                    <span className="text-muted-foreground">Start:</span> {
                                        startTimeType === "now" ? "Immediate" :
                                            startTimeType === "after" ? `After current occupancy (@ ${nextTimeStr})` :
                                                `Scheduled for ${customStartTime}`
                                    }
                                </p>
                                <p><span className="text-muted-foreground">Duration:</span> {customDuration || duration} mins</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Back</Button>
                                <Button className="flex-1" onClick={handleCreateBooking} disabled={loading || !!currentConflict || (!!timingWarning && !overrideTiming)}>
                                    {loading ? "Creating..." : "Confirm & Create"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
