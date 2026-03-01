"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    Globe,
    Users,
    TrendingUp,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/hooks/use-company-detail";
import type { CompanyStatus, CompanySize } from "@/lib/types";
import { CompanyContactsSection } from "./components/contacts-section";
import { CompanyEngagementsSection } from "./components/engagements-section";
import { CompanyContractsSection } from "./components/contracts-section";
import { CompanyIntelSection } from "./components/intel-section";

function StatusBadge({ status }: { status: CompanyStatus }) {
    const config: Record<CompanyStatus, { label: string; className: string }> = {
        prospect: {
            label: "Prospect",
            className: "bg-sophos-sky/10 text-sophos-sky",
        },
        active_client: {
            label: "Active Client",
            className: "bg-sophos-green/10 text-sophos-green",
        },
        previous_client: {
            label: "Previous Client",
            className: "bg-muted text-muted-foreground",
        },
        lost: {
            label: "Lost",
            className: "bg-sophos-red/10 text-sophos-red",
        },
        disqualified: {
            label: "Disqualified",
            className: "bg-sophos-red/10 text-sophos-red",
        },
    };
    const { label, className } = config[status];
    return (
        <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

function SizeBadge({ size }: { size: CompanySize }) {
    const labels: Record<CompanySize, string> = {
        SMB: "SMB",
        Mid_Market: "Mid-Market",
        Enterprise: "Enterprise",
        Government: "Government",
    };
    return (
        <span className="inline-flex items-center rounded-md bg-sophos-violet/10 text-sophos-violet px-2.5 py-1 text-xs font-semibold">
            {labels[size]}
        </span>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-0">{label}</p>
                <p className="text-sm font-medium truncate mb-0">{value}</p>
            </div>
        </div>
    );
}

const BACK_LINKS: Record<string, { href: string; label: string }> = {
    hunt: { href: "/hunt", label: "The Hunt" },
    vault: { href: "/vault", label: "Vault" },
    portfolio: { href: "/portfolio", label: "Portfolio" },
};

export default function CompanyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const from = searchParams.get("from") ?? "";
    const backLink = BACK_LINKS[from] ?? BACK_LINKS.portfolio;
    const company = useCompany(id);

    if (company.isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Loading company...</span>
            </div>
        );
    }

    if (company.isError) {
        return (
            <div className="p-6 space-y-4">
                <Link href={backLink.href}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" />
                        {backLink.label}
                    </Button>
                </Link>
                <div className="flex items-center justify-center py-24 text-sophos-red gap-2">
                    <AlertCircle className="size-5" />
                    <span className="text-sm">{company.error.message}</span>
                </div>
            </div>
        );
    }

    const c = company.data!;

    return (
        <div className="p-6 space-y-6">
            {/* Back navigation */}
            <Link href={backLink.href}>
                <Button variant="ghost" size="sm" className="gap-1 -ml-2">
                    <ArrowLeft className="size-4" />
                    {backLink.label}
                </Button>
            </Link>

            {/* Company header */}
            <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold leading-tight">
                                {c.current_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={c.status} />
                                {c.company_size && (
                                    <SizeBadge size={c.company_size} />
                                )}
                            </div>
                        </div>
                    </div>
                    {c.website && (
                        <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                        >
                            <Globe className="size-3.5" />
                            {c.website.replace(/^https?:\/\//, "")}
                        </a>
                    )}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <InfoCard
                        icon={Users}
                        label="Employees"
                        value={
                            c.employee_count?.toLocaleString() ?? "Unknown"
                        }
                    />
                    <InfoCard
                        icon={TrendingUp}
                        label="Revenue Range"
                        value={c.revenue_range ?? "Unknown"}
                    />
                    <InfoCard
                        icon={Globe}
                        label="Country"
                        value={c.country ?? "Unknown"}
                    />
                    <InfoCard
                        icon={Building2}
                        label="Stock Ticker"
                        value={c.stock_ticker ?? "N/A"}
                    />
                </div>
            </div>

            <Separator />

            {/* Sections */}
            <CompanyContactsSection companyId={id} />
            <CompanyEngagementsSection companyId={id} />
            <CompanyContractsSection companyId={id} />
            <CompanyIntelSection companyId={id} />
        </div>
    );
}
