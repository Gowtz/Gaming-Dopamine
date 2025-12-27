"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/hooks/useAdminStore";
import { getAdminDashboardData } from "@/lib/actions/admin-actions";
import { TableSkeleton } from "@/components/admin/skeletons";
import PlayerListClient from "@/components/admin/PlayerListClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Shield, Search } from "lucide-react";

export default function AdminPlayersPage() {
    const {
        isLoading,
        users,
        setData,
        setLoading
    } = useAdminStore();

    const [filterSearch, setFilterSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");

    useEffect(() => {
        if (!users.length) {
            const fetchData = async () => {
                try {
                    const data = await getAdminDashboardData();
                    setData(data);
                } catch (error) {
                    console.error(error);
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [users.length, setData, setLoading]);

    if (isLoading) {
        return <TableSkeleton />;
    }

    const totalUsers = users.length;
    const admins = users.filter(u => u.role === 'ADMIN').length;

    const filteredUsers = users.filter(u => {
        const matchesSearch = !filterSearch ||
            u.name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(filterSearch.toLowerCase());
        const matchesRole = !filterRole || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
                    <p className="text-muted-foreground">Manage user roles and monitor player engagement.</p>
                </div>
            </div>

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
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="flex h-10 w-[160px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">All Roles</option>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <PlayerListClient users={filteredUsers} />
        </div>
    );
}
