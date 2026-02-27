import { Radar, Newspaper, Shield, TrendingUp, TrendingDown, AlertTriangle, Clock, ExternalLink, Swords } from "lucide-react"

type Severity = "critical" | "high" | "medium" | "info"

const marketNews: {
  id: string
  headline: string
  source: string
  date: string
  severity: Severity
  relatedCompetitor: string | null
  impactedAccounts: number
}[] = [
  {
    id: "N-001",
    headline: "CrowdStrike announces 18% price increase effective Q3 2026",
    source: "CyberWire",
    date: "2026-02-25",
    severity: "critical",
    relatedCompetitor: "CrowdStrike",
    impactedAccounts: 48,
  },
  {
    id: "N-002",
    headline: "Palo Alto Networks reports critical vulnerability in PAN-OS (CVE-2026-1847)",
    source: "NIST NVD",
    date: "2026-02-24",
    severity: "critical",
    relatedCompetitor: "Palo Alto",
    impactedAccounts: 42,
  },
  {
    id: "N-003",
    headline: "SentinelOne loses FedRAMP authorization for Singularity XDR",
    source: "FedScoop",
    date: "2026-02-22",
    severity: "high",
    relatedCompetitor: "SentinelOne",
    impactedAccounts: 15,
  },
  {
    id: "N-004",
    headline: "Fortinet acquires cloud-native SIEM startup Observa.ai for $280M",
    source: "TechCrunch",
    date: "2026-02-20",
    severity: "medium",
    relatedCompetitor: "Fortinet",
    impactedAccounts: 22,
  },
  {
    id: "N-005",
    headline: "Gartner releases 2026 Magic Quadrant for Endpoint Protection — market shifts noted",
    source: "Gartner",
    date: "2026-02-18",
    severity: "info",
    relatedCompetitor: null,
    impactedAccounts: 0,
  },
  {
    id: "N-006",
    headline: "Cisco discontinues legacy AMP product line, forces migration to SecureX",
    source: "Cisco Blog",
    date: "2026-02-15",
    severity: "high",
    relatedCompetitor: "Cisco",
    impactedAccounts: 18,
  },
]

const competitors: {
  name: string
  accountsInplay: number
  expiringContracts: number
  recentWeakness: string
  sentiment: "positive" | "negative" | "neutral"
}[] = [
  {
    name: "CrowdStrike",
    accountsInplay: 48,
    expiringContracts: 12,
    recentWeakness: "18% price hike alienating mid-market",
    sentiment: "positive",
  },
  {
    name: "Palo Alto Networks",
    accountsInplay: 42,
    expiringContracts: 9,
    recentWeakness: "Critical PAN-OS CVE unpatched for 5 days",
    sentiment: "positive",
  },
  {
    name: "SentinelOne",
    accountsInplay: 15,
    expiringContracts: 4,
    recentWeakness: "Lost FedRAMP auth — government clients at risk",
    sentiment: "positive",
  },
  {
    name: "Fortinet",
    accountsInplay: 22,
    expiringContracts: 6,
    recentWeakness: "SIEM acquisition may cause integration friction",
    sentiment: "neutral",
  },
  {
    name: "Cisco",
    accountsInplay: 18,
    expiringContracts: 7,
    recentWeakness: "AMP EOL forces migration — displacement window",
    sentiment: "positive",
  },
  {
    name: "Trend Micro",
    accountsInplay: 11,
    expiringContracts: 3,
    recentWeakness: "Losing cloud-native market share",
    sentiment: "neutral",
  },
]

const displacementOpportunities: {
  company: string
  incumbent: string
  contractExpiry: string
  trigger: string
  priority: "high" | "medium" | "low"
}[] = [
  {
    company: "Meridian Health",
    incumbent: "CrowdStrike",
    contractExpiry: "2026-05-20",
    trigger: "Price hike — budget concern flagged by CISO",
    priority: "high",
  },
  {
    company: "Atlas Logistics",
    incumbent: "Palo Alto",
    contractExpiry: "2026-08-15",
    trigger: "CVE-2026-1847 — unpatched, client aware",
    priority: "high",
  },
  {
    company: "Federal Reserve Bank (regional)",
    incumbent: "SentinelOne",
    contractExpiry: "2026-07-01",
    trigger: "FedRAMP loss — compliance mandate at risk",
    priority: "high",
  },
  {
    company: "Nexus Pharma",
    incumbent: "Cisco",
    contractExpiry: "2026-09-10",
    trigger: "AMP EOL — forced migration creates opening",
    priority: "medium",
  },
  {
    company: "Zenith Financial",
    incumbent: "CrowdStrike",
    contractExpiry: "2026-07-01",
    trigger: "Price sensitivity — exploring alternatives",
    priority: "medium",
  },
]

