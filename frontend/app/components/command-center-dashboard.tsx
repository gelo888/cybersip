"use client";

import Link from "next/link";
import {
    Shield,
    Clock,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Newspaper,
    LayoutDashboard,
    Zap,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommandCenterActionStream } from "@/hooks/use-command-center-action-stream";
import { useCommandCenterSummary } from "@/hooks/use-command-center-summary";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { ContractType } from "@/lib/types";

const regionHeatmap: {
    region: string;
    wins: number;
    losses: number;
    active: number;
    status: "winning" | "contested" | "under_siege";
}[] = [
    { region: "North America", wins: 18, losses: 6, active: 12, status: "winning" },
    { region: "EMEA", wins: 11, losses: 8, active: 9, status: "contested" },
    { region: "APAC", wins: 4, losses: 7, active: 5, status: "under_siege" },
    { region: "LATAM", wins: 3, losses: 4, active: 3, status: "contested" },
];

function toNumber(v: number | string | null | undefined): number | null {
    if (v == null) return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const n = parseFloat(v);
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

function daysUntil(iso: string | null) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function HeatmapStatus({ status }: { status: "winning" | "contested" | "under_siege" }) {
    const config = {
        winning: { label: "Winning", className: "bg-sophos-green/10 text-sophos-green" },
        contested: { label: "Contested", className: "bg-sophos-orange/10 text-sophos-orange" },
        under_siege: { label: "Under Siege", className: "bg-sophos-red/10 text-sophos-red" },
    };
    const { label, className } = config[status];
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
            {label}
        </span>
    );
}

function ActionIcon({ type }: { type: string }) {
    const config: Record<string, { icon: typeof Zap; className: string }> = {
        breach: { icon: AlertTriangle, className: "text-sophos-red" },
        competitor: { icon: Shield, className: "text-sophos-orange" },
        renewal: { icon: Clock, className: "text-sophos-sky" },
        pipeline: { icon: Zap, className: "text-primary" },
        win: { icon: TrendingUp, className: "text-sophos-green" },
        loss: { icon: TrendingDown, className: "text-sophos-red" },
    };
    const { icon: Icon, className } = config[type] ?? {
        icon: Zap,
        className: "text-muted-foreground",
    };
    return <Icon className={`size-4 shrink-0 ${className}`} />;
}

function RadarTypeBadge({ type }: { type: ContractType }) {
    const isOurs = type === "our_contract";
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${isOurs ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
        >
            {isOurs ? "Ours" : "Competitor"}
        </span>
    );
}

function ActionStreamSkeleton() {
    return (
        <div className="rounded-lg border divide-y max-h-[340px] overflow-y-auto">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <Skeleton className="size-4 shrink-0 rounded mt-0.5" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <Skeleton className="h-4 w-full max-w-md" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function KpiSkeletonGrid() {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            ))}
        </div>
    );
}

