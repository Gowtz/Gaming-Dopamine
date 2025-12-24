"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { createSlot, updateSlot, getGames } from "@/lib/actions/slot-actions";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimpleTimePicker } from "@/components/ui/simple-time-picker";

interface Slot {
    id: string;
    title: string | null;
    type: Platform;
    startTime: string;
    endTime: string;
    duration: number;
    price: number;
    maxPlayers: number;
    status: string;
    isPublic: boolean;
    supportedGames?: Array<{ id: string }>;
}

interface SlotFormProps {
    slot?: Slot;
    onSuccess?: () => void;
}

export default function SlotForm({ slot, onSuccess }: SlotFormProps = {}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Array<{ id: string; title: string; platform: Platform }>>([]);
    const [selectedGames, setSelectedGames] = useState<string[]>(
        slot?.supportedGames?.map(g => g.id) || []
    );
    const [formData, setFormData] = useState({
        title: slot?.title || "",
        type: (slot?.type as Platform) || "PS5",
        startTime: slot?.startTime || "10:00",
        endTime: slot?.endTime || "22:00",
        price: slot?.price || 0,
        maxPlayers: slot?.maxPlayers || 1,
        isPublic: slot?.isPublic ?? true,
    });

    useEffect(() => {
        getGames().then(setGames);
    }, []);

    const toggleGame = (gameId: string) => {
        setSelectedGames(prev =>
            prev.includes(gameId)
                ? prev.filter(id => id !== gameId)
                : [...prev, gameId]
        );
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                ...formData,
                price: Number(formData.price),
                maxPlayers: Number(formData.maxPlayers),
                gameIds: selectedGames.length > 0 ? selectedGames : [],
            };

            if (slot?.id) {
                const { gameIds, ...updateData } = data;
                await updateSlot(slot.id, {
                    ...updateData,
                    supportedGames: {
                        set: gameIds.map(id => ({ id }))
                    }
                });
            } else {
                await createSlot(data);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/admin/slots");
            }
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
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
                            step="0.01"
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

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SimpleTimePicker
                        value={formData.startTime}
                        onChange={(value) => setFormData({ ...formData, startTime: value })}
                        label="Start Time"
                    />
                    <SimpleTimePicker
                        value={formData.endTime}
                        onChange={(value) => setFormData({ ...formData, endTime: value })}
                        label="End Time"
                    />
                </div>

                {/* Supported Games */}
                <div className="space-y-2">
                    <Label>Supported Games (Optional)</Label>
                    <p className="text-sm text-muted-foreground">Select games available for this slot</p>
                    <ScrollArea className="h-48 rounded-md border p-4">
                        {games.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No games available. Add games first.</p>
                        ) : (
                            <div className="space-y-3">
                                {games
                                    .filter(game => game.platform === formData.type)
                                    .map((game) => (
                                        <div key={game.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={game.id}
                                                checked={selectedGames.includes(game.id)}
                                                onCheckedChange={() => toggleGame(game.id)}
                                            />
                                            <label
                                                htmlFor={game.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {game.title}
                                            </label>
                                        </div>
                                    ))}
                                {games.filter(game => game.platform === formData.type).length === 0 && (
                                    <p className="text-sm text-muted-foreground">No games for {formData.type} platform</p>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                    {selectedGames.length > 0 && (
                        <p className="text-xs text-muted-foreground">{selectedGames.length} game(s) selected</p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isPublic"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    />
                    <Label htmlFor="isPublic">Make slot publicly visible</Label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => onSuccess ? onSuccess() : router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {slot?.id ? "Update Slot" : "Create Slot"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
