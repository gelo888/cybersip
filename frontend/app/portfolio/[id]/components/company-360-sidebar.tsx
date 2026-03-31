"use client";

import Link from "next/link";
import {
    Crosshair,
    FileText,
    LayoutList,
    Shield,
    Users,
} from "lucide-react";

import {
    useCompanyContacts,
    useCompanyContracts,
    useCompanyEngagements,
    useCompanyIntel,
} from "@/hooks/use-company-detail";

export function Company360Sidebar({ companyId }: { companyId: string }) {
    const contacts = useCompanyContacts(companyId);
    const engagements = useCompanyEngagements(companyId);
    const contracts = useCompanyContracts(companyId);
    const intel = useCompanyIntel(companyId);

    const contactTotal = contacts.data?.total ?? "—";
    const engCount = engagements.data?.length ?? "—";
    const contractCount = contracts.data?.length ?? "—";
    const intelCount = intel.data?.length ?? "—";

    const loading =
        contacts.isLoading ||
        engagements.isLoading ||
        contracts.isLoading ||
        intel.isLoading;

    const rows = [
        {
            label: "Contacts",
            value: loading ? "…" : contactTotal,
            icon: Users,
        },
        {
            label: "Engagements",
            value: loading ? "…" : engCount,
            icon: LayoutList,
        },
        {
            label: "Contracts",
            value: loading ? "…" : contractCount,
            icon: FileText,
        },
        {
            label: "Intel records",
            value: loading ? "…" : intelCount,
            icon: Shield,
        },
    ];

    return (
        <div className="lg:sticky lg:top-20 space-y-4">
            <div className="bg-card overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
                <div className="bg-primary h-0.5 w-full shrink-0" aria-hidden />
                <div className="border-border/50 bg-muted/45 border-b px-4 py-3 dark:bg-muted/25">
                    <h3 className="font-(family-name:--font-lexend) text-sm font-semibold tracking-tight">
                        Account snapshot
                    </h3>
                    <p className="text-muted-foreground m-0 text-xs">
                        Counts from live data on this company
                    </p>
                </div>
                <ul className="divide-border/50 divide-y p-2">
                    {rows.map(({ label, value, icon: Icon }) => (
                        <li
                            key={label}
                            className="flex items-center gap-3 px-3 py-3"
                        >
                            <div className="bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-lg">
                                <Icon className="text-primary size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                                    {label}
                                </p>
                                <p className="font-(family-name:--font-lexend) text-lg font-bold tabular-nums">
                                    {value}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-card rounded-xl border border-border/60 p-4 shadow-sm ring-1 ring-border/40">
                <p className="text-muted-foreground mb-3 text-[10px] font-bold tracking-widest uppercase">
                    Jump to
                </p>
                <nav className="flex flex-col gap-1">
                    <Link
                        href={`/hunt?company_id=${companyId}`}
                        className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                        <Crosshair className="size-4 shrink-0" />
                        Hunt (this company)
                    </Link>
                    <Link
                        href="/vault"
                        className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                        <FileText className="size-4 shrink-0" />
                        Vault
                    </Link>
                    <Link
                        href="/intelligence"
                        className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                        <Shield className="size-4 shrink-0" />
                        Intelligence Hub
                    </Link>
                    <Link
                        href="/portfolio"
                        className="text-muted-foreground hover:bg-muted/50 hover:text-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                        <Users className="size-4 shrink-0" />
                        Portfolio directory
                    </Link>
                </nav>
            </div>
        </div>
    );
}
