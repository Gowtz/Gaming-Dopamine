"use client";

import { SessionProvider } from "next-auth/react";
import * as React from "react";

import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <React.Fragment>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                <SessionProvider>{children}</SessionProvider>
            </ThemeProvider>
        </React.Fragment>
    );
}
