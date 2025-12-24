import prisma from "@/lib/prisma";
import { Users, Search, Filter, Shield } from "lucide-react";
import PlayerList from "@/components/admin/PlayerList";

export default async function AdminPlayersPage() {
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold font-outfit tracking-tighter">Player Management</h1>
                    <p className="text-zinc-500 mt-1">Manage user roles and monitor player engagement.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-bold">{totalUsers} Total Players</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl flex items-center gap-3">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-bold">{admins} Admins</span>
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-zinc-500 mr-2 border-r border-zinc-800 pr-6">
                    <Search className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Search</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Search by name, email or player ID..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />

                    <select className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none appearance-none min-w-[140px]">
                        <option value="">All Roles</option>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <select className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none appearance-none min-w-[140px]">
                        <option value="">All Tiers</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                    </select>
                </div>
            </div>

            {/* Player List */}
            <PlayerList />
        </div>
    );
}
