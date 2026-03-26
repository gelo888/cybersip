"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
    Telescope,
    Building2,
    Linkedin,
    Share2,
    Briefcase,
    Newspaper,
    ExternalLink,
    Info,
    Clock,
    ArrowRight,
    Users,
    Megaphone,
    Plus,
    Target,
    Cpu,
    CalendarDays,
    Focus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCompanies } from "@/hooks/use-companies"
import type { Company } from "@/lib/types"
import { CompanyFormDialog } from "@/app/portfolio/components/company-form-dialog"
import { cn } from "@/lib/utils"

type SignalSource = "linkedin" | "social" | "hiring" | "news"

interface ReconSignal {
    id: string
    source: SignalSource
    title: string
    detail: string
    capturedAt: string
    urlLabel?: string
    url?: string
}

const SOURCE_META: Record<
    SignalSource,
    { label: string; icon: typeof Linkedin; color: string }
> = {
    linkedin: {
        label: "LinkedIn & professional graph",
        icon: Linkedin,
        color: "text-[#0A66C2]",
    },
    social: {
        label: "Social & community",
        icon: Share2,
        color: "text-sky-600",
    },
    hiring: {
        label: "Hiring & careers (public)",
        icon: Briefcase,
        color: "text-violet-600",
    },
    news: {
        label: "News & public web",
        icon: Newspaper,
        color: "text-emerald-600",
    },
}

const formatEmployees = (n: number | null | undefined) => {
    if (n == null) return null
    return n.toLocaleString()
}

const statusLabel: Record<string, string> = {
    prospect: "Prospect",
    active_client: "Active Client",
    previous_client: "Previous Client",
    lost: "Lost",
    disqualified: "Disqualified",
}

const buildMockSignals = (accountName: string): ReconSignal[] => [
    {
        id: "li-1",
        source: "linkedin",
        title: "CISO & VP IT post cadence",
        detail: `Public activity from ${accountName} security leadership increased 40% QoQ — themes: “single pane of glass,” MSSP fatigue, and board reporting on ransomware readiness.`,
        capturedAt: "2026-03-24",
        urlLabel: "Search people & posts",
        url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(accountName + " cybersecurity")}`,
    },
    {
        id: "li-2",
        source: "linkedin",
        title: "Company page: partner & hiring push",
        detail: `${accountName} promoted a joint webinar with a cloud vendor and reposted three engineering hires — suggests budget unlocked for platform consolidation.`,
        capturedAt: "2026-03-20",
        urlLabel: "Find company on LinkedIn",
        url: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(accountName)}`,
    },
    {
        id: "li-3",
        source: "linkedin",
        title: "Employee advocacy thread",
        detail: `Staff posts reference an internal “security uplift” program and NIST CSF alignment — good hook for governance + managed detection narrative.`,
        capturedAt: "2026-03-17",
        urlLabel: "Search content",
        url: `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(accountName + " security program")}`,
    },
    {
        id: "so-1",
        source: "social",
        title: "X — endpoint & SOC chatter",
        detail: `Public thread compares ${accountName}’s incident response runbooks to industry peers; replies mention EDR overlap and SIEM rule debt.`,
        capturedAt: "2026-03-21",
        urlLabel: "Search posts on X",
        url: `https://x.com/search?q=${encodeURIComponent(accountName)}&src=typed_query&f=live`,
    },
    {
        id: "so-2",
        source: "social",
        title: "YouTube — keynote & analyst day",
        detail: `Recorded session: CIO cites “tool sprawl” and desire to standardize on fewer vendors by FY-end — align to TCO and analyst hours saved.`,
        capturedAt: "2026-03-08",
        urlLabel: "Search YouTube",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(accountName + " security keynote")}`,
    },
    {
        id: "so-3",
        source: "social",
        title: "Reddit / practitioner mentions",
        detail: `r/cybersecurity thread name-drops ${accountName} in context of purple-team exercises — practitioner sentiment neutral-to-positive on in-house team.`,
        capturedAt: "2026-03-05",
        urlLabel: "Search Reddit",
        url: `https://www.google.com/search?q=${encodeURIComponent("site:reddit.com " + accountName + " security")}`,
    },
    {
        id: "hi-1",
        source: "hiring",
        title: "Open reqs: cloud security & detection",
        detail: `Live listings for Senior Cloud Security Engineer, Detection & Response Manager, and IAM Architect — JD text mentions AWS, Okta, CrowdStrike, and Splunk.`,
        capturedAt: "2026-03-23",
        urlLabel: "Search jobs",
        url: `https://www.google.com/search?q=${encodeURIComponent(accountName + " careers security jobs")}`,
    },
    {
        id: "hi-2",
        source: "hiring",
        title: "GRC & third-party risk",
        detail: `New role for Third-Party Risk Lead emphasizes “scalable assurance” and “automation” — opportunity for supply-chain / vendor risk positioning.`,
        capturedAt: "2026-03-19",
        urlLabel: "Careers site search",
        url: `https://www.google.com/search?q=${encodeURIComponent(accountName + " careers third party risk")}`,
    },
    {
        id: "nw-1",
        source: "news",
        title: "Trade press — digital expansion",
        detail: `Coverage ties ${accountName} to new regional hubs and customer data platforms — raises questions on data residency, logging, and cross-border IR.`,
        capturedAt: "2026-03-18",
        urlLabel: "News search",
        url: `https://www.google.com/search?q=${encodeURIComponent(accountName + " news cybersecurity")}&tbm=nws`,
    },
    {
        id: "nw-2",
        source: "news",
        title: "Sector note — peer breach spillover",
        detail: `Analyst commentary places ${accountName} in a peer group reviewing identity controls after a competitor incident — timing for zero-trust / IdP review.`,
        capturedAt: "2026-03-12",
        urlLabel: "Analyst search",
        url: `https://www.google.com/search?q=${encodeURIComponent(accountName + " analyst cybersecurity")}`,
    },
]

