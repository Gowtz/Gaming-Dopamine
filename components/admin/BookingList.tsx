import prisma from "@/lib/prisma";
import { Clock, Calendar, User, Tag, MoreVertical, Trash2, CheckCircle, XCircle } from "lucide-react";
import { updateBookingStatus, deleteBooking } from "@/lib/actions/admin-actions";

interface BookingListProps {
    searchParams: {
        type?: string;
        status?: string;
        date?: string;
    };
}

export default async function BookingList({ searchParams }: BookingListProps) {
    const where: any = {};
    if (searchParams.type) where.type = searchParams.type;
    if (searchParams.status) where.status = searchParams.status;
    if (searchParams.date) {
        const date = new Date(searchParams.date);
        where.date = {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const bookings = await prisma.booking.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
            user: true,
            slot: true
        },
    });

    if (bookings.length === 0) {
        return (
            <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500">No bookings found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                    <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-2">Player</th>
                        <th className="px-6 py-2">Session Details</th>
                        <th className="px-6 py-2">Date & Time</th>
                        <th className="px-6 py-2">Status</th>
                        <th className="px-6 py-2 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id} className="group bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800 transition-all">
                            <td className="px-6 py-4 rounded-l-2xl border-y border-l border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                                        {booking.user.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">{booking.user.name}</p>
                                        <p className="text-[10px] text-zinc-500 lowercase tracking-wider">{booking.user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5 text-indigo-400" />
                                    <span className="text-sm font-medium">{booking.type}</span>
                                    {booking.slot && (
                                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 capitalize">
                                            {booking.slot.title || "Session"}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                        {new Date(booking.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {booking.duration} Minutes
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${booking.status === 'Upcoming' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                        booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    <div className={`w-1 h-1 rounded-full ${booking.status === 'Upcoming' ? 'bg-indigo-400' :
                                            booking.status === 'Completed' ? 'bg-emerald-400' :
                                                'bg-red-400'
                                        }`} />
                                    {booking.status}
                                </div>
                            </td>
                            <td className="px-6 py-4 rounded-r-2xl border-y border-r border-zinc-800 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <form action={async () => {
                                        "use server";
                                        await updateBookingStatus(booking.id, "Completed");
                                    }}>
                                        <button className="p-2 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 rounded-lg transition-colors" title="Mark Completed">
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await updateBookingStatus(booking.id, "Cancelled");
                                    }}>
                                        <button className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-colors" title="Cancel Booking">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
