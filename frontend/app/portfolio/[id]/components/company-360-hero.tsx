"use client";

import { Building2, Globe, TrendingUp, Users } from "lucide-react";

import { MetricStatCard } from "@/components/metric-stat-card";
import { cn } from "@/lib/utils";
import type { Company, CompanySize, CompanyStatus } from "@/lib/types";

function StatusBadge({ status }: { status: CompanyStatus }) {
    const config: Record<CompanyStatus, { label: string; className: string }> = {
        prospect: {
            label: "Prospect",
            className:
                "border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        },
        active_client: {
            label: "Active client",
            className:
                "border border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-400",
        },
        previous_client: {
            label: "Previous client",
            className: "border border-border bg-muted/60 text-muted-foreground",
        },
        lost: {
            label: "Lost",
            className:
                "border border-destructive/25 bg-destructive/10 text-destructive",
        },
        disqualified: {
            label: "Disqualified",
            className:
                "border border-destructive/20 bg-destructive/10 text-destructive",
        },
    };
    const { label, className } = config[status];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                className,
            )}
        >
            {label}
        </span>
    );
}

function SizeBadge({ size }: { size: CompanySize }) {
    const labels: Record<CompanySize, string> = {
        SMB: "SMB",
        Mid_Market: "Mid-market",
        Enterprise: "Enterprise",
        Government: "Government",
    };
    return (
        <span className="border-border bg-primary/10 text-primary inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
            {labels[size]}
        </span>
    );
}

function websiteHref(raw: string | null | undefined): string | null {
    const w = raw?.trim();
    if (!w) return null;
    if (w.startsWith("http://") || w.startsWith("https://")) return w;
    return `https://${w}`;
}

export function Company360Hero({
    company,
    className,
}: {
    company: Company;
    className?: string;
}) {
    const c = company;
    const href = websiteHref(c.website);
    const displaySite = c.website?.replace(/^https?:\/\//, "").trim() ?? "";

    return (
        <div
            className={cn(
                "bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40",
                className,
            )}
        >
            <div className="bg-primary h-0.5 w-full shrink-0" aria-hidden />
            <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                        <div className="bg-muted/50 border-border/50 flex size-16 shrink-0 items-center justify-center rounded-xl border">
                            <Building2 className="text-primary size-8" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-(family-name:--font-lexend) text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                                {c.current_name}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={c.status} />
                                {c.company_size ? (
                                    <SizeBadge size={c.company_size} />
                                ) : null}
                            </div>
                            {(c.industries ?? []).length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(c.industries ?? []).map((ind) => (
                                        <span
                                            key={ind.industry_id}
                                            className={cn(
                                                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                                                ind.is_primary
                                                    ? "border-primary/40 bg-primary/10 text-foreground"
                                                    : "text-muted-foreground border-border",
                                            )}
                                            title={
                                                ind.sector
                                                    ? `${ind.sector} — ${ind.name}`
                                                    : ind.name
                                            }
                                        >
                                            {ind.name}
                                            {ind.is_primary ? (
                                                <span className="ml-1 text-[10px] opacity-80">
                                                    primary
                                                </span>
                                            ) : null}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    {href ? (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex shrink-0 items-center gap-1.5 text-sm hover:underline"
                        >
                            <Globe className="size-3.5" />
                            {displaySite || "Website"}
                        </a>
                    ) : null}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricStatCard
                        label="Employees"
                        value={
                            c.employee_count != null
                                ? c.employee_count.toLocaleString()
                                : "—"
                        }
                        accent="primary"
                        decorativeIcon={Users}
                    />
                    <MetricStatCard
                        label="Revenue range"
                        value={c.revenue_range ?? "—"}
                        hint="From CRM profile"
                        accent="chart2"
                        decorativeIcon={TrendingUp}
                    />
                    <MetricStatCard
                        label="Country"
                        value={c.country ?? "—"}
                        accent="accent"
                    />
                    <MetricStatCard
                        label="Stock ticker"
                        value={c.stock_ticker ?? "—"}
                        accent="none"
                    />
                </div>
            </div>
        </div>
    );
}
