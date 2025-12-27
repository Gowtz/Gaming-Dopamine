"use client";

import { useState } from "react";
import prisma from "@/lib/prisma";
import {
    Calendar,
    Clock,
    MoreVertical,
    Edit2,
    Trash2,
    Power,
    Gamepad2,
    Monitor,
    Cpu,
    Flame,
    Users,
    ShieldCheck,
    Activity,
    Trophy,
    CheckCircle2
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SlotForm from "./SlotForm";
import { toggleSlotStatus, deleteSlot } from "@/lib/actions/slot-actions";
import { useRouter } from "next/navigation";

import { Platform } from "@prisma/client";

// Use local type definitions or cast to any to resolve Prisma export issues
type PlatformType = "PS5" | "VR" | "RACING_SIM";
type SlotStatusType = "AVAILABLE" | "BOOKED" | "BLOCKED" | "MAINTENANCE";

interface Slot {
    id: string;
    title: string | null;
    type: Platform;
    startTime: string;
    endTime: string;
    duration: number;
    price: number;
    maxPlayers: number;
    status: string; // SlotStatus enum
    isPublic: boolean;
    bookings?: any[];
}

export default function SlotListClient({ slots }: { slots: Slot[] }) {
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
    const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
    const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
    const router = useRouter();

    const handleToggleStatus = async (slotId: string, currentStatus: string) => {
        setTogglingStatus(slotId);
        try {
            const newStatus = currentStatus === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
            // @ts-ignore
            await toggleSlotStatus(slotId, newStatus);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setTogglingStatus(null);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSlot(id);
            setSlotToDelete(null);
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AVAILABLE": return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
            case "BOOKED": return <Badge variant="secondary">Booked</Badge>;
            case "MAINTENANCE": return <Badge variant="destructive">Maintenance</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPlatformConfig = (platform: string) => {
        switch (platform) {
            case "PS5":
                return {
                    icon: Gamepad2,
                    iconColor: "text-zinc-400",
                    borderColor: "border-zinc-800"
                };
            case "VR":
                return {
                    icon: Monitor,
                    iconColor: "text-zinc-400",
                    borderColor: "border-zinc-800"
                };
            case "RACING_SIM":
                return {
                    icon: Flame,
                    iconColor: "text-zinc-400",
                    borderColor: "border-zinc-800"
                };
            default:
                return {
                    icon: Activity,
                    iconColor: "text-zinc-400",
                    borderColor: "border-zinc-800"
                };
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => {
                    const config = getPlatformConfig(slot.type);
                    return (
                        <Card key={slot.id} className={`overflow-hidden border bg-zinc-900/50 ${config.borderColor} group hover:shadow-lg transition-all`}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <config.icon className={`h-5 w-5 ${config.iconColor}`} />
                                        <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                            {slot.type}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="admin-theme">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => setEditingSlot(slot)}>
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Edit Slot
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(slot.id, slot.status)}
                                                disabled={togglingStatus === slot.id}
                                            >
                                                <Power className="mr-2 h-4 w-4" />
                                                {slot.status === "MAINTENANCE" ? "Set Active" : "Set Maintenance"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setSlotToDelete(slot.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Slot
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-xl font-bold text-white font-outfit">
                                        {slot.title || `${slot.type} Training`}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-zinc-500">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-xs">{slot.startTime} - {slot.endTime}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Price per session</p>
                                    <p className="text-lg font-bold text-white font-outfit">₹{slot.price}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Capacity</p>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3 text-zinc-500" />
                                        <p className="text-sm font-medium text-white">{slot.maxPlayers} Players</p>
                                    </div>
                                </div>
                                <div className="col-span-2 pt-2 flex items-center justify-between border-t border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        {slot.isPublic ? (
                                            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-none">PUBLIC</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] bg-zinc-500/10 text-zinc-400 border-none">PRIVATE</Badge>
                                        )}
                                        {getStatusBadge(slot.status)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {editingSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl admin-theme overflow-hidden">
                        <CardHeader>
                            <CardTitle>Edit Slot</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[80vh] overflow-y-auto">
                            <SlotForm
                                slot={editingSlot}
                                onSuccess={() => {
                                    setEditingSlot(null);
                                    router.refresh();
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            <AlertDialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
                <AlertDialogContent className="admin-theme">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the slot from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (slotToDelete) {
                                    handleDelete(slotToDelete);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
