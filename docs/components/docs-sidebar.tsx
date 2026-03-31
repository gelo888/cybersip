"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Layers,
  Download,
  Database,
  Server,
  Monitor,
  Palette,
  Map,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    title: "Introduction",
    href: "/",
    icon: BookOpen,
    description: "About CyberSIP",
  },
  {
    title: "Architecture",
    href: "/architecture",
    icon: Layers,
    description: "System design",
  },
  {
    title: "Getting Started",
    href: "/getting-started",
    icon: Download,
    description: "Installation & setup",
  },
  {
    title: "Database Schema",
    href: "/database",
    icon: Database,
    description: "Data models",
  },
  {
    title: "Backend API",
    href: "/backend",
    icon: Server,
    description: "REST endpoints",
  },
  {
    title: "Frontend",
    href: "/frontend",
    icon: Monitor,
    description: "Next.js app",
  },
  {
    title: "UX / UI Design",
    href: "/design",
    icon: Palette,
    description: "Design system",
  },
  {
    title: "New UX/UI design",
    href: "/design/new-ux-ui",
    icon: Sparkles,
    description: "Rollout plan & AI prompt",
  },
  {
    title: "Roadmap",
    href: "/roadmap",
    icon: Map,
    description: "Development plan",
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r border-border bg-sidebar flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Shield className="h-6 w-6 shrink-0 text-blue-500" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">
              Cyber<span className="text-blue-500">SIP</span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              Documentation
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" &&
                item.href !== "/design" &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-500/10 text-blue-600 font-medium dark:text-blue-400"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-blue-500"
                        : "text-muted-foreground"
                    )}
                  />
                  {!collapsed && (
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span
                        className={cn(
                          "text-[11px]",
                          isActive
                            ? "text-blue-500/70"
                            : "text-muted-foreground/70"
                        )}
                      >
                        {item.description}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
