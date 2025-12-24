"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { bulkCreateSlots } from "@/lib/actions/slot-actions";
import { Loader2, Layers } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BulkSlotForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "PS5" as Platform,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: "17:00",
        endTime: "22:00",
        price: 15,
        maxPlayers: 1,
        frequency: "daily" as "daily" | "weekdays",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await bulkCreateSlots({
                ...formData,
                startDate: new Date(formData.startDate),
                endDate: new Date(formData.endDate),
                price: Number(formData.price),
                maxPlayers: Number(formData.maxPlayers),
            });
            router.push("/admin/slots");
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Slot Generator</CardTitle>
                    <CardDescription>Create multiple slots at once for a date range.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                className="[color-scheme:dark]"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                className="[color-scheme:dark]"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value) => setFormData({ ...formData, frequency: value as "daily" | "weekdays" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Every Day</SelectItem>
                                    <SelectItem value="weekdays">Weekdays Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platform">Platform</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as Platform })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PS5">PlayStation 5</SelectItem>
                                    <SelectItem value="VR">VR Arena</SelectItem>
                                    <SelectItem value="RACING_SIM">Racing Simulator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                className="[color-scheme:dark]"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                className="[color-scheme:dark]"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price Per Slot (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxPlayers">Capacity</Label>
                            <Input
                                id="maxPlayers"
                                type="number"
                                min="1"
                                value={formData.maxPlayers}
                                onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex gap-4">
                            <div className="p-2 bg-primary/10 rounded-md text-primary h-fit">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium">Bulk Generation Info</h4>
                                <p className="text-xs text-muted-foreground">
                                    This will generate one slot per day for the selected platform within the specified date range. All slots will use the same time and price.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Bulk Slots
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
