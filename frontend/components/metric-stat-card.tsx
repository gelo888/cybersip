import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface MetricStatCardProps {
    label: string;
    value: ReactNode;
    hint?: string;
    /** 0–100; renders a thin primary bar when set */
    progress?: number;
    /** e.g. refetch spinner */
    trailing?: ReactNode;
    className?: string;
}

export function MetricStatCard({
    label,
    value,
    hint,
    progress,
    trailing,
    className,
}: MetricStatCardProps) {
    const clamped =
        progress != null
            ? Math.min(100, Math.max(0, progress))
            : null;

    return (
        <div
            className={cn(
                "bg-card text-card-foreground space-y-1 rounded-lg p-4 ring-1 ring-border/50",
                className,
            )}
        >
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
            </span>
            <div className="flex items-center gap-2">
                <div className="font-(family-name:--font-lexend) text-2xl font-semibold tracking-tight tabular-nums">
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
        </div>
    );
}
