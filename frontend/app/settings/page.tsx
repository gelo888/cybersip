import { User2, Bell, Palette, Key } from "lucide-react"
import { ThemeSettingsSelect } from "@/components/theme-settings"

const profile = {
  name: "Alex Rivera",
  email: "alex.rivera@cybersip.io",
  role: "Enterprise Account Executive",
  team: "North America Enterprise",
  timezone: "America/New_York (EST)",
}

const notifications: { label: string; description: string; enabled: boolean }[] = [
  { label: "Renewal Alerts", description: "Contract expirations within 90 days", enabled: true },
  { label: "Competitor Intel", description: "CVEs, pricing changes, and market news", enabled: true },
  { label: "Deal Stage Changes", description: "When a deal moves through the pipeline", enabled: true },
  { label: "Action Stream Digest", description: "Daily email summary of all alerts", enabled: false },
  { label: "Win/Loss Notifications", description: "Instant alerts on closed deals", enabled: true },
  { label: "Territory Updates", description: "Account assignments and reassignments", enabled: false },
]

const integrations: { name: string; status: "connected" | "disconnected"; description: string }[] = [
  { name: "Salesforce CRM", status: "connected", description: "Bi-directional sync for contacts and deals" },
  { name: "Microsoft 365", status: "connected", description: "Calendar and email activity tracking" },
  { name: "LinkedIn Sales Navigator", status: "disconnected", description: "Contact enrichment and social signals" },
  { name: "Slack", status: "connected", description: "Alert delivery to #cybersip-alerts channel" },
  { name: "NIST NVD Feed", status: "connected", description: "Automatic CVE monitoring for tracked competitors" },
]

const appearance = {
  density: "Comfortable",
  language: "English (US)",
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}>
      <span className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${enabled ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </div>
  )
}

function ConnectionBadge({ status }: { status: "connected" | "disconnected" }) {
  return status === "connected" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-sophos-green/10 px-2 py-0.5 text-xs font-semibold text-sophos-green">
      Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      Disconnected
    </span>
  )
}

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-3xl">
      {/* Profile */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <User2 className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Profile</h3>
        </div>

        <div className="rounded-lg border divide-y">
          {Object.entries(profile).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Notifications</h3>
        </div>

        <div className="rounded-lg border divide-y">
          {notifications.map((n) => (
            <div key={n.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">{n.label}</span>
                <span className="block text-xs text-muted-foreground">{n.description}</span>
              </div>
              <Toggle enabled={n.enabled} />
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Key className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Integrations</h3>
        </div>

        <div className="rounded-lg border divide-y">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">{i.name}</span>
                <span className="block text-xs text-muted-foreground">{i.description}</span>
              </div>
              <ConnectionBadge status={i.status} />
            </div>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="size-5 text-primary" />
          <h3 className="text-base font-semibold">Appearance</h3>
        </div>

        <div className="rounded-lg border divide-y">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeSettingsSelect />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Data Density</span>
            <span className="text-sm font-medium">{appearance.density}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Language</span>
            <span className="text-sm font-medium">{appearance.language}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
