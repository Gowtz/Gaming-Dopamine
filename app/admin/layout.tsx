import { checkAdmin } from "@/lib/admin-check";
import {
    LayoutDashboard,
    CalendarDays,
    History,
    Settings,
    Users,
    LogOut,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await checkAdmin();

    const menuItems = [
        { name: "Overview", icon: LayoutDashboard, href: "/admin" },
        { name: "Manage Slots", icon: CalendarDays, href: "/admin/slots" },
        { name: "Booking History", icon: History, href: "/admin/bookings" },
        { name: "Players", icon: Users, href: "/admin/players" },
        { name: "Settings", icon: Settings, href: "/admin/settings" },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="p-8 border-b border-zinc-800">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold font-outfit uppercase tracking-tighter">Admin<span className="text-indigo-500">Panel</span></h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Gaming Dopamine</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800"
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                <span className="text-sm font-semibold tracking-wide text-zinc-400 group-hover:text-white">{item.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                    <div className="flex items-center gap-3 p-3 mb-2">
                        <div className="w-10 h-10 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center">
                            {session.user?.image ? (
                                <img src={session.user.image} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-5 h-5 text-zinc-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-zinc-200">{session.user?.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest font-bold">Admin</p>
                        </div>
                    </div>
                    <Link
                        href="/profile"
                        className="flex items-center justify-center gap-3 p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-all border border-zinc-800 group"
                    >
                        <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-widest">Exit Admin</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72">
                <div className="p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
