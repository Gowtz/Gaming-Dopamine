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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Player Info</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Membership Status</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-input">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getRoleBadge(user.role)}
                                </TableCell>
                                <TableCell>
                                    {getMembershipBadge(user.membership?.tier, user.membership?.isSubscriber)}
                                </TableCell>
                                <TableCell>
                                    {user.isBlocked && (
                                        <Badge variant="destructive" className="gap-1">
                                            <Ban className="w-3 h-3" /> Blocked
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {user.bookings?.[0] ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Last Booking</span>
                                            <span className="text-xs text-muted-foreground">{new Date(user.bookings[0].date).toLocaleDateString()}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">No activity yet</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {user.role === 'USER' ? (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateUserRole(user.id, Role.ADMIN);
                                                }}>
                                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2">
                                                        <ShieldCheck className="w-4 h-4" /> Promote to Admin
                                                    </button>
                                                </form>
                                            ) : (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateUserRole(user.id, Role.USER);
                                                }}>
                                                    <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2">
                                                        <User className="w-4 h-4" /> Demote to User
                                                    </button>
                                                </form>
                                            )}

                                            <DropdownMenuSeparator />

                                            <form action={async () => {
                                                "use server";
                                                await toggleUserBlock(user.id, !user.isBlocked);
                                            }}>
                                                <button className={`w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2 ${user.isBlocked ? 'text-green-500' : 'text-destructive'}`}>
                                                    {user.isBlocked ? (
                                                        <><Unlock className="w-4 h-4" /> Unblock Player</>
                                                    ) : (
                                                        <><Ban className="w-4 h-4" /> Block Player</>
                                                    )}
                                                </button>
                                            </form>

                                            <form action={async () => {
                                                "use server";
                                                await toggleUserSubscription(user.id, !user.membership?.isSubscriber);
                                            }}>
                                                <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2">
                                                    <Trophy className="w-4 h-4" />
                                                    {user.membership?.isSubscriber ? "Cancel Subscription" : "Activate Subscription"}
                                                </button>
                                            </form>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
