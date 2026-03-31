import type { Metadata } from "next";
import {
  Layers,
  ArrowDown,
  ArrowRight,
  Monitor,
  Server,
  Database,
  Bot,
  Workflow,
} from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Architecture",
};

export default function ArchitecturePage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Layers className="h-4 w-4" />
        <span className="font-medium">Architecture</span>
      </div>
      <h1>System Architecture</h1>
      <p>
        CyberSIP follows a <strong>decoupled three-tier architecture</strong>{" "}
        separating the frontend, backend, and database into independent layers
        that communicate via REST APIs.
      </p>

      <h2>High-Level Data Flow</h2>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
        {[
          "Browser",
          "Next.js (UI)",
          "fetch / axios",
          "FastAPI (API)",
          "Prisma",
          "PostgreSQL",
        ].map((item, i) => (
          <span key={item} className="flex items-center gap-2">
            <span className="rounded bg-foreground/10 px-2 py-0.5 font-mono text-xs font-medium">
              {item}
            </span>
            {i < 5 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </span>
        ))}
      </div>

      <p>
        The Next.js frontend is a <strong>pure UI layer</strong> — it never
        touches the database directly. All data operations go through the
        FastAPI backend, which uses Prisma as its ORM to interact with
        PostgreSQL.
      </p>

      <h2>Architecture Diagram</h2>

      <div className="mb-6 space-y-0">
        {/* Frontend */}
        <div className="rounded-t-xl border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 border-b border-blue-500/20 px-4 py-2.5">
            <Monitor className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-600">FRONTEND</span>
            <span className="ml-auto rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[11px] text-blue-500">
              Port 3000
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="mb-3 text-sm font-medium text-foreground">
              Next.js 16 (App Router) + shadcn/ui + Tailwind CSS
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {[
                { route: "/", name: "Command Center" },
                { route: "/intelligence", name: "Intelligence Hub" },
                { route: "/sales-recon", name: "Sales Recon" },
                { route: "/hunt", name: "Pipeline Kanban" },
                { route: "/portfolio", name: "Companies & Contacts" },
                { route: "/territories", name: "Geographic Views" },
                { route: "/vault", name: "Contracts & Proposals" },
              ].map((r) => (
                <div
                  key={r.route}
                  className="flex items-baseline gap-1.5 rounded bg-white/60 px-2 py-1.5 dark:bg-white/5"
                >
                  <code className="text-[11px] text-blue-500">{r.route}</code>
                  <span className="text-[11px] text-muted-foreground">
                    {r.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center py-1">
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">
              fetch / axios
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
        </div>

        {/* Backend */}
        <div className="border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 border-b border-amber-500/20 px-4 py-2.5">
            <Server className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-600">BACKEND</span>
            <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-500">
              Port 8000
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="mb-3 text-sm font-medium text-foreground">
              FastAPI (Python) + Pydantic Validation
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {[
                { path: "/api/companies", desc: "Company CRUD" },
                { path: "/api/contacts", desc: "Contact CRUD" },
                { path: "/api/engagements", desc: "Pipeline mgmt" },
                { path: "/api/assignments", desc: "User-Company links" },
                { path: "/api/products", desc: "Product catalog" },
                { path: "/api/contracts", desc: "Contract lifecycle" },
                { path: "/api/competitors", desc: "Competitive intel" },
                { path: "/api/regions", desc: "Territory hierarchy" },
                { path: "/api/teams", desc: "Team management" },
              ].map((ep) => (
                <div
                  key={ep.path}
                  className="flex items-baseline gap-1.5 rounded bg-white/60 px-2 py-1.5 dark:bg-white/5"
                >
                  <code className="text-[11px] text-amber-600">
                    {ep.path}
                  </code>
                  <span className="text-[11px] text-muted-foreground">
                    {ep.desc}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 mb-0 text-[11px] text-muted-foreground">
              CORS: <code className="text-[11px]">CORS_ALLOWED_ORIGINS</code> |{" "}
              9 router groups | 66 endpoints
            </p>
          </div>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center py-1">
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">
              Prisma Client (Python)
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
        </div>

        {/* Database */}
        <div className="rounded-b-xl border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2 border-b border-green-500/20 px-4 py-2.5">
            <Database className="h-4 w-4 text-green-500" />
            <span className="text-sm font-bold text-green-600">DATABASE</span>
            <span className="ml-auto rounded-full bg-green-500/10 px-2 py-0.5 font-mono text-[11px] text-green-500">
              Port 5432
            </span>
          </div>
          <div className="px-4 py-3">
            <p className="mb-3 text-sm font-medium text-foreground">
              PostgreSQL 16 — 20+ tables with rich relationships
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded border border-green-500/15 bg-white/60 p-2.5 dark:bg-white/5">
                <p className="mb-1 text-[11px] font-semibold text-foreground">
                  Core Entities
                </p>
                <p className="mb-0 text-[11px] text-muted-foreground leading-4">
                  companies, contacts, contracts, engagements, company_assignments
                </p>
              </div>
              <div className="rounded border border-green-500/15 bg-white/60 p-2.5 dark:bg-white/5">
                <p className="mb-1 text-[11px] font-semibold text-foreground">
                  Territory Hierarchy
                </p>
                <p className="mb-0 text-[11px] text-muted-foreground leading-4">
                  regions, territory_groups, teams, team_members
                </p>
              </div>
              <div className="rounded border border-green-500/15 bg-white/60 p-2.5 dark:bg-white/5">
                <p className="mb-1 text-[11px] font-semibold text-foreground">
                  Supporting Tables
                </p>
                <p className="mb-0 text-[11px] text-muted-foreground leading-4">
                  industries, products_services, competitors, competitor_intel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2>Key Architecture Decisions</h2>

      <h3>1. Prisma Lives on the Backend Only</h3>
      <p>
        Since the project uses FastAPI as a dedicated backend, Prisma is used
        exclusively on the backend side via <code>prisma-client-py</code>. The
        frontend remains a pure UI layer that consumes the REST API. This
        separation enables independent scaling and deployment of each tier.
      </p>

      <h3>2. Competitors as First-Class Citizens</h3>
      <p>
        The single most critical architectural decision is to{" "}
        <strong>
          track competitor contracts with the same fidelity as internal contracts
        </strong>
        . Most CRMs ignore the competition until a deal is lost. By tracking{" "}
        <code>competitor_intel</code> explicitly, the system transforms from a
        passive record-keeper into an active strategic tool.
      </p>

      <h3>3. Three-Tier Territory Hierarchy</h3>
      <p>
        The geographic model uses{" "}
        <strong>Region → Territory Group → Team</strong> with many-to-many joins
        at each level. This supports multinationals with operations spanning
        multiple regions and teams covering overlapping territories.
      </p>

      <h3>4. Docker-First Development</h3>
      <p>
        Both PostgreSQL and the FastAPI backend run in Docker containers via{" "}
        <code>docker-compose.yml</code>. The database container includes a
        health check, and the backend container waits for PostgreSQL readiness
        before pushing the Prisma schema and starting the server.
      </p>

      <h2>Future Architecture (Planned)</h2>

      <p>
        The planned architecture adds an{" "}
        <strong>N8N automation layer</strong> for event-driven workflows and{" "}
        <strong>AI-powered endpoints</strong> for intelligent features. The
        frontend will continue to interact exclusively with FastAPI.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Workflow className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-bold text-purple-600">
              N8N Automation
            </span>
          </div>
          <ul className="mb-0 list-none space-y-1 pl-0 text-[12px] text-muted-foreground">
            <li>Webhooks ↔ FastAPI events</li>
            <li>Scheduled scrapers</li>
            <li>AI calls (OpenAI)</li>
          </ul>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-600">
              New AI Endpoints
            </span>
          </div>
          <ul className="mb-0 list-none space-y-1 pl-0 text-[12px] text-muted-foreground">
            <li>
              <code className="text-[11px]">/api/ai/enrich-company</code>
            </li>
            <li>
              <code className="text-[11px]">/api/ai/generate-battlecard</code>
            </li>
            <li>
              <code className="text-[11px]">/api/ai/displacement-email</code>
            </li>
            <li>
              <code className="text-[11px]">/api/webhooks/n8n</code>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold text-blue-600">
              Frontend Rule
            </span>
          </div>
          <p className="mb-0 text-[12px] text-muted-foreground">
            Calls FastAPI only — never calls AI or N8N directly. All
            intelligence features are consumed through the backend API.
          </p>
        </div>
      </div>

      <h2>CORS & Security</h2>

      <table>
        <thead>
          <tr>
            <th>Setting</th>
            <th>Value</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Allowed Origins</td>
            <td>
              <code>CORS_ALLOWED_ORIGINS</code> env var
            </td>
            <td>Defaults to <code>http://localhost:3000</code></td>
          </tr>
          <tr>
            <td>Credentials</td>
            <td>Enabled</td>
            <td>Cookie / session support</td>
          </tr>
          <tr>
            <td>Methods</td>
            <td>All</td>
            <td>Full CRUD support</td>
          </tr>
          <tr>
            <td>Auth (planned)</td>
            <td>NextAuth.js → JWT</td>
            <td>Frontend validates, passes tokens to FastAPI</td>
          </tr>
        </tbody>
      </table>

      <DocsPager
        prev={{ title: "Introduction", href: "/", description: "About CyberSIP" }}
        next={{ title: "Getting Started", href: "/getting-started", description: "Installation & setup" }}
      />
    </div>
  );
}
