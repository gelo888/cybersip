"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Building2, ChevronRight, Radar, Shield } from "lucide-react";

import { ChartPanel } from "@/components/chart-panel";
import { MetricStatCard } from "@/components/metric-stat-card";
import { useChartColors } from "@/hooks/use-chart-colors";
import { useContacts } from "@/hooks/use-contacts";
import { useIntel } from "@/hooks/use-intel";
import { get } from "@/lib/api";
import {
    rechartsTooltipContentStyle,
    rechartsTooltipItemStyle,
    rechartsTooltipLabelStyle,
} from "@/lib/recharts-tooltip-styles";
import type { Company, CompanyStatus, PaginatedResponse } from "@/lib/types";

const LIST_FILTERS = {
    companySize: null as string | null,
    industryId: null as string | null,
    q: null as string | null,
};

const STATUSES: CompanyStatus[] = [
    "prospect",
    "active_client",
    "previous_client",
    "lost",
    "disqualified",
];

const STATUS_LABELS: Record<CompanyStatus, string> = {
    prospect: "Prospects",
    active_client: "Active",
    previous_client: "Previous",
    lost: "Lost",
    disqualified: "Disqualified",
};

function companiesListUrl(take: number, status?: CompanyStatus) {
    const params = new URLSearchParams();
    params.set("skip", "0");
    params.set("take", String(take));
    if (status) params.set("status", status);
    return `/api/companies/?${params}`;
}

export function PortfolioOverview() {
    const colors = useChartColors();

    const listQueries = useQueries({
        queries: [
            {
                queryKey: [
                    "companies",
                    "list",
                    {
                        skip: 0,
                        take: 1,
                        status: null,
                        companySize: LIST_FILTERS.companySize,
                        industryId: LIST_FILTERS.industryId,
                        q: LIST_FILTERS.q,
                    },
                ],
                queryFn: () =>
                    get<PaginatedResponse<Company>>(companiesListUrl(1)),
                staleTime: 30_000,
            },
            ...STATUSES.map((status) => ({
                queryKey: [
                    "companies",
                    "list",
                    {
                        skip: 0,
                        take: 1,
                        status,
                        companySize: LIST_FILTERS.companySize,
                        industryId: LIST_FILTERS.industryId,
                        q: LIST_FILTERS.q,
                    },
                ],
                queryFn: () =>
                    get<PaginatedResponse<Company>>(companiesListUrl(1, status)),
                staleTime: 30_000,
            })),
        ],
    });

    const contactsTotal = useContacts({ page: 0, pageSize: 1 });
    const intelList = useIntel({ take: 24 });

    const totalAccounts = listQueries[0]?.data?.total ?? 0;
    const prospectTotal =
        listQueries[1 + STATUSES.indexOf("prospect")]?.data?.total ?? 0;
    const activeClientTotal =
        listQueries[1 + STATUSES.indexOf("active_client")]?.data?.total ?? 0;

    const overviewLoading = listQueries.some((q) => q.isLoading);

    const chartData = STATUSES.map((s, i) => ({
        name: STATUS_LABELS[s],
        key: s,
        count: listQueries[1 + i]?.data?.total ?? 0,
    }));

    const chartLoading = listQueries.slice(1).some((q) => q.isLoading);
    const chartEmpty =
        !chartLoading && chartData.every((d) => d.count === 0);

    const intelPreview = (intelList.data ?? []).slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <nav className="text-primary/70 mb-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <span>Intelligence</span>
                        <ChevronRight className="size-3 opacity-60" aria-hidden />
                        <span className="text-primary">Portfolio recon</span>
                    </nav>
                    <h2 className="font-(family-name:--font-lexend) text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                        Portfolio directory
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
                        Accounts, contacts, and mix — drill into Company 360 from the
                        companies table below.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricStatCard
                    label="Total accounts"
                    value={overviewLoading ? "—" : totalAccounts}
                    hint="All CRM statuses"
                    accent="primary"
                    decorativeIcon={Building2}
                />
                <MetricStatCard
                    label="Active clients"
                    value={overviewLoading ? "—" : activeClientTotal}
                    hint="Status = active client"
                    accent="chart2"
                />
                <MetricStatCard
                    label="Key contacts"
                    value={
                        contactsTotal.isLoading
                            ? "—"
                            : (contactsTotal.data?.total ?? 0)
                    }
                    hint="Total in directory"
                    accent="accent"
                    decorativeIcon={Radar}
                />
                <MetricStatCard
                    label="Prospects"
                    value={overviewLoading ? "—" : prospectTotal}
                    hint="Pipeline funnel"
                    accent="none"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChartPanel
                        title="Account mix by status"
                        description="Counts from the live company index (one query per status)."
                        accent
                        isLoading={chartLoading}
                        isEmpty={chartEmpty}
                        emptyMessage="No companies yet — add accounts to see the mix."
                    >
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                            >
                                <CartesianGrid
                                    stroke="var(--border)"
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    width={36}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--muted-foreground)",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{
                                        fill: "var(--muted)",
                                        opacity: 0.2,
                                    }}
                                    contentStyle={rechartsTooltipContentStyle}
                                    labelStyle={rechartsTooltipLabelStyle}
                                    itemStyle={rechartsTooltipItemStyle}
                                />
                                <Bar
                                    dataKey="count"
                                    name="Companies"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={48}
                                >
                                    {chartData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={
                                                colors[i % colors.length] ??
                                                "var(--chart-1)"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>

                <div className="bg-card text-card-foreground overflow-hidden rounded-lg shadow-sm ring-1 ring-border/40">
                    <div className="bg-primary h-0.5 w-full shrink-0" aria-hidden />
                    <div className="border-border/50 bg-muted/45 flex items-center gap-2 border-b px-4 py-3 dark:bg-muted/25">
                        <Shield className="text-primary size-4" />
                        <div>
                            <h3 className="font-(family-name:--font-lexend) text-sm font-semibold tracking-tight">
                                Recent intel
                            </h3>
                            <p className="text-muted-foreground m-0 text-xs">
                                Latest competitive presence logs
                            </p>
                        </div>
                    </div>
                    <div className="p-4">
                        {intelList.isLoading ? (
                            <p className="text-muted-foreground text-sm">Loading…</p>
                        ) : intelPreview.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                No intel logged yet. Open Intelligence Hub to add records.
                            </p>
                        ) : (
                            <ul className="space-y-4">
                                {intelPreview.map((row) => (
                                    <li key={row.id} className="flex gap-3">
                                        <span
                                            className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"
                                            aria-hidden
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs leading-snug font-medium">
                                                {row.company_name}
                                                <span className="text-muted-foreground font-normal">
                                                    {" "}
                                                    · {row.competitor_name}
                                                </span>
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-[10px] uppercase tracking-wide">
                                                {row.confidence} confidence
                                                {row.product_name
                                                    ? ` · ${row.product_name}`
                                                    : ""}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link
                            href="/intelligence"
                            className="text-muted-foreground hover:text-foreground mt-4 block w-full rounded-md bg-muted/50 py-2 text-center text-[10px] font-bold tracking-widest uppercase transition-colors"
                        >
                            View intelligence feed
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
