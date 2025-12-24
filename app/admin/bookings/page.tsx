import prisma from "@/lib/prisma";
import { Filter, Search, Calendar as CalendarIcon, Download } from "lucide-react";
import BookingList from "@/components/admin/BookingList";

interface BookingsPageProps {
    searchParams: {
        type?: string;
        status?: string;
        date?: string;
    };
}

export default async function AdminBookingsPage({ searchParams }: BookingsPageProps) {
    const statuses = [
        { label: "All Status", value: "" },
        { label: "Upcoming", value: "Upcoming" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" },
    ];

    const types = [
        { label: "All Types", value: "" },
        { label: "PS5", value: "PS5" },
        { label: "VR", value: "VR" },
        { label: "Racing", value: "Racing" },
    ];

    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({ where: { status: "Completed" } });
    const upcomingBookings = await prisma.booking.count({ where: { status: "Upcoming" } });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold font-outfit tracking-tighter">Booking History</h1>
                    <p className="text-zinc-500 mt-1">Review and manage all player reservations.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl border border-zinc-800 transition-all">
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Bookings", value: totalBookings, color: "indigo" },
                    { label: "Completed", value: completedBookings, color: "emerald" },
                    { label: "Upcoming", value: upcomingBookings, color: "blue" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-bold mt-2 font-outfit">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-zinc-500 mr-2 border-r border-zinc-800 pr-6">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="Search by player name or email..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                    </div>

                    <select
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none appearance-none min-w-[140px]"
                        defaultValue={searchParams.type || ""}
                    >
                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>

                    <select
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none appearance-none min-w-[140px]"
                        defaultValue={searchParams.status || ""}
                    >
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="date"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none [color-scheme:dark]"
                            defaultValue={searchParams.date}
                        />
                    </div>
                </div>
            </div>

            {/* Booking List */}
            <BookingList searchParams={searchParams} />
        </div>
    );
}
