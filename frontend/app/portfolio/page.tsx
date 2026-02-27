import { Building2, User2, Shield, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"

const companies = [
  {
    name: "Acme Corp",
    domain: "acme.com",
    industry: "Financial Services",
    territory: "North America",
    incumbent: "Palo Alto Networks",
    contractEnd: "2026-06-15",
    healthScore: 82,
    healthTrend: "up" as const,
    contacts: 4,
    products: ["EDR", "Managed SIEM"],
  },
  {
    name: "Globex International",
    domain: "globex.io",
    industry: "Healthcare",
    territory: "EMEA",
    incumbent: "CrowdStrike",
    contractEnd: "2026-04-01",
    healthScore: 64,
    healthTrend: "down" as const,
    contacts: 2,
    products: ["Pen Testing"],
  },
  {
    name: "Initech Systems",
    domain: "initech.dev",
    industry: "Technology",
    territory: "APAC",
    incumbent: "SentinelOne",
    contractEnd: "2026-09-30",
    healthScore: 71,
    healthTrend: "neutral" as const,
    contacts: 3,
    products: ["EDR", "Pen Testing", "Managed SIEM"],
  },
  {
    name: "Umbrella Ltd",
    domain: "umbrella.co",
    industry: "Pharmaceuticals",
    territory: "EMEA",
    incumbent: "Fortinet",
    contractEnd: "2026-03-12",
    healthScore: 91,
    healthTrend: "up" as const,
    contacts: 5,
    products: ["Managed SIEM"],
  },
  {
    name: "Stark Industries",
    domain: "stark.tech",
    industry: "Defense & Aerospace",
    territory: "North America",
    incumbent: "Cisco",
    contractEnd: "2026-12-01",
    healthScore: 45,
    healthTrend: "down" as const,
    contacts: 1,
    products: [],
  },
]

const contacts = [
  { name: "Sarah Chen", title: "CISO", company: "Acme Corp", role: "Champion", lastContact: "2 days ago" },
  { name: "Marcus Webb", title: "VP Security", company: "Umbrella Ltd", role: "Decision Maker", lastContact: "1 week ago" },
  { name: "Priya Sharma", title: "IT Director", company: "Globex International", role: "Blocker", lastContact: "3 weeks ago" },
  { name: "James Park", title: "Security Architect", company: "Initech Systems", role: "Champion", lastContact: "5 days ago" },
  { name: "Elena Voss", title: "CTO", company: "Stark Industries", role: "Decision Maker", lastContact: "1 month ago" },
]

function HealthBadge({ score, trend }: { score: number; trend: "up" | "down" | "neutral" }) {
  const color =
    score >= 80 ? "text-sophos-green bg-sophos-green/10" :
    score >= 60 ? "text-sophos-orange bg-sophos-orange/10" :
    "text-sophos-red bg-sophos-red/10"

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${color}`}>
      {score}
      <TrendIcon className="size-3" />
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const color =
    role === "Champion" ? "bg-sophos-green/10 text-sophos-green" :
    role === "Decision Maker" ? "bg-sophos-cyber-blue/10 text-sophos-sky" :
    "bg-sophos-red/10 text-sophos-red"

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {role}
    </span>
  )
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function PortfolioPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Companies Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Companies</h3>
          <span className="text-xs text-muted-foreground">({companies.length})</span>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Industry</th>
                <th className="px-4 py-3 text-left font-medium">Territory</th>
                <th className="px-4 py-3 text-left font-medium">Incumbent</th>
                <th className="px-4 py-3 text-left font-medium">Contract Expiry</th>
                <th className="px-4 py-3 text-left font-medium">Health</th>
                <th className="px-4 py-3 text-center font-medium">Contacts</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const days = daysUntil(company.contractEnd)
                const expiryColor = days <= 60 ? "text-sophos-red font-semibold" : days <= 120 ? "text-sophos-orange" : ""

                return (
                  <tr key={company.domain} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{company.name}</span>
                        <span className="block text-xs text-muted-foreground">{company.domain}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{company.industry}</td>
                    <td className="px-4 py-3 text-muted-foreground">{company.territory}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Shield className="size-3.5 text-sophos-red" />
                        {company.incumbent}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={expiryColor}>
                        <Clock className="inline size-3.5 mr-1 align-text-bottom" />
                        {days}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <HealthBadge score={company.healthScore} trend={company.healthTrend} />
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{company.contacts}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contacts Table */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <User2 className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Key Contacts</h3>
          <span className="text-xs text-muted-foreground">({contacts.length})</span>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Last Contact</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.name} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{contact.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.company}</td>
                  <td className="px-4 py-3"><RoleBadge role={contact.role} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{contact.lastContact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
