import prisma from "@/lib/prisma";
import {
    Users,
    Gamepad2,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    CalendarCheck
} from "lucide-react";
import Link from "next/link";

export default async function AdminOverview() {
    // Real stats from DB
    const totalPlayers = await prisma.user.count();
    const activeBookings = await prisma.booking.count({ where: { status: "Upcoming" } });
    const totalRevenue = 1250.50; // Mock revenue since we don't have payments yet
    const slotUtilization = 68; // Mock percentage

    const stats = [
        { label: "Total Players", value: totalPlayers, icon: Users, trend: "+12%", up: true },
        { label: "Upcoming Bookings", value: activeBookings, icon: CalendarCheck, trend: "+5%", up: true },
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: "+18%", up: true },
        { label: "Slot Utilization", value: `${slotUtilization}%`, icon: Gamepad2, trend: "-2%", up: false },
    ];

    const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { user: true }
    });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold font-outfit tracking-tighter">Dashboard Overview</h1>
                <p className="text-zinc-500 mt-1">Quick insights into your gaming café performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-zinc-800 rounded-2xl group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-bold mt-1 font-outfit">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-outfit tracking-tight">Recent Bookings</h2>
                        <Link href="/admin/bookings" className="text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors">View All</Link>
                    </div>

                    <div className="space-y-4">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-zinc-800/30 border border-white/5 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                                            {booking.user.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{booking.user.name}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{booking.type} • {booking.duration}m</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold">{new Date(booking.date).toLocaleDateString()}</p>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Confimed</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-500 text-center py-12 italic">No recent bookings found.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 shadow-2xl shadow-indigo-600/20">
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href="/admin/slots/new"
                                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                            >
                                <span className="text-sm font-bold">New Single Slot</span>
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            </Link>
                            <Link
                                href="/admin/slots/bulk"
                                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                            >
                                <span className="text-sm font-bold">Generate Bulk</span>
                                <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                        <h3 className="text-lg font-bold mb-4">Admin Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm">System Status</span>
                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm">Prisma Engine</span>
                                <span className="text-xs font-bold text-zinc-300">v5.22.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Plus = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
