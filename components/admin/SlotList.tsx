import prisma from "@/lib/prisma";
import { Platform, SlotStatus } from "@prisma/client";
import { Clock, Users, ArrowRight, MoreVertical, ShieldCheck, ShieldAlert, Wrench, Ban } from "lucide-react";
import { toggleSlotVisibility, deleteSlot } from "@/lib/actions/slot-actions";

interface SlotListProps {
    searchParams: {
        platform?: Platform;
        status?: SlotStatus;
        date?: string;
    };
}

export default async function SlotList({ searchParams }: SlotListProps) {
    const where: any = {};
    if (searchParams.platform) where.type = searchParams.platform;
    if (searchParams.status) where.status = searchParams.status;
    if (searchParams.date) {
        const date = new Date(searchParams.date);
        where.date = {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const slots = await prisma.slot.findMany({
        where,
        orderBy: { date: "asc" },
        include: { bookings: true },
    });

    if (slots.length === 0) {
        return (
            <div className="py-20 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500">No slots found matching your criteria.</p>
            </div>
        );
    }

    const getStatusIcon = (status: SlotStatus) => {
        switch (status) {
            case "AVAILABLE": return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
            case "BOOKED": return <ArrowRight className="w-4 h-4 text-blue-500" />;
            case "MAINTENANCE": return <Wrench className="w-4 h-4 text-amber-500" />;
            case "BLOCKED": return <Ban className="w-4 h-4 text-red-500" />;
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                    <tr className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-6 py-2">Platform / Title</th>
                        <th className="px-6 py-2">Time Slot</th>
                        <th className="px-6 py-2">Price</th>
                        <th className="px-6 py-2">Capacity</th>
                        <th className="px-6 py-2">Status</th>
                        <th className="px-6 py-2">Visibility</th>
                        <th className="px-6 py-2 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {slots.map((slot) => (
                        <tr key={slot.id} className="group bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800 transition-all">
                            <td className="px-6 py-4 rounded-l-2xl border-y border-l border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${slot.type === 'PS5' ? 'bg-indigo-500/10 text-indigo-400' :
                                            slot.type === 'VR' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">{slot.type}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{slot.title || "Standard Session"}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className="text-sm font-semibold">
                                    {slot.startTime} - {slot.endTime}
                                    <p className="text-[10px] text-zinc-500 font-normal mt-1">{new Date(slot.date).toLocaleDateString()}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800 text-sm font-bold">${slot.price.toFixed(2)}</td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3 text-zinc-500" />
                                    <span className="text-xs font-medium">{slot.bookings.length} / {slot.maxPlayers}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className="flex items-center gap-2 bg-zinc-950/50 w-fit px-3 py-1.5 rounded-full border border-zinc-800">
                                    {getStatusIcon(slot.status)}
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{slot.status}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 border-y border-zinc-800">
                                <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${slot.isPublic ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                    {slot.isPublic ? 'Public' : 'Hidden'}
                                </div>
                            </td>
                            <td className="px-6 py-4 rounded-r-2xl border-y border-r border-zinc-800 text-right">
                                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
