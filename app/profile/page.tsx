import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/profile-actions";
import {
    Clock,
    Calendar,
    Gamepad2,
    Trophy,
    Mail,
    Zap,
    History,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/auth/signin");
    }

    if (session.user.role === "ADMIN") {
        redirect("/admin");
    }

    const profileData = await getUserProfile(session.user.email);

    if (!profileData) {
        redirect("/");
    }

    const {
        user,
        stats,
        wallet,
        membership,
        preferences,
        realTotalPlaytimeMinutes,
        availableHours
    } = profileData;




    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header / Basic Info */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <Avatar className="h-24 w-24 rounded-2xl border-2 border-white/10 relative">
                                    <AvatarImage src={user.image || ""} />
                                    <AvatarFallback className="bg-zinc-800 text-2xl">
                                        {user.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                            Member
                                        </Badge>
                                        {membership.isSubscriber && (
                                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
                                                <Trophy className="w-3 h-3" /> Subscriber
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-zinc-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Link href="/booking">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                                Book Now
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">Available Hours</p>
                            <h2 className="text-2xl font-bold text-white">{availableHours.toFixed(1)} hrs</h2>
                            {!membership.isSubscriber && wallet.balance > 0 && (
                                <p className="text-xs text-zinc-500 mt-1">Wallet: ₹{wallet.balance}</p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">Total Playtime</p>
                            {/* Convert minutes to hours */}
                            <h2 className="text-2xl font-bold text-white">{(realTotalPlaytimeMinutes / 60).toFixed(1)} hrs</h2>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <History className="w-6 h-6 text-cyan-500" />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-400 mb-1">Rank Points</p>
                            <h2 className="text-2xl font-bold text-white">{membership.points} XP</h2>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Favorite Games section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Gamepad2 className="w-5 h-5 text-blue-500" />
                            Favorite Games
                        </h2>
                        {preferences.favoriteGames?.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {preferences.favoriteGames.map((game: string, i: number) => (
                                    <Badge key={i} className="bg-zinc-800 text-white border-zinc-700 py-1.5 px-4 rounded-xl">
                                        {game}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500">No favorite games added yet.</p>
                        )}
                    </div>

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Recent Bookings
                        </h2>
                        <div className="space-y-4">
                            {user.bookings?.length > 0 ? (
                                user.bookings.map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800/50">
                                        <div>
                                            <p className="font-bold">{booking.service || 'PS5 Session'}</p>
                                            <p className="text-xs text-zinc-500">{new Date(booking.date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge className={`
                                            ${booking.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                                booking.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-zinc-500/10 text-zinc-500'} border-none
                                        `}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-500">No bookings yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
