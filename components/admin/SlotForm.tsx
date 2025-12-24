"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { createSlot } from "@/lib/actions/slot-actions";
import { Loader2 } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SlotForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        type: "PS5" as Platform,
        date: new Date().toISOString().split('T')[0],
        startTime: "12:00",
        endTime: "13:00",
        price: 15,
        maxPlayers: 1,
        isPublic: true,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await createSlot({
                ...formData,
                date: new Date(formData.date),
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
                    <CardTitle>Create New Slot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Session Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Weekend Special"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
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

                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                className="[color-scheme:dark]"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
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

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isPublic"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        />
                        <Label htmlFor="isPublic">Make slot publicly visible</Label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Slot
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
