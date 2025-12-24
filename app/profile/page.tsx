import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Gamepad2,
    History,
    Wallet,
    Trophy,
    Clock,
    Settings,
    Mail,
    User as UserIcon,
    ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
            preferences: true,
            bookings: {
                orderBy: { date: 'desc' },
                take: 5
            },
            wallet: true,
            membership: true,
            stats: true,
        }
    });

    if (!user) {
        redirect("/auth/signin");
    }

    // Mock data if records don't exist yet
    const stats = user.stats || { totalPlaytime: 0, mostPlayedGame: "None" };
    const wallet = user.wallet || { balance: 0, credits: 0 };
    const membership = user.membership || { tier: "Bronze", points: 0 };
    const preferences = user.preferences || { favoriteGames: [], hasPS5: false, hasVR: false, hasRacingSim: false };

    return (
        <div className="min-h-screen bg-black text-white pb-20 pt-32 px-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header / Basic Info */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <div className="relative">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                            {user.image ? (
                                <Image src={user.image} alt={user.name || "Player"} width={128} height={128} />
                            ) : (
                                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-4xl font-bold">
                                    {user.name?.[0] || 'P'}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-2 rounded-lg shadow-lg">
                            <Trophy className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h1 className="text-4xl font-extrabold tracking-tight font-outfit">{user.name}</h1>
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-widest self-center">
                                {membership.tier} Member
                            </span>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-zinc-400">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                <span className="text-sm">Player ID: #{user.id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/profile/edit"
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-sm font-semibold border border-zinc-700"
                    >
                        <Settings className="w-4 h-4" />
                        Edit Profile
                    </Link>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Wallet */}
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <h3 className="text-zinc-400 text-sm font-medium">Available Balance</h3>
                        <p className="text-2xl font-bold mt-1">${wallet.balance.toFixed(2)}</p>
                        <p className="text-zinc-500 text-xs mt-2">{wallet.credits} Credits</p>
                    </div>

                    {/* Playtime */}
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <h3 className="text-zinc-400 text-sm font-medium">Total Playtime</h3>
                        <p className="text-2xl font-bold mt-1">{Math.floor(stats.totalPlaytime / 60)}h {stats.totalPlaytime % 60}m</p>
                        <p className="text-zinc-500 text-xs mt-2">Active Player Status</p>
                    </div>

                    {/* Most Played */}
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
                                <Gamepad2 className="w-6 h-6" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <h3 className="text-zinc-400 text-sm font-medium">Most Played</h3>
                        <p className="text-2xl font-bold mt-1 truncate">{stats.mostPlayedGame || "None"}</p>
                        <p className="text-zinc-500 text-xs mt-2">Personal Favorite</p>
                    </div>

                    {/* Loyalty Tier */}
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-indigo-500/50 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <h3 className="text-zinc-400 text-sm font-medium">Loyalty Points</h3>
                        <p className="text-2xl font-bold mt-1">{membership.points} XP</p>
                        <p className="text-zinc-500 text-xs mt-2">{membership.tier} Tier Reached</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Gaming Preferences */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold font-outfit">Gaming DNA</h2>
                                <Gamepad2 className="text-zinc-700 w-8 h-8" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Equipment & Setup</h4>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { name: "PS5", active: preferences.hasPS5 },
                                            { name: "VR Arena", active: preferences.hasVR },
                                            { name: "Racing Simulator", active: preferences.hasRacingSim },
                                        ].map((pref) => (
                                            <div key={pref.name} className={`flex items-center justify-between p-4 rounded-2xl border ${pref.active ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-zinc-800/30 border-white/5'}`}>
                                                <span className={pref.active ? 'text-indigo-300 font-semibold' : 'text-zinc-500'}>{pref.name}</span>
                                                <div className={`w-2 h-2 rounded-full ${pref.active ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-zinc-700'}`}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Favorite Games</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.favoriteGames.length > 0 ? (
                                            preferences.favoriteGames.map((game, i) => (
                                                <span key={i} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium hover:border-indigo-500 transition-colors">
                                                    {game}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-zinc-500 italic text-sm">No favorite games added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold font-outfit">Recent Sessions</h2>
                                <History className="text-zinc-700 w-8 h-8" />
                            </div>

                            <div className="space-y-4">
                                {user.bookings.length > 0 ? (
                                    user.bookings.map((booking) => (
                                        <div key={booking.id} className="flex items-center justify-between p-5 bg-zinc-800/30 border border-white/5 rounded-2xl hover:bg-zinc-800/50 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">
                                                    <Clock className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-200">{booking.type}</p>
                                                    <p className="text-xs text-zinc-500">{new Date(booking.date).toLocaleDateString()} • {booking.duration} mins</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    booking.status === 'Upcoming' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-800">
                                        <p className="text-zinc-500 mb-4 text-sm">No gaming history found.</p>
                                        <Link href="/booking" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors text-sm uppercase tracking-wider">
                                            Book Your First Session
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info maybe? */}
                    <div className="space-y-6">
                        {/* Membership Details */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Trophy className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Membership Status</h3>
                                <p className="text-indigo-100/80 text-sm mb-6">You're on track for Silver tier!</p>

                                <div className="space-y-4">
                                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                        <div className="bg-white h-full" style={{ width: '65%' }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span>{membership.points} XP / 1000 XP</span>
                                        <span>NEXT TIER</span>
                                    </div>
                                </div>

                                <button className="mt-8 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                                    View Benefits
                                </button>
                            </div>
                        </div>

                        {/* FAQ or Quick Info */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                <Link href="#" className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                    <span className="text-zinc-400 text-sm">Rules & Guidelines</span>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                                </Link>
                                <Link href="#" className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                    <span className="text-zinc-400 text-sm">Subscription Plans</span>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                                </Link>
                                <Link href="#" className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                    <span className="text-zinc-400 text-sm">Support Center</span>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
