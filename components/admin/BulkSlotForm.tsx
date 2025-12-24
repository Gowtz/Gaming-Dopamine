"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { bulkCreateSlots } from "@/lib/actions/slot-actions";
import { Calendar, Clock, DollarSign, Users, Layers } from "lucide-react";

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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Range and Frequency */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="date"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit [color-scheme:dark]"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="date"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-11 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-outfit [color-scheme:dark]"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Frequency</label>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Every Day", value: "daily" },
                                { label: "Weekdays Only", value: "weekdays" },
                            ].map((f) => (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, frequency: f.value as any })}
                                    className={`py-4 px-4 rounded-xl border font-bold text-sm transition-all ${formData.frequency === f.value
                                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Platform</label>
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
                </div>

                {/* Pricing and Capacity */}
                <div className="space-y-6">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Price Per Slot ($)</label>
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

                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                        <div className="flex gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-300">Bulk Generation Tip</h4>
                                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                    This will generate one slot per day for the selected platform within the specified date range. All slots will use the same time and price.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-zinc-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-zinc-950 text-zinc-500 font-bold rounded-2xl hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Generate Bulk Slots"}
                </button>
            </div>
        </form>
    );
}
