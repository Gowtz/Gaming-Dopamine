"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Clock,
    Calendar,
    History,
    Trophy,
    Mail,
    Gamepad2
} from "lucide-react";

interface PlayerDetailsModalProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PlayerDetailsModal({ user, open, onOpenChange }: PlayerDetailsModalProps) {
    if (!user) return null;

    const wallet = user.wallet || { balance: 0 };
    const membership = user.membership || { tier: "Bronze", isSubscriber: false, expiresAt: null };
    const bookings = user.bookings || [];

    const upcomingBookings = bookings.filter((b: any) => b.status === "Upcoming");
    const pastBookings = bookings.filter((b: any) => b.status !== "Upcoming");

    const formatDate = (date: any) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatShortDate = (date: any) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto admin-theme">
                <DialogHeader>
                    <DialogTitle>Player Details</DialogTitle>
                    <DialogDescription>
                        Comprehensive view of player activity and status.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-xl">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {user.email}
                            </p>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={membership.isSubscriber ? "default" : "outline"} className={membership.isSubscriber ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""}>
                                    {membership.isSubscriber ? <><Trophy className="w-3 h-3 mr-1" /> Subscriber</> : "Member"}
                                </Badge>
                                {user.role === "ADMIN" && (
                                    <Badge variant="secondary">Admin</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border bg-card">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Hours Left
                            </p>
                            <p className="text-2xl font-bold">{(wallet.balance / 100).toFixed(1)} hrs</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-card">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Subscription Ends
                            </p>
                            <p className="text-sm font-bold">
                                {formatDate(membership.expiresAt)}
                            </p>
                        </div>
                    </div>

                    {/* Bookings */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Gamepad2 className="w-4 h-4 text-primary" /> Upcoming Bookings ({upcomingBookings.length})
                            </h4>
                            <div className="space-y-2">
                                {upcomingBookings.length > 0 ? upcomingBookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm">
                                        <div>
                                            <p className="font-medium">{booking.type} Session</p>
                                            <p className="text-xs text-muted-foreground">{formatShortDate(booking.date)} @ {booking.startTime}</p>
                                        </div>
                                        <Badge variant="outline">{booking.duration}m</Badge>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic p-2">No upcoming bookings</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <History className="w-4 h-4 text-muted-foreground" /> Booking History
                            </h4>
                            <div className="space-y-2">
                                {pastBookings.length > 0 ? pastBookings.slice(0, 5).map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10 text-sm opacity-80">
                                        <div>
                                            <p className="font-medium">{booking.type}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{booking.status}</Badge>
                                    </div>
                                )) : (
                                    <p className="text-xs text-muted-foreground italic p-2">No past bookings</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
