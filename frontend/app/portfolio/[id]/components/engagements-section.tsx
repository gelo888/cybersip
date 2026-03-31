"use client";

import { useState } from "react";
import {
    MessageSquare,
    Loader2,
    AlertCircle,
    Phone,
    Mail,
    Video,
    Monitor,
    Plus,
    Pencil,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyEngagements } from "@/hooks/use-company-detail";
import { useStages } from "@/hooks/use-stages";
import { useDeleteEngagement } from "@/hooks/use-engagements";
import { EngagementFormDialog } from "@/app/hunt/components/engagement-form-dialog";
import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog";
import type { Engagement, EngagementType } from "@/lib/types";

const typeConfig: Record<
    EngagementType,
    {
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        className: string;
    }
> = {
    call: {
        label: "Call",
        icon: Phone,
        className: "bg-sophos-sky/10 text-sophos-sky",
    },
    email: {
        label: "Email",
        icon: Mail,
        className: "bg-sophos-violet/10 text-sophos-violet",
    },
    meeting: {
        label: "Meeting",
        icon: Video,
        className: "bg-sophos-green/10 text-sophos-green",
    },
    demo: {
        label: "Demo",
        icon: Monitor,
        className: "bg-sophos-orange/10 text-sophos-orange",
    },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function CompanyEngagementsSection({
    companyId,
}: {
    companyId: string;
}) {
    const engagements = useCompanyEngagements(companyId);
    const stagesQuery = useStages();
    const deleteMutation = useDeleteEngagement();
    const items = engagements.data ?? [];
    const stages = stagesQuery.data ?? [];

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Engagement | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Engagement | null>(null);

    function openCreate() {
        setEditTarget(null);
        setFormOpen(true);
    }

    function openEdit(eng: Engagement) {
        setEditTarget(eng);
        setFormOpen(true);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    const canAdd = stages.length > 0;

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <MessageSquare className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-tight">Engagements</h3>
                {engagements.data && (
                    <span className="text-xs text-muted-foreground">
                        ({items.length})
                    </span>
                )}
                <div className="ml-auto">
                    <Button
                        size="sm"
                        onClick={openCreate}
                        disabled={!canAdd || engagements.isLoading}
                    >
                        <Plus className="size-4 mr-1" />
                        Add Engagement
                    </Button>
                </div>
            </div>

            {!canAdd && stagesQuery.isSuccess && (
                <p className="text-xs text-muted-foreground">
                    Add pipeline stages in settings or seed data before logging
                    engagements.
                </p>
            )}

            {engagements.isLoading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading engagements...</span>
                </div>
            )}

            {engagements.isError && (
                <div className="flex items-center justify-center py-8 text-sophos-red gap-2">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">
                        {engagements.error.message}
                    </span>
                </div>
            )}

            {engagements.data && items.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground space-y-3">
                    <p>No engagements recorded yet.</p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={openCreate}
                        disabled={!canAdd}
                    >
                        <Plus className="size-4 mr-1" />
                        Add Engagement
                    </Button>
                </div>
            )}

            {engagements.data && items.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-border/60 border-b">
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Stage
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Type
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Outcome
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Next action
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Date
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((eng) => {
                                const cfg = typeConfig[eng.type];
                                const Icon = cfg.icon;
                                return (
                                    <tr
                                        key={eng.id}
                                        className="hover:bg-muted/30 border-border/40 border-b transition-colors last:border-b-0"
                                    >
                                        <td className="text-muted-foreground px-6 py-3">
                                            {eng.stage_name}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
                                            >
                                                <Icon className="size-3" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="text-muted-foreground max-w-xs truncate px-6 py-3">
                                            {eng.outcome ?? "—"}
                                        </td>
                                        <td className="text-muted-foreground px-6 py-3">
                                            {eng.next_action_date
                                                ? formatDate(
                                                      eng.next_action_date,
                                                  )
                                                : "—"}
                                        </td>
                                        <td className="text-muted-foreground px-6 py-3">
                                            {formatDate(eng.created_at)}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() => openEdit(eng)}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-xs"
                                                    onClick={() =>
                                                        setDeleteTarget(eng)
                                                    }
                                                >
                                                    <Trash2 className="size-3.5 text-sophos-red" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            <EngagementFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                engagement={editTarget}
                stages={stages}
                scopedCompanyId={companyId}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                entityName={
                    deleteTarget
                        ? `${typeConfig[deleteTarget.type].label} engagement`
                        : ""
                }
                onConfirm={confirmDelete}
                isPending={deleteMutation.isPending}
                error={
                    deleteMutation.isError
                        ? deleteMutation.error.message
                        : null
                }
            />
        </section>
    );
}
