"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { getAdminDashboardData, deleteGame as removeGameFromServer } from "@/lib/actions/admin-actions";
import { DashboardSkeleton } from "@/components/admin/skeletons"; // Or similar skeleton
import GameSearchModal from "@/components/admin/GameSearchModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Gamepad2 } from "lucide-react";
import { toast } from "sonner"; // If used in project

export default function AdminGamesPage() {
    const {
        isLoading,
        games,
        setData,
        setLoading,
        deleteGame
    } = useAdminStore();

    useEffect(() => {
        if (!games.length) {
            const fetchData = async () => {
                try {
                    const data = await getAdminDashboardData();
                    setData(data);
                } catch (error) {
                    console.error(error);
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [games.length, setData, setLoading]);

    const handleDelete = async (id: string) => {
        try {
            deleteGame(id); // Optimistic update
            await removeGameFromServer(id);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Game Library</h1>
                    <p className="text-muted-foreground">Manage games available for PS5, VR, and Racing Sim.</p>
                </div>
                <GameSearchModal />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game: any) => (
                    <Card key={game.id} className="overflow-hidden group">
                        <div className="relative aspect-[3/4] overflow-hidden">
                            {game.image ? (
                                <img
                                    src={game.image}
                                    alt={game.title}
                                    className="object-cover w-full h-full transition-transform group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Gamepad2 className="w-12 h-12 text-muted-foreground" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="icon">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDelete(game.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold truncate" title={game.title}>{game.title}</h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{game.genre}</span>
                                <Badge variant="outline" className="text-[10px] uppercase">
                                    {game.platform}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {games.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No games added yet. Use the button above to add games.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
