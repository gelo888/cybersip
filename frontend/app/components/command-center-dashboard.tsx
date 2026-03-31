"use client";

import Link from "next/link";
import { useRef } from "react";
import {
    Shield,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    LayoutDashboard,
    Zap,
    Loader2,
    Building2,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    RefreshCw,
    Trophy,
    History,
    ArrowRight,
} from "lucide-react";

import { MetricStatCard } from "@/components/metric-stat-card";
import { Button } from "@/components/ui/button";
import { ChartPanel } from "@/components/chart-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCommandCenterActionStream } from "@/hooks/use-command-center-action-stream";
import { useCommandCenterSummary } from "@/hooks/use-command-center-summary";
import {
    countRenewalsWithinDays,
    daysUntilEnd,
    overallWinRateFromStream,
    streamSignalCounts,
    sumRenewalRadarValue,
} from "@/lib/command-center-derive";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { ActionStreamItem, ContractType } from "@/lib/types";
import { RenewalsByMonthChart } from "./renewals-by-month-chart";
import { WinRateTrendChart } from "./win-rate-trend-chart";

function toNumber(v: number | string | null | undefined): number | null {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
}

function formatCurrency(value: number | string | null) {
    const n = toNumber(value);
    if (n == null) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);
}

function ActionIcon({ type }: { type: string }) {
    const config: Record<string, { icon: typeof Zap; className: string }> = {
        breach: { icon: AlertTriangle, className: "text-destructive" },
        competitor: { icon: Shield, className: "text-orange-500 dark:text-orange-400" },
        renewal: { icon: Clock, className: "text-sky-600 dark:text-sky-400" },
        pipeline: { icon: Zap, className: "text-primary" },
        win: { icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400" },
        loss: { icon: TrendingDown, className: "text-destructive" },
    };
    const { icon: Icon, className } = config[type] ?? {
        icon: Zap,
        className: "text-muted-foreground",
    };
    return <Icon className={cn("size-4 shrink-0", className)} />;
}

function streamDotClass(type: ActionStreamItem["stream_type"]) {
    const map: Record<ActionStreamItem["stream_type"], string> = {
        win: "bg-emerald-500 ring-emerald-500/25",
        loss: "bg-destructive ring-destructive/25",
        pipeline: "bg-primary ring-primary/25",
        renewal: "bg-sky-500 ring-sky-500/25",
        competitor: "bg-orange-500 ring-orange-500/25",
        breach: "bg-destructive ring-destructive/20",
    };
    return map[type];
}

function RadarTypeBadge({ type }: { type: ContractType }) {
    const isOurs = type === "our_contract";
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                isOurs ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
        >
            {isOurs ? "Ours" : "Competitor"}
        </span>
    );
}

function renewalTopBorderClass(days: number | null) {
    if (days != null && days >= 0 && days <= 14) return "border-t-destructive";
    if (days != null && days >= 0 && days <= 30) return "border-t-orange-500 dark:border-t-orange-400";
    return "border-t-primary";
}

function renewalRiskLabel(days: number | null) {
    if (days == null || days < 0) return { label: "Unknown", className: "text-muted-foreground" };
    if (days <= 14) return { label: "High risk", className: "text-destructive font-bold" };
    if (days <= 30) return { label: "Attention", className: "text-orange-600 font-bold dark:text-orange-400" };
    if (days <= 60) return { label: "Stable", className: "text-accent font-bold" };
    return { label: "Growth window", className: "text-primary font-bold" };
}

function ActionStreamSkeleton() {
    return (
        <div className="divide-border max-h-[min(700px,70vh)] divide-y overflow-y-auto rounded-lg border ring-1 ring-border/40">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-4">
                    <Skeleton className="mt-0.5 size-2.5 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-4 w-full max-w-md" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function KpiSkeletonGrid() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-card space-y-2 overflow-hidden rounded-lg p-5 ring-1 ring-border/50"
                >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    );
}

