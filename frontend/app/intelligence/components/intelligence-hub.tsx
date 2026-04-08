"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    ChevronRight,
    Clock,
    ExternalLink,
    Info,
    ListFilter,
    Newspaper,
    Pencil,
    Plus,
    Radar,
    Shield,
    Trash2,
} from "lucide-react";

import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartPanel } from "@/components/chart-panel";
import { MetricStatCard } from "@/components/metric-stat-card";
import { useCompanies } from "@/hooks/use-companies";
import { useCompetitors, useDeleteCompetitor } from "@/hooks/use-competitors";
import { useIntel, useDeleteIntel } from "@/hooks/use-intel";
import type { Competitor, CompetitorIntel } from "@/lib/types";

import { CompetitorFormDialog } from "./competitor-form-dialog";
import { IntelConfidenceChart } from "./intel-confidence-chart";
import { IntelFormDialog } from "./intel-form-dialog";

const MOCK_MARKET_SIGNALS = [
    {
        id: "ms-1",
        severity: "critical" as const,
        title: "CrowdStrike announces 18% price increase effective Q3 2026",
        source: "CyberWire",
        date: "2026-02-25",
        competitor: "CrowdStrike",
        accountsImpacted: 48,
    },
    {
        id: "ms-2",
        severity: "critical" as const,
        title: "Palo Alto Networks reports critical vulnerability in PAN-OS (CVE-2026-1847)",
        source: "NIST NVD",
        date: "2026-03-24",
        competitor: "Palo Alto",
        accountsImpacted: 41,
    },
    {
        id: "ms-3",
        severity: "high" as const,
        title: "SentinelOne loses FedRAMP authorization for Singularity XDR",
        source: "FedScoop",
        date: "2026-02-22",
        competitor: "SentinelOne",
        accountsImpacted: 19,
    },
    {
        id: "ms-4",
        severity: "medium" as const,
        title: "Fortinet acquires cloud-native SIEM startup Observa.ai for $280M",
        source: "TechCrunch",
        date: "2026-03-03",
        competitor: "Fortinet",
        accountsImpacted: 33,
    },
    {
        id: "ms-5",
        severity: "info" as const,
        title: "Gartner releases 2026 Magic Quadrant for Endpoint Protection — market shifts noted",
        source: "Gartner",
        date: "2026-02-18",
        competitor: null,
        accountsImpacted: null,
    },
    {
        id: "ms-6",
        severity: "high" as const,
        title: "Cisco discontinues legacy AMP product line, forces migration to SecureX",
        source: "Cisco Blog",
        date: "2026-02-15",
        competitor: "Cisco",
        accountsImpacted: 18,
    },
];

