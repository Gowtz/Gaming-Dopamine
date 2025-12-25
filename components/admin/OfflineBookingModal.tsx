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

interface OfflineBookingModalProps {
    users: any[];
    slots: any[];
}

export default function OfflineBookingModal({ users, slots }: OfflineBookingModalProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedSlotId, setSelectedSlotId] = useState("");
    const [startTimeType, setStartTimeType] = useState<"now" | "after">("now");
    const [duration, setDuration] = useState<number>(60);
    const [customDuration, setCustomDuration] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
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

    // Calculate next available time if slot is occupied
    const getNextAvailableTime = () => {
        if (!selectedSlot) return null;
        // In a real app, we'd check current bookings for this slot
        // For now, let's assume if it has bookings, we show the end time of the last one
        // Mocking this for now as we don't have the bookings passed in yet
        return "11:30 AM";
    };

    const handleCreateBooking = async () => {
        if (!selectedSlotId) return;
        setLoading(true);
        try {
            const finalDuration = customDuration ? parseInt(customDuration) : duration;
            const finalStartTime = startTimeType === "now" ? null : getNextAvailableTime();
            await createOfflineBooking(
                selectedUser?.id || null,
                selectedSlotId,
                finalDuration,
                finalStartTime || undefined,
                BookingSource.OFFLINE
            );
            setOpen(false);
            setShowConfirm(false);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Create Offline Booking
                </Button>
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
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={startTimeType === "now" ? "default" : "outline"}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setStartTimeType("now")}
                                >
                                    Start Now
                                </Button>
                                <Button
                                    type="button"
                                    variant={startTimeType === "after" ? "default" : "outline"}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setStartTimeType("after")}
                                >
                                    Start @ {getNextAvailableTime()}
                                </Button>
                            </div>
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

                    {!showConfirm ? (
                        <Button
                            className="w-full"
                            disabled={!selectedSlotId || loading}
                            onClick={() => setShowConfirm(true)}
                        >
                            Review Booking
                        </Button>
                    ) : (
                        <div className="space-y-4 p-4 rounded-lg border bg-amber-500/5 border-amber-500/20">
                            <div className="text-sm space-y-1">
                                <p><span className="text-muted-foreground">Player:</span> {selectedUser?.name || "Guest"}</p>
                                <p><span className="text-muted-foreground">Slot:</span> {selectedSlot?.title || selectedSlot?.type}</p>
                                <p><span className="text-muted-foreground">Start:</span> {startTimeType === "now" ? "Immediate" : `After current occupancy (@ ${getNextAvailableTime()})`}</p>
                                <p><span className="text-muted-foreground">Duration:</span> {customDuration || duration} mins</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Back</Button>
                                <Button className="flex-1" onClick={handleCreateBooking} disabled={loading}>
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
