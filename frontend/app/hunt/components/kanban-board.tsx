"use client"

import { useState, useMemo, useEffect, type ReactNode } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStages } from "@/hooks/use-stages"
import { useEngagements, useDeleteEngagement, useUpdateEngagement } from "@/hooks/use-engagements"
import { useCompanies } from "@/hooks/use-companies"
import { useContracts } from "@/hooks/use-contracts"
import { EngagementCard } from "./engagement-card"
import { EngagementFormDialog } from "./engagement-form-dialog"
import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog"
import {
    getContractSignalsForCompany,
    type ContractCardSignals,
} from "@/lib/contract-signals"
import { cn } from "@/lib/utils"
import type { Engagement } from "@/lib/types"

function stageDropId(stageId: string) {
    return `stage-${stageId}`
}

function engagementDragId(engagementId: string) {
    return `engagement-${engagementId}`
}

function StageDropZone({
    stageId,
    children,
}: {
    stageId: string
    children: ReactNode
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: stageDropId(stageId),
    })
    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 rounded-b-lg border bg-muted/20 p-2 space-y-2 min-h-[200px]",
                isOver && "ring-2 ring-primary/35 ring-inset",
            )}
        >
            {children}
        </div>
    )
}

function DraggableEngagementCard({
    engagement,
    onEdit,
    onDelete,
    contractSignals,
    highlight,
}: {
    engagement: Engagement
    onEdit: (e: Engagement) => void
    onDelete: (e: Engagement) => void
    contractSignals?: ContractCardSignals
    highlight: boolean
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: engagementDragId(engagement.id),
        data: { engagement },
    })
    const style = transform ? { transform: CSS.Transform.toString(transform) } : undefined

    return (
        <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")}>
            <EngagementCard
                engagement={engagement}
                onEdit={onEdit}
                onDelete={onDelete}
                contractSignals={contractSignals}
                highlight={highlight}
                dragHandleProps={{ attributes, listeners }}
            />
        </div>
    )
}

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
    const updateMutation = useUpdateEngagement()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    )

    const [activeEngagement, setActiveEngagement] = useState<Engagement | null>(null)

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

    function handleDragStart(event: DragStartEvent) {
        const eng = event.active.data.current?.engagement as Engagement | undefined
        setActiveEngagement(eng ?? null)
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveEngagement(null)
        const { active, over } = event
        if (!over) return
        const overStr = String(over.id)
        if (!overStr.startsWith("stage-")) return
        const nextStageId = overStr.slice("stage-".length)
        const activeStr = String(active.id)
        if (!activeStr.startsWith("engagement-")) return
        const engagementId = activeStr.slice("engagement-".length)
        const eng = filteredEngagements.find((e) => e.id === engagementId)
        if (!eng || eng.stage_id === nextStageId) return
        updateMutation.mutate({ id: engagementId, data: { stage_id: nextStageId } })
    }

    if (isLoading) {
        return (
            <div className="overflow-x-auto pb-4">
                <div className="inline-flex gap-4 min-w-max">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-72 shrink-0 flex flex-col">
                            <Skeleton className="rounded-t-lg rounded-b-none border border-b-0 px-3 h-14 w-full" />
                            <div className="rounded-b-lg border bg-muted/20 p-2 min-h-[200px] space-y-2 flex flex-col">
                                <Skeleton className="h-24 w-full rounded-lg shrink-0" />
                                <Skeleton className="h-24 w-full rounded-lg shrink-0" />
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

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
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

                                    <StageDropZone stageId={stage.id}>
                                        {colEngagements.length > 0 ? (
                                            colEngagements.map((eng) => (
                                                <DraggableEngagementCard
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
                                            <div className="flex items-center justify-center h-full min-h-[120px] text-xs text-muted-foreground">
                                                Drop here or add an engagement
                                            </div>
                                        )}
                                    </StageDropZone>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeEngagement ? (
                        <div className="pointer-events-none w-72">
                            <EngagementCard
                                engagement={activeEngagement}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                contractSignals={getContractSignalsForCompany(
                                    contracts,
                                    activeEngagement.company_id,
                                )}
                                highlight={false}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

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
