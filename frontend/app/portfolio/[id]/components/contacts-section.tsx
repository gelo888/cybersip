"use client";

import { useState } from "react";
import {
    Users,
    Loader2,
    AlertCircle,
    Mail,
    Phone,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyContacts } from "@/hooks/use-company-detail";
import { ContactFormDialog } from "@/app/portfolio/components/contact-form-dialog";
import type { ContactSeniority, RoleInDeal } from "@/lib/types";

function SeniorityBadge({ seniority }: { seniority: ContactSeniority }) {
    const labels: Record<ContactSeniority, string> = {
        C_Suite: "C-Suite",
        VP: "VP",
        Director: "Director",
        Manager: "Manager",
    };
    const colors: Record<ContactSeniority, string> = {
        C_Suite: "bg-sophos-violet/10 text-sophos-violet",
        VP: "bg-sophos-indigo/10 text-sophos-indigo",
        Director: "bg-sophos-sky/10 text-sophos-sky",
        Manager: "bg-muted text-muted-foreground",
    };
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${colors[seniority]}`}
        >
            {labels[seniority]}
        </span>
    );
}

function RoleBadge({ role }: { role: RoleInDeal }) {
    const config: Record<RoleInDeal, { label: string; className: string }> = {
        decision_maker: {
            label: "Decision Maker",
            className: "bg-sophos-green/10 text-sophos-green",
        },
        influencer: {
            label: "Influencer",
            className: "bg-sophos-sky/10 text-sophos-sky",
        },
        champion: {
            label: "Champion",
            className: "bg-sophos-cyber-green/10 text-sophos-cyber-green",
        },
        blocker: {
            label: "Blocker",
            className: "bg-sophos-red/10 text-sophos-red",
        },
    };
    const { label, className } = config[role];
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}
        >
            {label}
        </span>
    );
}

export function CompanyContactsSection({
    companyId,
    companyName,
}: {
    companyId: string;
    companyName: string;
}) {
    const contacts = useCompanyContacts(companyId);
    const items = contacts.data?.items ?? [];
    const [addOpen, setAddOpen] = useState(false);

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Users className="text-primary size-5" />
                    <h3 className="text-base font-semibold tracking-tight">Contacts</h3>
                    {contacts.data && (
                        <span className="text-xs text-muted-foreground">
                            ({contacts.data.total})
                        </span>
                    )}
                </div>
                <Button type="button" size="sm" className="gap-1 shrink-0" onClick={() => setAddOpen(true)}>
                    <Plus className="size-4" />
                    Add contact
                </Button>
            </div>

            <ContactFormDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                scopedCompanyId={companyId}
                scopedCompanyName={companyName}
            />

            {contacts.isLoading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Loading contacts...</span>
                </div>
            )}

            {contacts.isError && (
                <div className="flex items-center justify-center py-8 text-sophos-red gap-2">
                    <AlertCircle className="size-4" />
                    <span className="text-sm">{contacts.error.message}</span>
                </div>
            )}

            {contacts.data && items.length === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No contacts linked to this company yet.
                </div>
            )}

            {contacts.data && items.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border/60 shadow-sm ring-1 ring-border/40">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-border/60 border-b">
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Name
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Title
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Seniority
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Role
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-left text-[10px] font-bold tracking-wider uppercase">
                                    Contact Info
                                </th>
                                <th className="text-muted-foreground px-6 py-4 text-center text-[10px] font-bold tracking-wider uppercase">
                                    Active
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className="hover:bg-muted/30 border-border/40 border-b transition-colors last:border-b-0"
                                >
                                    <td className="px-6 py-3 font-medium">
                                        {contact.first_name} {contact.last_name}
                                    </td>
                                    <td className="text-muted-foreground px-6 py-3">
                                        {contact.title ?? "—"}
                                    </td>
                                    <td className="px-6 py-3">
                                        {contact.seniority ? (
                                            <SeniorityBadge
                                                seniority={contact.seniority}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        {contact.role_in_deal ? (
                                            <RoleBadge
                                                role={contact.role_in_deal}
                                            />
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                                            {contact.email && (
                                                <a
                                                    href={`mailto:${contact.email}`}
                                                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                                >
                                                    <Mail className="size-3" />
                                                    {contact.email}
                                                </a>
                                            )}
                                            {contact.phone && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {contact.phone}
                                                </span>
                                            )}
                                            {!contact.email &&
                                                !contact.phone &&
                                                "—"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span
                                            className={`inline-block size-2 rounded-full ${
                                                contact.is_active
                                                    ? "bg-sophos-green"
                                                    : "bg-muted-foreground/40"
                                            }`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </section>
    );
}
