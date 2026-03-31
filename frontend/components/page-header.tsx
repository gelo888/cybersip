"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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

export function PageHeader() {
    const pathname = usePathname();
    const page = resolvePageConfig(pathname);

    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
            />
            {page && (
                <div className="flex items-center gap-3 min-w-0">
                    <span className="text-md font-semibold whitespace-nowrap">
                        {page.title}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                        {page.description}
                    </span>
                </div>
            )}
        </header>
    );
}
