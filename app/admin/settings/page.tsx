"use client";

import { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    Save,
    Code,
    ShieldCheck,
    Activity,
    Clock,
    Mail,
    Bell,
    Database,
    Terminal
} from "lucide-react";
import { updateSettings, getSettings } from "@/lib/actions/admin-actions";

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
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState({
        siteName: "Gaming Dopamine",
        supportEmail: "support@gamingdopamine.com",
        maintenanceMode: false,
        emailNotifications: true,
    });

    useEffect(() => {
        getSettings().then((data: any) => {
            setSettings({
                siteName: data.siteName || "Gaming Dopamine",
                supportEmail: data.supportEmail || "support@gamingdopamine.com",
                maintenanceMode: data.maintenanceMode || false,
                emailNotifications: data.emailNotifications ?? true,
            });
            setFetching(false);
        });
    }, []);

    async function handleSave() {
        setLoading(true);
        try {
            await updateSettings(settings);
            alert("Settings updated successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to update settings");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
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
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general" className="gap-2">
                        <SettingsIcon className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="developer" className="gap-2">
                        <Code className="h-4 w-4" /> Developer
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
                                    <Input
                                        id="siteName"
                                        value={settings.siteName}
                                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Support Email</Label>
                                    <Input
                                        id="supportEmail"
                                        type="email"
                                        value={settings.supportEmail}
                                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                    />
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
                                <Switch
                                    checked={settings.maintenanceMode}
                                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable automated confirmation emails for all players.
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                </TabsContent>

                <TabsContent value="developer" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                                <Database className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">Healthy</div>
                                <p className="text-xs text-muted-foreground">Connected to NeonDB</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">API Latency</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">24ms</div>
                                <p className="text-xs text-muted-foreground">Average response time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Prisma Version</CardTitle>
                                <Terminal className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">v5.22.0</div>
                                <p className="text-xs text-muted-foreground">Latest compatible</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4h ago</div>
                                <p className="text-xs text-muted-foreground">Automated snapshot</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Environment Variables</CardTitle>
                            <CardDescription>
                                Securely configured variables for this deployment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm font-medium leading-none">DATABASE_URL</span>
                                    <span className="text-sm text-muted-foreground">Configured</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm font-medium leading-none">NEXTAUTH_URL</span>
                                    <span className="text-sm text-muted-foreground">Configured</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm font-medium leading-none">NODE_ENV</span>
                                    <span className="text-sm text-muted-foreground">development</span>
                                </div>
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
            </Tabs >
        </div >
    );
}
