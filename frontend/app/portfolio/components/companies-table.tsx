"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2,
    Loader2,
    AlertCircle,
    Plus,
    Pencil,
    Trash2,
    Search,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCompanies, useDeleteCompany } from "@/hooks/use-companies";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CompanyFormDialog } from "./company-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { TablePagination, DEFAULT_PAGE_SIZE } from "./table-pagination";
import type { Company, CompanyStatus, CompanySize } from "@/lib/types";

const STATUS_OPTIONS: { value: CompanyStatus; label: string }[] = [
    { value: "prospect", label: "Prospect" },
    { value: "active_client", label: "Active client" },
    { value: "previous_client", label: "Previous client" },
    { value: "lost", label: "Lost" },
    { value: "disqualified", label: "Disqualified" },
];

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
    { value: "SMB", label: "SMB" },
    { value: "Mid_Market", label: "Mid-Market" },
    { value: "Enterprise", label: "Enterprise" },
    { value: "Government", label: "Government" },
];

function StatusBadge({ status }: { status: CompanyStatus }) {
    const config: Record<CompanyStatus, { label: string; className: string }> =
        {
            prospect: {
                label: "Prospect",
                className: "bg-sophos-sky/10 text-sophos-sky",
            },
            active_client: {
                label: "Active",
                className: "bg-sophos-green/10 text-sophos-green",
            },
            previous_client: {
                label: "Previous",
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
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
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
    return <span className="text-muted-foreground">{labels[size]}</span>;
}

export function CompaniesTable() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchInput, setSearchInput] = useState("");
    const debouncedQ = useDebouncedValue(searchInput, 300);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sizeFilter, setSizeFilter] = useState<string>("all");

    const statusParam =
        statusFilter === "all" ? undefined : (statusFilter as CompanyStatus);
    const sizeParam =
        sizeFilter === "all" ? undefined : (sizeFilter as CompanySize);

    const companies = useCompanies({
        page,
        pageSize,
        status: statusParam,
        companySize: sizeParam,
        q: debouncedQ,
    });
    const deleteMutation = useDeleteCompany();

    const hasActiveFilters =
        debouncedQ.trim().length > 0 ||
        statusFilter !== "all" ||
        sizeFilter !== "all";

    useEffect(() => {
        setPage(0);
    }, [debouncedQ, statusFilter, sizeFilter]);

    function clearFilters() {
        setSearchInput("");
        setStatusFilter("all");
        setSizeFilter("all");
        setPage(0);
    }

    const items = companies.data?.items ?? [];
    const total = companies.data?.total ?? 0;

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Company | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

    function openCreate() {
        setEditTarget(null);
        setFormOpen(true);
    }

    function openEdit(company: Company) {
        setEditTarget(company);
        setFormOpen(true);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Companies</h3>
                {companies.data && (
                    <span className="text-xs text-muted-foreground">
                        ({total})
                    </span>
                )}
                <div className="ml-auto">
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="size-4 mr-1" />
                        Add Company
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="relative flex-1 min-w-[min(100%,12rem)] max-w-md">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        className="h-9 pl-9 pr-8"
                        placeholder="Search by company name…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        aria-label="Search companies"
                    />
                    {searchInput ? (
                        <button
                            type="button"
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                            onClick={() => setSearchInput("")}
                            aria-label="Clear search"
                        >
                            <X className="size-3.5" />
                        </button>
                    ) : null}
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                >
                    <SelectTrigger
                        size="sm"
                        className="w-full min-w-[10rem] sm:w-[11rem]"
                        aria-label="Filter by status"
                    >
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={sizeFilter}
                    onValueChange={setSizeFilter}
                >
                    <SelectTrigger
                        size="sm"
                        className="w-full min-w-[10rem] sm:w-[11rem]"
                        aria-label="Filter by company size"
                    >
                        <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All sizes</SelectItem>
                        {SIZE_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
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
                        className="h-9 text-muted-foreground"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </Button>
                ) : null}
            </div>

            {companies.isLoading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading...</span>
                </div>
            )}
            {companies.isError && (
                <div className="flex items-center justify-center py-12 text-sophos-red gap-2">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">{companies.error.message}</span>
                </div>
            )}

            {companies.data && (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-3 text-left font-medium">
                                    Company
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Size
                                </th>
                                <th className="px-4 py-3 text-center font-medium">
                                    Employees
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Country
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Website
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((company) => (
                                <tr
                                    key={company.id}
                                    className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        <Link
                                            href={`/portfolio/${company.id}`}
                                            className="hover:text-primary hover:underline transition-colors"
                                        >
                                            {company.current_name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={company.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        {company.company_size ? (
                                            <SizeBadge
                                                size={company.company_size}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">
                                        {company.employee_count?.toLocaleString() ??
                                            "—"}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {company.country ?? "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {company.website ? (
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-xs"
                                            >
                                                {company.website.replace(
                                                    /^https?:\/\//,
                                                    "",
                                                )}
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    openEdit(company)
                                                }
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    setDeleteTarget(company)
                                                }
                                            >
                                                <Trash2 className="size-3.5 text-sophos-red" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <TablePagination
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(0);
                        }}
                    />
                </div>
            )}

            <CompanyFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                company={editTarget}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                entityName={deleteTarget?.current_name ?? ""}
                onConfirm={confirmDelete}
                isPending={deleteMutation.isPending}
                error={
                    deleteMutation.isError ? deleteMutation.error.message : null
                }
            />
        </section>
    );
}
