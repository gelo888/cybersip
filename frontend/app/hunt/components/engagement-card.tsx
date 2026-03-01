"use client"

import Link from "next/link"
import { Phone, Mail, Users, Monitor, Clock, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Engagement } from "@/lib/types"

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
}

export function EngagementCard({ engagement, onEdit, onDelete }: Props) {
    const cfg = TYPE_CONFIG[engagement.type] ?? TYPE_CONFIG.call
    const Icon = cfg.icon
    const age = daysSince(engagement.created_at)

    return (
        <div className="rounded-lg border bg-card p-3 space-y-2.5 hover:shadow-sm transition-shadow group">
            <div className="flex items-start justify-between gap-2">
                <Link
                    href={`/portfolio/${engagement.company_id}?from=hunt`}
                    className="font-medium text-sm truncate hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {engagement.company_name}
                </Link>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

            <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                    <Icon className="size-3" />
                    {cfg.label}
                </span>
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
