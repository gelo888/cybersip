import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, ChevronRight, Key, Palette, User2 } from "lucide-react";

import { ThemeSettingsSelect } from "@/components/theme-settings";

const profile = {
  name: "Alex Rivera",
  email: "alex.rivera@cybersip.io",
  role: "Enterprise Account Executive",
  team: "North America Enterprise",
  timezone: "America/New_York (EST)",
};

const notifications: { label: string; description: string; enabled: boolean }[] = [
  { label: "Renewal Alerts", description: "Contract expirations within 90 days", enabled: true },
  { label: "Competitor Intel", description: "CVEs, pricing changes, and market news", enabled: true },
  { label: "Deal Stage Changes", description: "When a deal moves through the pipeline", enabled: true },
  { label: "Action Stream Digest", description: "Daily email summary of all alerts", enabled: false },
  { label: "Win/Loss Notifications", description: "Instant alerts on closed deals", enabled: true },
  { label: "Territory Updates", description: "Account assignments and reassignments", enabled: false },
];

const integrations: { name: string; status: "connected" | "disconnected"; description: string }[] = [
  { name: "Salesforce CRM", status: "connected", description: "Bi-directional sync for contacts and deals" },
  { name: "Microsoft 365", status: "connected", description: "Calendar and email activity tracking" },
  { name: "LinkedIn Sales Navigator", status: "disconnected", description: "Contact enrichment and social signals" },
  { name: "Slack", status: "connected", description: "Alert delivery to #cybersip-alerts channel" },
  { name: "NIST NVD Feed", status: "connected", description: "Automatic CVE monitoring for tracked competitors" },
];

const appearance = {
  density: "Comfortable",
  language: "English (US)",
};

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`mt-0.5 inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-[18px]" : "translate-x-0.5"}`}
      />
    </div>
  );
}

function ConnectionBadge({ status }: { status: "connected" | "disconnected" }) {
  return status === "connected" ? (
    <span className="bg-chart-3/15 text-chart-3 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold">
      Connected
    </span>
  ) : (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold">
      Disconnected
    </span>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="bg-card overflow-hidden rounded-lg shadow-sm ring-1 ring-border/40">
        <div className="bg-primary h-0.5 w-full shrink-0" aria-hidden />
        <div className="border-border/50 flex items-center gap-2 border-b bg-muted/45 px-4 py-3 dark:bg-muted/25">
          <Icon className="size-4 shrink-0 text-primary" aria-hidden />
          <h2 className="font-(family-name:--font-lexend) text-foreground m-0 text-sm font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <div className="divide-border/50 divide-y">{children}</div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-10 p-6">
      <div>
        <nav className="text-primary/70 mb-2 flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest uppercase">
          <Link href="/" className="hover:text-primary">
            Command center
          </Link>
          <ChevronRight className="size-3 opacity-60" aria-hidden />
          <span className="text-primary">Settings</span>
        </nav>
        <h1 className="font-(family-name:--font-lexend) text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Workspace preferences
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Profile, notifications, integrations, and appearance — aligned with the
          app theme tokens (light / dark / system).
        </p>
      </div>

      <div className="space-y-8">
        <SettingsSection title="Profile" icon={User2}>
          {Object.entries(profile).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </SettingsSection>

        <SettingsSection title="Notifications" icon={Bell}>
          {notifications.map((n) => (
            <div key={n.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">{n.label}</span>
                <span className="text-muted-foreground block text-xs">{n.description}</span>
              </div>
              <Toggle enabled={n.enabled} />
            </div>
          ))}
        </SettingsSection>

        <SettingsSection title="Integrations" icon={Key}>
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">{i.name}</span>
                <span className="text-muted-foreground block text-xs">{i.description}</span>
              </div>
              <ConnectionBadge status={i.status} />
            </div>
          ))}
        </SettingsSection>

        <SettingsSection title="Appearance" icon={Palette}>
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Theme
            </span>
            <ThemeSettingsSelect />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Data density
            </span>
            <span className="text-sm font-medium">{appearance.density}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              Language
            </span>
            <span className="text-sm font-medium">{appearance.language}</span>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
