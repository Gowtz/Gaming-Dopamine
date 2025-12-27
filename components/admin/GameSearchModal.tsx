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
import { Search, Plus, Loader2, Gamepad2 } from "lucide-react";
import { addGame } from "@/lib/actions/admin-actions";
import { useAdminStore } from "@/hooks/useAdminStore";

export default function GameSearchModal() {
    const { addGame: addGameToStore } = useAdminStore();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [platform, setPlatform] = useState<string>("PS5");

    const handleSearch = async () => {
        if (!search) return;
        setLoading(true);
        try {
            // Mock API search implementation
            // In a real app, this would call RAWG or IGDB API
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockResults = [
                {
                    id: 1,
                    title: `${search}`,
                    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
                    genre: "Action/Adventure"
                },
                {
                    id: 2,
                    title: `${search} II`,
                    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070&auto=format&fit=crop",
                    genre: "RPG"
                },
            ];
            setResults(mockResults);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGame = async (gameData: any) => {
        try {
            const newGame = await addGame({
                title: gameData.title,
                image: gameData.image,
                genre: gameData.genre,
                platform: platform as any,
            });

            if (newGame) {
                addGameToStore(newGame);
            }
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Add Game
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] admin-theme">
                <DialogHeader>
                    <DialogTitle>Add New Game</DialogTitle>
                    <DialogDescription>
                        Search our online library to add games to your collection.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search for a game title..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Search
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Target Platform</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="admin-theme">
                                    <SelectItem value="PS5">PlayStation 5</SelectItem>
                                    <SelectItem value="VR">VR Experience</SelectItem>
                                    <SelectItem value="RACING_SIM">Racing Simulator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {results.map((game) => (
                            <div key={game.id} className="flex items-center gap-4 p-2 rounded-lg border hover:bg-muted/50 group">
                                <div className="h-16 w-12 bg-muted rounded overflow-hidden flex-shrink-0">
                                    <img src={game.image} alt="" className="object-cover w-full h-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{game.title}</p>
                                    <p className="text-xs text-muted-foreground">{game.genre}</p>
                                </div>
                                <Button size="sm" onClick={() => handleAddGame(game)}>
                                    Add
                                </Button>
                            </div>
                        ))}
                        {results.length === 0 && !loading && search && (
                            <p className="text-center text-sm text-muted-foreground py-8">No results found.</p>
                        )}
                        {!search && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Gamepad2 className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">Search for games to see results</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
