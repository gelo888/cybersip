"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface ChartPanelProps {
    title: string;
    description?: string;
    /** 2px primary strip (Sentinel “active monitoring” cue) */
    accent?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    isLoading?: boolean;
    loadingSlot?: ReactNode;
    headerRight?: ReactNode;
    className?: string;
    children?: ReactNode;
}

function ChartPanelSkeleton() {
    return (
        <div className="flex h-[220px] flex-col justify-end gap-2 pb-2">
            <div className="flex flex-1 items-end justify-around gap-2 px-2 pt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="w-full max-w-12 rounded-t-sm"
                        style={{ height: `${40 + ((i * 17) % 55)}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between px-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-10" />
                ))}
            </div>
        </div>
    );
}

export function ChartPanel({
    title,
    description,
    accent = true,
    isEmpty = false,
    emptyMessage = "No data to chart yet.",
    isLoading = false,
    loadingSlot,
    headerRight,
    className,
    children,
}: ChartPanelProps) {
    return (
        <div
            className={cn(
                "bg-card text-card-foreground overflow-hidden rounded-lg shadow-sm ring-1 ring-border/40",
                className,
            )}
        >
            {accent ? (
                <div className="bg-primary h-0.5 w-full shrink-0" aria-hidden />
            ) : null}
            <div className="flex items-start justify-between gap-3 border-b border-border/50 bg-muted/45 px-4 py-3 dark:bg-muted/25">
                <div className="min-w-0">
                    <h3 className="font-(family-name:--font-lexend) text-foreground text-sm font-semibold tracking-tight">
                        {title}
                    </h3>
                    {description ? (
                        <p className="text-muted-foreground mt-0.5 mb-0 text-xs">
                            {description}
                        </p>
                    ) : null}
                </div>
                {headerRight}
            </div>
            <div className="relative min-h-[220px] p-4">
                {isLoading ? (
                    (loadingSlot ?? <ChartPanelSkeleton />)
                ) : isEmpty ? (
                    <div className="text-muted-foreground flex h-[220px] flex-col items-center justify-center gap-1 px-4 text-center text-sm">
                        {emptyMessage}
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