function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" | "info" }) {
    const config = {
        critical: {
            label: "Critical",
            className:
                "border border-destructive/25 bg-destructive/15 text-destructive dark:bg-destructive/20",
        },
        high: {
            label: "High",
            className:
                "border border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-400",
        },
        medium: {
            label: "Medium",
            className:
                "border border-amber-500/30 bg-amber-500/15 text-amber-800 dark:text-amber-300",
        },
        info: {
            label: "Info",
            className: "border border-border bg-muted/60 text-muted-foreground",
        },
    };
    const { label, className } = config[severity];
    return (
        <span
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`}
        >
            {label}
        </span>
    );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
    const config: Record<string, { label: string; className: string }> = {
        confirmed: {
            label: "Confirmed",
            className: "border border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-400",
        },
        rumor: {
            label: "Rumor",
            className: "border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        },
        inferred: {
            label: "Inferred",
            className: "border border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        },
    };
    const { label, className } = config[confidence] ?? {
        label: confidence,
        className: "bg-muted text-muted-foreground border border-border",
    };
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function tableShell(children: ReactNode) {
    return (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm ring-1 ring-border/40">
            <div className="overflow-x-auto">{children}</div>
        </div>
    );
}

export function IntelligenceHub() {
    const { data: competitors = [], isLoading: loadingComp } = useCompetitors();
    const { data: intelRecords = [], isLoading: loadingIntel } = useIntel();
    const { data: companiesData } = useCompanies({ page: 0, pageSize: 500 });
    const companies = companiesData?.items ?? [];
    const deleteCompetitor = useDeleteCompetitor();
    const deleteIntel = useDeleteIntel();

    const [compFormOpen, setCompFormOpen] = useState(false);
    const [editingComp, setEditingComp] = useState<Competitor | null>(null);
    const [deletingComp, setDeletingComp] = useState<Competitor | null>(null);

    const [intelFormOpen, setIntelFormOpen] = useState(false);
    const [editingIntel, setEditingIntel] = useState<CompetitorIntel | null>(null);
    const [deletingIntel, setDeletingIntel] = useState<CompetitorIntel | null>(null);

    const isLoading = loadingComp || loadingIntel;

    const { intelByCompetitor, expiringByCompetitor } = useMemo(() => {
        const m = new Map<string, number>();
        const exp = new Map<string, number>();
        for (const r of intelRecords) {
            m.set(r.competitor_id, (m.get(r.competitor_id) ?? 0) + 1);
            if (r.contract_end) {
                const days = daysUntil(r.contract_end);
                if (days > 0 && days <= 180) {
                    exp.set(r.competitor_id, (exp.get(r.competitor_id) ?? 0) + 1);
                }
            }
        }
        return { intelByCompetitor: m, expiringByCompetitor: exp };
    }, [intelRecords]);

    const confirmedPct = useMemo(() => {
        if (intelRecords.length === 0) return 0;
        const n = intelRecords.filter((r) => r.confidence === "confirmed").length;
        return Math.round((n / intelRecords.length) * 100);
    }, [intelRecords]);

    if (isLoading) {
        return (
            <div className="space-y-8 p-6">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-lg" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-9">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-56 rounded-xl" />
                    </div>
                    <div className="space-y-6 lg:col-span-3">
                        <Skeleton className="h-72 rounded-lg" />
                        <Skeleton className="h-96 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Hero */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <nav className="text-primary/70 mb-2 flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <Link href="/" className="hover:text-primary">
                            Command center
                        </Link>
                        <ChevronRight className="size-3 opacity-60" aria-hidden />
                        <span className="text-primary">Intelligence</span>
                    </nav>
                    <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Global market surveillance
                    </p>
                    <h2 className="font-(family-name:--font-lexend) text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Active signal grid
                    </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" disabled className="gap-1.5">
                        <ListFilter className="size-3.5" />
                        Filter
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                            setEditingComp(null);
                            setCompFormOpen(true);
                        }}
                    >
                        <Plus className="size-3.5" />
                        Track competitor
                    </Button>
                </div>
            </div>

            {/* KPI strip */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricStatCard
                    label="Tracked competitors"
                    value={competitors.length}
                    hint="Battle cards & intel targets"
                    accent="primary"
                    decorativeIcon={Radar}
                />
                <MetricStatCard
                    label="Intel records"
                    value={intelRecords.length}
                    hint="Account-level presence"
                    accent="chart2"
                    decorativeIcon={Shield}
                />
                <MetricStatCard
                    label="Confirmed share"
                    value={`${confirmedPct}%`}
                    hint="Of logged intel"
                    progress={confirmedPct}
                    accent="accent"
                />
                <MetricStatCard
                    label="Sample signals"
                    value={MOCK_MARKET_SIGNALS.length}
                    hint="Static preview feed"
                    accent="none"
                    decorativeIcon={Newspaper}
                />
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-9">
                    {/* Competitor Tracker */}
                    <section className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Radar className="text-primary size-5" />
                                    <h3 className="text-base font-semibold tracking-tight">
                                        Competitor tracker
                                    </h3>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    {competitors.length} tracked · strengths, weaknesses, and intel density
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setEditingComp(null);
                                    setCompFormOpen(true);
                                }}
                            >
                                <Plus className="mr-1 size-4" />
                                Add competitor
                            </Button>
                        </div>

                        {competitors.length === 0 ? (
                            <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                                No competitors tracked yet. Add your first competitor to start building
                                intelligence.
                            </div>
                        ) : (
                            tableShell(
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border/60">
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Competitor
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                                                Intel
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                                                Expiring ≤6mo
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Strengths
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Weaknesses
                                            </th>
                                            <th className="text-muted-foreground w-24 px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {competitors.map((c) => (
                                            <tr
                                                key={c.id}
                                                className="hover:bg-muted/30 border-b border-border/40 transition-colors last:border-b-0"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Shield className="text-destructive size-3.5 shrink-0" />
                                                        <span className="font-medium">{c.name}</span>
                                                        {c.website ? (
                                                            <a
                                                                href={c.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-muted-foreground hover:text-primary"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <ExternalLink className="size-3" />
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium tabular-nums">
                                                    {intelByCompetitor.get(c.id) ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-center tabular-nums">
                                                    <span
                                                        className={
                                                            (expiringByCompetitor.get(c.id) ?? 0) > 0
                                                                ? "text-amber-600 font-semibold dark:text-amber-400"
                                                                : "text-muted-foreground"
                                                        }
                                                    >
                                                        {expiringByCompetitor.get(c.id) ?? 0}
                                                    </span>
                                                </td>
                                                <td className="max-w-xs px-6 py-4">
                                                    {c.strengths.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {c.strengths.map((s, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex rounded-md bg-green-500/10 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400"
                                                                >
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="max-w-xs px-6 py-4">
                                                    {c.weaknesses.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {c.weaknesses.map((w, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex rounded-md bg-red-500/10 px-1.5 py-0.5 text-xs text-red-700 dark:text-red-400"
                                                                >
                                                                    {w}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7"
                                                            onClick={() => {
                                                                setEditingComp(c);
                                                                setCompFormOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive size-7"
                                                            onClick={() => setDeletingComp(c)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>,
                            )
                        )}
                    </section>

                    {/* Intel Feed */}
                    <section className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Shield className="text-primary size-5" />
                                    <h3 className="text-base font-semibold tracking-tight">Intel feed</h3>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    {intelRecords.length} records · contracts and confidence
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setEditingIntel(null);
                                    setIntelFormOpen(true);
                                }}
                                disabled={competitors.length === 0}
                            >
                                <Plus className="mr-1 size-4" />
                                Log intel
                            </Button>
                        </div>

                        {intelRecords.length === 0 ? (
                            <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                                No intel logged yet. Start tracking competitor presence at your accounts.
                            </div>
                        ) : (
                            tableShell(
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border/60">
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Company
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Competitor
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Product
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Contract ends
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                                                Confidence
                                            </th>
                                            <th className="text-muted-foreground w-24 px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {intelRecords.map((r) => {
                                            const days = r.contract_end ? daysUntil(r.contract_end) : null;
                                            return (
                                                <tr
                                                    key={r.id}
                                                    className="hover:bg-muted/30 border-b border-border/40 transition-colors last:border-b-0"
                                                >
                                                    <td className="px-6 py-4">
                                                        <Link
                                                            href={`/portfolio/${r.company_id}?from=intelligence`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {r.company_name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Shield className="text-destructive size-3" />
                                                            {r.competitor_name}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted-foreground px-6 py-4">
                                                        {r.product_name || "—"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {days !== null ? (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Clock className="size-3" />
                                                                <span
                                                                    className={
                                                                        days <= 0
                                                                            ? "text-destructive font-semibold"
                                                                            : days <= 90
                                                                              ? "text-amber-600 font-semibold dark:text-amber-400"
                                                                              : "text-muted-foreground"
                                                                    }
                                                                >
                                                                    {days <= 0 ? "Expired" : `${days}d`}
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <ConfidenceBadge confidence={r.confidence} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7"
                                                                onClick={() => {
                                                                    setEditingIntel(r);
                                                                    setIntelFormOpen(true);
                                                                }}
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive size-7"
                                                                onClick={() => setDeletingIntel(r)}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>,
                            )
                        )}
                    </section>
                </div>

                {/* Right rail: live chart + sample market signals (full list) */}
                <div className="space-y-6 lg:col-span-3">
                    <IntelConfidenceChart records={intelRecords} isLoading={false} />

                    <ChartPanel
                        title="Market signals"
                        description="Static preview — automated feeds are on the N8N roadmap."
                        accent
                        isEmpty={false}
                    >
                        <div className="space-y-3">
                            <div className="border-amber-500/25 bg-amber-500/5 text-amber-900 dark:text-amber-200 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
                                <Info className="mt-0.5 size-3.5 shrink-0 opacity-80" />
                                <span>
                                    <strong>Static preview.</strong> Market signals will be powered by automated
                                    N8N workflows — scraping CyberWire, NIST NVD, and vendor blogs for real-time
                                    competitive intelligence.
                                </span>
                            </div>
                            <div className="max-h-[min(520px,60vh)] space-y-2 overflow-y-auto pr-1">
                                {MOCK_MARKET_SIGNALS.map((signal) => (
                                    <div
                                        key={signal.id}
                                        className="bg-muted/20 hover:bg-muted/35 flex items-start gap-3 rounded-lg border border-border/60 px-3 py-3 transition-colors"
                                    >
                                        <div className="pt-0.5">
                                            <SeverityBadge severity={signal.severity} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm leading-snug font-medium">{signal.title}</p>
                                            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                <span>{signal.source}</span>
                                                <span>{signal.date}</span>
                                                {signal.competitor ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Shield className="text-destructive size-3" />
                                                        {signal.competitor}
                                                    </span>
                                                ) : null}
                                                {signal.accountsImpacted != null ? (
                                                    <span>{signal.accountsImpacted} accounts impacted</span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-primary shrink-0 pt-0.5 transition-colors"
                                            aria-label="Open signal (preview)"
                                        >
                                            <ExternalLink className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ChartPanel>
                </div>
            </div>

            <CompetitorFormDialog
                open={compFormOpen}
                onOpenChange={setCompFormOpen}
                competitor={editingComp}
            />

            <IntelFormDialog
                open={intelFormOpen}
                onOpenChange={setIntelFormOpen}
                intel={editingIntel}
                companies={companies}
                competitors={competitors}
            />

            <DeleteConfirmDialog
                open={!!deletingComp}
                onOpenChange={(open) => {
                    if (!open) setDeletingComp(null);
                }}
                entityName={deletingComp?.name ?? "competitor"}
                isPending={deleteCompetitor.isPending}
                onConfirm={() => {
                    if (deletingComp) {
                        deleteCompetitor.mutate(deletingComp.id, {
                            onSuccess: () => setDeletingComp(null),
                        });
                    }
                }}
            />

            <DeleteConfirmDialog
                open={!!deletingIntel}
                onOpenChange={(open) => {
                    if (!open) setDeletingIntel(null);
                }}
                entityName={
                    deletingIntel
                        ? `${deletingIntel.competitor_name} intel at ${deletingIntel.company_name}`
                        : "intel"
                }
                isPending={deleteIntel.isPending}
                onConfirm={() => {
                    if (deletingIntel) {
                        deleteIntel.mutate(deletingIntel.id, {
                            onSuccess: () => setDeletingIntel(null),
                        });
                    }
                }}
            />
        </div>
    );
}
