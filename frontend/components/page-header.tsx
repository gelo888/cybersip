"use client";

import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Search } from "lucide-react";

import { COMMAND_PALETTE_OPEN_EVENT } from "@/components/command-palette";
import { ThemeToggleButton } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageConfig: Record<string, { title: string; description: string }> = {
    "/": {
        title: "Command Center",
        description:
            "Proactive dashboard — upcoming attacks and displacement opportunities.",
    },
    "/intelligence": {
        title: "Intelligence Hub",
        description:
            "Competitor tracking, market signals, and displacement opportunities.",
    },
    "/sales-recon": {
        title: "Sales Recon",
        description:
            "GTM recon — public social, hiring, and news signals per account.",
    },
    "/hunt": {
        title: "The Hunt",
        description: "Competitive displacement pipeline.",
    },
    "/portfolio": {
        title: "Portfolio",
        description: "Companies & Contacts under your coverage.",
    },
    "/territories": {
        title: "Territories",
        description: "Geographic & team performance across all regions.",
    },
    "/vault": {
        title: "Vault",
        description: "Contracts & Proposals — your revenue foundation.",
    },
    "/settings": {
        title: "Settings",
        description: "Manage your profile, notifications, and integrations.",
    },
};

function resolvePageConfig(pathname: string) {
    if (pageConfig[pathname]) return pageConfig[pathname];

    if (pathname.startsWith("/portfolio/")) {
        return {
            title: "Company 360",
            description: "Full view of company relationships, engagements, and contracts.",
        };
    }

    return null;
}

function requestCommandPalette() {
    window.dispatchEvent(new Event(COMMAND_PALETTE_OPEN_EVENT));
}

export function PageHeader() {
    const pathname = usePathname();
    const page = resolvePageConfig(pathname);

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-3 shadow-sm backdrop-blur-xl supports-backdrop-filter:bg-background/70 dark:border-white/6 dark:bg-background/55 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] sm:px-4">
            <SidebarTrigger className="-ml-0.5 shrink-0" />
            <div
                className="hidden h-5 w-px shrink-0 bg-border/70 dark:bg-white/10 sm:block"
                aria-hidden
            />
            {page && (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <h2 className="font-(family-name:--font-lexend) text-sm font-semibold tracking-tight text-primary sm:text-base">
                        {page.title}
                    </h2>
                    <div
                        className="hidden h-4 w-px shrink-0 bg-border/60 dark:bg-white/10 md:block"
                        aria-hidden
                    />
                    <p className="text-muted-foreground hidden truncate text-xs font-medium md:inline">
                        {page.description}
                    </p>
                </div>
            )}
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                    type="button"
                    onClick={requestCommandPalette}
                    className="border-input bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground relative hidden h-8 w-[min(100%,14rem)] items-center gap-2 rounded-md border px-2 text-left text-xs shadow-none transition-colors md:flex"
                >
                    <Search className="text-muted-foreground/80 size-3.5 shrink-0" />
                    <span className="text-muted-foreground/90 truncate">
                        Global search…
                    </span>
                    <kbd className="text-muted-foreground/50 pointer-events-none ml-auto hidden text-[10px] font-sans lg:inline">
                        ⌘K
                    </kbd>
                </button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 md:hidden"
                    aria-label="Open search"
                    onClick={requestCommandPalette}
                >
                    <Search className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hidden size-8 sm:flex"
                    aria-label="Notifications (placeholder)"
                >
                    <Bell className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hidden size-8 sm:flex"
                    aria-label="Help (placeholder)"
                >
                    <HelpCircle className="size-4" />
                </Button>
                <ThemeToggleButton className="size-8" />
            </div>
        </header>
    );
}
