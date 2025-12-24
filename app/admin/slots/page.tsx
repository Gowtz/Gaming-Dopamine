import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import { Plus, Filter, Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";
import SlotList from "@/components/admin/SlotList";

interface SlotsPageProps {
    searchParams: {
        platform?: Platform;
        status?: SlotStatus;
        date?: string;
    };
}

export default async function SlotsDashboard({ searchParams }: SlotsPageProps) {
    const platforms = [
        { label: "All Platforms", value: "" },
        { label: "PS5", value: "PS5" },
        { label: "VR", value: "VR" },
        { label: "Racing Sim", value: "RACING_SIM" },
    ];

    const statuses = [
        { label: "All Status", value: "" },
        { label: "Available", value: "AVAILABLE" },
        { label: "Booked", value: "BOOKED" },
        { label: "Blocked", value: "BLOCKED" },
        { label: "Maintenance", value: "MAINTENANCE" },
    ];

    // Stats
    const totalSlots = await prisma.slot.count();
    const availableSlots = await prisma.slot.count({ where: { status: "AVAILABLE" } });
    const bookedSlots = await prisma.slot.count({ where: { status: "BOOKED" } });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold font-outfit tracking-tighter">Slot Management</h1>
                    <p className="text-zinc-500 mt-1">Create and monitor gaming sessions for your players.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/slots/bulk"
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl border border-zinc-800 transition-all"
                    >
                        Bulk Create
                    </Link>
                    <Link
                        href="/admin/slots/new"
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Slot
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Slots", value: totalSlots, color: "indigo" },
                    { label: "Available", value: availableSlots, color: "emerald" },
                    { label: "Booked Sessions", value: bookedSlots, color: "blue" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-all`}></div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-bold mt-2 font-outfit">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-zinc-500 mr-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <select
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[150px]"
                        defaultValue={searchParams.platform || ""}
                    >
                        {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>

                    <select
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none min-w-[150px]"
                        defaultValue={searchParams.status || ""}
                    >
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    <input
                        type="date"
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]"
                        defaultValue={searchParams.date}
                    />
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button className="p-2 bg-zinc-800 text-white rounded-lg shadow-sm">
                        <ListIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <Calendar className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Slot List */}
            <SlotList searchParams={searchParams} />
        </div>
    );
}