function SeverityBadge({ severity }: { severity: Severity }) {
  const config = {
    critical: { label: "Critical", className: "bg-sophos-red/10 text-sophos-red" },
    high: { label: "High", className: "bg-sophos-orange/10 text-sophos-orange" },
    medium: { label: "Medium", className: "bg-sophos-yellow/10 text-sophos-orange" },
    info: { label: "Info", className: "bg-sophos-sky/10 text-sophos-sky" },
  }
  const { label, className } = config[severity]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

function SentimentIndicator({ sentiment }: { sentiment: "positive" | "negative" | "neutral" }) {
  if (sentiment === "positive") return <TrendingUp className="size-4 text-sophos-green" />
  if (sentiment === "negative") return <TrendingDown className="size-4 text-sophos-red" />
  return <span className="text-xs text-muted-foreground">—</span>
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const config = {
    high: { label: "High", className: "bg-sophos-red/10 text-sophos-red" },
    medium: { label: "Medium", className: "bg-sophos-orange/10 text-sophos-orange" },
    low: { label: "Low", className: "bg-muted text-muted-foreground" },
  }
  const { label, className } = config[priority]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function IntelligencePage() {
  return (
    <div className="p-6 space-y-8">
      {/* Market News / Action Stream */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Newspaper className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Market Signals</h3>
        </div>

        <div className="space-y-2">
          {marketNews.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/20 transition-colors">
              <div className="mt-0.5">
                <SeverityBadge severity={item.severity} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium leading-snug m-0">{item.headline}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{item.source}</span>
                  <span>{item.date}</span>
                  {item.relatedCompetitor && (
                    <span className="inline-flex items-center gap-1">
                      <Shield className="size-3 text-sophos-red" />
                      {item.relatedCompetitor}
                    </span>
                  )}
                  {item.impactedAccounts > 0 && (
                    <span>{item.impactedAccounts} accounts impacted</span>
                  )}
                </div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground/40 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </section>

      {/* Competitor Tracker */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Radar className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Competitor Tracker</h3>
          <span className="text-xs text-muted-foreground">({competitors.length} tracked)</span>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Competitor</th>
                <th className="px-4 py-3 text-center font-medium">Accounts In-Play</th>
                <th className="px-4 py-3 text-center font-medium">Expiring Contracts</th>
                <th className="px-4 py-3 text-left font-medium">Latest Weakness</th>
                <th className="px-4 py-3 text-center font-medium">Our Outlook</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr key={c.name} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield className="size-3.5 text-sophos-red" />
                      <span className="font-medium">{c.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{c.accountsInplay}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={c.expiringContracts >= 8 ? "text-sophos-orange font-semibold" : "text-muted-foreground"}>
                      {c.expiringContracts}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">
                    <span className="line-clamp-1">{c.recentWeakness}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <SentimentIndicator sentiment={c.sentiment} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Displacement Opportunities */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Swords className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Displacement Opportunities</h3>
          <span className="text-xs text-muted-foreground">Signal-driven targets</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displacementOpportunities.map((opp) => {
            const days = daysUntil(opp.contractExpiry)
            return (
              <div key={opp.company} className="rounded-lg border p-4 space-y-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{opp.company}</span>
                  <PriorityBadge priority={opp.priority} />
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Shield className="size-3 text-sophos-red" />
                  <span className="text-muted-foreground">Incumbent: {opp.incumbent}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed m-0">
                  <AlertTriangle className="inline size-3 mr-1 text-sophos-orange align-text-bottom" />
                  {opp.trigger}
                </p>

                <div className="flex items-center gap-1.5 text-xs pt-1 border-t">
                  <Clock className="size-3" />
                  <span className={days <= 90 ? "text-sophos-red font-semibold" : "text-muted-foreground"}>
                    Contract expires in {days}d
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
