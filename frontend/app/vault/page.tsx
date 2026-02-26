import { Lock, FileText, FileSignature, Clock, CheckCircle2, AlertTriangle, XCircle, Send } from "lucide-react"

const contracts = [
  {
    id: "CTR-001",
    company: "Acme Corp",
    type: "Managed SIEM",
    value: "$420,000",
    startDate: "2024-07-01",
    endDate: "2026-06-30",
    status: "active" as const,
    autoRenew: true,
  },
  {
    id: "CTR-002",
    company: "Umbrella Ltd",
    type: "EDR + Pen Testing",
    value: "$285,000",
    startDate: "2025-01-15",
    endDate: "2026-03-14",
    status: "expiring" as const,
    autoRenew: false,
  },
  {
    id: "CTR-003",
    company: "Globex International",
    type: "Pen Testing",
    value: "$95,000",
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    status: "active" as const,
    autoRenew: true,
  },
  {
    id: "CTR-004",
    company: "Initech Systems",
    type: "Full Stack Security",
    value: "$610,000",
    startDate: "2024-10-01",
    endDate: "2026-09-30",
    status: "active" as const,
    autoRenew: false,
  },
  {
    id: "CTR-005",
    company: "Stark Industries",
    type: "EDR",
    value: "$150,000",
    startDate: "2023-12-01",
    endDate: "2025-11-30",
    status: "expired" as const,
    autoRenew: false,
  },
]

const proposals = [
  {
    id: "PRP-101",
    company: "Umbrella Ltd",
    title: "Renewal + EDR Upsell",
    value: "$340,000",
    sentDate: "2026-02-10",
    status: "sent" as const,
    expiresIn: 18,
  },
  {
    id: "PRP-102",
    company: "Stark Industries",
    title: "Full Stack Displacement",
    value: "$520,000",
    sentDate: "2026-02-20",
    status: "draft" as const,
    expiresIn: null,
  },
  {
    id: "PRP-103",
    company: "Wayne Enterprises",
    title: "Managed SIEM Greenfield",
    value: "$275,000",
    sentDate: "2026-01-28",
    status: "viewed" as const,
    expiresIn: 5,
  },
  {
    id: "PRP-104",
    company: "Acme Corp",
    title: "Pen Testing Add-on",
    value: "$88,000",
    sentDate: "2026-02-05",
    status: "accepted" as const,
    expiresIn: null,
  },
  {
    id: "PRP-105",
    company: "Oscorp",
    title: "EDR Competitive Displacement",
    value: "$195,000",
    sentDate: "2026-01-15",
    status: "rejected" as const,
    expiresIn: null,
  },
]

function ContractStatusBadge({ status }: { status: "active" | "expiring" | "expired" }) {
  const config = {
    active: { label: "Active", icon: CheckCircle2, className: "bg-sophos-green/10 text-sophos-green" },
    expiring: { label: "Expiring Soon", icon: AlertTriangle, className: "bg-sophos-orange/10 text-sophos-orange" },
    expired: { label: "Expired", icon: XCircle, className: "bg-sophos-red/10 text-sophos-red" },
  }
  const { label, icon: Icon, className } = config[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
      <Icon className="size-3" />
      {label}
    </span>
  )
}

function ProposalStatusBadge({ status }: { status: "draft" | "sent" | "viewed" | "accepted" | "rejected" }) {
  const config = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    sent: { label: "Sent", className: "bg-sophos-sky/10 text-sophos-sky" },
    viewed: { label: "Viewed", className: "bg-sophos-orange/10 text-sophos-orange" },
    accepted: { label: "Accepted", className: "bg-sophos-green/10 text-sophos-green" },
    rejected: { label: "Rejected", className: "bg-sophos-red/10 text-sophos-red" },
  }
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function VaultPage() {
  const activeValue = contracts
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + parseInt(c.value.replace(/[$,]/g, "")), 0)
  const proposalPipeline = proposals
    .filter((p) => p.status === "sent" || p.status === "viewed")
    .reduce((sum, p) => sum + parseInt(p.value.replace(/[$,]/g, "")), 0)

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3>
          <strong>Vault</strong>
        </h3>
        <p className="text-muted-foreground">
          Contracts &amp; Proposals — your revenue foundation.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Active Contracts</span>
          <div className="text-2xl font-bold">{contracts.filter((c) => c.status === "active").length}</div>
          <span className="text-sm text-muted-foreground">${activeValue.toLocaleString()} total value</span>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Expiring (90 days)</span>
          <div className="text-2xl font-bold text-sophos-orange">{contracts.filter((c) => c.status === "expiring").length}</div>
          <span className="text-sm text-muted-foreground">Requires renewal action</span>
        </div>
        <div className="rounded-lg border p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Open Proposals</span>
          <div className="text-2xl font-bold text-primary">{proposals.filter((p) => p.status === "sent" || p.status === "viewed").length}</div>
          <span className="text-sm text-muted-foreground">${proposalPipeline.toLocaleString()} pending</span>
        </div>
      </div>

      {/* Contracts Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FileSignature className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Contracts</h3>
          <span className="text-xs text-muted-foreground">({contracts.length})</span>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Value</th>
                <th className="px-4 py-3 text-left font-medium">End Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Auto-Renew</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const days = daysUntil(c.endDate)
                const expiryColor = c.status === "expired" ? "text-sophos-red" : days <= 90 ? "text-sophos-orange font-semibold" : ""
                return (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                    <td className="px-4 py-3 font-medium">{c.value}</td>
                    <td className="px-4 py-3">
                      <span className={expiryColor}>
                        <Clock className="inline size-3.5 mr-1 align-text-bottom" />
                        {c.endDate}
                        {c.status !== "expired" && <span className="text-xs ml-1">({days}d)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ContractStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.autoRenew ? (
                        <span className="text-sophos-green text-xs font-medium">Yes</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Proposals Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Send className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Proposals</h3>
          <span className="text-xs text-muted-foreground">({proposals.length})</span>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Value</th>
                <th className="px-4 py-3 text-left font-medium">Sent</th>
                <th className="px-4 py-3 text-left font-medium">Expires In</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                  <td className="px-4 py-3 font-medium">{p.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.title}</td>
                  <td className="px-4 py-3 font-medium">{p.value}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sentDate}</td>
                  <td className="px-4 py-3">
                    {p.expiresIn !== null ? (
                      <span className={p.expiresIn <= 7 ? "text-sophos-red font-semibold" : "text-muted-foreground"}>
                        {p.expiresIn}d
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ProposalStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
