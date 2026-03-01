"use client";

import { FileText, Loader2, AlertCircle } from "lucide-react";
import { useCompanyContracts } from "@/hooks/use-company-detail";
import type { ContractStatus, ContractType } from "@/lib/types";

function ContractStatusBadge({ status }: { status: ContractStatus }) {
    const config: Record<ContractStatus, { label: string; className: string }> =
        {
            active: {
                label: "Active",
                className: "bg-sophos-green/10 text-sophos-green",
            },
            pending: {
                label: "Pending",
                className: "bg-sophos-orange/10 text-sophos-orange",
            },
            renewed: {
                label: "Renewed",
                className: "bg-sophos-sky/10 text-sophos-sky",
            },
            expired: {
                label: "Expired",
                className: "bg-muted text-muted-foreground",
            },
        };
    const { label, className } = config[status];
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

function ContractTypeBadge({ type }: { type: ContractType }) {
    const isOurs = type === "our_contract";
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                isOurs
                    ? "bg-primary/10 text-primary"
                    : "bg-sophos-red/10 text-sophos-red"
            }`}
        >
            {isOurs ? "Our Contract" : "Competitor"}
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

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function CompanyContractsSection({
    companyId,
}: {
    companyId: string;
}) {
    const contracts = useCompanyContracts(companyId);
    const items = contracts.data ?? [];

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Contracts</h3>
                {contracts.data && (
                    <span className="text-xs text-muted-foreground">
                        ({items.length})
                    </span>
                )}
            </div>

            {contracts.isLoading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading contracts...</span>
                </div>
            )}

            {contracts.isError && (
                <div className="flex items-center justify-center py-8 text-sophos-red gap-2">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">{contracts.error.message}</span>
                </div>
            )}

            {contracts.data && items.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No contracts on file.
                </div>
            )}

            {contracts.data && items.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-3 text-left font-medium">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Value
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Start
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    End
                                </th>
                                <th className="px-4 py-3 text-center font-medium">
                                    Renewal Notice
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((contract) => (
                                <tr
                                    key={contract.id}
                                    className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <ContractTypeBadge
                                            type={contract.type}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <ContractStatusBadge
                                            status={contract.status}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {contract.total_value != null
                                            ? formatCurrency(
                                                  contract.total_value,
                                              )
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {contract.start_date
                                            ? formatDate(contract.start_date)
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {contract.end_date
                                            ? formatDate(contract.end_date)
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">
                                        {contract.renewal_notice_days != null
                                            ? `${contract.renewal_notice_days}d`
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
