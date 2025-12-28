"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Calendar, Clock, Crown, Edit2 } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { getSubscriptionPlan, getSubscriptionData } from "@/lib/actions/admin-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStore } from "@/hooks/useAdminStore";

export default function SubscriptionPage() {
    // Local state for fallback or explicit local data
    const [localPlan, setLocalPlan] = useState<any>(null);
    const [localSubscribers, setLocalSubscribers] = useState<any[]>([]);
    const [localHistory, setLocalHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        activeSubscriptionTab,
        setSubscriptionTab,
        users,
        subscriptionPlan: storePlan,
        subscriptionHistory: storeHistory,
        setData // Generic setter
    } = useAdminStore();

    const router = useRouter();

    useEffect(() => {
        const initData = async () => {
            // Check Store Cache
            const hasUsers = users.length > 0;
            const hasHistory = storeHistory.length > 0;
            const hasPlan = !!storePlan;

            if (hasUsers && hasHistory && hasPlan) {
                // Cache Hit
                setLocalPlan(storePlan);
                setLocalSubscribers(users.filter(u => u.membership?.isSubscriber));
                setLocalHistory(storeHistory);
                setLoading(false);
                return;
            }

            // Cache Miss - Fetch Data
            try {
                const [planData, subData] = await Promise.all([
                    getSubscriptionPlan(),
                    getSubscriptionData()
                ]);

                setLocalPlan(planData);
                setLocalSubscribers(subData.activeSubscribers);
                setLocalHistory(subData.history);

                // Update Store Cache
                // Note: We do NOT update 'users' here to avoid partial state (users requires all users).
                // We only update specific slices.
                setData({
                    subscriptionPlan: planData,
                    subscriptionHistory: subData.history
                });
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("Failed to load subscription data");
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [users, storeHistory, storePlan, setData]);

    // Derived state for rendering: Use Store if available, else Local
    // Actually the effect syncs store to local, so we can just use local?
    // Or prefer store to be reactive?
    // Let's use reactive store if available for 'Subscribers' (since users might update elsewhere), 
    // but fall back to local if users is empty (direct page load).

    // Efficient Strategy:
    // If users.length > 0, use users.filter
    // Else use localSubscribers
    const displaySubscribers = users.length > 0
        ? users.filter(u => u.membership?.isSubscriber)
        : localSubscribers;

    // For History/Plan, we blindly updated store, so store *should* be populated after fetch,
    // except if we use the local state which updates faster/simpler? 
    // Let's use the local state variables which are synchronized in the effect.
    // Wait, the effect runs ONCE. If store updates later (background), local details might be stale?
    // No, effect has deps [users, storeHistory...]. It will re-run if store updates.
    // So sticking to local state sync is fine.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Subscription Management</h1>
                    <p className="text-zinc-400">View active subscribers and track subscription history.</p>
                </div>
            </div>

            <Tabs value={activeSubscriptionTab} onValueChange={setSubscriptionTab} className="space-y-4">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="subscribers">Active Subscribers ({displaySubscribers.length})</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="subscribers">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-[300px] bg-zinc-800" />
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader>
                                    <Skeleton className="h-6 w-[200px] mb-2 bg-zinc-800" />
                                    <Skeleton className="h-4 w-[300px] bg-zinc-800" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full bg-zinc-800" />
                                        <Skeleton className="h-12 w-full bg-zinc-800" />
                                        <Skeleton className="h-12 w-full bg-zinc-800" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle>Active Subscribers</CardTitle>
                                <CardDescription>Users currently subscribed to the {localPlan?.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {displaySubscribers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No active subscribers found.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-zinc-800/50 border-zinc-800">
                                                <TableHead>User</TableHead>
                                                <TableHead>Tier</TableHead>
                                                <TableHead>Hours Used</TableHead>
                                                <TableHead>Expires At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {displaySubscribers.map((user) => (
                                                <TableRow key={user.id} className="hover:bg-zinc-800/50 border-zinc-800">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={user.image} />
                                                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span>{user.name}</span>
                                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                                            {user.membership?.tier}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-white">{user.membership?.utilizedHours}</span>
                                                            <span className="text-muted-foreground">/ {user.membership?.totalHours} hrs</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.membership?.expiresAt ? format(new Date(user.membership.expiresAt), "MMM d, yyyy") : "N/A"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    {loading ? (
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <Skeleton className="h-6 w-[200px] mb-2 bg-zinc-800" />
                                <Skeleton className="h-4 w-[300px] bg-zinc-800" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full bg-zinc-800" />
                                    <Skeleton className="h-12 w-full bg-zinc-800" />
                                    <Skeleton className="h-12 w-full bg-zinc-800" />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle>Subscription History</CardTitle>
                                <CardDescription>Recent subscription events and changes.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(localHistory.length > 0 ? localHistory : storeHistory).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No history records found.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-zinc-800/50 border-zinc-800">
                                                <TableHead>Time</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Details</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(localHistory.length > 0 ? localHistory : storeHistory).map((record) => (
                                                <TableRow key={record.id} className="hover:bg-zinc-800/50 border-zinc-800">
                                                    <TableCell className="text-muted-foreground">
                                                        {format(new Date(record.timestamp), "MMM d, h:mm a")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={record.user?.image} />
                                                                <AvatarFallback>{record.user?.name?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm">{record.user?.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline"
                                                            className={
                                                                record.action === "ACTIVATED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                                    record.action === "CANCELLED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                                        "bg-zinc-500/10 text-zinc-500"
                                                            }
                                                        >
                                                            {record.action}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-zinc-400">
                                                        {record.details}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