const buildSampleGtmPanels = (accountName: string) => [
    {
        title: "Industry & motion",
        icon: Target,
        body: `${accountName} operates in a regulated-heavy segment with active digital transformation. Public narrative emphasizes customer trust, uptime SLAs, and reducing vendor count before fiscal year-end.`,
    },
    {
        title: "Stack signals (inferred)",
        icon: Cpu,
        body: `Job posts and event blurbs suggest a hybrid cloud footprint, Okta or similar IdP, modern EDR, and a legacy SIEM under migration. Phrases like “detection-as-code” and “SOAR playbooks” appear repeatedly.`,
    },
    {
        title: "People to watch",
        icon: Users,
        body: `Sample watchlist: CISO (promoted internally 8 months ago), Head of Infrastructure (new hire from a Fortune 500), Procurement lead attached to a recent RFI for “security operations modernization.”`,
    },
    {
        title: "Timing & budget",
        icon: CalendarDays,
        body: `Hiring velocity and conference presence imply H1 evaluation windows. Sample hypothesis: formal RFP for MDR or SIEM replacement in next two quarters; informal POCs may already be underway.`,
    },
] as const

const PLAYBOOK_ITEMS = [
    {
        title: "LinkedIn",
        body: "Public company pages, employee post themes, and role changes (where visible) — use for timing and narrative, not scraping private data.",
    },
    {
        title: "X / YouTube / forums",
        body: "Brand announcements, conference recaps, and practitioner chatter that mentions the account or its industry peers.",
    },
    {
        title: "Careers sites & job boards",
        body: "Job descriptions reveal stack keywords (SIEM, EDR, IAM) and hiring velocity as a proxy for budget and pain.",
    },
    {
        title: "News, RSS, filings",
        body: "Press releases, trade press, and (for public companies) filings — strong signals for expansion, M&A, and risk events.",
    },
] as const

const PROSPECT_CARD_PREVIEW_LIMIT = 24

const hashFromId = (id: string) => {
    let h = 0
    for (let i = 0; i < id.length; i++) {
        h = (h * 31 + id.charCodeAt(i)) >>> 0
    }
    return h
}

const buildProspectReconFields = (c: Company) => {
    const h = hashFromId(c.id)
    const signalLevels = ["High", "Elevated", "Medium"] as const
    const signalStrength = signalLevels[h % 3]
    const pulseDay = 1 + (h % 22)
    const lastPublicPulse = `2026-03-${String(pulseDay).padStart(2, "0")}`

    const gtmHooks = [
        `Executive and security voices at ${c.current_name} stress vendor consolidation — anchor on platform TCO and analyst hours reclaimed.`,
        `Hiring language at ${c.current_name} references cloud IAM and detection engineering — align POC to identity + SOC workflow metrics.`,
        `Public posts from ${c.current_name} leaders mention board reporting on ransomware — lead with resilience metrics and tabletop outcomes.`,
        `Careers copy at ${c.current_name} signals legacy SIEM migration — position detection pipeline and managed escalation paths.`,
        `Partner co-marketing from ${c.current_name} suggests ecosystem budget — map to integration roadmaps and MSSP handoffs.`,
    ]

    const whitespace = [
        `Incumbent endpoint contract rumored within 12–18 mo renewal; displacement window if value story ties to IR hours avoided.`,
        `No strong managed detection narrative visible publicly — room to own “SOC extension” without ripping out existing EDR.`,
        `Peer set is standardizing on a single XDR vendor; ${c.current_name} may follow if procurement pushes suite pricing.`,
        `Third-party risk program hiring implies upcoming RFP for GRC automation — attach security data feeds early.`,
    ]

    const nextSteps = [
        "Schedule exec briefing tied to recent LinkedIn hiring themes.",
        "Offer lightweight attack-surface review using only public data.",
        "Invite technical champion to a detection-engineering roundtable.",
        `Share case study from the same segment in ${c.country ?? "this region"}.`,
    ]

    const priority = h % 5 === 0 ? "P1 — warm" : h % 5 === 1 ? "P2 — nurture" : "P3 — watch"

    return {
        signalStrength,
        lastPublicPulse,
        gtmHook: gtmHooks[h % gtmHooks.length],
        whitespace: whitespace[h % whitespace.length],
        nextStep: nextSteps[h % nextSteps.length],
        priority,
    }
}

