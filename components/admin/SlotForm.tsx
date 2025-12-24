"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { createSlot } from "@/lib/actions/slot-actions";
import { Calendar, Clock, DollarSign, Users, Tag } from "lucide-react";

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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Session Title (Optional)</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="e.g. Weekend Special"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Platform / Platform</label>
                        <div className="grid grid-cols-3 gap-4">
                            {["PS5", "VR", "RACING_SIM"].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: p as Platform })}
                                    className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all ${formData.type === p
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                        }`}
                                >
                                    {p.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Price ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="number"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Max Players</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="number"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit"
                                    value={formData.maxPlayers}
                                    onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Session Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="date"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit [color-scheme:dark]"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="time"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit [color-scheme:dark]"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">End Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="time"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit [color-scheme:dark]"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl cursor-pointer group">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${formData.isPublic ? "bg-indigo-600 border-indigo-500" : "border-zinc-700 group-hover:border-zinc-600"
                            }`}>
                            {formData.isPublic && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        />
                        <span className="text-sm font-semibold">Make slot public (Bookable by players)</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-zinc-950 text-zinc-500 font-bold rounded-2xl hover:text-white transition-colors"
                >
                    Discard Changes
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? "Creating..." : "Generate Slot"}
                </button>
            </div>
        </form>
    );
}
