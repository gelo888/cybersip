"use client";

import {
    MessageSquare,
    Loader2,
    AlertCircle,
    Phone,
    Mail,
    Video,
    Monitor,
} from "lucide-react";
import { useCompanyEngagements } from "@/hooks/use-company-detail";
import type { EngagementType } from "@/lib/types";

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
    const items = engagements.data ?? [];

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                <h3 className="text-base font-semibold">Engagements</h3>
                {engagements.data && (
                    <span className="text-xs text-muted-foreground">
                        ({items.length})
                    </span>
                )}
            </div>

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
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No engagements recorded yet.
                </div>
            )}

            {engagements.data && items.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-3 text-left font-medium">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Outcome
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Next Action
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    Date
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
                                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
                                            >
                                                <Icon className="size-3" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                                            {eng.outcome ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {eng.next_action_date
                                                ? formatDate(
                                                      eng.next_action_date,
                                                  )
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDate(eng.created_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