const SourceBadge = ({ source }: { source: SignalSource }) => {
    const meta = SOURCE_META[source]
    const Icon = meta.icon
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs font-medium ${meta.color}`}
        >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {meta.label}
        </span>
    )
}

const ReconSection = ({
    title,
    description,
    icon: Icon,
    headerAlign = "center",
    children,
}: {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    /** Prospect-style sections read better with left-aligned headers. */
    headerAlign?: "center" | "left"
    children: React.ReactNode
}) => {
    const isLeft = headerAlign === "left"
    return (
        <section className="space-y-3">
            <div
                className={cn(
                    "flex flex-col gap-1.5",
                    isLeft ? "items-start text-left" : "items-center text-center",
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-2",
                        isLeft ? "justify-start" : "justify-center",
                    )}
                >
                    <Icon className="size-5 text-primary shrink-0" aria-hidden />
                    <h3 className="text-base font-semibold leading-tight mb-0">{title}</h3>
                </div>
                <p
                    className={cn(
                        "text-xs text-muted-foreground w-full",
                        isLeft ? "text-left" : "text-center",
                    )}
                >
                    {description}
                </p>
            </div>
            {children}
        </section>
    )
}

export const SalesReconHub = () => {
    const { data: companiesData, isLoading: loadingAll } = useCompanies({
        page: 0,
        pageSize: 100,
    })
    const { data: prospectsData, isLoading: loadingProspects } = useCompanies({
        page: 0,
        pageSize: 100,
        status: "prospect",
    })

    const companies = companiesData?.items ?? []
    const prospectTotal = prospectsData?.total ?? prospectsData?.items.length ?? 0
    const prospects = prospectsData?.items ?? []

    const sortedCompanies = useMemo(
        () => [...companies].sort((a, b) => a.current_name.localeCompare(b.current_name)),
        [companies],
    )

    const sortedProspects = useMemo(
        () => [...prospects].sort((a, b) => a.current_name.localeCompare(b.current_name)),
        [prospects],
    )

    const prospectPreviewList = useMemo(
        () => sortedProspects.slice(0, PROSPECT_CARD_PREVIEW_LIMIT),
        [sortedProspects],
    )

    const isLoading = loadingAll || loadingProspects

    const [selectedId, setSelectedId] = useState<string>("")
    const [companyFormOpen, setCompanyFormOpen] = useState(false)

    const selectedCompany: Company | undefined = useMemo(
        () => sortedCompanies.find((c) => c.id === selectedId),
        [sortedCompanies, selectedId],
    )

    const accountName = selectedCompany?.current_name ?? "this account"
    const signals = useMemo(
        () => (selectedId ? buildMockSignals(accountName) : []),
        [selectedId, accountName],
    )

    const sampleGtmPanels = useMemo(
        () => (selectedId ? buildSampleGtmPanels(accountName) : []),
        [selectedId, accountName],
    )

    const signalsBySource = useMemo(() => {
        const map = new Map<SignalSource, ReconSignal[]>()
        for (const s of signals) {
            const list = map.get(s.source) ?? []
            list.push(s)
            map.set(s.source, list)
        }
        return map
    }, [signals])

    const handleCreatedCompany = (company: Company) => {
        setSelectedId(company.id)
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-8">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-full max-w-md" />
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-none p-6 space-y-10">
            <CompanyFormDialog
                open={companyFormOpen}
                onOpenChange={setCompanyFormOpen}
                onCreated={handleCreatedCompany}
            />

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Telescope className="size-5 text-primary" aria-hidden />
                    <span className="text-xs font-medium uppercase tracking-wide">
                        Account recon workspace
                    </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-none">
                    Structure sales and GTM research around a portfolio account: public professional
                    social signals, hiring language, and news — with evidence links you can open in
                    the source platforms.
                </p>
            </div>

            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 flex items-start gap-2 text-[10px] leading-snug text-amber-800 dark:text-amber-200">
                <Info className="size-3 shrink-0 mt-0.5" aria-hidden />
                <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Preview workspace</p>
                    <p className="text-sm">
                        Cards are <strong>illustrative</strong> and use the selected account name.
                        Live LinkedIn/X ingestion runs on the <strong>backend</strong> (APIs, licensed
                        data, or approved exports) — do not scrape from the browser.
                    </p>
                </div>
            </div>

            <ReconSection
                title="Prospect accounts"
                description={`CRM status = Prospect · ${prospectTotal} in portfolio · sample recon fields below`}
                icon={Focus}
                headerAlign="left"
            >
                {sortedProspects.length === 0 ? (
                    <p className="text-sm text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-left">
                        No prospect accounts yet. Mark companies as <strong>Prospect</strong> in Portfolio
                        or use <strong>New account for recon</strong> (defaults to prospect).
                    </p>
                ) : (
                    <>
                        {prospectTotal > PROSPECT_CARD_PREVIEW_LIMIT && (
                            <p className="text-[11px] text-muted-foreground">
                                Showing first {PROSPECT_CARD_PREVIEW_LIMIT} of {prospectTotal} prospects.
                                Use <strong>Target account</strong> to open any company by name.
                            </p>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {prospectPreviewList.map((c) => {
                                const fields = buildProspectReconFields(c)
                                const isSelected = selectedId === c.id
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setSelectedId(c.id)}
                                        aria-pressed={isSelected}
                                        aria-label={`Open recon for ${c.current_name}`}
                                        className={`rounded-lg border bg-card text-left p-4 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                                            isSelected
                                                ? "ring-2 ring-primary border-primary/40"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold leading-tight truncate">
                                                    {c.current_name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {fields.priority}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-md bg-sophos-sky/15 text-sophos-sky px-2 py-0.5 text-[10px] font-semibold">
                                                Prospect
                                            </span>
                                        </div>
                                        <dl className="space-y-2 text-[11px]">
                                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-muted-foreground">
                                                <dt className="sr-only">Region and segment</dt>
                                                <dd>
                                                    {c.country ?? "—"}
                                                    {c.company_size
                                                        ? ` · ${c.company_size.replace("_", " ")}`
                                                        : ""}
                                                    {c.employee_count != null
                                                        ? ` · ${c.employee_count.toLocaleString()} emp.`
                                                        : ""}
                                                </dd>
                                            </div>
                                            <div className="rounded-md bg-muted/50 px-2.5 py-1.5 space-y-1">
                                                <div className="flex justify-between gap-2">
                                                    <dt className="text-muted-foreground">
                                                        Public signal strength
                                                    </dt>
                                                    <dd className="font-medium text-foreground">
                                                        {fields.signalStrength}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <dt className="text-muted-foreground">
                                                        Last public pulse
                                                    </dt>
                                                    <dd className="font-medium tabular-nums">
                                                        {fields.lastPublicPulse}
                                                    </dd>
                                                </div>
                                            </div>
                                            <div>
                                                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                                                    GTM hook
                                                </dt>
                                                <dd className="text-muted-foreground leading-snug">
                                                    {fields.gtmHook}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                                                    Displacement whitespace
                                                </dt>
                                                <dd className="text-muted-foreground leading-snug">
                                                    {fields.whitespace}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">
                                                    Suggested next step
                                                </dt>
                                                <dd className="text-foreground font-medium leading-snug">
                                                    {fields.nextStep}
                                                </dd>
                                            </div>
                                        </dl>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
            </ReconSection>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:flex-wrap">
                <div className="space-y-2 flex-1 min-w-[min(100%,280px)] max-w-md">
                    <Label htmlFor="recon-account">Target account</Label>
                    <Select
                        value={selectedId}
                        onValueChange={setSelectedId}
                        disabled={sortedCompanies.length === 0}
                    >
                        <SelectTrigger
                            id="recon-account"
                            className="w-full"
                            aria-label="Choose portfolio company for recon"
                        >
                            <SelectValue
                                placeholder={
                                    sortedCompanies.length === 0
                                        ? "No companies yet — add one below"
                                        : "Select a company from Portfolio…"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                            {sortedCompanies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.current_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="inline-flex items-center gap-1.5"
                        onClick={() => setCompanyFormOpen(true)}
                        aria-label="Add new company for recon"
                    >
                        <Plus className="size-3.5" aria-hidden />
                        New account for recon
                    </Button>
                    {selectedCompany && (
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={`/portfolio/${selectedCompany.id}?from=sales-recon`}
                                className="inline-flex items-center gap-1"
                            >
                                Company 360
                                <ArrowRight className="size-3.5" aria-hidden />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {!selectedId && (
                <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-10 text-center space-y-3">
                    <Building2
                        className="size-10 text-muted-foreground mx-auto"
                        aria-hidden
                    />
                    <p className="text-sm font-medium">Select or add an account</p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Pick a portfolio company above, or use{" "}
                        <strong>New account for recon</strong> to create a prospect and run the sample
                        GTM layout immediately.
                    </p>
                </div>
            )}

            {selectedId && selectedCompany && (
                <>
                    <ReconSection
                        title="Portfolio snapshot"
                        description="Fields from your CRM (Portfolio)"
                        icon={Building2}
                    >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Account</p>
                                <p className="text-sm font-semibold truncate">{selectedCompany.current_name}</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Relationship</p>
                                <p className="text-sm font-medium">
                                    {statusLabel[selectedCompany.status] ?? selectedCompany.status}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Region</p>
                                <p className="text-sm font-medium">
                                    {selectedCompany.country ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Segment</p>
                                <p className="text-sm font-medium">
                                    {selectedCompany.company_size?.replace("_", " ") ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Employees</p>
                                <p className="text-sm font-medium">
                                    {formatEmployees(selectedCompany.employee_count) ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Revenue range</p>
                                <p className="text-sm font-medium truncate">
                                    {selectedCompany.revenue_range ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Ticker</p>
                                <p className="text-sm font-medium">
                                    {selectedCompany.stock_ticker ?? "—"}
                                </p>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <p className="text-xs text-muted-foreground">Web</p>
                                <p className="text-sm font-medium truncate">
                                    {selectedCompany.website ? (
                                        <a
                                            href={
                                                selectedCompany.website.startsWith("http")
                                                    ? selectedCompany.website
                                                    : `https://${selectedCompany.website}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            {selectedCompany.website}
                                            <ExternalLink className="size-3 shrink-0" aria-hidden />
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </p>
                            </div>
                        </div>
                    </ReconSection>

                    <ReconSection
                        title="Sample GTM profile"
                        description="Illustrative enrichment — not from live APIs"
                        icon={Telescope}
                    >
                        <div className="rounded-md border border-dashed border-muted-foreground/25 bg-muted/10 px-3 py-2 mb-3">
                            <p className="text-[10px] leading-snug text-muted-foreground">
                                The panels below are <strong>sample copy</strong> for demos and
                                layout review. They personalize with <strong>{accountName}</strong> but
                                do not reflect verified OSINT until backend feeds are connected.
                            </p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {sampleGtmPanels.map((panel) => (
                                <div
                                    key={panel.title}
                                    className="rounded-lg border bg-card p-4 space-y-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <panel.icon className="size-4 text-primary shrink-0" aria-hidden />
                                        <p className="text-sm font-semibold">{panel.title}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {panel.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ReconSection>

                    <ReconSection
                        title="Public signal feed"
                        description="GTM-ready snippets tied to professional social, hiring, and news sources"
                        icon={Megaphone}
                    >
                        <div className="space-y-6">
                            {(["linkedin", "social", "hiring", "news"] as const).map((key) => {
                                const items = signalsBySource.get(key) ?? []
                                if (items.length === 0) return null
                                return (
                                    <div key={key} className="space-y-2">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {SOURCE_META[key].label}
                                        </h4>
                                        <ul className="space-y-2 list-none p-0 m-0">
                                            {items.map((sig) => (
                                                <li
                                                    key={sig.id}
                                                    className="rounded-lg border bg-card px-4 py-3 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <SourceBadge source={sig.source} />
                                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="size-3" aria-hidden />
                                                            {sig.capturedAt}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium leading-snug">
                                                        {sig.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                        {sig.detail}
                                                    </p>
                                                    {sig.url && sig.urlLabel && (
                                                        <a
                                                            href={sig.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                        >
                                                            {sig.urlLabel}
                                                            <ExternalLink
                                                                className="size-3"
                                                                aria-hidden
                                                            />
                                                        </a>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    </ReconSection>

                    <ReconSection
                        title="Source playbook"
                        description="What public-layer recon typically includes (compliance-aware)"
                        icon={Users}
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            {PLAYBOOK_ITEMS.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-lg border bg-card p-4 space-y-1.5"
                                >
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ReconSection>
                </>
            )}
        </div>
    )
}
