import { Shield, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, Newspaper, LayoutDashboard, Zap } from "lucide-react"

const renewalRadar: {
  company: string
  incumbent: string
  contractEnd: string
  value: string
  territory: string
  healthScore: number
}[] = [
  { company: "Umbrella Ltd", incumbent: "Fortinet", contractEnd: "2026-03-14", value: "$285K", territory: "EMEA", healthScore: 91 },
  { company: "Globex International", incumbent: "CrowdStrike", contractEnd: "2026-04-01", value: "$220K", territory: "EMEA", healthScore: 64 },
  { company: "Meridian Health", incumbent: "CrowdStrike", contractEnd: "2026-05-20", value: "$310K", territory: "NAM", healthScore: 72 },
  { company: "Acme Corp", incumbent: "Palo Alto", contractEnd: "2026-06-15", value: "$420K", territory: "NAM", healthScore: 82 },
  { company: "Zenith Financial", incumbent: "Palo Alto", contractEnd: "2026-07-01", value: "$185K", territory: "NAM", healthScore: 58 },
  { company: "Federal Reserve (Regional)", incumbent: "SentinelOne", contractEnd: "2026-07-01", value: "$390K", territory: "NAM", healthScore: 44 },
  { company: "Atlas Logistics", incumbent: "SentinelOne", contractEnd: "2026-08-15", value: "$125K", territory: "EMEA", healthScore: 67 },
]

const regionHeatmap: {
  region: string
  wins: number
  losses: number
  active: number
  status: "winning" | "contested" | "under_siege"
}[] = [
  { region: "North America", wins: 18, losses: 6, active: 12, status: "winning" },
  { region: "EMEA", wins: 11, losses: 8, active: 9, status: "contested" },
  { region: "APAC", wins: 4, losses: 7, active: 5, status: "under_siege" },
  { region: "LATAM", wins: 3, losses: 4, active: 3, status: "contested" },
]

const actionStream: {
  id: string
  message: string
  type: "breach" | "competitor" | "renewal" | "win" | "loss"
  timestamp: string
}[] = [
  { id: "A-001", message: "Prospect 'Meridian Health' just announced a data breach — displacement window open", type: "breach", timestamp: "12 min ago" },
  { id: "A-002", message: "CrowdStrike increased prices by 18% — 48 accounts impacted in your territories", type: "competitor", timestamp: "2 hours ago" },
  { id: "A-003", message: "Umbrella Ltd contract expires in 16 days — renewal proposal not yet sent", type: "renewal", timestamp: "3 hours ago" },
  { id: "A-004", message: "Won 'Acme Corp' Pen Testing add-on — $88K closed", type: "win", timestamp: "5 hours ago" },
  { id: "A-005", message: "Palo Alto CVE-2026-1847 disclosed — 42 accounts running vulnerable PAN-OS", type: "competitor", timestamp: "1 day ago" },
  { id: "A-006", message: "Lost 'Orion Defense' to Fortinet — post-mortem available", type: "loss", timestamp: "1 day ago" },
  { id: "A-007", message: "Cisco AMP end-of-life announced — 18 accounts affected, migration window opening", type: "competitor", timestamp: "2 days ago" },
  { id: "A-008", message: "Globex International CISO requested a follow-up meeting — Stage: Initial Infiltration", type: "renewal", timestamp: "2 days ago" },
]

const kpis = [
  { label: "Active Pipeline", value: "$4.8M", change: "+12%", trend: "up" as const },
  { label: "Expiring (90d)", value: "7", change: "+2", trend: "up" as const },
  { label: "Win Rate (QTD)", value: "58%", change: "+4%", trend: "up" as const },
  { label: "Avg Deal Cycle", value: "62d", change: "-5d", trend: "down" as const },
]

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function HeatmapStatus({ status }: { status: "winning" | "contested" | "under_siege" }) {
  const config = {
    winning: { label: "Winning", className: "bg-sophos-green/10 text-sophos-green" },
    contested: { label: "Contested", className: "bg-sophos-orange/10 text-sophos-orange" },
    under_siege: { label: "Under Siege", className: "bg-sophos-red/10 text-sophos-red" },
  }
  const { label, className } = config[status]
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
}

function ActionIcon({ type }: { type: string }) {
  const config: Record<string, { icon: typeof Zap; className: string }> = {
    breach: { icon: AlertTriangle, className: "text-sophos-red" },
    competitor: { icon: Shield, className: "text-sophos-orange" },
    renewal: { icon: Clock, className: "text-sophos-sky" },
    win: { icon: TrendingUp, className: "text-sophos-green" },
    loss: { icon: TrendingDown, className: "text-sophos-red" },
  }
  const { icon: Icon, className } = config[type] ?? { icon: Zap, className: "text-muted-foreground" }
  return <Icon className={`size-4 shrink-0 ${className}`} />
}

export default function Home() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3>
          <strong>Command Center</strong>
        </h3>
        <p className="text-muted-foreground">
          Proactive dashboard — upcoming attacks and displacement opportunities.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border p-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${kpi.trend === "up" ? "text-sophos-green" : "text-sophos-red"}`}>
              {kpi.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {/* Renewal Radar */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Renewal Radar</h3>
          <span className="text-xs text-muted-foreground">Next 90 days</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-3 min-w-max">
            {renewalRadar.map((item) => {
              const days = daysUntil(item.contractEnd)
              const urgent = days <= 30
              return (
                <div key={item.company} className="w-56 shrink-0 rounded-lg border p-4 space-y-2.5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{item.company}</span>
                    <span className={`text-xs font-bold ${urgent ? "text-sophos-red" : "text-muted-foreground"}`}>
                      {days}d
                    </span>
                  </div>
                  <div className="text-lg font-bold">{item.value}</div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Shield className="size-3 text-sophos-red" />
                    <span className="text-muted-foreground">{item.incumbent}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                    <span>{item.territory}</span>
                    <span className={`font-semibold ${item.healthScore >= 70 ? "text-sophos-green" : item.healthScore >= 50 ? "text-sophos-orange" : "text-sophos-red"}`}>
                      {item.healthScore} Health
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Win/Loss Heatmap + Action Stream side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Win/Loss Heatmap */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-primary" />
            <h3 className="text-base font-semibold">Win/Loss Heatmap</h3>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium">Region</th>
                  <th className="px-4 py-2.5 text-center font-medium">W</th>
                  <th className="px-4 py-2.5 text-center font-medium">L</th>
                  <th className="px-4 py-2.5 text-center font-medium">Active</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {regionHeatmap.map((r) => (
                  <tr key={r.region} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{r.region}</td>
                    <td className="px-4 py-2.5 text-center text-sophos-green font-semibold">{r.wins}</td>
                    <td className="px-4 py-2.5 text-center text-sophos-red font-semibold">{r.losses}</td>
                    <td className="px-4 py-2.5 text-center text-muted-foreground">{r.active}</td>
                    <td className="px-4 py-2.5"><HeatmapStatus status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Action Stream */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Newspaper className="size-5 text-primary" />
            <h3 className="text-base font-semibold">Action Stream</h3>
          </div>

          <div className="rounded-lg border divide-y max-h-[340px] overflow-y-auto">
            {actionStream.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="mt-0.5">
                  <ActionIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug m-0">{item.message}</p>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
