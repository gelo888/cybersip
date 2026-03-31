import type { Metadata } from "next";
import { Monitor } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Frontend",
};

export default function FrontendPage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Monitor className="h-4 w-4" />
        <span className="font-medium">Frontend</span>
      </div>
      <h1>Frontend Overview</h1>
      <p>
        The CyberSIP frontend is built with <strong>Next.js 16</strong> (App
        Router), <strong>React 19</strong>, <strong>TypeScript</strong>, and{" "}
        <strong>shadcn/ui</strong> + <strong>Tailwind CSS</strong>. It serves as
        a pure UI layer that consumes the FastAPI REST API.
      </p>

      <h2>Tech Stack</h2>

      <table>
        <thead>
          <tr>
            <th>Technology</th>
            <th>Version</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Next.js</td>
            <td>16.1.6</td>
            <td>React framework with App Router</td>
          </tr>
          <tr>
            <td>React</td>
            <td>19.2.3</td>
            <td>UI library</td>
          </tr>
          <tr>
            <td>TypeScript</td>
            <td>5.x</td>
            <td>Type safety</td>
          </tr>
          <tr>
            <td>Tailwind CSS</td>
            <td>4.x</td>
            <td>Utility-first styling</td>
          </tr>
          <tr>
            <td>shadcn/ui</td>
            <td>Latest</td>
            <td>Component system (Radix UI primitives)</td>
          </tr>
          <tr>
            <td>TanStack Query</td>
            <td>5.x</td>
            <td>Server-state management (caching, mutations, invalidation)</td>
          </tr>
          <tr>
            <td>Lucide React</td>
            <td>Latest</td>
            <td>Icon library</td>
          </tr>
          <tr>
            <td><code>@dnd-kit/core</code> + <code>@dnd-kit/utilities</code></td>
            <td>Latest</td>
            <td>Hunt Kanban drag-and-drop between pipeline stages</td>
          </tr>
          <tr>
            <td><code>cmdk</code></td>
            <td>Latest</td>
            <td>App-wide command palette (composed with Dialog in <code>components/ui/command.tsx</code>)</td>
          </tr>
          <tr>
            <td><code>next-themes</code></td>
            <td>Latest</td>
            <td>
              Light / dark / system appearance; <code>ThemeProvider</code> wraps the
              app in <code>components/providers.tsx</code> (<code>components/theme-provider.tsx</code>)
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Interactive shell</h2>

      <p>
        <strong>Hunt</strong> — Cards move between columns via a grip handle;{" "}
        <code>DndContext</code> / <code>useDraggable</code> / <code>useDroppable</code>{" "}
        in <code>app/hunt/components/kanban-board.tsx</code> call{" "}
        <code>useUpdateEngagement</code> (<code>PATCH /api/engagements/&#123;id&#125;</code>
        with <code>stage_id</code>). <strong>Command palette</strong> —{" "}
        <code>CommandPalette</code> is mounted from <code>components/providers.tsx</code>;
        press <kbd>Cmd</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> to open. Primary and
        secondary nav URLs and labels are defined once in{" "}
        <code>lib/app-nav.ts</code> and imported by both <code>app-sidebar.tsx</code>{" "}
        and the palette. <strong>Global UX</strong> — Header sun/moon control sets
        explicit light or dark (overrides system until changed in Settings); Settings
        → Appearance offers Light, Dark, and System. Primary data views use skeleton
        layouts while queries load; Portfolio companies/contacts support inline field
        updates via <code>useUpdateCompany</code> / <code>useUpdateContact</code>{" "}
        (<code>PATCH</code>, partial payloads; see <code>CompanyUpdatePayload</code> /{" "}
        <code>ContactUpdatePayload</code> in <code>lib/types.ts</code>).
      </p>

      <h2>Application Routes</h2>

      <p>
        The navigation is grouped by <strong>strategic intent</strong> rather
        than just object types — making it feel like a command center.
      </p>

      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Page Name</th>
            <th>Status</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>/</code></td>
            <td>Command Center</td>
            <td>Live API + sample widgets</td>
            <td>
              KPI strip and Renewal Radar from <code>/api/command-center/summary</code> (
              <code>useCommandCenterSummary</code>); Action Stream from{" "}
              <code>/api/command-center/action-stream</code> (
              <code>useCommandCenterActionStream</code>); Win/Loss Heatmap remains
              illustrative sample data
            </td>
          </tr>
          <tr>
            <td><code>/intelligence</code></td>
            <td>Intelligence Hub</td>
            <td>Live API</td>
            <td>Competitor tracker, intel feed with CRUD, static market signals preview</td>
          </tr>
          <tr>
            <td><code>/sales-recon</code></td>
            <td>Sales Recon</td>
            <td>Live API (picker) + preview</td>
            <td>GTM / account recon: prospect account cards (filled sample recon fields from CRM prospects), portfolio account select, illustrative public-source signals with external links; <code>useCompanies</code> supports optional <code>status</code> filter; full-width layout</td>
          </tr>
          <tr>
            <td><code>/hunt</code></td>
            <td>The Hunt</td>
            <td>Live API</td>
            <td>
              Kanban pipeline with engagement CRUD and drag-and-drop stage moves
              (grip handle); account-level contract signals on cards;{" "}
              <code>?company_id=</code> filter and optional{" "}
              <code>engagement_id=</code> deep link from Vault. New engagements
              need at least one company in Portfolio; with{" "}
              <code>?company_id=</code>, that company is pre-filled for create.
            </td>
          </tr>
          <tr>
            <td><code>/portfolio</code></td>
            <td>Portfolio</td>
            <td>Live API</td>
            <td>
              Companies and contacts with full CRUD; debounced server-side search
              and filters (companies: status, size, <strong>industry</strong>; contacts:
              company, active, deal role, seniority) via <code>useCompanies</code> /{" "}
              <code>useContacts</code> and <code>useIndustries</code> for the industry
              catalog; company form sets primary/secondary via <code>industry_links</code>;
              companies table shows primary industry column; inline edits on table rows
              (companies: status, size, employees, country, website; contacts: title,
              seniority, role, email, phone) with subtle refetch when the list refetches
            </td>
          </tr>
          <tr>
            <td><code>/portfolio/[id]</code></td>
            <td>Company 360</td>
            <td>Live API</td>
            <td>Skeleton shell while company loads; header shows <strong>industry</strong> badges (primary vs secondary); contacts (read-only table); engagements, contracts, and competitor intel with full CRUD (reuses Hunt / Vault / Intelligence form dialogs with scoped company)</td>
          </tr>
          <tr>
            <td><code>/territories</code></td>
            <td>Territories</td>
            <td>Live API</td>
            <td>Map/list toggle (mapcn/MapLibre GL); skeleton map panel or list rows while territories load; CRUD via /api/territories and /api/segment-labels, geo data via /api/geo/*, multi-step creation form with cascading selects, GeoJSON polygons with color coding, team member assignment via /api/team-members and /api/territory-members</td>
          </tr>
          <tr>
            <td><code>/vault</code></td>
            <td>Vault</td>
            <td>Live API</td>
            <td>
              Skeleton summary + table while contracts load; contracts table with
              CRUD, optional linked engagement on create/edit, Pipeline column to
              Hunt (<code>?company_id=</code> and <code>engagement_id=</code> when
              set), summary cards. New contracts require a company from Portfolio
              (loading/empty/error states in the form).
            </td>
          </tr>
          <tr>
            <td><code>/settings</code></td>
            <td>Settings</td>
            <td>Mostly static</td>
            <td>Profile / notifications / integrations mock; Appearance theme (Light, Dark, System) wired to <code>next-themes</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Project Structure</h2>

      <pre>{`frontend/
├── app/
│   ├── layout.tsx             # Root layout with sidebar
│   ├── page.tsx               # Command Center entry (renders dashboard client)
│   ├── components/
│   │   └── command-center-dashboard.tsx  # KPIs + renewal radar + action stream (live); heatmap (sample)
│   ├── intelligence/
│   │   └── page.tsx           # Intelligence Hub
│   ├── sales-recon/
│   │   ├── page.tsx           # Sales Recon (GTM recon)
│   │   └── components/
│   │       └── sales-recon-hub.tsx
│   ├── hunt/
│   │   ├── page.tsx           # Pipeline Kanban (Live API)
│   │   └── components/
│   │       ├── kanban-board.tsx   # + contract signals, URL filters
│   │       ├── engagement-card.tsx
│   │       └── engagement-form-dialog.tsx
│   ├── portfolio/
│   │   ├── page.tsx           # Companies & Contacts (Live API)
│   │   ├── components/        # Table, form dialogs, pagination
│   │   └── [id]/
│   │       ├── page.tsx       # Company 360 (Live API)
│   │       └── components/    # Section components
│   ├── territories/
│   │   ├── page.tsx           # Geographic / Team views (Live API)
│   │   └── components/        # Map, list, territory form
│   ├── vault/
│   │   ├── page.tsx           # Contracts & Proposals (Live API)
│   │   └── components/
│   │       ├── contracts-table.tsx
│   │       └── contract-form-dialog.tsx
│   └── settings/
│       └── page.tsx           # Application settings
│
├── components/
│   ├── app-sidebar.tsx        # Main navigation (uses lib/app-nav.ts)
│   ├── command-palette.tsx    # Cmd/Ctrl+K palette (uses lib/app-nav.ts)
│   ├── providers.tsx          # QueryClientProvider + CommandPalette
│   ├── company-combobox.tsx   # Searchable company picker (Hunt/Vault/Portfolio/Intel forms)
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx, command.tsx, dialog.tsx, input.tsx, label.tsx
│       ├── popover.tsx, select.tsx, separator.tsx, sheet.tsx
│       ├── sidebar.tsx, skeleton.tsx, switch.tsx
│       ├── visually-hidden.tsx  # Radix VisuallyHidden (e.g. dialog titles)
│       └── tooltip.tsx
│
├── hooks/                     # TanStack Query data hooks
│   ├── use-companies.ts       # Company list + CRUD (optional status, company_size, q)
│   ├── use-contacts.ts        # Contact list + CRUD (optional company_id, q, filters)
│   ├── use-debounced-value.ts # Debounced input for Portfolio search fields
│   ├── use-company-detail.ts  # Single company fetch
│   ├── use-stages.ts          # Pipeline stage CRUD
│   ├── use-engagements.ts     # Engagement list + CRUD
│   ├── use-command-center-summary.ts  # GET /api/command-center/summary
│   ├── use-command-center-action-stream.ts  # GET /api/command-center/action-stream
│   ├── use-contracts.ts       # Contract + line-item CRUD
│   ├── use-territories.ts     # useTerritories, useCreateTerritory, useUpdateTerritory, useDeleteTerritory, useSegmentLabels, useCreateSegmentLabel
│   ├── use-teams.ts           # useTeamMembers, useCreateTeamMember, useAssignMemberTerritory, useUnassignMemberTerritory
│   ├── use-geo-data.ts        # useGeoRegions, useGeoSubRegions, useGeoCountries, useCountriesByLevel, useAdminDivisions, useGeoFeatures
│   └── use-mobile.ts          # Mobile detection
│
├── lib/
│   ├── api.ts                 # Centralized fetch (get, post, patch, del)
│   ├── app-nav.ts             # Sidebar + command palette route list
│   ├── contract-signals.ts    # Per-company contract cues for Hunt cards
│   ├── format-relative-time.ts # Command Center action stream timestamps
│   ├── types.ts               # Shared TypeScript interfaces
│   └── utils.ts               # cn() utility for class merging
│
└── package.json`}</pre>

      <h2>Sidebar Navigation</h2>

      <p>
        The sidebar component (<code>app-sidebar.tsx</code>) is collapsible and
        groups navigation by strategic intent. Items are sourced from{" "}
        <code>lib/app-nav.ts</code> so the command palette stays aligned with the
        sidebar.
      </p>

      <ul>
        <li>
          <strong>Command Center</strong> — Dashboard home
        </li>
        <li>
          <strong>Intelligence Hub</strong> — Competitor tracking and market news
        </li>
        <li>
          <strong>Sales Recon</strong> — GTM and account recon workspace (public-source signal preview, full width)
        </li>
        <li>
          <strong>The Hunt</strong> — Pipeline and Kanban board
        </li>
        <li>
          <strong>Portfolio</strong> — Companies and contacts
        </li>
        <li>
          <strong>Territories</strong> — Geographic and team views
        </li>
        <li>
          <strong>Vault</strong> — Contracts and proposals
        </li>
      </ul>

      <h2>Data Fetching Pattern</h2>

      <p>
        All API data flows through <strong>TanStack Query</strong> hooks in
        the <code>hooks/</code> directory. Each hook wraps the centralized API
        client (<code>lib/api.ts</code>) and provides caching, refetching, and
        optimistic updates.
      </p>

      <pre>{`// Example: hooks/use-contracts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type { Contract, ContractPayload } from "@/lib/types";

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: () => get<Contract[]>("/api/contracts?take=500"),
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContractPayload) =>
      post<Contract>("/api/contracts", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}`}</pre>

      <p>
        Page components are thin orchestrators that compose page-specific
        components from a colocated <code>components/</code> subfolder. Shared
        types live in <code>lib/types.ts</code>.
      </p>

      <h2>Component System</h2>

      <p>
        The UI is built on <strong>shadcn/ui</strong>, which provides
        unstyled, accessible Radix UI primitives styled with Tailwind CSS.
        Installed components include:
      </p>

      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Button</code></td>
            <td>Primary actions, CTA elements</td>
          </tr>
          <tr>
            <td><code>Input</code></td>
            <td>Form fields, search inputs</td>
          </tr>
          <tr>
            <td><code>Sheet</code></td>
            <td>Slide-over drawers for adding intel, forms</td>
          </tr>
          <tr>
            <td><code>Sidebar</code></td>
            <td>Collapsible navigation with groups</td>
          </tr>
          <tr>
            <td><code>Skeleton</code></td>
            <td>Loading placeholder states</td>
          </tr>
          <tr>
            <td><code>Tooltip</code></td>
            <td>Hover information on icons/actions</td>
          </tr>
          <tr>
            <td><code>Popover</code></td>
            <td>Floating panels (e.g. anchored dropdowns)</td>
          </tr>
          <tr>
            <td><code>CompanyCombobox</code></td>
            <td>Searchable company field in Hunt, Vault, Sales Recon, contact, and intel flows</td>
          </tr>
          <tr>
            <td><code>Separator</code></td>
            <td>Visual dividers between sections</td>
          </tr>
        </tbody>
      </table>

      <h2>Design Tokens</h2>

      <p>
        The app uses CSS custom properties for theming, supporting both light
        and dark modes:
      </p>

      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>--primary</code></td>
            <td>Main brand color (Deep Navy)</td>
          </tr>
          <tr>
            <td><code>--background</code></td>
            <td>Page background</td>
          </tr>
          <tr>
            <td><code>--sidebar</code></td>
            <td>Sidebar background</td>
          </tr>
          <tr>
            <td><code>--muted</code></td>
            <td>Subdued backgrounds</td>
          </tr>
          <tr>
            <td><code>--destructive</code></td>
            <td>Delete / danger actions</td>
          </tr>
          <tr>
            <td><code>--border</code></td>
            <td>Borders and dividers</td>
          </tr>
        </tbody>
      </table>

      <h2>Current Status</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <h3 className="mt-0 mb-2 text-sm font-semibold text-green-600">
            Live API (Phases 1 + 1.5)
          </h3>
          <ul className="mb-0 text-sm">
            <li>
              <strong>Phase 1.75</strong> (roadmap): DB-backed Command Center
              Action Stream (done: engagements + new companies); CMD+K, Hunt Kanban
              DnD, dark mode / skeletons / inline table editing, static
              displacement email templates — no OpenAI or N8N
            </li>
            <li>TanStack Query + centralized API client</li>
            <li>
              Command Center — KPI strip and Renewal Radar from{" "}
              <code>/api/command-center/summary</code>; Action Stream from{" "}
              <code>/api/command-center/action-stream</code>
            </li>
            <li>Portfolio — companies &amp; contacts with full CRUD</li>
            <li>Company 360 — live data; CRUD for engagements, contracts, and intel; contacts — <strong>Add contact</strong> opens the shared contact form scoped to the company (edit/delete from Portfolio contacts table)</li>
            <li>
              Hunt — Kanban + contract status chips per account; filter via{" "}
              <code>?company_id=</code>; optional <code>engagement_id=</code>{" "}
              highlight from Vault; new engagement uses filtered company when{" "}
              <code>?company_id=</code> is set; otherwise pick from Portfolio
              companies (or add companies on Portfolio first).
            </li>
            <li>
              Vault — contracts CRUD, optional linked engagement, Pipeline column
              to Hunt; new contract picker loads companies from Portfolio with
              clear empty/load/error messaging.
            </li>
            <li>Intelligence Hub — competitor tracker and intel feed with CRUD, static market signals preview</li>
            <li>Territories — map/list toggle, CRUD via /api/territories and /api/segment-labels, geo data via /api/geo/*, GeoJSON polygons, team member assignment</li>
            <li>Context-aware breadcrumbs (Hunt → Company 360 → back to Hunt)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="mt-0 mb-2 text-sm font-semibold text-amber-600">
            Pending
          </h3>
          <ul className="mb-0 text-sm">
            <li>
              Command Center — Win/Loss Heatmap still uses sample data (KPIs,
              Renewal Radar, and Action Stream are live)
            </li>
            <li>Deeper Hunt ↔ Vault workflow (e.g. auto-create contract from stage)</li>
            <li>No authentication / authorization</li>
            <li>Dark mode toggle not implemented</li>
          </ul>
        </div>
      </div>

      <DocsPager
        prev={{ title: "Backend API", href: "/backend", description: "REST endpoints" }}
        next={{ title: "UX / UI Design", href: "/design", description: "Design system & patterns" }}
      />
    </div>
  );
}
