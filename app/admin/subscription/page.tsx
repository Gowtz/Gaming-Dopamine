"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Calendar, Clock, Crown, Edit2 } from 'lucide-react';
import { getSubscriptionPlan, updateSubscriptionPlan } from "@/lib/actions/admin-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState<{ name: string; totalHours: number | string }>({ name: "", totalHours: 50 });
    const router = useRouter();

    useEffect(() => {
        loadPlan();
    }, []);

    const loadPlan = async () => {
        try {
            const data = await getSubscriptionPlan();
            setPlan(data);
            setFormData({ name: data.name, totalHours: data.totalHours });
        } catch (error) {
            console.error("Failed to load plan", error);
            toast.error("Failed to load subscription plan");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await updateSubscriptionPlan({
                name: formData.name,
                totalHours: Number(formData.totalHours) || 0
            });
            toast.success("Subscription plan updated successfully");
            setEditOpen(false);
            loadPlan();
            router.refresh();
        } catch (error) {
            console.error("Failed to update plan", error);
            toast.error("Failed to update plan");
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white font-outfit">Subscription Management</h1>
                    <p className="text-zinc-400">Manage the default plan settings for subscribers.</p>
                </div>
            </div>

            <Card className="max-w-md border-zinc-800 bg-zinc-900/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Current Plan
                    </CardTitle>
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="admin-theme sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Subscription Plan</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSave} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="planName">Plan Name</Label>
                                    <Input
                                        id="planName"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Gold Membership"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalHours">Total Playable Hours</Label>
                                    <div className="relative">
                                        <Input
                                            id="totalHours"
                                            type="number"
                                            min="0"
                                            value={formData.totalHours}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, totalHours: val === "" ? "" : parseFloat(val) })
                                            }}
                                            className="pl-9"
                                            required
                                        />
                                        <Clock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Monthly hours allocated to subscribers.</p>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={formLoading}>
                                        {formLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-1">
                            <span className="text-xs uppercase text-zinc-500 font-bold tracking-wider">Plan Name</span>
                            <div className="text-2xl font-bold text-white font-outfit">{plan?.name}</div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs uppercase text-zinc-500 font-bold tracking-wider">Allocation</span>
                            <div className="flex items-end gap-2">
                                <div className="text-4xl font-bold text-primary font-outfit">{plan?.totalHours}</div>
                                <div className="text-lg text-zinc-400 mb-1.5">hours / month</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 p-2 rounded-md">
                                <Calendar className="w-4 h-4 text-zinc-500" />
                                <span>Updates apply to new subscriptions</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
