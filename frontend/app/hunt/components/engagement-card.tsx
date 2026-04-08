"use client";

import Link from "next/link";
import type {
    DraggableAttributes,
    DraggableSyntheticListeners,
} from "@dnd-kit/core";
import {
    Phone,
    Mail,
    Users,
    Monitor,
    Clock,
    Pencil,
    Trash2,
    FileSignature,
    GripVertical,
    AlertTriangle,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Engagement } from "@/lib/types";
import type { ContractCardSignals } from "@/lib/contract-signals";

const TYPE_CONFIG: Record<
    string,
    { icon: typeof Phone; label: string; color: string }
> = {
    call: { icon: Phone, label: "Call", color: "bg-primary/12 text-primary" },
    email: {
        icon: Mail,
        label: "Email",
        color: "bg-accent/15 text-accent-foreground",
    },
    meeting: {
        icon: Users,
        label: "Meeting",
        color: "bg-chart-2/15 text-chart-2",
    },
    demo: {
        icon: Monitor,
        label: "Demo",
        color: "bg-chart-4/15 text-chart-4",
    },
};

function daysSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDealValue(n: number) {
    if (n >= 1_000_000) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);
}

interface Props {
    engagement: Engagement;
    onEdit: (engagement: Engagement) => void;
    onDelete: (engagement: Engagement) => void;
    contractSignals?: ContractCardSignals;
    /** Sum of pending our_contract values for this company (pipeline exposure). */
    dealValue?: number | null;
    highlight?: boolean;
    dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: DraggableSyntheticListeners;
    };
}

export function EngagementCard({
    engagement,
    onEdit,
    onDelete,
    contractSignals,
    dealValue,
    highlight,
    dragHandleProps,
}: Props) {
    const cfg = TYPE_CONFIG[engagement.type] ?? TYPE_CONFIG.call;
    const Icon = cfg.icon;
    const age = daysSince(engagement.created_at);
    const hasSignals =
        contractSignals &&
        (contractSignals.showProposalPending ||
            contractSignals.showContractSigned ||
            contractSignals.showCompetitorActive);
    const followDays = engagement.next_action_date
        ? daysUntil(engagement.next_action_date)
        : null;
    const urgentFollow =
        followDays != null && followDays <= 14 && followDays >= 0;

    return (
        <div
            id={`hunt-engagement-${engagement.id}`}
            className={cn(
                "group bg-card space-y-3 rounded-xl border border-border/60 p-4 shadow-sm transition-all",
                "hover:border-primary/40 hover:shadow-md",
                highlight &&
                    "ring-primary ring-offset-background ring-2 ring-offset-2",
            )}
        >
            <div className="flex items-center gap-1">
                {dragHandleProps ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground mt-0.5 size-7 shrink-0 cursor-grab touch-none active:cursor-grabbing"
                        aria-label="Drag to change pipeline stage"
                        {...dragHandleProps.attributes}
                        {...dragHandleProps.listeners}
                    >
                        <GripVertical className="size-4" />
                    </Button>
                ) : null}
                <div className="min-w-0 flex-1 items-center">
                    <div className="">
                        <Link
                            href={`/portfolio/${engagement.company_id}?from=hunt`}
                            className="font-(family-name:--font-lexend) text-foreground inline-block text-sm font-bold leading-tight hover:text-primary hover:underline"
                        >
                            {engagement.company_name}
                        </Link>
                    </div>
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onEdit(engagement)}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive size-7"
                        onClick={() => onDelete(engagement)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 py-1">
                <span
                    className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold",
                        cfg.color,
                    )}
                >
                    <Icon className="size-3 shrink-0" />
                    {cfg.label}
                </span>
                {urgentFollow && engagement.next_action_date ? (
                    <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
                        <AlertTriangle className="size-3" />
                        Follow-up • {followDays}d
                    </span>
                ) : null}
                {contractSignals?.showCompetitorActive ? (
                    <span className="bg-sophos-orange/12 text-sophos-orange inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold">
                        <Shield className="size-3" />
                        Competitor
                    </span>
                ) : null}
                {hasSignals && contractSignals ? (
                    <>
                        {contractSignals.showProposalPending ? (
                            <span className="bg-sophos-sky/12 text-sophos-sky inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                                <FileSignature className="size-2.5" />
                                Proposal
                            </span>
                        ) : null}
                        {contractSignals.showContractSigned ? (
                            <span className="bg-sophos-green/12 text-sophos-green inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
                                <FileSignature className="size-2.5" />
                                Signed
                            </span>
                        ) : null}
                    </>
                ) : null}
            </div>

            {engagement.outcome ? (
                <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                    {engagement.outcome}
                </p>
            ) : null}

            <div className="flex items-end justify-between gap-3 pt-1">
                <div>
                    <p className="text-muted-foreground m-0 text-[10px] font-medium tracking-wide uppercase">
                        Value
                    </p>
                    <p className="font-(family-name:--font-lexend) text-primary m-0 text-sm font-bold">
                        {dealValue != null && dealValue > 0
                            ? formatDealValue(dealValue)
                            : "—"}
                    </p>
                </div>
            </div>

            <div className="border-border/60 flex items-center justify-end border-t border-dashed pt-3">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
                    {age}d in stage
                </span>
            </div>

            <div className="text-muted-foreground flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-[10px]">
                {engagement.next_action_date ? (
                    <span
                        className={cn(
                            "flex items-center gap-1",
                            followDays != null && followDays <= 3
                                ? "text-destructive font-semibold"
                                : "",
                        )}
                    >
                        <Clock className="size-3 shrink-0" />
                        {followDays != null && followDays <= 0
                            ? "Overdue"
                            : followDays != null
                              ? `${followDays}d to follow-up`
                              : "Follow-up"}
                    </span>
                ) : (
                    <span>No follow-up</span>
                )}
                <span className="text-muted-foreground/80 truncate">
                    {engagement.stage_name}
                </span>
            </div>
        </div>
    );
}
