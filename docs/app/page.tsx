import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Download,
  Database,
  Server,
  Monitor,
  Palette,
  Map,
  ArrowRight,
  Shield,
  Crosshair,
  Zap,
} from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Introduction",
};

const quickLinks = [
  {
    title: "Architecture",
    href: "/architecture",
    icon: Layers,
    description: "Understand the system design and data flow",
  },
  {
    title: "Getting Started",
    href: "/getting-started",
    icon: Download,
    description: "Set up the project locally in minutes",
  },
  {
    title: "Database Schema",
    href: "/database",
    icon: Database,
    description: "Explore the data models and relationships",
  },
  {
    title: "Backend API",
    href: "/backend",
    icon: Server,
    description: "66 REST endpoints across 9 entity groups",
  },
  {
    title: "Frontend",
    href: "/frontend",
    icon: Monitor,
    description: "Next.js app with shadcn/ui components",
  },
  {
    title: "UX / UI Design",
    href: "/design",
    icon: Palette,
    description: "Design system and interaction patterns",
  },
  {
    title: "Roadmap",
    href: "/roadmap",
    icon: Map,
    description: "Development phases and future plans",
  },
];

export default function IntroductionPage() {
  return (
    <div className="docs-content">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
          <Shield className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="mb-0">
            Cyber<span className="text-blue-500">SIP</span>
          </h1>
          <p className="mb-0 text-sm text-muted-foreground">
            Cybersecurity Sales Intelligence Platform
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-blue-500/20 bg-blue-500/5 p-5">
        <p className="mb-0 text-[15px] leading-7 text-foreground">
          <strong>CyberSIP</strong> is a specialized CRM platform designed for
          cybersecurity sales teams. Unlike generic CRM solutions, it focuses on{" "}
          <strong>market intelligence</strong>,{" "}
          <strong>competitor tracking</strong>, and{" "}
          <strong>contract lifecycle management</strong> — turning complex
          competitive data into actionable sales &quot;plays.&quot;
        </p>
      </div>

      <h2>Why CyberSIP?</h2>

      <p>
        Most CRMs ignore the competition until a deal is lost. CyberSIP treats{" "}
        <strong>competitor contracts as first-class citizens</strong>, tracking
        them with the same fidelity as internal contracts. This transforms the
        platform from a passive record-keeper into an active strategic tool that
        tells sales agents exactly <em>when</em> a competitor is vulnerable.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <Crosshair className="mb-2 h-5 w-5 text-blue-500" />
          <h3 className="mt-0 mb-1 text-sm font-semibold">
            Proactive Intelligence
          </h3>
          <p className="mb-0 text-sm">
            Know when competitor contracts expire. Strike at the right moment
            with data-driven timing.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <Shield className="mb-2 h-5 w-5 text-green-500" />
          <h3 className="mt-0 mb-1 text-sm font-semibold">
            Competitive Displacement
          </h3>
          <p className="mb-0 text-sm">
            Track competitor presence within client organizations. Auto-generate
            battle cards and displacement strategies.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <Zap className="mb-2 h-5 w-5 text-amber-500" />
          <h3 className="mt-0 mb-1 text-sm font-semibold">Strategy Engine</h3>
          <p className="mb-0 text-sm">
            Predict what should happen next. Shift from data entry to an
            intelligence-first workflow.
          </p>
        </div>
      </div>

      <h2>Core Capabilities</h2>

      <ul>
        <li>
          <strong>Command Center</strong> — Proactive dashboard with Renewal
          Radar, Win/Loss Heatmap, and Action Stream
        </li>
        <li>
          <strong>Intelligence Hub</strong> — Competitor tracking, market news,
          and vulnerability monitoring
        </li>
        <li>
          <strong>The Hunt</strong> — Competitive Kanban pipeline with
          displacement-stage tracking
        </li>
        <li>
          <strong>Portfolio</strong> — Company 360-degree views with battle
          cards, relationship maps, and tech stack timelines
        </li>
        <li>
          <strong>Territories</strong> — Three-tier geographic hierarchy (Region
          → Territory Group → Team)
        </li>
        <li>
          <strong>Vault</strong> — Contract and proposal lifecycle management
        </li>
      </ul>

      <h2>Tech Stack</h2>

      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technology</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Frontend</td>
            <td>
              <code>Next.js 16</code> + TypeScript
            </td>
            <td>SSR, App Router, data-heavy dashboards</td>
          </tr>
          <tr>
            <td>UI Library</td>
            <td>
              <code>shadcn/ui</code> + Tailwind CSS
            </td>
            <td>Enterprise-grade component system</td>
          </tr>
          <tr>
            <td>Backend</td>
            <td>
              <code>FastAPI</code> (Python)
            </td>
            <td>High-performance REST API with async support</td>
          </tr>
          <tr>
            <td>Database</td>
            <td>
              <code>PostgreSQL 16</code>
            </td>
            <td>Relational integrity + JSONB flexibility</td>
          </tr>
          <tr>
            <td>ORM</td>
            <td>
              <code>Prisma</code> (prisma-client-py)
            </td>
            <td>Type-safe database access</td>
          </tr>
          <tr>
            <td>Infrastructure</td>
            <td>
              <code>Docker Compose</code>
            </td>
            <td>PostgreSQL + Backend containerization</td>
          </tr>
        </tbody>
      </table>

      <h2>Documentation</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-blue-500/30 hover:bg-blue-500/5 no-underline"
          >
            <link.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-blue-500" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {link.title}
                <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
              </div>
              <p className="mb-0 mt-0.5 text-[13px] text-muted-foreground">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <DocsPager
        next={{ title: "Architecture", href: "/architecture", description: "System design & data flow" }}
      />
    </div>
  );
}