function ActionStreamColumn({
    streamLoading,
    streamError,
    streamErr,
    streamData,
    refetchStream,
}: {
    streamLoading: boolean;
    streamError: boolean;
    streamErr: unknown;
    streamData: { items: ActionStreamItem[] } | undefined;
    refetchStream: () => void;
}) {
    return (
        <div className="bg-card flex flex-col rounded-lg p-5 ring-1 ring-border/50 lg:min-h-0">
            <div className="text-muted-foreground mb-4 flex items-center justify-between">
                <h2 className="text-foreground m-0 text-xs font-bold tracking-wider uppercase">
                    Action stream
                </h2>
                <History className="size-4 opacity-60" aria-hidden />
            </div>

            {streamLoading ? (
                <ActionStreamSkeleton />
            ) : streamError ? (
                <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4">
                    <p className="text-destructive m-0 text-sm">
                        {streamErr instanceof Error
                            ? streamErr.message
                            : "Could not load action stream."}
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => refetchStream()}>
                        Retry
                    </Button>
                </div>
            ) : streamData && streamData.items.length === 0 ? (
                <p className="text-muted-foreground m-0 rounded-lg border border-dashed p-6 text-center text-sm">
                    No recent CRM activity in this window.
                </p>
            ) : streamData ? (
                <>
                    <div className="max-h-[min(700px,70vh)] space-y-0 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {streamData.items.map((streamItem, index) => {
                            const content = (
                                <div className="min-w-0 flex-1 pt-0.5">
                                    <p className="text-muted-foreground m-0 text-[10px] font-bold tracking-wide uppercase">
                                        {formatRelativeTime(streamItem.occurred_at)}
                                    </p>
                                    <p className="mt-1 mb-0 text-sm leading-snug font-medium">
                                        {streamItem.message}
                                    </p>
                                </div>
                            );
                            const inner = (
                                <div className="flex gap-3">
                                    <div className="relative flex w-4 shrink-0 flex-col items-center">
                                        <div
                                            className={cn(
                                                "z-10 size-2.5 shrink-0 rounded-full ring-4",
                                                streamDotClass(streamItem.stream_type),
                                            )}
                                            aria-hidden
                                        />
                                        {index < streamData.items.length - 1 ? (
                                            <div
                                                className="bg-border/60 mt-1 min-h-6 w-px flex-1"
                                                aria-hidden
                                            />
                                        ) : null}
                                    </div>
                                    {content}
                                </div>
                            );
                            return (
                                <div key={streamItem.id} className="pb-6 last:pb-0">
                                    {streamItem.company_id ? (
                                        <Link
                                            href={`/portfolio/${streamItem.company_id}`}
                                            className="hover:bg-muted/25 -mx-1 block rounded-md px-1 py-0.5 transition-colors"
                                        >
                                            {inner}
                                        </Link>
                                    ) : (
                                        <div className="px-1 py-0.5">{inner}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 gap-2 text-xs font-bold"
                        asChild
                    >
                        <Link href="/hunt">
                            View pipeline
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </Button>
                </>
            ) : null}
        </div>
    );
}

function CrmSignalsPanel({
    items,
    isLoading,
}: {
    items: ActionStreamItem[];
    isLoading: boolean;
}) {
    const c = streamSignalCounts(items);
    const cells = [
        { label: "Wins", value: c.win, tone: "text-emerald-600 dark:text-emerald-400" },
        { label: "Losses", value: c.loss, tone: "text-destructive" },
        { label: "Pipeline", value: c.pipeline, tone: "text-primary" },
        { label: "Renewals", value: c.renewal, tone: "text-sky-600 dark:text-sky-400" },
        { label: "Competitor", value: c.competitor, tone: "text-orange-600 dark:text-orange-400" },
        { label: "Risk", value: c.breach, tone: "text-destructive" },
    ];

    return (
        <ChartPanel
            title="CRM signals"
            description="Action stream mix · last 90 days (engagements + new accounts)"
            accent
            isLoading={isLoading}
            isEmpty={!isLoading && items.length === 0}
            emptyMessage="No CRM activity in this window."
        >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {cells.map((cell) => (
                    <div
                        key={cell.label}
                        className="bg-muted/30 rounded-lg px-3 py-3 ring-1 ring-border/30"
                    >
                        <p className="text-muted-foreground m-0 text-[10px] font-bold tracking-wider uppercase">
                            {cell.label}
                        </p>
                        <p
                            className={cn(
                                "font-(family-name:--font-lexend) m-0 mt-1 text-xl font-bold tabular-nums",
                                cell.tone,
                            )}
                        >
                            {cell.value}
                        </p>
                    </div>
                ))}
            </div>
        </ChartPanel>
    );
}

export function CommandCenterDashboard() {
    const radarScrollRef = useRef<HTMLDivElement>(null);
    const { data, isLoading, isError, error, refetch, isFetching } =
        useCommandCenterSummary();
    const {
        data: streamData,
        isLoading: streamLoading,
        isError: streamError,
        error: streamErr,
        refetch: refetchStream,
    } = useCommandCenterActionStream();

    const streamItems = streamData?.items ?? [];
    const winRateAgg = overallWinRateFromStream(streamItems);

    function scrollRadar(dir: -1 | 1) {
        const el = radarScrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 280, behavior: "smooth" });
    }

    const summaryBlock =
        isLoading ? (
            <>
                <KpiSkeletonGrid />
                <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="size-2 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex gap-3 overflow-hidden pb-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-44 w-72 shrink-0 rounded-lg" />
                        ))}
                    </div>
                </div>
            </>
        ) : isError ? (
            <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-destructive m-0 text-sm">
                    {error instanceof Error
                        ? error.message
                        : "Could not load dashboard metrics."}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                </Button>
            </div>
        ) : data ? (
            <>
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricStatCard
                        label="Pipeline value"
                        value={formatCurrency(data.kpis.pipeline_value)}
                        hint="Pending our_contract deals"
                        accent="primary"
                        decorativeIcon={DollarSign}
                        trailing={
                            isFetching && !isLoading ? (
                                <Loader2 className="text-muted-foreground size-4 animate-spin" />
                            ) : null
                        }
                    />
                    <MetricStatCard
                        label="90d renewal exposure"
                        value={formatCurrency(sumRenewalRadarValue(data.renewal_radar))}
                        hint="Sum of values on renewal radar"
                        accent="chart2"
                        decorativeIcon={RefreshCw}
                        trailing={
                            isFetching && !isLoading ? (
                                <Loader2 className="text-muted-foreground size-4 animate-spin" />
                            ) : null
                        }
                    />
                    <MetricStatCard
                        label="Win rate (stream)"
                        value={
                            streamLoading ? (
                                <span className="text-muted-foreground text-lg">…</span>
                            ) : streamError ? (
                                "—"
                            ) : winRateAgg.rate != null ? (
                                `${winRateAgg.rate}%`
                            ) : (
                                "—"
                            )
                        }
                        hint={
                            streamError
                                ? "Could not load action stream."
                                : streamLoading
                                  ? "Loading stream…"
                                  : winRateAgg.rate == null
                                    ? `No wins/losses yet (${streamItems.length} events).`
                                    : `${winRateAgg.wins}W / ${winRateAgg.losses}L in window`
                        }
                        accent="accent"
                        decorativeIcon={Trophy}
                        trailing={
                            streamLoading ? (
                                <Loader2 className="text-muted-foreground size-4 animate-spin" />
                            ) : null
                        }
                    />
                    <MetricStatCard
                        label="At-risk renewals"
                        value={String(
                            countRenewalsWithinDays(data.renewal_radar, 30),
                        )}
                        hint="≤30 days to expiry on radar"
                        accent="destructive"
                        decorativeIcon={AlertTriangle}
                    />
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <span
                                className="bg-primary size-1.5 shrink-0 animate-pulse rounded-full"
                                aria-hidden
                            />
                            <LayoutDashboard className="text-primary size-5 shrink-0" />
                            <h2 className="m-0 text-base font-semibold">Renewal radar</h2>
                            <span className="text-muted-foreground hidden text-xs sm:inline">
                                Next 90 days · active contracts
                            </span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                aria-label="Scroll radar left"
                                onClick={() => scrollRadar(-1)}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                aria-label="Scroll radar right"
                                onClick={() => scrollRadar(1)}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {data.renewal_radar.length === 0 ? (
                        <p className="text-muted-foreground m-0 text-sm">
                            No active contracts expiring in the next 90 days.
                        </p>
                    ) : (
                        <div
                            ref={radarScrollRef}
                            className="flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {data.renewal_radar.map((item) => {
                                const days = daysUntilEnd(item.end_date);
                                const risk = renewalRiskLabel(days);
                                return (
                                    <div
                                        key={item.contract_id}
                                        className={cn(
                                            "bg-card w-72 shrink-0 snap-start space-y-3 rounded-lg p-4 ring-1 ring-border/50 border-t-2",
                                            renewalTopBorderClass(days),
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="bg-muted/50 rounded-md p-2 ring-1 ring-border/40">
                                                <Building2 className="text-primary size-5" />
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={cn(
                                                        "m-0 text-[10px] tracking-tight uppercase",
                                                        risk.className,
                                                    )}
                                                >
                                                    {risk.label}
                                                </p>
                                                <p className="m-0 text-xs font-semibold">
                                                    {days != null ? `${days} days left` : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/portfolio/${item.company_id}`}
                                            className="block truncate text-sm font-bold text-foreground hover:text-primary hover:underline"
                                        >
                                            {item.company_name}
                                        </Link>
                                        <p className="text-muted-foreground m-0 flex flex-wrap items-center gap-1 text-xs">
                                            <span>Incumbent:</span>
                                            <span className="text-foreground">
                                                {item.incumbent_label}
                                            </span>
                                        </p>
                                        <div className="flex items-center justify-between gap-2 pt-1">
                                            <span className="font-(family-name:--font-lexend) text-primary text-xs font-semibold">
                                                {formatCurrency(item.total_value)}
                                            </span>
                                            <Button size="sm" className="h-7 text-[10px] font-bold" asChild>
                                                <Link href={`/portfolio/${item.company_id}`}>
                                                    Open
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="text-muted-foreground flex items-center justify-between gap-2 border-t border-border/50 pt-2 text-xs">
                                            <span className="truncate">
                                                {item.territory_label ?? "—"}
                                            </span>
                                            <RadarTypeBadge type={item.contract_type} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </>
        ) : null;

    const lowerGrid = !isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-6 lg:col-span-2">
                {data ? (
                    <>
                        <CrmSignalsPanel items={streamItems} isLoading={streamLoading} />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <RenewalsByMonthChart
                                items={data.renewal_radar}
                                isLoading={false}
                                metric="valueM"
                            />
                            <WinRateTrendChart
                                items={streamItems}
                                isLoading={streamLoading}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {isError ? (
                            <p className="text-muted-foreground m-0 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm">
                                Summary metrics are unavailable. CRM signals and win-rate trend
                                still reflect the action stream; renewal value chart needs a
                                successful summary load.
                            </p>
                        ) : null}
                        <CrmSignalsPanel items={streamItems} isLoading={streamLoading} />
                        <WinRateTrendChart items={streamItems} isLoading={streamLoading} />
                    </>
                )}
            </div>

            <ActionStreamColumn
                streamLoading={streamLoading}
                streamError={streamError}
                streamErr={streamErr}
                streamData={streamData}
                refetchStream={refetchStream}
            />
        </div>
    ) : null;

    const chartsWhileLoading = isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-6 lg:col-span-2">
                <ChartPanel title="CRM signals" isLoading />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <RenewalsByMonthChart items={[]} isLoading metric="valueM" />
                    <WinRateTrendChart items={[]} isLoading />
                </div>
            </div>
            <div className="bg-card h-[min(420px,50vh)] rounded-lg ring-1 ring-border/50 lg:h-auto lg:min-h-[min(700px,70vh)]">
                <div className="text-muted-foreground flex items-center justify-between p-5 pb-0">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="size-4 rounded" />
                </div>
                <div className="p-4">
                    <ActionStreamSkeleton />
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="space-y-0 p-6">
            {summaryBlock}
            {chartsWhileLoading}
            {lowerGrid}
        </div>
    );
}
