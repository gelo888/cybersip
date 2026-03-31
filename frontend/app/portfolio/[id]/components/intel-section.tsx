"use client";

import { useState } from "react";
import {
    Shield,
    Loader2,
    AlertCircle,
    Plus,
    Pencil,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany, useCompanyIntel } from "@/hooks/use-company-detail";
import { useCompetitors } from "@/hooks/use-competitors";
import { useDeleteIntel } from "@/hooks/use-intel";
import { IntelFormDialog } from "@/app/intelligence/components/intel-form-dialog";
import { DeleteConfirmDialog } from "@/app/portfolio/components/delete-confirm-dialog";
import type { CompetitorIntel, IntelConfidence } from "@/lib/types";

function ConfidenceBadge({ confidence }: { confidence: IntelConfidence }) {
    const config: Record<
        IntelConfidence,
        { label: string; className: string }
    > = {
        confirmed: {
            label: "Confirmed",
            className: "bg-sophos-green/10 text-sophos-green",
        },
        rumor: {
            label: "Rumor",
            className: "bg-sophos-orange/10 text-sophos-orange",
        },
        inferred: {
            label: "Inferred",
            className: "bg-sophos-sky/10 text-sophos-sky",
        },
    };
    const { label, className } = config[confidence];
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function CompanyIntelSection({
    companyId,
    companyName,
}: {
    companyId: string;
    companyName: string;
}) {
    const intel = useCompanyIntel(companyId);
    const companyDetail = useCompany(companyId);
    const competitorsQuery = useCompetitors();
    const deleteMutation = useDeleteIntel();
    const items = intel.data ?? [];
    const competitors = competitorsQuery.data ?? [];

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CompetitorIntel | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CompetitorIntel | null>(
        null,
    );

    const companiesForDialog =
        companyDetail.data != null ? [companyDetail.data] : [];

    function openCreate() {
        setEditTarget(null);
        setFormOpen(true);
    }

    function openEdit(record: CompetitorIntel) {
        setEditTarget(record);
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
            <div className="flex items-center gap-2">
                <Shield className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-tight">Competitor intel</h3>
                {intel.data && (
                    <span className="text-xs text-muted-foreground">
                        ({items.length})
                    </span>
                )}
                <div className="ml-auto">
                    <Button
                        size="sm"
                        onClick={openCreate}
                        disabled={
                            intel.isLoading ||
                            competitors.length === 0 ||
                            !companyDetail.data
                        }
                    >
                        <Plus className="size-4 mr-1" />
                        Log Intel
                    </Button>
                </div>
            </div>

            {competitorsQuery.isSuccess && competitors.length === 0 && (
                <p className="text-xs text-muted-foreground">
                    Add competitors on the Intelligence page before logging intel
                    here.
                </p>
            )}

            {intel.isLoading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading intel...</span>
                </div>
            )}

            {intel.isError && (
                <div className="flex items-center justify-center py-8 text-sophos-red gap-2">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">{intel.error.message}</span>
                </div>
            )}

            {intel.data && items.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground space-y-3">
                    <p>No competitor intelligence gathered yet.</p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={openCreate}
                        disabled={
                            competitors.length === 0 || !companyDetail.data
                        }
                    >
                        <Plus className="size-4 mr-1" />
                        Log Intel
                    </Button>
                </div>
            )}

            {intel.data && items.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-border/60 border-b">
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Competitor
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Product
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Confidence
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Contract end
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-right text-[10px] font-bold tracking-wider uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((record) => (
                                <tr
                                    key={record.id}
                                    className="hover:bg-muted/30 border-border/40 border-b transition-colors last:border-b-0"
                                >
                                    <td className="px-6 py-3 font-medium">
                                        {record.competitor_name}
                                    </td>
                                    <td className="px-6 py-3 font-medium">
                                        {record.product_name ?? "—"}
                                    </td>
                                    <td className="px-6 py-3">
                                        <ConfidenceBadge
                                            confidence={record.confidence}
                                        />
                                    </td>
                                    <td className="text-muted-foreground px-6 py-3">
                                        {record.contract_end
                                            ? formatDate(record.contract_end)
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    openEdit(record)
                                                }
                                            >
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() =>
                                                    setDeleteTarget(record)
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
                    </div>
                </div>
            )}

            <IntelFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                intel={editTarget}
                companies={companiesForDialog}
                competitors={competitors}
                scopedCompanyId={editTarget ? undefined : companyId}
                scopedCompanyName={companyName}
            />

            <DeleteConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                entityName={
                    deleteTarget
                        ? `${deleteTarget.competitor_name} intel`
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
