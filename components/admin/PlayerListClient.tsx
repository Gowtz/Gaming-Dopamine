"use client";

import { useState } from "react";
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
    User as UserIcon,
    ShieldCheck,
    Mail,
    MoreVertical,
    Ban,
    Unlock,
    Trophy,
} from "lucide-react";
import { toggleUserBlock, toggleUserSubscription, updateUserRole } from "@/lib/actions/admin-actions";
import { Role } from "@prisma/client";
import PlayerDetailsModal from "./PlayerDetailsModal";
import { useAdminStore } from "@/hooks/useAdminStore";

interface PlayerListClientProps {
    users: any[];
}

export default function PlayerListClient({ users }: PlayerListClientProps) {
    const { updateUser } = useAdminStore();
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
                <UserIcon className="w-3 h-3" /> User
            </Badge>
        );
    };

    const getMembershipBadge = (tier?: string, isSubscriber?: boolean) => {
        return (
            <div className="flex items-center gap-2">
                {isSubscriber ? (
                    <Badge variant="default" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1">
                        <Trophy className="w-3 h-3" /> Subscriber
                    </Badge>
                ) : (
                    <Badge variant="outline">Member</Badge>
                )}
            </div>
        );
    };

    const handleRowClick = (user: any) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    return (
        <>
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
                        <TableRow
                            key={user.id}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleRowClick(user)}
                        >
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
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="admin-theme">
                                        <DropdownMenuItem onClick={async () => {
                                            const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
                                            updateUser(user.id, { role: newRole }); // Optimistic
                                            await updateUserRole(user.id, newRole as Role);
                                        }}>
                                            {user.role === 'ADMIN' ? (
                                                <><UserIcon className="w-4 h-4 mr-2" /> Demote to User</>
                                            ) : (
                                                <><ShieldCheck className="w-4 h-4 mr-2" /> Promote to Admin</>
                                            )}
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className={user.isBlocked ? 'text-green-500' : 'text-destructive'}
                                            onClick={async () => {
                                                const newBlocked = !user.isBlocked;
                                                updateUser(user.id, { isBlocked: newBlocked }); // Optimistic
                                                await toggleUserBlock(user.id, newBlocked);
                                            }}
                                        >
                                            {user.isBlocked ? (
                                                <><Unlock className="w-4 h-4 mr-2" /> Unblock Player</>
                                            ) : (
                                                <><Ban className="w-4 h-4 mr-2" /> Block Player</>
                                            )}
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={async () => {
                                            const isSubscriber = !user.membership?.isSubscriber;
                                            // Optimistic update for membership
                                            updateUser(user.id, {
                                                membership: {
                                                    ...user.membership,
                                                    isSubscriber,
                                                    tier: isSubscriber ? "Gold" : user.membership?.tier
                                                }
                                            });
                                            await toggleUserSubscription(user.id, isSubscriber);
                                        }}>
                                            <Trophy className="w-4 h-4 mr-2" />
                                            {user.membership?.isSubscriber ? "Cancel Subscription" : "Activate Subscription"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <PlayerDetailsModal
                user={selectedUser}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </>
    );
}
