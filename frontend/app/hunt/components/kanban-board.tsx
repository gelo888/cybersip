"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStages } from "@/hooks/use-stages"
import { useEngagements, useDeleteEngagement } from "@/hooks/use-engagements"
import { useCompanies } from "@/hooks/use-companies"
import { useContracts } from "@/hooks/use-contracts"
import { EngagementCard } from "./engagement-card"
import { EngagementFormDialog } from "./engagement-form-dialog"
import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog"
import { getContractSignalsForCompany } from "@/lib/contract-signals"
import type { Engagement } from "@/lib/types"

export function KanbanBoard() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const companyFilter = searchParams.get("company_id")
    const engagementHighlight = searchParams.get("engagement_id")

    const { data: stages = [], isLoading: stagesLoading } = useStages()
    const { data: engagements = [], isLoading: engagementsLoading } = useEngagements({ take: 500 })
    const { data: contracts = [], isLoading: contractsLoading } = useContracts({ take: 500 })
    const companiesQuery = useCompanies({ page: 0, pageSize: 200 })
    const companies = companiesQuery.data?.items ?? []
    const deleteMutation = useDeleteEngagement()

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Engagement | null>(null)
    const [defaultStageId, setDefaultStageId] = useState<string>()
    const [deleteTarget, setDeleteTarget] = useState<Engagement | null>(null)

    const filteredEngagements = useMemo(() => {
        if (!companyFilter) return engagements
        return engagements.filter((e) => e.company_id === companyFilter)
    }, [engagements, companyFilter])

    const engagementIdsFiltered = useMemo(
        () => new Set(filteredEngagements.map((e) => e.id)),
        [filteredEngagements],
    )

    const staleEngagementLink =
        !!engagementHighlight &&
        !!companyFilter &&
        !engagementIdsFiltered.has(engagementHighlight)

    const filterCompanyName =
        companies.find((c) => c.id === companyFilter)?.current_name ??
        filteredEngagements[0]?.company_name ??
        null

    const isLoading = stagesLoading || engagementsLoading || contractsLoading

    useEffect(() => {
        if (!engagementHighlight || !companyFilter) return
        const t = window.setTimeout(() => {
            document
                .getElementById(`hunt-engagement-${engagementHighlight}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
        return () => window.clearTimeout(t)
    }, [engagementHighlight, companyFilter, filteredEngagements.length])

    function clearFilters() {
        router.replace("/hunt")
    }

    function openCreate(stageId?: string) {
        setEditTarget(null)
        setDefaultStageId(stageId)
        setFormOpen(true)
    }

    function openEdit(engagement: Engagement) {
        setEditTarget(engagement)
        setFormOpen(true)
    }

    function handleDelete() {
        if (!deleteTarget) return
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        })
    }

    if (isLoading) {
        return (
            <div className="overflow-x-auto pb-4">
                <div className="inline-flex gap-4 min-w-max">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-72 shrink-0">
                            <div className="rounded-t-lg bg-muted/50 border border-b-0 px-3 py-2.5 h-14 animate-pulse" />
                            <div className="rounded-b-lg border bg-muted/20 p-2 min-h-[200px] space-y-2">
                                <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
                                <div className="h-24 rounded-lg bg-muted/40 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (stages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground mb-4">
                    No pipeline stages configured yet. Create stages to start tracking engagements.
                </p>
                <Button onClick={() => openCreate()}>
                    <Plus className="size-4 mr-2" />
                    New Engagement
                </Button>
            </div>
        )
    }

    const engagementsByStage = new Map<string, Engagement[]>()
    for (const stage of stages) {
        engagementsByStage.set(stage.id, [])
    }
    for (const eng of filteredEngagements) {
        const list = engagementsByStage.get(eng.stage_id)
        if (list) list.push(eng)
    }

    return (
        <>
            {companyFilter && (
                <div className="mb-4 flex flex-col gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-muted-foreground mb-0">
                            Showing pipeline for{" "}
                            <span className="font-medium text-foreground">
                                {filterCompanyName ?? "selected company"}
                            </span>
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                            <X className="size-3.5 mr-1" />
                            Clear filter
                        </Button>
                    </div>
                    {staleEngagementLink && (
                        <p className="text-xs text-sophos-orange mb-0">
                            Linked engagement is no longer on the board; showing all deals for this
                            company.
                        </p>
                    )}
                </div>
            )}

            {companyFilter && filteredEngagements.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                    No engagements for this company in the pipeline.
                </p>
            )}

            <div className="overflow-x-auto pb-4">
                <div className="inline-flex gap-4 min-w-max">
                    {stages.map((stage) => {
                        const colEngagements = engagementsByStage.get(stage.id) ?? []

                        return (
                            <div key={stage.id} className="w-72 shrink-0 flex flex-col">
                                <div className="rounded-t-lg bg-muted/50 border border-b-0 px-3 py-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">{stage.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="flex items-center justify-center size-5 rounded-full bg-muted text-xs font-medium">
                                                {colEngagements.length}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-5"
                                                onClick={() => openCreate(stage.id)}
                                            >
                                                <Plus className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {stage.probability}% probability
                                    </span>
                                </div>

                                <div className="flex-1 rounded-b-lg border bg-muted/20 p-2 space-y-2 min-h-[200px]">
                                    {colEngagements.length > 0 ? (
                                        colEngagements.map((eng) => (
                                            <EngagementCard
                                                key={eng.id}
                                                engagement={eng}
                                                onEdit={openEdit}
                                                onDelete={setDeleteTarget}
                                                contractSignals={getContractSignalsForCompany(
                                                    contracts,
                                                    eng.company_id,
                                                )}
                                                highlight={
                                                    !!engagementHighlight &&
                                                    engagementHighlight === eng.id
                                                }
                                            />
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                            No engagements
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <EngagementFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                engagement={editTarget}
                stages={stages}
                companies={companies}
                companiesLoading={companiesQuery.isLoading}
                companiesError={companiesQuery.isError ? companiesQuery.error : null}
                scopedCompanyId={companyFilter ?? undefined}
                defaultStageId={defaultStageId}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
                entityName={deleteTarget ? `${deleteTarget.type} with ${deleteTarget.company_name}` : ""}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
                error={deleteMutation.isError ? deleteMutation.error.message : null}
            />
        </>
    )
}
