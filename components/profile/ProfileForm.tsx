"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Save, X } from "lucide-react";

interface ProfileFormProps {
    initialData: {
        favoriteGames: string[];
        hasPS5: boolean;
        hasVR: boolean;
        hasRacingSim: boolean;
    };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData);
    const [newGame, setNewGame] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/profile");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addGame = () => {
        if (newGame.trim() && !formData.favoriteGames.includes(newGame.trim())) {
            setFormData({
                ...formData,
                favoriteGames: [...formData.favoriteGames, newGame.trim()],
            });
            setNewGame("");
        }
    };

    const removeGame = (gameToRemove: string) => {
        setFormData({
            ...formData,
            favoriteGames: formData.favoriteGames.filter((g) => g !== gameToRemove),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hardware Preferences */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-300">Gaming Gear</h3>
                    <div className="space-y-3">
                        {[
                            { id: "hasPS5", label: "PlayStation 5" },
                            { id: "hasVR", label: "VR Arena" },
                            { id: "hasRacingSim", label: "Racing Simulator" },
                        ].map((item) => (
                            <label
                                key={item.id}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${(formData as any)[item.id]
                                        ? "bg-indigo-500/10 border-indigo-500/50"
                                        : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
                                    }`}
                            >
                                <span className="font-medium">{item.label}</span>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={(formData as any)[item.id]}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [item.id]: e.target.checked })
                                    }
                                />
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${(formData as any)[item.id] ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
                                    }`}>
                                    {(formData as any)[item.id] && <Save className="w-4 h-4 text-white" />}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Favorite Games */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-300">Favorite Games</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newGame}
                            onChange={(e) => setNewGame(e.target.value)}
                            placeholder="Add a game..."
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-outfit"
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addGame())}
                        />
                        <button
                            type="button"
                            onClick={addGame}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {formData.favoriteGames.map((game) => (
                            <span
                                key={game}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm"
                            >
                                {game}
                                <button
                                    type="button"
                                    onClick={() => removeGame(game)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-zinc-900 text-zinc-400 font-bold rounded-xl hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? "Saving..." : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
            </div>
        </form>
    );
}
