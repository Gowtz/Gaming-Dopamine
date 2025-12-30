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
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BookingModal } from "@/components/profile/BookingModal";

// ...


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
        availableHours,
        ongoingBooking
    } = profileData;




    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header / Basic Info */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative z-10">

                        {/* User Info Group */}
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto text-center md:text-left">
                            {/* Avatar */}
                            <div className="relative group shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                                <Avatar className="h-24 w-24 md:h-28 md:w-28 rounded-2xl border-2 border-white/10 relative">
                                    <AvatarImage src={user.image || ""} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-800 text-3xl font-bold">
                                        {user.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Details */}
                            <div className="flex flex-col items-center md:items-start space-y-2 max-w-full">
                                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                                    <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{user.name}</h1>
                                    <div className="flex items-center gap-2 scale-90 md:scale-100">
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3">
                                            Member
                                        </Badge>
                                        {membership.isSubscriber && (
                                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 px-3">
                                                <Trophy className="w-3 h-3" /> Subscriber
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-zinc-400 flex items-center gap-2 text-sm md:text-base max-w-[280px] md:max-w-md mx-auto md:mx-0">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="w-full md:w-auto">
                            <div className="w-full md:w-auto">
                                <BookingModal subscriptionExpiresAt={'expiresAt' in membership && membership.expiresAt ? new Date(membership.expiresAt) : null} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Session Card */}
                {ongoingBooking && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-green-500 rounded-full blur animate-pulse"></div>
                                <div className="relative w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-green-500/50">
                                    <Gamepad2 className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-white">Active Session</h3>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                </div>
                                <p className="text-green-400 font-medium">
                                    {ongoingBooking.slot?.title || ongoingBooking.type} • Ends at {new Date(new Date(ongoingBooking.date).getTime() + ongoingBooking.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            {/* Optional: Add Extend button or just visual info */}
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 px-4 py-1.5 text-sm">
                                In Progress
                            </Badge>
                        </div>
                    </div>
                )}


                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                {/* Recent Bookings section (Full Width now) */}
                <div className="grid grid-cols-1 gap-8">


                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Recent Bookings
                        </h2>
                        <div className="space-y-4">
                            {user.bookings?.length > 0 ? (
                                user.bookings.map((booking: any) => {
                                    const isOngoing = ongoingBooking?.id === booking.id;
                                    const displayStatus = isOngoing ? "Ongoing" : booking.status;

                                    const statusClass = isOngoing
                                        ? "bg-green-500/20 text-green-400 border-green-500/50 animate-pulse"
                                        : booking.status === 'Completed'
                                            ? "bg-green-500/10 text-green-500"
                                            : booking.status === 'Upcoming'
                                                ? "bg-blue-500/10 text-blue-500"
                                                : "bg-zinc-500/10 text-zinc-500";

                                    return (
                                        <div key={booking.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isOngoing ? 'bg-green-900/10 border-green-500/30' : 'bg-zinc-800/30 border-zinc-800/50'}`}>
                                            <div>
                                                <p className="font-bold">{booking.service || booking.slot?.title || 'Gaming Session'}</p>
                                                <p className="text-xs text-zinc-500">{new Date(booking.date).toLocaleDateString()}</p>
                                            </div>
                                            <Badge className={`${statusClass} border-none`}>
                                                {displayStatus}
                                            </Badge>
                                        </div>
                                    );
                                })
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
