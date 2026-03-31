import type { LucideIcon } from "lucide-react";
import {
    LayoutDashboard,
    Radar,
    Telescope,
    Crosshair,
    Building2,
    Map,
    Lock,
    Settings,
} from "lucide-react";

/** Primary app areas (sidebar + command palette). */
export interface AppNavItem {
    title: string;
    description?: string;
    url: string;
    icon: LucideIcon;
}

export const appNavMain: AppNavItem[] = [
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
        title: "Sales Recon",
        description: "GTM & account recon workspace",
        url: "/sales-recon",
        icon: Telescope,
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

export const appNavSecondary: AppNavItem[] = [
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

/** Flat list for command palette search (main first, then secondary). */
export const appNavAll: AppNavItem[] = [...appNavMain, ...appNavSecondary];
