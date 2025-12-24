"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon,
    MapPin,
    DollarSign,
    Shield,
    Save,
    Clock,
    ShieldCheck
} from "lucide-react";
import { updateSettings } from "@/lib/actions/admin-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        setLoading(true);
        // Simulate save
        await updateSettings({});
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Configure your café's global parameters.</p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
                    <TabsTrigger value="general" className="gap-2">
                        <SettingsIcon className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="gap-2">
                        <DollarSign className="h-4 w-4" /> Pricing & Slots
                    </TabsTrigger>
                    <TabsTrigger value="location" className="gap-2">
                        <MapPin className="h-4 w-4" /> Branch Info
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="h-4 w-4" /> Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>
                                Basic details about your gaming café.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input id="siteName" defaultValue="Gaming Dopamine" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Support Email</Label>
                                    <Input id="supportEmail" defaultValue="support@gamingdopamine.com" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Preferences</CardTitle>
                            <CardDescription>
                                Toggle system-wide features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Temporarily disable public access to the booking system.
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable automated confirmation emails for all players.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium">Database Connection</span>
                                </div>
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Healthy</Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Last Backup</span>
                                </div>
                                <Badge variant="outline">4h ago</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pricing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Configuration</CardTitle>
                            <CardDescription>Manage global pricing settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="py-10 text-center text-muted-foreground">
                                Pricing configuration coming soon.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="location">
                    <Card>
                        <CardHeader>
                            <CardTitle>Branch Information</CardTitle>
                            <CardDescription>Address and contact details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="py-10 text-center text-muted-foreground">
                                Branch settings coming soon.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>Manage admin access and security protocols.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="py-10 text-center text-muted-foreground">
                                Security settings coming soon.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
