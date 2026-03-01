"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Radar, Shield, Newspaper, Plus, Pencil, Trash2, Clock, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompetitors, useDeleteCompetitor } from "@/hooks/use-competitors"
import { useIntel, useDeleteIntel } from "@/hooks/use-intel"
import { useCompanies } from "@/hooks/use-companies"
import { CompetitorFormDialog } from "./competitor-form-dialog"
import { IntelFormDialog } from "./intel-form-dialog"
import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog"
import type { Competitor, CompetitorIntel } from "@/lib/types"

function ConfidenceBadge({ confidence }: { confidence: string }) {
    const config: Record<string, { label: string; className: string }> = {
        confirmed: { label: "Confirmed", className: "bg-green-500/10 text-green-700" },
        rumor: { label: "Rumor", className: "bg-amber-500/10 text-amber-700" },
        inferred: { label: "Inferred", className: "bg-blue-500/10 text-blue-700" },
    }
    const { label, className } = config[confidence] ?? { label: confidence, className: "bg-muted text-muted-foreground" }
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
            {label}
        </span>
    )
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function IntelligenceHub() {
    const { data: competitors = [], isLoading: loadingComp } = useCompetitors()
    const { data: intelRecords = [], isLoading: loadingIntel } = useIntel()
    const { data: companiesData } = useCompanies({ page: 0, pageSize: 500 })
    const companies = companiesData?.items ?? []
    const deleteCompetitor = useDeleteCompetitor()
    const deleteIntel = useDeleteIntel()

    const [compFormOpen, setCompFormOpen] = useState(false)
    const [editingComp, setEditingComp] = useState<Competitor | null>(null)
    const [deletingComp, setDeletingComp] = useState<Competitor | null>(null)

    const [intelFormOpen, setIntelFormOpen] = useState(false)
    const [editingIntel, setEditingIntel] = useState<CompetitorIntel | null>(null)
    const [deletingIntel, setDeletingIntel] = useState<CompetitorIntel | null>(null)

    const isLoading = loadingComp || loadingIntel

    if (isLoading) {
        return (
            <div className="p-6 space-y-8">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
                <Skeleton className="h-8 w-48" />
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    const intelByCompetitor = new Map<string, number>()
    const expiringByCompetitor = new Map<string, number>()
    for (const r of intelRecords) {
        intelByCompetitor.set(r.competitor_id, (intelByCompetitor.get(r.competitor_id) ?? 0) + 1)
        if (r.contract_end) {
            const days = daysUntil(r.contract_end)
            if (days > 0 && days <= 180) {
                expiringByCompetitor.set(r.competitor_id, (expiringByCompetitor.get(r.competitor_id) ?? 0) + 1)
            }
        }
    }

    return (
        <div className="p-6 space-y-8">
            {/* ── Market Signals (placeholder) ── */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <Newspaper className="size-5 text-primary" />
                    <h3 className="text-base font-semibold">Market Signals</h3>
                    <span className="text-xs text-muted-foreground">(Coming in Phase 3 — N8N Automation)</span>
                </div>
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
                    Market signals will be powered by automated N8N workflows — scraping CyberWire, NIST NVD,
                    and vendor blogs for real-time competitive intelligence.
                </div>
            </section>

            {/* ── Competitor Tracker ── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radar className="size-5 text-primary" />
                        <h3 className="text-base font-semibold">Competitor Tracker</h3>
                        <span className="text-xs text-muted-foreground">({competitors.length} tracked)</span>
                    </div>
                    <Button size="sm" onClick={() => { setEditingComp(null); setCompFormOpen(true) }}>
                        <Plus className="size-4 mr-1" />
                        Add Competitor
                    </Button>
                </div>

                {competitors.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No competitors tracked yet. Add your first competitor to start building intelligence.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 text-left font-medium">Competitor</th>
                                    <th className="px-4 py-3 text-center font-medium">Intel Records</th>
                                    <th className="px-4 py-3 text-center font-medium">Expiring ≤6mo</th>
                                    <th className="px-4 py-3 text-left font-medium">Strengths</th>
                                    <th className="px-4 py-3 text-left font-medium">Weaknesses</th>
                                    <th className="px-4 py-3 text-right font-medium w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competitors.map((c) => (
                                    <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="size-3.5 text-destructive shrink-0" />
                                                <span className="font-medium">{c.name}</span>
                                                {c.website && (
                                                    <a
                                                        href={c.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-muted-foreground hover:text-primary"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium">
                                            {intelByCompetitor.get(c.id) ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={(expiringByCompetitor.get(c.id) ?? 0) > 0 ? "text-amber-600 font-semibold" : "text-muted-foreground"}>
                                                {expiringByCompetitor.get(c.id) ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            {c.strengths.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {c.strengths.map((s, i) => (
                                                        <span key={i} className="inline-flex rounded-md bg-green-500/10 px-1.5 py-0.5 text-xs text-green-700">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            {c.weaknesses.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {c.weaknesses.map((w, i) => (
                                                        <span key={i} className="inline-flex rounded-md bg-red-500/10 px-1.5 py-0.5 text-xs text-red-700">
                                                            {w}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7"
                                                    onClick={() => { setEditingComp(c); setCompFormOpen(true) }}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:text-destructive"
                                                    onClick={() => setDeletingComp(c)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* ── Intel Feed ── */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="size-5 text-primary" />
                        <h3 className="text-base font-semibold">Intel Feed</h3>
                        <span className="text-xs text-muted-foreground">({intelRecords.length} records)</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => { setEditingIntel(null); setIntelFormOpen(true) }}
                        disabled={competitors.length === 0}
                    >
                        <Plus className="size-4 mr-1" />
                        Log Intel
                    </Button>
                </div>

                {intelRecords.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No intel logged yet. Start tracking competitor presence at your accounts.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-4 py-3 text-left font-medium">Company</th>
                                    <th className="px-4 py-3 text-left font-medium">Competitor</th>
                                    <th className="px-4 py-3 text-left font-medium">Product</th>
                                    <th className="px-4 py-3 text-left font-medium">Contract Ends</th>
                                    <th className="px-4 py-3 text-center font-medium">Confidence</th>
                                    <th className="px-4 py-3 text-right font-medium w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intelRecords.map((r) => {
                                    const days = r.contract_end ? daysUntil(r.contract_end) : null
                                    return (
                                        <tr key={r.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/portfolio/${r.company_id}?from=intelligence`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {r.company_name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Shield className="size-3 text-destructive" />
                                                    {r.competitor_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {r.product_name || "—"}
                                            </td>
                                            <td className="px-4 py-3">
                                                {days !== null ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock className="size-3" />
                                                        <span className={days <= 90 ? "text-amber-600 font-semibold" : days <= 0 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                                                            {days <= 0 ? "Expired" : `${days}d`}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <ConfidenceBadge confidence={r.confidence} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7"
                                                        onClick={() => { setEditingIntel(r); setIntelFormOpen(true) }}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-destructive hover:text-destructive"
                                                        onClick={() => setDeletingIntel(r)}
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

            {/* ── Dialogs ── */}
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
                onOpenChange={(open) => { if (!open) setDeletingComp(null) }}
                entityName={deletingComp?.name ?? "competitor"}
                isPending={deleteCompetitor.isPending}
                onConfirm={() => {
                    if (deletingComp) {
                        deleteCompetitor.mutate(deletingComp.id, {
                            onSuccess: () => setDeletingComp(null),
                        })
                    }
                }}
            />

            <DeleteConfirmDialog
                open={!!deletingIntel}
                onOpenChange={(open) => { if (!open) setDeletingIntel(null) }}
                entityName={deletingIntel ? `${deletingIntel.competitor_name} intel at ${deletingIntel.company_name}` : "intel"}
                isPending={deleteIntel.isPending}
                onConfirm={() => {
                    if (deletingIntel) {
                        deleteIntel.mutate(deletingIntel.id, {
                            onSuccess: () => setDeletingIntel(null),
                        })
                    }
                }}
            />
        </div>
    )
}
