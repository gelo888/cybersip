import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MetricStatAccent =
    | "none"
    | "primary"
    | "chart2"
    | "accent"
    | "destructive";

const accentBorder: Record<MetricStatAccent, string> = {
    none: "",
    primary: "border-l-2 border-l-primary",
    chart2: "border-l-2 border-l-chart-2",
    accent: "border-l-2 border-l-accent",
    destructive: "border-l-2 border-l-destructive",
};

export interface MetricStatCardProps {
    label: string;
    value: ReactNode;
    hint?: string;
    /** 0–100; renders a thin primary bar when set */
    progress?: number;
    /** e.g. refetch spinner */
    trailing?: ReactNode;
    /** Sentinel-style left accent */
    accent?: MetricStatAccent;
    /** Large faded icon (bottom-right) */
    decorativeIcon?: LucideIcon;
    className?: string;
}

export function MetricStatCard({
    label,
    value,
    hint,
    progress,
    trailing,
    accent = "none",
    decorativeIcon: DecorativeIcon,
    className,
}: MetricStatCardProps) {
    const clamped =
        progress != null
            ? Math.min(100, Math.max(0, progress))
            : null;

    return (
        <div
            className={cn(
                "group bg-card text-card-foreground relative space-y-1 overflow-hidden rounded-lg p-5 ring-1 ring-border/50",
                accentBorder[accent],
                className,
            )}
        >
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <div className="font-(family-name:--font-lexend) text-2xl font-bold tracking-tight text-foreground tabular-nums">
                    {value}
                </div>
                {trailing ? (
                    <span className="shrink-0">{trailing}</span>
                ) : null}
            </div>
            {hint ? (
                <p className="text-muted-foreground m-0 text-xs">{hint}</p>
            ) : null}
            {clamped != null ? (
                <div
                    className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full"
                    role="presentation"
                >
                    <div
                        className="bg-primary h-full rounded-full transition-[width] duration-300"
                        style={{ width: `${clamped}%` }}
                    />
                </div>
            ) : null}
            {DecorativeIcon ? (
                <DecorativeIcon
                    className="text-primary pointer-events-none absolute -bottom-2 -right-2 size-[5.5rem] opacity-[0.06] transition-opacity group-hover:opacity-[0.1] dark:opacity-[0.08] dark:group-hover:opacity-[0.14]"
                    aria-hidden
                />
            ) : null}
        </div>
    );
}
