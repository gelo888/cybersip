"use client"

import Link from "next/link"
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import { Phone, Mail, Users, Monitor, Clock, Pencil, Trash2, FileSignature, Building2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Engagement } from "@/lib/types"
import type { ContractCardSignals } from "@/lib/contract-signals"

const TYPE_CONFIG: Record<string, { icon: typeof Phone; label: string; color: string }> = {
    call: { icon: Phone, label: "Call", color: "bg-blue-500/15 text-blue-400" },
    email: { icon: Mail, label: "Email", color: "bg-emerald-500/15 text-emerald-400" },
    meeting: { icon: Users, label: "Meeting", color: "bg-purple-500/15 text-purple-400" },
    demo: { icon: Monitor, label: "Demo", color: "bg-amber-500/15 text-amber-400" },
}

function daysSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

interface Props {
    engagement: Engagement
    onEdit: (engagement: Engagement) => void
    onDelete: (engagement: Engagement) => void
    contractSignals?: ContractCardSignals
    highlight?: boolean
    /** When set, this control starts a Kanban drag (stage change). */
    dragHandleProps?: {
        attributes: DraggableAttributes
        listeners: DraggableSyntheticListeners
    }
}

export function EngagementCard({ engagement, onEdit, onDelete, contractSignals, highlight, dragHandleProps }: Props) {
    const cfg = TYPE_CONFIG[engagement.type] ?? TYPE_CONFIG.call
    const Icon = cfg.icon
    const age = daysSince(engagement.created_at)
    const hasSignals =
        contractSignals &&
        (contractSignals.showProposalPending ||
            contractSignals.showContractSigned ||
            contractSignals.showCompetitorActive)

    return (
        <div
            id={`hunt-engagement-${engagement.id}`}
            className={`rounded-lg border bg-card p-3 space-y-2.5 hover:shadow-sm transition-shadow group ${
                highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
            }`}
        >
            <div className="flex items-start gap-1">
                {dragHandleProps && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing touch-none mt-0.5"
                        aria-label="Drag to change pipeline stage"
                        {...dragHandleProps.attributes}
                        {...dragHandleProps.listeners}
                    >
                        <GripVertical className="size-4" />
                    </Button>
                )}
                <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                    <Link
                        href={`/portfolio/${engagement.company_id}?from=hunt`}
                        className="font-medium text-sm truncate hover:underline"
                    >
                        {engagement.company_name}
                    </Link>
                    <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => onEdit(engagement)}
                        >
                            <Pencil className="size-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-destructive"
                            onClick={() => onDelete(engagement)}
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                    <Icon className="size-3" />
                    {cfg.label}
                </span>
                {hasSignals && contractSignals && (
                    <>
                        {contractSignals.showProposalPending && (
                            <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-sophos-sky/15 text-sophos-sky">
                                <FileSignature className="size-2.5" />
                                Proposal
                            </span>
                        )}
                        {contractSignals.showContractSigned && (
                            <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-sophos-green/15 text-sophos-green">
                                <FileSignature className="size-2.5" />
                                Signed
                            </span>
                        )}
                        {contractSignals.showCompetitorActive && (
                            <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground">
                                <Building2 className="size-2.5" />
                                Competitor
                            </span>
                        )}
                    </>
                )}
            </div>

            {engagement.outcome && (
                <p className="text-xs text-muted-foreground line-clamp-2">{engagement.outcome}</p>
            )}

            <div className="flex items-center justify-between pt-1 border-t">
                {engagement.next_action_date ? (
                    <span className={`flex items-center gap-1 text-xs ${daysUntil(engagement.next_action_date) <= 3 ? "text-sophos-red font-semibold" : "text-muted-foreground"}`}>
                        <Clock className="size-3" />
                        {daysUntil(engagement.next_action_date) <= 0
                            ? "Overdue"
                            : `${daysUntil(engagement.next_action_date)}d until follow-up`}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground">No follow-up</span>
                )}
                <span className="text-xs text-muted-foreground">{age}d in stage</span>
            </div>
        </div>
    )
}
