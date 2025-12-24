import prisma from "@/lib/prisma";
import { User, Shield, ShieldCheck, Mail, Calendar, MoreVertical, UserPlus, UserMinus } from "lucide-react";
import { updateUserRole, deleteUser } from "@/lib/actions/admin-actions";
import { Role } from "@prisma/client";

export default async function PlayerList() {
    const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        include: {
            bookings: { take: 1, orderBy: { date: "desc" } },
            membership: true,
        }
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                    <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-2">Player Info</th>
                        <th className="px-6 py-2">Role</th>
                        <th className="px-6 py-2">Membership Status</th>
                        <th className="px-6 py-2">Last Activity</th>
                        <th className="px-6 py-2 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="group bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800 transition-all">
                            <td className="px-6 py-4 rounded-l-2xl border-y border-l border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold">{user.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">{user.name}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                            <Mail className="w-3 h-3" />
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                    }`}>
                                    {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                    {user.role}
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${user.membership?.tier === 'Gold' ? 'bg-amber-400' :
                                            user.membership?.tier === 'Silver' ? 'bg-zinc-300' :
                                                'bg-orange-400'
                                        }`} />
                                    <span className="text-xs font-semibold">{user.membership?.tier || "Bronze"}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                {user.bookings[0] ? (
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium">Last Booking</span>
                                        <span className="text-[10px] text-zinc-500 italic">{new Date(user.bookings[0].date).toLocaleDateString()}</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-zinc-600 italic">No activity yet</span>
                                )}
                            </td>
                            <td className="px-6 py-4 rounded-r-2xl border-y border-r border-zinc-800 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {user.role === 'USER' ? (
                                        <form action={async () => {
                                            "use server";
                                            await updateUserRole(user.id, Role.ADMIN);
                                        }}>
                                            <button className="p-2 hover:bg-indigo-500/10 text-zinc-500 hover:text-indigo-400 rounded-lg transition-colors" title="Promote to Admin">
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </form>
                                    ) : (
                                        <form action={async () => {
                                            "use server";
                                            await updateUserRole(user.id, Role.USER);
                                        }}>
                                            <button className="p-2 hover:bg-zinc-500/10 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors" title="Demote to User">
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}
                                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
