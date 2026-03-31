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
import { useCompanies, useDeleteCompany, useUpdateCompany } from "@/hooks/use-companies";
import { useIndustries } from "@/hooks/use-industries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CompanyFormDialog } from "./company-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { TablePagination, DEFAULT_PAGE_SIZE } from "./table-pagination";
import { DataTableSkeleton } from "@/components/data-table-skeleton";
import type {
    Company,
    CompanyStatus,
    CompanySize,
    CompanyUpdatePayload,
} from "@/lib/types";
import { EditableNumberCell, EditableTextCell } from "@/components/inline-edit-cells";

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

export function CompaniesTable() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchInput, setSearchInput] = useState("");
    const debouncedQ = useDebouncedValue(searchInput, 300);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sizeFilter, setSizeFilter] = useState<string>("all");
    const [industryFilter, setIndustryFilter] = useState<string>("all");

    const statusParam =
        statusFilter === "all" ? undefined : (statusFilter as CompanyStatus);
    const sizeParam =
        sizeFilter === "all" ? undefined : (sizeFilter as CompanySize);
    const industryIdParam =
        industryFilter === "all" ? undefined : industryFilter;

    const industriesQuery = useIndustries();
    const companies = useCompanies({
        page,
        pageSize,
        status: statusParam,
        companySize: sizeParam,
        industryId: industryIdParam,
        q: debouncedQ,
    });
    const deleteMutation = useDeleteCompany();
    const updateMutation = useUpdateCompany();

    function patchCompany(id: string, data: CompanyUpdatePayload) {
        updateMutation.mutate({ id, data });
    }

    function rowPending(id: string) {
        return (
            updateMutation.isPending && updateMutation.variables?.id === id
        );
    }

    const hasActiveFilters =
        debouncedQ.trim().length > 0 ||
        statusFilter !== "all" ||
        sizeFilter !== "all" ||
        industryFilter !== "all";

    useEffect(() => {
        queueMicrotask(() => setPage(0));
    }, [debouncedQ, statusFilter, sizeFilter, industryFilter]);

    function clearFilters() {
        setSearchInput("");
        setStatusFilter("all");
        setSizeFilter("all");
        setIndustryFilter("all");
        setPage(0);
    }

    function primaryIndustryLabel(company: Company): string {
        const list = company.industries ?? [];
        const p = list.find((i) => i.is_primary) ?? list[0];
        return p?.name ?? "—";
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
        <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Building2 className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-tight">Companies</h3>
                {companies.data ? (
                    <span className="text-muted-foreground text-xs">({total})</span>
                ) : null}
                {companies.isFetching && !companies.isLoading ? (
                    <Loader2
                        className="text-muted-foreground size-3.5 animate-spin"
                        aria-hidden
                    />
                ) : null}
                <div className="ml-auto">
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="mr-1 size-4" />
                        Add Company
                    </Button>
                </div>
            </div>

            <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
                <div className="border-border/50 bg-muted/30 border-b px-4 py-4">
                    <p className="text-muted-foreground mb-3 text-[10px] font-bold tracking-widest uppercase">
                        Search &amp; filters
                    </p>
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
                <Select
                    value={industryFilter}
                    onValueChange={setIndustryFilter}
                >
                    <SelectTrigger
                        size="sm"
                        className="w-full min-w-[10rem] sm:min-w-[12rem] sm:max-w-[14rem]"
                        aria-label="Filter by industry"
                    >
                        <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        <SelectItem value="all">All industries</SelectItem>
                        {(industriesQuery.data ?? []).map((ind) => (
                            <SelectItem key={ind.id} value={ind.id}>
                                <span className="truncate">
                                    {ind.sector
                                        ? `${ind.sector} — ${ind.name}`
                                        : ind.name}
                                </span>
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

                {companies.isLoading ? (
                    <div className="p-4">
                        <DataTableSkeleton rows={8} columns={8} />
                    </div>
                ) : null}
                {companies.isError ? (
                    <div className="text-sophos-red flex items-center justify-center gap-2 py-12">
                        <AlertCircle className="size-4" />
                        <span className="text-sm">{companies.error.message}</span>
                    </div>
                ) : null}

                {updateMutation.isError ? (
                    <p className="text-sophos-red px-4 py-2 text-sm" role="alert">
                        {updateMutation.error.message}
                    </p>
                ) : null}

                {companies.data ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 border-border/60 border-b">
                                    <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                        Company
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                        Industry
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                        Status
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                        Size
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                                        Employees
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                        Country
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                        Website
                                    </th>
                                    <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                        <tbody>
                            {items.map((company) => (
                                <tr
                                    key={company.id}
                                    className="hover:bg-muted/30 border-border/40 border-b transition-colors last:border-b-0"
                                >
                                    <td className="px-6 py-3 font-medium">
                                        <Link
                                            href={`/portfolio/${company.id}`}
                                            className="hover:text-primary hover:underline transition-colors"
                                        >
                                            {company.current_name}
                                        </Link>
                                    </td>
                                    <td
                                        className="text-muted-foreground max-w-[10rem] truncate px-6 py-3"
                                        title={primaryIndustryLabel(company)}
                                    >
                                        {primaryIndustryLabel(company)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Select
                                            value={company.status}
                                            disabled={rowPending(company.id)}
                                            onValueChange={(v) => {
                                                if (v === company.status) return;
                                                patchCompany(company.id, {
                                                    status: v as CompanyStatus,
                                                });
                                            }}
                                        >
                                            <SelectTrigger
                                                size="sm"
                                                className="h-8 w-[9.5rem] border-transparent bg-transparent shadow-none hover:bg-muted/50"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((o) => (
                                                    <SelectItem
                                                        key={o.value}
                                                        value={o.value}
                                                    >
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Select
                                            value={
                                                company.company_size ?? "__none__"
                                            }
                                            disabled={rowPending(company.id)}
                                            onValueChange={(v) => {
                                                const next =
                                                    v === "__none__"
                                                        ? null
                                                        : (v as CompanySize);
                                                if (next === company.company_size)
                                                    return;
                                                patchCompany(company.id, {
                                                    company_size: next,
                                                });
                                            }}
                                        >
                                            <SelectTrigger
                                                size="sm"
                                                className="h-8 w-[8.5rem] border-transparent bg-transparent shadow-none hover:bg-muted/50"
                                            >
                                                <SelectValue placeholder="—" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">
                                                    —
                                                </SelectItem>
                                                {SIZE_OPTIONS.map((o) => (
                                                    <SelectItem
                                                        key={o.value}
                                                        value={o.value}
                                                    >
                                                        {o.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <EditableNumberCell
                                            value={company.employee_count}
                                            disabled={rowPending(company.id)}
                                            onSave={(next) => {
                                                if (next === company.employee_count)
                                                    return;
                                                patchCompany(company.id, {
                                                    employee_count: next,
                                                });
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <EditableTextCell
                                            value={company.country}
                                            disabled={rowPending(company.id)}
                                            onSave={(next) => {
                                                if (next === (company.country ?? null))
                                                    return;
                                                patchCompany(company.id, {
                                                    country: next,
                                                });
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <EditableTextCell
                                            value={company.website}
                                            disabled={rowPending(company.id)}
                                            showOpenLink
                                            onSave={(next) => {
                                                if (next === (company.website ?? null))
                                                    return;
                                                patchCompany(company.id, {
                                                    website: next,
                                                });
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-right">
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
                ) : null}
            </div>

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
