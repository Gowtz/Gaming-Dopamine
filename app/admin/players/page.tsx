import prisma from "@/lib/prisma";
import { Users, Search, Shield } from "lucide-react";
import PlayerList from "@/components/admin/PlayerList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function AdminPlayersPage() {
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
                    <p className="text-muted-foreground">Manage user roles and monitor player engagement.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{admins}</div>
                    </CardContent>
                </Card>
            </div>


            {/* Control Bar */}
            <Card>
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground mr-2 border-r pr-4">
                        <Search className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Search</span>
                    </div>

                    <div className="flex flex-1 flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[300px]">
                            <Input
                                type="text"
                                placeholder="Search by name, email or player ID..."
                            />
                        </div>

                        <select className="flex h-10 w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">All Roles</option>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>

                        <select className="flex h-10 w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="">All Tiers</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                        </select>

                        <Button variant="secondary">Search</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Player List */}
            <PlayerList />
        </div>
    );
}
