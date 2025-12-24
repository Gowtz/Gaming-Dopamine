"use client";

import { useState } from "react";
import { Platform, SlotStatus } from "@prisma/client";
import { Clock, Users, MoreVertical, ShieldCheck, ArrowRight, Wrench, Ban, Gamepad2, Activity, Edit, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SlotForm from "./SlotForm";
import { toggleSlotStatus } from "@/lib/actions/slot-actions";
import { useRouter } from "next/navigation";

interface Slot {
    id: string;
    title: string | null;
    type: Platform;
    startTime: string;
    endTime: string;
    duration: number;
    price: number;
    maxPlayers: number;
    status: SlotStatus;
    isPublic: boolean;
    bookings: Array<{
        id: string;
        userId: string;
        status: string;
    }>;
}

interface SlotListClientProps {
    slots: Slot[];
}

export default function SlotListClient({ slots }: SlotListClientProps) {
    const router = useRouter();
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

    const handleToggleStatus = async (slotId: string, currentStatus: SlotStatus) => {
        setTogglingStatus(slotId);
        try {
            const newStatus = currentStatus === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
            await toggleSlotStatus(slotId, newStatus);
            router.refresh();
        } catch (error) {
            console.error("Failed to toggle status:", error);
        } finally {
            setTogglingStatus(null);
        }
    };

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
            case "MAINTENANCE": return <Badge variant="destructive">Offline</Badge>;
            case "BLOCKED": return <Badge variant="outline">Blocked</Badge>;
        }
    };

    const getPlatformConfig = (platform: Platform) => {
        switch (platform) {
            case "PS5":
                return {
                    icon: Gamepad2,
                    gradient: "from-blue-500/20 to-purple-500/20",
                    iconColor: "text-blue-400",
                    bgColor: "bg-blue-500/10"
                };
            case "VR":
                return {
                    icon: ShieldCheck,
                    gradient: "from-cyan-500/20 to-pink-500/20",
                    iconColor: "text-cyan-400",
                    bgColor: "bg-cyan-500/10"
                };
            case "RACING_SIM":
                return {
                    icon: Activity,
                    gradient: "from-orange-500/20 to-red-500/20",
                    iconColor: "text-orange-400",
                    bgColor: "bg-orange-500/10"
                };
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                    const config = getPlatformConfig(slot.type);
                    const Icon = config.icon;
                    const currentOwner = slot.bookings.find(b => b.status === "Upcoming");
                    const isOffline = slot.status === "MAINTENANCE";

                    return (
                        <div
                            key={slot.id}
                            className={`group relative rounded-xl border bg-gradient-to-br ${config.gradient} backdrop-blur-sm overflow-hidden transition-all hover:shadow-lg ${isOffline ? 'grayscale opacity-70 bg-muted/50 border-muted' : ''}`}
                        >
                            {/* Platform Icon Background */}
                            <div className="absolute top-0 right-0 opacity-10">
                                <Icon className="w-32 h-32 -mr-8 -mt-8" />
                            </div>

                            <div className="relative p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${config.bgColor} group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${config.iconColor}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-none">{slot.title || "Standard Session"}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 font-medium">{slot.type.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingSlot(slot)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(slot.id, slot.status)}
                                                disabled={togglingStatus === slot.id}
                                            >
                                                <Power className="mr-2 h-4 w-4" />
                                                {isOffline ? "Set Online" : "Set Offline"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Wrench className="mr-2 h-4 w-4" />
                                                Delete slot
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Time & Price */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                                    </div>
                                    <span className="font-bold text-lg">${slot.price.toFixed(2)}</span>
                                </div>

                                {/* Capacity */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Capacity</span>
                                        </div>
                                        <span className="font-semibold text-foreground">{slot.maxPlayers} Players</span>
                                    </div>
                                </div>

                                {/* Status & Availability Toggle */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex flex-col gap-1">
                                        {getStatusBadge(slot.status)}
                                        {currentOwner && (
                                            <span className="text-xs text-muted-foreground">
                                                Owned by: <span className="font-medium">{currentOwner.userId.slice(0, 8)}...</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {slot.isPublic ? (
                                            <Badge variant="outline" className="text-xs">Public</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs">Hidden</Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Status Toggle */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <Label htmlFor={`status-${slot.id}`} className="text-sm font-medium cursor-pointer">
                                        {isOffline ? "Offline (Servicing)" : "Online"}
                                    </Label>
                                    <Switch
                                        id={`status-${slot.id}`}
                                        checked={!isOffline}
                                        onCheckedChange={() => handleToggleStatus(slot.id, slot.status)}
                                        disabled={togglingStatus === slot.id}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Slot</DialogTitle>
                        <DialogDescription>
                            Update the slot details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editingSlot && (
                        <SlotForm
                            slot={editingSlot}
                            onSuccess={() => {
                                setEditingSlot(null);
                                router.refresh();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
