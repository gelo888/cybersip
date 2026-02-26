"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Radar,
    Crosshair,
    Building2,
    Map,
    Lock,
    Settings,
    ChevronUp,
    User2,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";

const navMain = [
    {
        title: "Command Center",
        description: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Intelligence Hub",
        description: "Competitor tracking & market news",
        url: "/intelligence",
        icon: Radar,
    },
    {
        title: "The Hunt",
        description: "Pipeline & Kanban",
        url: "/hunt",
        icon: Crosshair,
    },
    {
        title: "Portfolio",
        description: "Companies & Contacts",
        url: "/portfolio",
        icon: Building2,
    },
    {
        title: "Territories",
        description: "Geographic & Team views",
        url: "/territories",
        icon: Map,
    },
    {
        title: "Vault",
        description: "Contracts & Proposals",
        url: "/vault",
        icon: Lock,
    },
];

const navSecondary = [
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="min-h-14 items-center justify-center">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-bold">
                                    CS
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">
                                        CyberSIP
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Sales Intelligence
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarSeparator />
                <SidebarGroup>
                    <SidebarGroupLabel>Strategic Operations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navMain.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
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
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navSecondary.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
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
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip="Account">
                            <div className="bg-sidebar-accent flex aspect-square size-8 items-center justify-center rounded-lg">
                                <User2 className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium text-sm">
                                    Agent
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    agent@cybersip.io
                                </span>
                            </div>
                            <ChevronUp className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
