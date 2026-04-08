"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    CalendarClock,
    CheckCircle2,
    Clock,
    DollarSign,
    FileSignature,
    FileStack,
    Hourglass,
    LayoutGrid,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
    XCircle,
} from "lucide-react";

import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MetricStatCard } from "@/components/metric-stat-card";
import { useCompanies } from "@/hooks/use-companies";
import { useContracts, useDeleteContract } from "@/hooks/use-contracts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Contract, ContractStatus, ContractType } from "@/lib/types";

import { ContractFormDialog } from "./contract-form-dialog";
import { ContractsTableSkeleton } from "./contracts-table-skeleton";

function StatusBadge({ status }: { status: ContractStatus }) {
    const config: Record<
        ContractStatus,
        { label: string; icon: typeof CheckCircle2; className: string }
    > = {
        active: {
            label: "Active",
            icon: CheckCircle2,
            className:
                "border border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-400",
        },
        pending: {
            label: "Pending",
            icon: Hourglass,
            className:
                "border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        },
        renewed: {
            label: "Renewed",
            icon: RotateCcw,
            className:
                "border border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
        },
        expired: {
            label: "Expired",
            icon: XCircle,
            className:
                "border border-destructive/25 bg-destructive/10 text-destructive",
        },
    };
    const { label, icon: Icon, className } = config[status];
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
        >
            <Icon className="size-3" />
            {label}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    const isOurs = type === "our_contract";
    return (
        <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                isOurs
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "text-muted-foreground border-border bg-muted/40"
            }`}
        >
            {isOurs ? "Ours" : "Competitor"}
        </span>
    );
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCurrency(value: number | null) {
    if (value == null) return "—";
    return `$${Number(value).toLocaleString()}`;
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function huntPipelineHref(
    companyId: string,
    engagementId: string | null | undefined,
) {
    const sp = new URLSearchParams();
    sp.set("company_id", companyId);
    if (engagementId) sp.set("engagement_id", engagementId);
    return `/hunt?${sp.toString()}`;
}

const STATUS_FILTER_OPTIONS: { value: "all" | ContractStatus; label: string }[] =
    [
        { value: "all", label: "All statuses" },
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "renewed", label: "Renewed" },
        { value: "expired", label: "Expired" },
    ];

const TYPE_FILTER_OPTIONS: { value: "all" | ContractType; label: string }[] = [
    { value: "all", label: "All types" },
    { value: "our_contract", label: "Our contract" },
    { value: "competitor_contract", label: "Competitor" },
];

export function ContractsTable() {
    const { data: contracts = [], isLoading } = useContracts({ take: 500 });
    const companiesQuery = useCompanies({ page: 0, pageSize: 200 });
    const companies = companiesQuery.data?.items ?? [];
    const deleteMutation = useDeleteContract();

    const [searchInput, setSearchInput] = useState("");
    const debouncedQ = useDebouncedValue(searchInput, 300);
    const [statusFilter, setStatusFilter] = useState<"all" | ContractStatus>(
        "all",
    );
    const [typeFilter, setTypeFilter] = useState<"all" | ContractType>("all");

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Contract | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);

    function openCreate() {
        setEditTarget(null);
        setFormOpen(true);
    }

    function openEdit(contract: Contract) {
        setEditTarget(contract);
        setFormOpen(true);
    }

    function handleDelete() {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const activeContracts = useMemo(
        () => contracts.filter((c) => c.status === "active"),
        [contracts],
    );
    const activeValue = useMemo(
        () =>
            activeContracts.reduce(
                (sum, c) => sum + (Number(c.total_value) || 0),
                0,
            ),
        [activeContracts],
    );
    const expiringCount = useMemo(
        () =>
            activeContracts.filter(
                (c) =>
                    c.end_date &&
                    daysUntil(c.end_date) <= 90 &&
                    daysUntil(c.end_date) > 0,
            ).length,
        [activeContracts],
    );
    const pendingCount = useMemo(
        () => contracts.filter((c) => c.status === "pending").length,
        [contracts],
    );
    const expiringShare =
        activeContracts.length > 0
            ? Math.round((expiringCount / activeContracts.length) * 100)
            : 0;

    const filtered = useMemo(() => {
        const q = debouncedQ.trim().toLowerCase();
        return contracts.filter((c) => {
            if (statusFilter !== "all" && c.status !== statusFilter) {
                return false;
            }
            if (typeFilter !== "all" && c.type !== typeFilter) {
                return false;
            }
            if (q && !c.company_name.toLowerCase().includes(q)) {
                return false;
            }
            return true;
        });
    }, [contracts, statusFilter, typeFilter, debouncedQ]);

    const hasActiveFilters =
        debouncedQ.trim().length > 0 ||
        statusFilter !== "all" ||
        typeFilter !== "all";

    function clearFilters() {
        setSearchInput("");
        setStatusFilter("all");
        setTypeFilter("all");
    }

    if (isLoading) {
        return <ContractsTableSkeleton />;
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricStatCard
                    label="Expiring ≤90 days"
                    value={expiringCount}
                    hint={`${activeContracts.length} active in vault`}
                    progress={expiringShare}
                    accent="destructive"
                    decorativeIcon={CalendarClock}
                />
                <MetricStatCard
                    label="Active value"
                    value={formatCurrency(activeValue)}
                    hint="Sum of active total_value"
                    accent="primary"
                    decorativeIcon={DollarSign}
                />
                <MetricStatCard
                    label="Pending"
                    value={pendingCount}
                    hint="Awaiting execution / signature"
                    accent="chart2"
                    decorativeIcon={Hourglass}
                />
                <MetricStatCard
                    label="Records loaded"
                    value={contracts.length}
                    hint="API take 500 — not full DB total"
                    accent="none"
                    decorativeIcon={FileStack}
                />
            </div>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <FileSignature className="text-primary size-5" />
                        <h2 className="text-base font-semibold tracking-tight">
                            Contract register
                        </h2>
                        <span className="text-muted-foreground text-xs">
                            ({filtered.length}
                            {filtered.length !== contracts.length
                                ? ` of ${contracts.length}`
                                : ""}
                            )
                        </span>
                    </div>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-1 size-4" />
                        New contract
                    </Button>
                </div>

                {contracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                        <p className="text-muted-foreground mb-4">
                            No contracts yet.
                        </p>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Create first contract
                        </Button>
                    </div>
                ) : (
                    <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
                        <div className="border-border/50 bg-muted/30 border-b px-4 py-4">
                            <p className="text-muted-foreground mb-3 text-[10px] font-bold tracking-widest uppercase">
                                Search &amp; filters
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                                <div className="relative min-w-[min(100%,12rem)] max-w-md flex-1">
                                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                                    <Input
                                        className="h-9 pl-9 pr-8"
                                        placeholder="Filter by company name…"
                                        value={searchInput}
                                        onChange={(e) =>
                                            setSearchInput(e.target.value)
                                        }
                                        aria-label="Search contracts by company"
                                    />
                                    {searchInput ? (
                                        <button
                                            type="button"
                                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 rounded-sm p-1"
                                            onClick={() => setSearchInput("")}
                                            aria-label="Clear search"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    ) : null}
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(v) =>
                                        setStatusFilter(
                                            v as "all" | ContractStatus,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        size="sm"
                                        className="w-full min-w-40 sm:w-44"
                                        aria-label="Filter by status"
                                    >
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_FILTER_OPTIONS.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(v) =>
                                        setTypeFilter(v as "all" | ContractType)
                                    }
                                >
                                    <SelectTrigger
                                        size="sm"
                                        className="w-full min-w-40 sm:w-48"
                                        aria-label="Filter by contract type"
                                    >
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPE_FILTER_OPTIONS.map((o) => (
                                            <SelectItem
                                                key={o.value}
                                                value={o.value}
                                            >
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {hasActiveFilters ? (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground h-9"
                                        onClick={clearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                ) : null}
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-muted-foreground px-4 py-12 text-center text-sm">
                                No contracts match these filters.{" "}
                                <button
                                    type="button"
                                    className="text-primary font-medium underline-offset-4 hover:underline"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/50 border-border/60 border-b">
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Company
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Type
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Value
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Start
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                End
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Status
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                                                Renewal
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Pipeline
                                            </th>
                                            <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((c) => {
                                            const days = c.end_date
                                                ? daysUntil(c.end_date)
                                                : null;
                                            const isExpiring =
                                                c.status === "active" &&
                                                days !== null &&
                                                days > 0 &&
                                                days <= 90;
                                            return (
                                                <tr
                                                    key={c.id}
                                                    className="hover:bg-muted/30 border-border/40 border-b transition-colors last:border-b-0"
                                                >
                                                    <td className="px-6 py-3">
                                                        <Link
                                                            href={`/portfolio/${c.company_id}?from=vault`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {c.company_name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <TypeBadge
                                                            type={c.type}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 font-medium tabular-nums">
                                                        {formatCurrency(
                                                            c.total_value,
                                                        )}
                                                    </td>
                                                    <td className="text-muted-foreground px-6 py-3">
                                                        {formatDate(
                                                            c.start_date,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span
                                                            className={
                                                                isExpiring
                                                                    ? "text-sophos-orange font-semibold"
                                                                    : c.status ===
                                                                        "expired"
                                                                      ? "text-sophos-red"
                                                                      : ""
                                                            }
                                                        >
                                                            {c.end_date ? (
                                                                <Clock className="mr-1 inline size-3.5 align-text-bottom" />
                                                            ) : null}
                                                            {formatDate(
                                                                c.end_date,
                                                            )}
                                                            {days !== null &&
                                                            c.status !==
                                                                "expired" ? (
                                                                <span className="ml-1 text-xs">
                                                                    ({days}d)
                                                                </span>
                                                            ) : null}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <StatusBadge
                                                            status={c.status}
                                                        />
                                                    </td>
                                                    <td className="text-muted-foreground px-6 py-3 text-center text-xs">
                                                        {c.renewal_notice_days !=
                                                        null
                                                            ? `${c.renewal_notice_days}d`
                                                            : "—"}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <Link
                                                            href={huntPipelineHref(
                                                                c.company_id,
                                                                c.engagement_id,
                                                            )}
                                                            className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                                                            title={
                                                                c.engagement_id
                                                                    ? "Open linked deal on Hunt"
                                                                    : "Open company pipeline on Hunt"
                                                            }
                                                        >
                                                            <LayoutGrid className="size-3.5" />
                                                            {c.engagement_id
                                                                ? "Open deal"
                                                                : "Pipeline"}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7"
                                                                onClick={() =>
                                                                    openEdit(c)
                                                                }
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive size-7"
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        c,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </section>

            <ContractFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                contract={editTarget}
                companies={companies}
                companiesLoading={companiesQuery.isLoading}
                companiesError={
                    companiesQuery.isError ? companiesQuery.error : null
                }
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                entityName={
                    deleteTarget
                        ? `contract with ${deleteTarget.company_name}`
                        : ""
                }
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
                error={
                    deleteMutation.isError
                        ? deleteMutation.error.message
                        : null
                }
            />
        </>
    );
}
