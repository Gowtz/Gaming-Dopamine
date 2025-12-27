"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/actions/admin-actions";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAdminPath = pathname?.startsWith("/admin");
    const isUnauthorizedPath = pathname === "/unauthorized";

    useEffect(() => {
        getSettings().then((settings: any) => {
            setMaintenance(settings?.maintenanceMode || false);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen bg-background" />;

    // @ts-ignore
    const isAdmin = session?.user?.role === "ADMIN";

    if (maintenance && !isAdmin && !isAdminPath && !isUnauthorizedPath) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h1 className="text-4xl font-bold mb-4 font-outfit">Under Maintenance</h1>
                <p className="text-muted-foreground max-w-md">
                    We're currently performing some scheduled maintenance to improve your experience.
                    We'll be back online shortly!
                </p>
            </div>
        );
    }

    if (isAdminPath || isUnauthorizedPath) {
        return <>{children}</>;
    }

    return (
        <div className="dark contents">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}
