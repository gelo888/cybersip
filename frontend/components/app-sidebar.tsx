"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User2 } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { appNavMain, appNavSecondary } from "@/lib/app-nav";

function isNavActive(pathname: string, url: string) {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
}

const navButtonPassive =
    "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground";

const navButtonActive =
    "relative !bg-primary/10 !text-primary shadow-none hover:!bg-primary/15 data-[active=true]:!bg-primary/10 data-[active=true]:!text-primary before:pointer-events-none before:absolute before:left-1 before:top-1/2 before:z-10 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-primary before:content-[''] before:shadow-[0_0_10px_color-mix(in_srgb,var(--sidebar-primary),transparent_20%)]";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="gap-3 px-2 pb-2 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-auto py-2">
                            <Link href="/">
                                <div className="bg-primary/15 text-primary ring-primary/25 flex aspect-square size-9 items-center justify-center rounded-md text-xs font-bold ring-1">
                                    CS
                                </div>
                                <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                                    <span className="font-(family-name:--font-lexend) text-base font-bold tracking-tight text-sidebar-foreground">
                                        CyberSIP
                                    </span>
                                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/45">
                                        Strategic Intelligence
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1">
                <SidebarSeparator className="bg-sidebar-border/40" />
                <SidebarGroup className="px-0 py-0">
                    <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/45">
                        Strategic Operations
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5 px-1">
                            {appNavMain.map((item) => {
                                const active = isNavActive(pathname, item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.title}
                                            className={cn(
                                                active
                                                    ? navButtonActive
                                                    : navButtonPassive,
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon
                                                    className={cn(
                                                        active &&
                                                            "text-primary",
                                                    )}
                                                />
                                                <span className="font-medium tracking-wide">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-sidebar-border/40" />

                <SidebarGroup className="px-0 py-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5 px-1">
                            {appNavSecondary.map((item) => {
                                const active = isNavActive(pathname, item.url);
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={item.title}
                                            className={cn(
                                                active
                                                    ? navButtonActive
                                                    : navButtonPassive,
                                            )}
                                        >
                                            <Link href={item.url}>
                                                <item.icon
                                                    className={cn(
                                                        active &&
                                                            "text-primary",
                                                    )}
                                                />
                                                <span className="font-medium tracking-wide">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/30 p-2">
                <div className="bg-sidebar-accent/80 flex items-center gap-3 rounded-lg px-3 py-2.5">
                    <div className="bg-primary/20 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                        AG
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                        <p className="truncate text-xs font-semibold text-sidebar-foreground">
                            Agent
                        </p>
                        <p className="truncate text-[10px] text-sidebar-foreground/50">
                            agent@cybersip.io
                        </p>
                    </div>
                    <button
                        type="button"
                        className="text-sidebar-foreground/40 hover:text-sidebar-foreground shrink-0 rounded-md p-1 transition-colors"
                        aria-label="Sign out (placeholder)"
                    >
                        <LogOut className="size-4" />
                    </button>
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
