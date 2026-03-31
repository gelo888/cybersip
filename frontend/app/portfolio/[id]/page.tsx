"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/hooks/use-company-detail";
import { CompanyContactsSection } from "./components/contacts-section";
import { CompanyEngagementsSection } from "./components/engagements-section";
import { CompanyContractsSection } from "./components/contracts-section";
import { CompanyIntelSection } from "./components/intel-section";
import { CompanyDetailSkeleton } from "./components/company-detail-skeleton";
import { Company360Hero } from "./components/company-360-hero";
import { CompanyEngagementVelocityChart } from "./components/company-engagement-velocity-chart";
import { Company360Sidebar } from "./components/company-360-sidebar";

const BACK_LINKS: Record<string, { href: string; label: string }> = {
    hunt: { href: "/hunt", label: "The Hunt" },
    vault: { href: "/vault", label: "Vault" },
    intelligence: { href: "/intelligence", label: "Intelligence" },
    "sales-recon": { href: "/sales-recon", label: "Sales Recon" },
    portfolio: { href: "/portfolio", label: "Portfolio" },
};

export default function CompanyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const from = searchParams.get("from") ?? "";
    const backLink = BACK_LINKS[from] ?? BACK_LINKS.portfolio;
    const company = useCompany(id);

    if (company.isLoading) {
        return <CompanyDetailSkeleton />;
    }

    if (company.isError) {
        return (
            <div className="space-y-6 p-6">
                <Link href={backLink.href}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-1 size-4" />
                        {backLink.label}
                    </Button>
                </Link>
                <div className="text-sophos-red flex items-center justify-center gap-2 py-24">
                    <AlertCircle className="size-5" />
                    <span className="text-sm">{company.error.message}</span>
                </div>
            </div>
        );
    }

    const c = company.data!;

    return (
        <div className="space-y-10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href={backLink.href}>
                    <Button variant="ghost" size="sm" className="-ml-2 gap-1">
                        <ArrowLeft className="size-4" />
                        {backLink.label}
                    </Button>
                </Link>
            </div>

            <div>
                <nav className="text-primary/70 mb-2 flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <Link href="/portfolio" className="hover:text-primary">
                        Portfolio
                    </Link>
                    <ChevronRight className="size-3 opacity-60" aria-hidden />
                    <span className="text-primary">Company 360</span>
                </nav>
                <p className="text-muted-foreground max-w-2xl text-sm">
                    Account overview, pipeline velocity, and linked contacts,
                    engagements, contracts, and competitive intel.
                </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <Company360Hero company={c} className="lg:col-span-8" />
                <div className="min-w-0 w-full lg:col-span-4">
                    <CompanyEngagementVelocityChart companyId={id} />
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                <div className="space-y-10 lg:col-span-8">
                    <CompanyContactsSection
                        companyId={id}
                        companyName={c.current_name}
                    />
                    <CompanyEngagementsSection companyId={id} />
                    <CompanyContractsSection companyId={id} />
                    <CompanyIntelSection
                        companyId={id}
                        companyName={c.current_name}
                    />
                </div>
                <div className="lg:col-span-4">
                    <Company360Sidebar companyId={id} />
                </div>
            </div>
        </div>
    );
}
