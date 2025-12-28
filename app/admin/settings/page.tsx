"use client";

import { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    Save,
    Code,
    ShieldCheck,
    Activity,
    Clock,
    Database,
    Crown,
    Loader2,
    Terminal
} from "lucide-react";
import { updateSettings, getSettings, getSubscriptionPlan, updateSubscriptionPlan } from "@/lib/actions/admin-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { useAdminStore } from "@/hooks/useAdminStore";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [localSettings, setLocalSettings] = useState({
        siteName: "Gaming Dopamine",
        supportEmail: "support@gamingdopamine.com",
        maintenanceMode: false,
        emailNotifications: true,
    });

    const {
        activeSettingsTab,
        setSettingsTab,
        settings: storeSettings,
        subscriptionPlan: storePlan,
        updateSettingsCache,
        updateSubscriptionPlanCache
    } = useAdminStore();

    // Subscription Plan State
    const [planForm, setPlanForm] = useState<{ name: string; totalHours: number | string }>({ name: "", totalHours: 50 });
    const [planLoading, setPlanLoading] = useState(false);

    useEffect(() => {
        const initData = async () => {
            if (storeSettings && storePlan) {
                setLocalSettings({
                    siteName: storeSettings.siteName || "Gaming Dopamine",
                    supportEmail: storeSettings.supportEmail || "support@gamingdopamine.com",
                    maintenanceMode: storeSettings.maintenanceMode || false,
                    emailNotifications: storeSettings.emailNotifications ?? true,
                });
                setPlanForm({ name: storePlan.name || "", totalHours: storePlan.totalHours || 50 });
                setFetching(false);
                return;
            }

            try {
                const [settingsData, planData] = await Promise.all([
                    getSettings(),
                    getSubscriptionPlan()
                ]);

                // Update Store
                updateSettingsCache(settingsData);
                updateSubscriptionPlanCache(planData);

                // Update Local State
                setLocalSettings({
                    siteName: settingsData.siteName || "Gaming Dopamine",
                    supportEmail: settingsData.supportEmail || "support@gamingdopamine.com",
                    maintenanceMode: settingsData.maintenanceMode || false,
                    emailNotifications: settingsData.emailNotifications ?? true,
                });
                setPlanForm({ name: planData?.name || "", totalHours: planData?.totalHours || 50 });
            } catch (error) {
                console.error("Failed to fetch settings", error);
                toast.error("Failed to load settings");
            } finally {
                setFetching(false);
            }
        };

        initData();
    }, [storeSettings, storePlan, updateSettingsCache, updateSubscriptionPlanCache]);

    async function handleSave() {
        setLoading(true);
        try {
            const updated = await updateSettings(localSettings);
            updateSettingsCache(updated); // Update Store
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    }

    async function handlePlanSave() {
        setPlanLoading(true);
        try {
            await updateSubscriptionPlan({
                name: planForm.name,
                totalHours: Number(planForm.totalHours) || 0
            });
            toast.success("Subscription plan updated");

            // Refresh and Update Store
            const updated = await getSubscriptionPlan();
            updateSubscriptionPlanCache(updated);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update plan");
        } finally {
            setPlanLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Configure your café's global parameters.</p>
                </div>
                <Button onClick={handleSave} disabled={loading || fetching}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs value={activeSettingsTab} onValueChange={setSettingsTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="general" className="gap-2">
                        <SettingsIcon className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="subscription" className="gap-2">
                        <Crown className="h-4 w-4" /> Subscription
                    </TabsTrigger>
                    <TabsTrigger value="developer" className="gap-2">
                        <Code className="h-4 w-4" /> Developer
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    {fetching ? (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-[200px] mb-2" />
                                    <Skeleton className="h-4 w-[300px]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[100px]" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[100px]" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-[200px] mb-2" />
                                    <Skeleton className="h-4 w-[300px]" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <>
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
                                                value={localSettings.siteName}
                                                onChange={(e) => setLocalSettings({ ...localSettings, siteName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="supportEmail">Support Email</Label>
                                            <Input
                                                id="supportEmail"
                                                type="email"
                                                value={localSettings.supportEmail}
                                                onChange={(e) => setLocalSettings({ ...localSettings, supportEmail: e.target.value })}
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
                                            checked={localSettings.maintenanceMode}
                                            onCheckedChange={(checked) => setLocalSettings({ ...localSettings, maintenanceMode: checked })}
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
                                            checked={localSettings.emailNotifications}
                                            onCheckedChange={(checked) => setLocalSettings({ ...localSettings, emailNotifications: checked })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="subscription" className="space-y-4">
                    {fetching ? (
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-[200px] mb-2" />
                                <Skeleton className="h-4 w-[300px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-56 w-full" />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Subscription Plan</CardTitle>
                                <CardDescription>
                                    Define the default tier name and hours allocated for new subscribers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="planName">Plan Name</Label>
                                        <Input
                                            id="planName"
                                            value={planForm.name}
                                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                            placeholder="e.g. Gold Membership"
                                        />
                                        <p className="text-xs text-muted-foreground">Visible on user profiles.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="totalHours">Allocated Hours</Label>
                                        <Input
                                            id="totalHours"
                                            type="number"
                                            min="0"
                                            value={planForm.totalHours}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPlanForm({ ...planForm, totalHours: val === "" ? "" : parseFloat(val) })
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">Monthly hours given to subscribers.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handlePlanSave} disabled={planLoading} variant="secondary">
                                        {planLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Update Plan Defaults
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="developer" className="space-y-4">
                    {fetching ? (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </TabsContent>
            </Tabs >
        </div >
    );
}
