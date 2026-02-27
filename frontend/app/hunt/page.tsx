import { Shield, Clock, GripVertical } from "lucide-react"

type Stage =
  | "intelligence_gathering"
  | "vulnerability_identified"
  | "initial_infiltration"
  | "proof_of_concept"
  | "final_assault"
  | "extraction"

const columns: { id: Stage; label: string; description: string }[] = [
  { id: "intelligence_gathering", label: "Intelligence Gathering", description: "Researching targets" },
  { id: "vulnerability_identified", label: "Vulnerability Identified", description: "Renewal approaching" },
  { id: "initial_infiltration", label: "Initial Infiltration", description: "First meeting" },
  { id: "proof_of_concept", label: "Proof of Concept", description: "Demonstrating value" },
  { id: "final_assault", label: "Final Assault", description: "Proposal submitted" },
  { id: "extraction", label: "Extraction", description: "Competitor removed" },
]

const deals: {
  id: string
  company: string
  value: string
  incumbent: string
  daysInStage: number
  owner: string
  contractExpiry: string
  stage: Stage
  priority: "high" | "medium" | "low"
}[] = [
  {
    id: "HNT-001",
    company: "Meridian Health",
    value: "$310,000",
    incumbent: "CrowdStrike",
    daysInStage: 3,
    owner: "Alex Rivera",
    contractExpiry: "2026-05-20",
    stage: "intelligence_gathering",
    priority: "high",
  },
  {
    id: "HNT-002",
    company: "Zenith Financial",
    value: "$185,000",
    incumbent: "Palo Alto",
    daysInStage: 8,
    owner: "Sophie Laurent",
    contractExpiry: "2026-07-01",
    stage: "intelligence_gathering",
    priority: "medium",
  },
  {
    id: "HNT-003",
    company: "Umbrella Ltd",
    value: "$340,000",
    incumbent: "Fortinet",
    daysInStage: 12,
    owner: "Sophie Laurent",
    contractExpiry: "2026-03-14",
    stage: "vulnerability_identified",
    priority: "high",
  },
  {
    id: "HNT-004",
    company: "Atlas Logistics",
    value: "$125,000",
    incumbent: "SentinelOne",
    daysInStage: 5,
    owner: "Markus Braun",
    contractExpiry: "2026-08-15",
    stage: "vulnerability_identified",
    priority: "low",
  },
  {
    id: "HNT-005",
    company: "Globex International",
    value: "$220,000",
    incumbent: "CrowdStrike",
    daysInStage: 18,
    owner: "Alex Rivera",
    contractExpiry: "2026-04-01",
    stage: "initial_infiltration",
    priority: "high",
  },
  {
    id: "HNT-006",
    company: "Nexus Pharma",
    value: "$410,000",
    incumbent: "Cisco",
    daysInStage: 7,
    owner: "Kenji Tanaka",
    contractExpiry: "2026-09-10",
    stage: "initial_infiltration",
    priority: "medium",
  },
  {
    id: "HNT-007",
    company: "Initech Systems",
    value: "$610,000",
    incumbent: "SentinelOne",
    daysInStage: 22,
    owner: "Jordan Ellis",
    contractExpiry: "2026-09-30",
    stage: "proof_of_concept",
    priority: "high",
  },
  {
    id: "HNT-008",
    company: "Stark Industries",
    value: "$520,000",
    incumbent: "Cisco",
    daysInStage: 14,
    owner: "Alex Rivera",
    contractExpiry: "2026-12-01",
    stage: "final_assault",
    priority: "medium",
  },
  {
    id: "HNT-009",
    company: "Acme Corp",
    value: "$88,000",
    incumbent: "Palo Alto",
    daysInStage: 2,
    owner: "Sophie Laurent",
    contractExpiry: "2026-06-30",
    stage: "extraction",
    priority: "high",
  },
]

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function PriorityDot({ priority }: { priority: "high" | "medium" | "low" }) {
  const color =
    priority === "high" ? "bg-sophos-red" :
    priority === "medium" ? "bg-sophos-orange" :
    "bg-sophos-steel"
  return <span className={`inline-block size-2 rounded-full ${color}`} />
}

function DealCard({ deal }: { deal: (typeof deals)[number] }) {
  const expiryDays = daysUntil(deal.contractExpiry)
  const expiryUrgent = expiryDays <= 60

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <PriorityDot priority={deal.priority} />
          <span className="font-medium text-sm truncate">{deal.company}</span>
        </div>
        <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
      </div>

      <div className="text-lg font-bold">{deal.value}</div>

      <div className="flex items-center gap-1.5 text-xs">
        <Shield className="size-3 text-sophos-red" />
        <span className="text-muted-foreground">{deal.incumbent}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <Clock className="size-3" />
        <span className={expiryUrgent ? "text-sophos-red font-semibold" : "text-muted-foreground"}>
          {expiryDays}d to expiry
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t">
        <span className="text-xs text-muted-foreground">{deal.owner}</span>
        <span className="text-xs text-muted-foreground">{deal.daysInStage}d in stage</span>
      </div>
    </div>
  )
}

export default function HuntPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-max">
          {columns.map((col) => {
            const colDeals = deals.filter((d) => d.stage === col.id)
            const colValue = colDeals.reduce((sum, d) => sum + parseInt(d.value.replace(/[$,]/g, "")), 0)

            return (
              <div key={col.id} className="w-72 shrink-0 flex flex-col">
                {/* Column Header */}
                <div className="rounded-t-lg bg-muted/50 border border-b-0 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{col.label}</span>
                    <span className="flex items-center justify-center size-5 rounded-full bg-muted text-xs font-medium">
                      {colDeals.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground">{col.description}</span>
                    {colValue > 0 && (
                      <span className="text-xs font-medium text-muted-foreground">${colValue.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {/* Column Body */}
                <div className="flex-1 rounded-b-lg border bg-muted/20 p-2 space-y-2 min-h-[200px]">
                  {colDeals.length > 0 ? (
                    colDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
