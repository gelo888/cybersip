import { Map, Users, Shield, TrendingUp, TrendingDown, Minus } from "lucide-react"

const territories = [
  {
    name: "North America Enterprise",
    region: "NAM",
    lead: "Alex Rivera",
    accounts: 34,
    pipeline: "$4.2M",
    winRate: 62,
    winTrend: "up" as const,
    status: "winning" as const,
  },
  {
    name: "EMEA Enterprise",
    region: "EMEA",
    lead: "Sophie Laurent",
    accounts: 28,
    pipeline: "$3.1M",
    winRate: 54,
    winTrend: "neutral" as const,
    status: "contested" as const,
  },
  {
    name: "DACH Mid-Market",
    region: "EMEA",
    lead: "Markus Braun",
    accounts: 19,
    pipeline: "$1.8M",
    winRate: 71,
    winTrend: "up" as const,
    status: "winning" as const,
  },
  {
    name: "APAC Enterprise",
    region: "APAC",
    lead: "Kenji Tanaka",
    accounts: 22,
    pipeline: "$2.4M",
    winRate: 38,
    winTrend: "down" as const,
    status: "under_siege" as const,
  },
  {
    name: "LATAM Emerging",
    region: "LATAM",
    lead: "Carlos Mendez",
    accounts: 15,
    pipeline: "$980K",
    winRate: 47,
    winTrend: "down" as const,
    status: "contested" as const,
  },
  {
    name: "North America Mid-Market",
    region: "NAM",
    lead: "Jordan Ellis",
    accounts: 41,
    pipeline: "$2.9M",
    winRate: 58,
    winTrend: "up" as const,
    status: "winning" as const,
  },
]

const regionSummary = [
  { region: "NAM", accounts: 75, pipeline: "$7.1M", wins: 18, losses: 6, pending: 12 },
  { region: "EMEA", accounts: 47, pipeline: "$4.9M", wins: 11, losses: 8, pending: 9 },
  { region: "APAC", accounts: 22, pipeline: "$2.4M", wins: 4, losses: 7, pending: 5 },
  { region: "LATAM", accounts: 15, pipeline: "$980K", wins: 3, losses: 4, pending: 3 },
]

const competitorPresence = [
  { region: "NAM", competitors: [{ name: "Palo Alto", count: 28 }, { name: "CrowdStrike", count: 19 }, { name: "SentinelOne", count: 12 }] },
  { region: "EMEA", competitors: [{ name: "CrowdStrike", count: 21 }, { name: "Fortinet", count: 15 }, { name: "Palo Alto", count: 9 }] },
  { region: "APAC", competitors: [{ name: "Trend Micro", count: 11 }, { name: "CrowdStrike", count: 8 }, { name: "Cisco", count: 6 }] },
  { region: "LATAM", competitors: [{ name: "Fortinet", count: 7 }, { name: "Palo Alto", count: 5 }, { name: "Cisco", count: 4 }] },
]

function StatusBadge({ status }: { status: "winning" | "contested" | "under_siege" }) {
  const config = {
    winning: { label: "Winning", className: "bg-sophos-green/10 text-sophos-green" },
    contested: { label: "Contested", className: "bg-sophos-orange/10 text-sophos-orange" },
    under_siege: { label: "Under Siege", className: "bg-sophos-red/10 text-sophos-red" },
  }
  const { label, className } = config[status]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

function TrendIndicator({ value, trend }: { value: number; trend: "up" | "down" | "neutral" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const color = trend === "up" ? "text-sophos-green" : trend === "down" ? "text-sophos-red" : "text-muted-foreground"
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${color}`}>
      {value}%
      <Icon className="size-3.5" />
    </span>
  )
}

function HeatBar({ wins, losses, pending }: { wins: number; losses: number; pending: number }) {
  const total = wins + losses + pending
  const wPct = (wins / total) * 100
  const lPct = (losses / total) * 100

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 flex rounded-full overflow-hidden bg-muted">
        <div className="bg-sophos-green h-full" style={{ width: `${wPct}%` }} />
        <div className="bg-sophos-red h-full" style={{ width: `${lPct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {wins}W / {losses}L / {pending}P
      </span>
    </div>
  )
}

export default function TerritoriesPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Region Summary Cards */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Map className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Region Overview</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {regionSummary.map((r) => (
            <div key={r.region} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{r.region}</span>
                <span className="text-xs text-muted-foreground">{r.accounts} accounts</span>
              </div>
              <div className="text-2xl font-bold text-primary">{r.pipeline}</div>
              <HeatBar wins={r.wins} losses={r.losses} pending={r.pending} />
            </div>
          ))}
        </div>
      </section>

      {/* Territory Teams Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Territory Teams</h3>
          <span className="text-xs text-muted-foreground">({territories.length})</span>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Territory</th>
                <th className="px-4 py-3 text-left font-medium">Region</th>
                <th className="px-4 py-3 text-left font-medium">Lead</th>
                <th className="px-4 py-3 text-center font-medium">Accounts</th>
                <th className="px-4 py-3 text-left font-medium">Pipeline</th>
                <th className="px-4 py-3 text-left font-medium">Win Rate</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {territories.map((t) => (
                <tr key={t.name} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.region}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.lead}</td>
                  <td className="px-4 py-3 text-center">{t.accounts}</td>
                  <td className="px-4 py-3 font-medium">{t.pipeline}</td>
                  <td className="px-4 py-3">
                    <TrendIndicator value={t.winRate} trend={t.winTrend} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Competitor Presence by Region */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Competitor Presence</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {competitorPresence.map((r) => (
            <div key={r.region} className="rounded-lg border p-4 space-y-3">
              <span className="text-sm font-bold">{r.region}</span>
              <div className="space-y-2">
                {r.competitors.map((c) => {
                  const maxCount = Math.max(...r.competitors.map((x) => x.count))
                  const pct = (c.count / maxCount) * 100
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="w-28 text-sm text-muted-foreground truncate">{c.name}</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-sophos-red/60" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-medium w-6 text-right">{c.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
