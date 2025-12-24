"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus2, Trophy, CheckCircle2 } from "lucide-react";
import { toggleUserSubscription } from "@/lib/actions/admin-actions";

interface PlayerSearchModalProps {
    users: any[];
    trigger?: React.ReactNode;
}

export default function PlayerSearchModal({ users, trigger }: PlayerSearchModalProps) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <UserPlus2 className="w-4 h-4" /> Create Subscriber
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] admin-theme">
                <DialogHeader>
                    <DialogTitle>Add New Subscriber</DialogTitle>
                    <DialogDescription>
                        Search for a player to activate their premium subscription.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        {search && filteredUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant={user.membership?.isSubscriber ? "secondary" : "default"}
                                    className="gap-1 h-8"
                                    onClick={async () => {
                                        await toggleUserSubscription(user.id, !user.membership?.isSubscriber);
                                        setOpen(false);
                                    }}
                                >
                                    {user.membership?.isSubscriber ? (
                                        <><CheckCircle2 className="w-3 h-3 text-green-500" /> Active</>
                                    ) : (
                                        <><Trophy className="w-3 h-3" /> Subscribe</>
                                    )}
                                </Button>
                            </div>
                        ))}
                        {search && filteredUsers.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">No players found.</p>
                        )}
                        {!search && (
                            <p className="text-center text-sm text-muted-foreground py-4 italic">Start typing to find players...</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
