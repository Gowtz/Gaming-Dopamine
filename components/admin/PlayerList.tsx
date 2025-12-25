import prisma from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    User,
    ShieldCheck,
    Mail,
    MoreVertical,
    Ban,
    Unlock,
    Trophy,
} from "lucide-react";
import { toggleUserBlock, toggleUserSubscription, updateUserRole } from "@/lib/actions/admin-actions";
import { Role } from "@prisma/client";
import PlayerSearchModal from "./PlayerSearchModal";
import PlayerListClient from "./PlayerListClient";

export default async function PlayerList() {
    const users = await prisma.user.findMany({
        orderBy: { name: "asc" },
        include: {
            bookings: { take: 1, orderBy: { createdAt: "desc" } },
            membership: true,
            stats: true,
            wallet: true
        }
    }) as any[];

    const getRoleBadge = (role: string) => {
        if (role === 'ADMIN') {
            return (
                <Badge variant="default" className="gap-1">
                    <ShieldCheck className="w-3 h-3" /> Admin
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="gap-1">
                <User className="w-3 h-3" /> User
            </Badge>
        );
    };

    const getMembershipBadge = (tier?: string, isSubscriber?: boolean) => {
        return (
            <div className="flex items-center gap-2">
                {tier === 'Gold' && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Gold</Badge>}
                {tier === 'Silver' && <Badge className="bg-gray-400 hover:bg-gray-500 text-black">Silver</Badge>}
                {tier === 'Bronze' && <Badge variant="outline">Bronze</Badge>}
                {isSubscriber && (
                    <Badge variant="default" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
                        <Trophy className="w-3 h-3" /> Subscriber
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Total Players ({users.length})</h2>
                <PlayerSearchModal users={users} />
            </div>

            <div className="rounded-md border bg-card">
                <PlayerListClient users={users} />
            </div>
        </div>
    );
}
