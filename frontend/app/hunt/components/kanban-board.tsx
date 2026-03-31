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
import { ListFilter, MoreHorizontal, Plus, X } from "lucide-react"
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
import type { Contract, Engagement } from "@/lib/types"

function pendingOurValueForCompany(contracts: Contract[], companyId: string): number {
    let sum = 0
    for (const c of contracts) {
        if (c.company_id !== companyId) continue
        if (c.type !== "our_contract" || c.status !== "pending") continue
        if (c.total_value == null) continue
        const v =
            typeof c.total_value === "number"
                ? c.total_value
                : parseFloat(String(c.total_value))
        if (Number.isFinite(v)) sum += v
    }
    return sum
}

function pipelineValueForEngagementSet(
    engagements: Engagement[],
    contracts: Contract[],
): number {
    const seen = new Set<string>()
    let sum = 0
    for (const e of engagements) {
        if (seen.has(e.company_id)) continue
        seen.add(e.company_id)
        sum += pendingOurValueForCompany(contracts, e.company_id)
    }
    return sum
}

function avgDaysInPipeline(engagements: Engagement[]): number | null {
    if (engagements.length === 0) return null
    const total = engagements.reduce((s, e) => {
        const diff = Date.now() - new Date(e.created_at).getTime()
        return s + Math.floor(diff / (1000 * 60 * 60 * 24))
    }, 0)
    return Math.round(total / engagements.length)
}

function formatHuntCurrency(n: number) {
    if (n >= 1_000_000) return `$${(n / 1e6).toFixed(1)}M`
    if (n >= 1000) return `$${Math.round(n / 1000)}K`
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n)
}

