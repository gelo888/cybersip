"use client";

import { Shield, Loader2, AlertCircle } from "lucide-react";
import { useCompanyIntel } from "@/hooks/use-company-detail";
import type { IntelConfidence } from "@/lib/types";

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

export function CompanyIntelSection({ companyId }: { companyId: string }) {
    const intel = useCompanyIntel(companyId);
    const items = intel.data ?? [];

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Competitor Intel</h3>
                {intel.data && (
                    <span className="text-xs text-muted-foreground">
                        ({items.length})
                    </span>
                )}
            </div>

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
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No competitor intelligence gathered yet.
                </div>
            )}

            {intel.data && items.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-3 text-left font-medium">
                                    Product
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Confidence
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Contract End
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {record.product_name ?? "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <ConfidenceBadge
                                            confidence={record.confidence}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {record.contract_end
                                            ? formatDate(record.contract_end)
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
