"use client"

import * as React from "react"
import {
    CalendarDays,
    History,
    LayoutDashboard,
    LogOut,
    Settings,
    Users,
    Gamepad2, // Fallback logo
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const data = {
    navMain: [
        {
            title: "Overview",
            url: "/admin",
            icon: LayoutDashboard,
        },
        {
            title: "Manage Slots",
            url: "/admin/slots",
            icon: CalendarDays,
        },
        {
            title: "Booking History",
            url: "/admin/bookings",
            icon: History,
        },
        {
            title: "Players",
            url: "/admin/players",
            icon: Users,
        },
        {
            title: "Settings",
            url: "/admin/settings",
            icon: Settings,
        },
    ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" {...props} className="border-r-0">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Gamepad2 className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Admin Panel</span>
                                    <span className="truncate text-xs">Gaming Dopamine</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {data.navMain.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.url || pathname?.startsWith(item.url + "/")}
                                tooltip={item.title}
                            >
                                <Link href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                        <AvatarFallback className="rounded-lg">{user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                    <LogOut className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Exit Admin
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