const STAGE_BORDER = [
    "border-l-primary",
    "border-l-accent",
    "border-l-chart-2",
    "border-l-chart-3",
    "border-l-primary",
    "border-l-muted-foreground/45",
] as const

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
                "border-border/60 flex min-h-[240px] flex-1 flex-col gap-3 rounded-b-xl border border-t-0 bg-muted/25 p-3 dark:bg-muted/15",
                isOver && "ring-primary/35 ring-2 ring-inset",
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
    dealValue = 0,
    highlight,
}: {
    engagement: Engagement
    onEdit: (e: Engagement) => void
    onDelete: (e: Engagement) => void
    contractSignals?: ContractCardSignals
    dealValue?: number
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
                dealValue={dealValue}
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

    const boardPipeline = useMemo(
        () => pipelineValueForEngagementSet(filteredEngagements, contracts),
        [filteredEngagements, contracts],
    )
    const avgDays = useMemo(
        () => avgDaysInPipeline(filteredEngagements),
        [filteredEngagements],
    )

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
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="border-border/60 bg-muted/35 mb-4 flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 dark:bg-muted/20">
                    <div className="flex flex-wrap gap-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-36" />
                        ))}
                    </div>
                    <Skeleton className="h-9 w-40" />
                </div>
                <div className="kanban-scroll-x min-h-0 flex-1 overflow-x-auto px-6 pb-6">
                    <div className="inline-flex h-full min-w-max gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex w-80 shrink-0 flex-col">
                                <Skeleton className="h-16 w-full rounded-t-xl rounded-b-none border border-b-0 px-3" />
                                <div className="border-border/60 flex min-h-[260px] flex-col gap-3 rounded-b-xl border bg-muted/20 p-3">
                                    <Skeleton className="h-36 w-full shrink-0 rounded-xl" />
                                    <Skeleton className="h-36 w-full shrink-0 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (stages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
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
                <div className="mx-6 mb-4 flex flex-col gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
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
                <p className="text-muted-foreground mx-6 mb-4 text-sm">
                    No engagements for this company in the pipeline.
                </p>
            )}

            <div className="border-border/60 bg-muted/35 mb-4 flex flex-col gap-4 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-muted/20">
                <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                    <div>
                        <p className="text-muted-foreground m-0 text-[10px] font-bold tracking-wider uppercase">
                            Pipeline value
                        </p>
                        <p className="font-(family-name:--font-lexend) text-primary m-0 text-2xl font-bold tabular-nums">
                            {formatHuntCurrency(boardPipeline)}
                        </p>
                        <p className="text-muted-foreground/80 m-0 mt-0.5 max-w-56 text-[10px]">
                            Pending our_contract totals, one per company on the board
                        </p>
                    </div>
                    <div className="bg-border/50 hidden h-10 w-px sm:block" aria-hidden />
                    <div>
                        <p className="text-muted-foreground m-0 text-[10px] font-bold tracking-wider uppercase">
                            Active deals
                        </p>
                        <p className="font-(family-name:--font-lexend) text-accent m-0 text-2xl font-bold tabular-nums">
                            {filteredEngagements.length}
                        </p>
                    </div>
                    <div className="bg-border/50 hidden h-10 w-px sm:block" aria-hidden />
                    <div>
                        <p className="text-muted-foreground m-0 text-[10px] font-bold tracking-wider uppercase">
                            Avg. age in pipeline
                        </p>
                        <p className="font-(family-name:--font-lexend) m-0 text-2xl font-bold tabular-nums text-foreground">
                            {avgDays != null ? `${avgDays}d` : "—"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-border/70 bg-card/80 gap-2 shadow-sm"
                        title="Advanced filters coming soon; scope to one company from Company 360."
                        disabled
                    >
                        <ListFilter className="size-3.5 opacity-60" />
                        Filter
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="bg-primary font-semibold text-primary-foreground shadow-md hover:opacity-95"
                        onClick={() => openCreate()}
                    >
                        <Plus className="size-3.5" />
                        New target
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="kanban-scroll-x min-h-[min(520px,calc(100dvh-16rem))] flex-1 overflow-x-auto px-6 pb-6">
                    <div className="inline-flex h-full min-h-[inherit] min-w-max items-stretch gap-6">
                        {stages.map((stage, stageIndex) => {
                            const colEngagements = engagementsByStage.get(stage.id) ?? []
                            const colPipeline = pipelineValueForEngagementSet(
                                colEngagements,
                                contracts,
                            )
                            const borderAccent =
                                STAGE_BORDER[stageIndex % STAGE_BORDER.length] ?? "border-l-primary"

                            return (
                                <div
                                    key={stage.id}
                                    className="flex w-80 shrink-0 flex-col self-stretch"
                                >
                                    <div className="border-border/60 flex flex-col rounded-t-xl border border-b-0 bg-muted/40 px-3 py-3 dark:bg-muted/25">
                                        <div
                                            className={cn(
                                                "flex items-start justify-between gap-2 border-l-2 pl-3",
                                                borderAccent,
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-(family-name:--font-lexend) m-0 text-sm font-semibold leading-tight text-foreground">
                                                    {stage.name}
                                                </h3>
                                                <p className="text-muted-foreground m-0 mt-1 text-[10px] font-medium">
                                                    {colEngagements.length} deals
                                                    {colPipeline > 0
                                                        ? ` · ${formatHuntCurrency(colPipeline)}`
                                                        : ""}
                                                </p>
                                                <p className="text-muted-foreground/80 m-0 text-[10px]">
                                                    {stage.probability}% probability
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-0.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground size-8"
                                                    aria-label={`Add engagement to ${stage.name}`}
                                                    onClick={() => openCreate(stage.id)}
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground size-8"
                                                    aria-label="Column menu"
                                                    disabled
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
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
                                                    dealValue={pendingOurValueForCompany(
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
                                            <div className="text-muted-foreground flex min-h-[140px] flex-1 items-center justify-center px-2 text-center text-xs">
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
                        <div className="pointer-events-none w-80 rotate-1 opacity-95 shadow-xl">
                            <EngagementCard
                                engagement={activeEngagement}
                                onEdit={() => {}}
                                onDelete={() => {}}
                                contractSignals={getContractSignalsForCompany(
                                    contracts,
                                    activeEngagement.company_id,
                                )}
                                dealValue={pendingOurValueForCompany(
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
