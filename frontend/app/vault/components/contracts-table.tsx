"use client"

import { useState } from "react"
import Link from "next/link"
import {
    FileSignature,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Hourglass,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContracts, useDeleteContract } from "@/hooks/use-contracts"
import { useCompanies } from "@/hooks/use-companies"
import { ContractFormDialog } from "./contract-form-dialog"
import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog"
import type { Contract, ContractStatus } from "@/lib/types"

function StatusBadge({ status }: { status: ContractStatus }) {
    const config: Record<ContractStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
        active: { label: "Active", icon: CheckCircle2, className: "bg-sophos-green/10 text-sophos-green" },
        pending: { label: "Pending", icon: Hourglass, className: "bg-sophos-sky/10 text-sophos-sky" },
        renewed: { label: "Renewed", icon: RotateCcw, className: "bg-sophos-violet/10 text-sophos-violet" },
        expired: { label: "Expired", icon: XCircle, className: "bg-sophos-red/10 text-sophos-red" },
    }
    const { label, icon: Icon, className } = config[status]
    return (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
            <Icon className="size-3" />
            {label}
        </span>
    )
}

function TypeBadge({ type }: { type: string }) {
    const isOurs = type === "our_contract"
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${isOurs ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {isOurs ? "Ours" : "Competitor"}
        </span>
    )
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatCurrency(value: number | null) {
    if (value == null) return "—"
    return `$${Number(value).toLocaleString()}`
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function huntPipelineHref(companyId: string, engagementId: string | null | undefined) {
    const sp = new URLSearchParams()
    sp.set("company_id", companyId)
    if (engagementId) sp.set("engagement_id", engagementId)
    return `/hunt?${sp.toString()}`
}

export function ContractsTable() {
    const { data: contracts = [], isLoading } = useContracts({ take: 500 })
    const companiesQuery = useCompanies({ page: 0, pageSize: 200 })
    const companies = companiesQuery.data?.items ?? []
    const deleteMutation = useDeleteContract()

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Contract | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null)

    function openCreate() {
        setEditTarget(null)
        setFormOpen(true)
    }

    function openEdit(contract: Contract) {
        setEditTarget(contract)
        setFormOpen(true)
    }

    function handleDelete() {
        if (!deleteTarget) return
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        })
    }

    const activeContracts = contracts.filter((c) => c.status === "active")
    const activeValue = activeContracts.reduce((sum, c) => sum + (Number(c.total_value) || 0), 0)
    const expiringCount = activeContracts.filter((c) => c.end_date && daysUntil(c.end_date) <= 90 && daysUntil(c.end_date) > 0).length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Loading contracts…</span>
            </div>
        )
    }

    return (
        <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Active Contracts</span>
                    <div className="text-2xl font-bold">{activeContracts.length}</div>
                    <span className="text-sm text-muted-foreground">{formatCurrency(activeValue)} total value</span>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Expiring (90 days)</span>
                    <div className="text-2xl font-bold text-sophos-orange">{expiringCount}</div>
                    <span className="text-sm text-muted-foreground">Requires renewal action</span>
                </div>
                <div className="rounded-lg border p-4 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Total Contracts</span>
                    <div className="text-2xl font-bold text-primary">{contracts.length}</div>
                    <span className="text-sm text-muted-foreground">All types &amp; statuses</span>
                </div>
            </div>

            {/* Table */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileSignature className="size-5 text-primary" />
                        <h3 className="text-base font-semibold">Contracts</h3>
                        <span className="text-xs text-muted-foreground">({contracts.length})</span>
                    </div>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="size-4 mr-1" />
                        New Contract
                    </Button>
                </div>

                {contracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border">
                        <p className="text-muted-foreground mb-4">No contracts yet.</p>
                        <Button onClick={openCreate}>
                            <Plus className="size-4 mr-2" />
                            Create First Contract
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 text-left font-medium">Company</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Value</th>
                                    <th className="px-4 py-3 text-left font-medium">Start</th>
                                    <th className="px-4 py-3 text-left font-medium">End</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-center font-medium">Renewal</th>
                                    <th className="px-4 py-3 text-left font-medium">Pipeline</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.map((c) => {
                                    const days = c.end_date ? daysUntil(c.end_date) : null
                                    const isExpiring = c.status === "active" && days !== null && days > 0 && days <= 90
                                    return (
                                        <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/portfolio/${c.company_id}?from=vault`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {c.company_name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <TypeBadge type={c.type} />
                                            </td>
                                            <td className="px-4 py-3 font-medium">{formatCurrency(c.total_value)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(c.start_date)}</td>
                                            <td className="px-4 py-3">
                                                <span className={isExpiring ? "text-sophos-orange font-semibold" : c.status === "expired" ? "text-sophos-red" : ""}>
                                                    {c.end_date && (
                                                        <Clock className="inline size-3.5 mr-1 align-text-bottom" />
                                                    )}
                                                    {formatDate(c.end_date)}
                                                    {days !== null && c.status !== "expired" && (
                                                        <span className="text-xs ml-1">({days}d)</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={c.status} />
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                                                {c.renewal_notice_days != null
                                                    ? `${c.renewal_notice_days}d`
                                                    : "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={huntPipelineHref(c.company_id, c.engagement_id)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                    title={
                                                        c.engagement_id
                                                            ? "Open linked deal on Hunt"
                                                            : "Open company pipeline on Hunt"
                                                    }
                                                >
                                                    <LayoutGrid className="size-3.5" />
                                                    {c.engagement_id ? "Open deal" : "Pipeline"}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                        onClick={() => openEdit(c)}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-destructive"
                                                        onClick={() => setDeleteTarget(c)}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <ContractFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                contract={editTarget}
                companies={companies}
                companiesLoading={companiesQuery.isLoading}
                companiesError={companiesQuery.isError ? companiesQuery.error : null}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                entityName={deleteTarget ? `contract with ${deleteTarget.company_name}` : ""}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
                error={deleteMutation.isError ? deleteMutation.error.message : null}
            />
        </>
    )
}
