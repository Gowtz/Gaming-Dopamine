"use client";

import { useState } from "react";
import {
    Settings,
    MapPin,
    DollarSign,
    Clock,
    Shield,
    Bell,
    ExternalLink,
    Save
} from "lucide-react";
import { updateSettings } from "@/lib/actions/admin-actions";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "pricing", label: "Pricing & Slots", icon: DollarSign },
        { id: "location", label: "Branch Info", icon: MapPin },
        { id: "security", label: "Security", icon: Shield },
    ];

    async function handleSave() {
        setLoading(true);
        // Simulate save
        await updateSettings({});
        setLoading(false);
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold font-outfit tracking-tighter">System Settings</h1>
                    <p className="text-zinc-500 mt-1">Configure your café's global parameters and regional settings.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Sidebar Tabs */}
                <aside className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${activeTab === tab.id
                                    ? "bg-zinc-900 border-zinc-800 text-white"
                                    : "text-zinc-500 hover:text-zinc-300 border-transparent"
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="text-sm font-bold">{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>

                        <div className="space-y-8">
                            <section className="space-y-6">
                                <h3 className="text-xl font-bold font-outfit tracking-tight">General Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Site Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Gaming Dopamine"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Support Email</label>
                                        <input
                                            type="email"
                                            defaultValue="support@gamingdopamine.com"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <label className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 cursor-pointer group">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">Maintenance Mode</p>
                                            <p className="text-xs text-zinc-500">Temporarily disable public access to the café booking system.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-zinc-800 rounded-full relative transition-colors group-hover:bg-zinc-700">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-500 rounded-full transition-transform"></div>
                                        </div>
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 cursor-pointer group">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">Email Notifications</p>
                                            <p className="text-xs text-zinc-500">Enable automated confirmation emails for all players.</p>
                                        </div>
                                        <div className="w-12 h-6 bg-indigo-600 rounded-full relative transition-colors">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                                        </div>
                                    </label>
                                </div>
                            </section>

                            <div className="pt-8 border-t border-zinc-800">
                                <section className="space-y-6">
                                    <h3 className="text-xl font-bold font-outfit tracking-tight">System Status</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-emerald-500" />
                                                <span className="text-sm font-semibold">Database Connection</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">Healthy</span>
                                        </div>
                                        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-indigo-400" />
                                                <span className="text-sm font-semibold">Last Backup</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">4h ago</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