export function CommandCenterDashboard() {
    const { data, isLoading, isError, error, refetch, isFetching } = useCommandCenterSummary();
    const {
        data: streamData,
        isLoading: streamLoading,
        isError: streamError,
        error: streamErr,
        refetch: refetchStream,
    } = useCommandCenterActionStream();

    return (
        <div className="p-6 space-y-8">
            {isLoading ? (
                <KpiSkeletonGrid />
            ) : isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-destructive m-0">
                        {error instanceof Error ? error.message : "Could not load dashboard metrics."}
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                        Retry
                    </Button>
                </div>
            ) : data ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                        {
                            label: "Pipeline value",
                            value: formatCurrency(data.kpis.pipeline_value),
                            hint: "Pending our contracts",
                        },
                        {
                            label: "Expiring (90d)",
                            value: String(data.kpis.expiring_90d_count),
                            hint: "Active, ending soon",
                        },
                        {
                            label: "Our contracts",
                            value: String(data.kpis.active_our_contracts_count),
                            hint: "Active",
                        },
                        {
                            label: "Competitor contracts",
                            value: String(data.kpis.active_competitor_contracts_count),
                            hint: "Active",
                        },
                    ].map((kpi) => (
                        <div key={kpi.label} className="rounded-lg border p-4 space-y-1">
                            <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {kpi.value}
                                {isFetching && !isLoading ? (
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                ) : null}
                            </div>
                            <span className="text-xs text-muted-foreground">{kpi.hint}</span>
                        </div>
                    ))}
                </div>
            ) : null}

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-5 text-primary" />
                    <h3 className="text-base font-semibold">Renewal Radar</h3>
                    <span className="text-xs text-muted-foreground">Next 90 days · Active contracts</span>
                </div>

                {isLoading ? (
                    <div className="overflow-x-auto pb-2">
                        <div className="inline-flex gap-3 min-w-max">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-56 shrink-0 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ) : isError ? (
                    <p className="text-sm text-muted-foreground m-0">Renewal data unavailable.</p>
                ) : data && data.renewal_radar.length === 0 ? (
                    <p className="text-sm text-muted-foreground m-0">
                        No active contracts expiring in the next 90 days.
                    </p>
                ) : data ? (
                    <div className="overflow-x-auto pb-2">
                        <div className="inline-flex gap-3 min-w-max">
                            {data.renewal_radar.map((item) => {
                                const days = daysUntil(item.end_date);
                                const urgent = days != null && days <= 30;
                                return (
                                    <div
                                        key={item.contract_id}
                                        className="w-56 shrink-0 rounded-lg border p-4 space-y-2.5 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <Link
                                                href={`/portfolio/${item.company_id}`}
                                                className="font-medium text-sm truncate text-primary hover:underline"
                                            >
                                                {item.company_name}
                                            </Link>
                                            <span
                                                className={`text-xs font-bold shrink-0 ${urgent ? "text-sophos-red" : "text-muted-foreground"}`}
                                            >
                                                {days != null ? `${days}d` : "—"}
                                            </span>
                                        </div>
                                        <div className="text-lg font-bold">{formatCurrency(item.total_value)}</div>
                                        <div className="flex items-center gap-1.5 text-xs min-w-0">
                                            <Shield
                                                className={`size-3 shrink-0 ${item.contract_type === "our_contract" ? "text-primary" : "text-sophos-red"}`}
                                            />
                                            <span className="text-muted-foreground truncate">
                                                {item.incumbent_label}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t gap-2">
                                            <span className="truncate">
                                                {item.territory_label ?? "—"}
                                            </span>
                                            <RadarTypeBadge type={item.contract_type} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : null}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Zap className="size-5 text-primary" />
                        <h3 className="text-base font-semibold">Win/Loss Heatmap</h3>
                        <span className="text-xs text-muted-foreground">Sample</span>
                    </div>

                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-2.5 text-left font-medium">Region</th>
                                    <th className="px-4 py-2.5 text-center font-medium">W</th>
                                    <th className="px-4 py-2.5 text-center font-medium">L</th>
                                    <th className="px-4 py-2.5 text-center font-medium">Active</th>
                                    <th className="px-4 py-2.5 text-left font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regionHeatmap.map((r) => (
                                    <tr
                                        key={r.region}
                                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-4 py-2.5 font-medium">{r.region}</td>
                                        <td className="px-4 py-2.5 text-center text-sophos-green font-semibold">
                                            {r.wins}
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-sophos-red font-semibold">
                                            {r.losses}
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-muted-foreground">
                                            {r.active}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <HeatmapStatus status={r.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Newspaper className="size-5 text-primary" />
                        <h3 className="text-base font-semibold">Action Stream</h3>
                        <span className="text-xs text-muted-foreground">
                            Engagements (90d lookback) · New accounts (14d, capped)
                        </span>
                    </div>

                    {streamLoading ? (
                        <ActionStreamSkeleton />
                    ) : streamError ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-destructive m-0">
                                {streamErr instanceof Error
                                    ? streamErr.message
                                    : "Could not load action stream."}
                            </p>
                            <Button type="button" variant="outline" size="sm" onClick={() => refetchStream()}>
                                Retry
                            </Button>
                        </div>
                    ) : streamData && streamData.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground m-0 rounded-lg border p-4">
                            No recent CRM activity in this window.
                        </p>
                    ) : streamData ? (
                        <div className="rounded-lg border divide-y max-h-[340px] overflow-y-auto">
                            {streamData.items.map((streamItem) => {
                                const body = (
                                    <>
                                        <div className="mt-0.5">
                                            <ActionIcon type={streamItem.stream_type} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm leading-snug m-0">{streamItem.message}</p>
                                            <span className="text-xs text-muted-foreground">
                                                {formatRelativeTime(streamItem.occurred_at)}
                                            </span>
                                        </div>
                                    </>
                                );
                                if (streamItem.company_id) {
                                    return (
                                        <Link
                                            key={streamItem.id}
                                            href={`/portfolio/${streamItem.company_id}`}
                                            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                                        >
                                            {body}
                                        </Link>
                                    );
                                }
                                return (
                                    <div
                                        key={streamItem.id}
                                        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors"
                                    >
                                        {body}
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </section>
            </div>
        </div>
    );
}
