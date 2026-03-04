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
        </tbody>
      </table>

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
            <td>Mock data</td>
            <td>Proactive dashboard with Renewal Radar, Win/Loss Heatmap, Action Stream</td>
          </tr>
          <tr>
            <td><code>/intelligence</code></td>
            <td>Intelligence Hub</td>
            <td>Live API</td>
            <td>Competitor tracker, intel feed with CRUD, static market signals preview</td>
          </tr>
          <tr>
            <td><code>/hunt</code></td>
            <td>The Hunt</td>
            <td>Live API</td>
            <td>Kanban pipeline with engagement CRUD, company links</td>
          </tr>
          <tr>
            <td><code>/portfolio</code></td>
            <td>Portfolio</td>
            <td>Live API</td>
            <td>Companies and contacts management with full CRUD</td>
          </tr>
          <tr>
            <td><code>/portfolio/[id]</code></td>
            <td>Company 360</td>
            <td>Live API</td>
            <td>Contacts, engagements, contracts, intel with context-aware breadcrumbs</td>
          </tr>
          <tr>
            <td><code>/territories</code></td>
            <td>Territories</td>
            <td>Live API</td>
            <td>Map/list toggle (mapcn/MapLibre GL), CRUD via /api/territories and /api/segment-labels, geo data via /api/geo/*, multi-step creation form with cascading selects, GeoJSON polygons with color coding</td>
          </tr>
          <tr>
            <td><code>/vault</code></td>
            <td>Vault</td>
            <td>Live API</td>
            <td>Contracts table with CRUD and summary cards</td>
          </tr>
          <tr>
            <td><code>/settings</code></td>
            <td>Settings</td>
            <td>Static</td>
            <td>Application configuration</td>
          </tr>
        </tbody>
      </table>

      <h2>Project Structure</h2>

      <pre>{`frontend/
├── app/
│   ├── layout.tsx             # Root layout with sidebar
│   ├── page.tsx               # Command Center (Dashboard)
│   ├── intelligence/
│   │   └── page.tsx           # Intelligence Hub
│   ├── hunt/
│   │   ├── page.tsx           # Pipeline Kanban (Live API)
│   │   └── components/
│   │       ├── kanban-board.tsx
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
│   ├── app-sidebar.tsx        # Main navigation sidebar
│   └── ui/                    # shadcn/ui components
│       ├── button.tsx, dialog.tsx, input.tsx, label.tsx
│       ├── select.tsx, separator.tsx, sheet.tsx
│       ├── sidebar.tsx, skeleton.tsx, switch.tsx
│       └── tooltip.tsx
│
├── hooks/                     # TanStack Query data hooks
│   ├── use-companies.ts       # Company list + CRUD
│   ├── use-company-detail.ts  # Single company fetch
│   ├── use-contacts.ts        # Contact list + CRUD
│   ├── use-stages.ts          # Pipeline stage CRUD
│   ├── use-engagements.ts     # Engagement list + CRUD
│   ├── use-contracts.ts       # Contract + line-item CRUD
│   ├── use-territories.ts     # useTerritories, useCreateTerritory, useUpdateTerritory, useDeleteTerritory, useSegmentLabels, useCreateSegmentLabel
│   ├── use-geo-data.ts        # useGeoRegions, useGeoSubRegions, useGeoCountries, useCountriesByLevel, useAdminDivisions, useGeoFeatures
│   └── use-mobile.ts          # Mobile detection
│
├── lib/
│   ├── api.ts                 # Centralized fetch (get, post, patch, del)
│   ├── types.ts               # Shared TypeScript interfaces
│   └── utils.ts               # cn() utility for class merging
│
└── package.json`}</pre>

      <h2>Sidebar Navigation</h2>

      <p>
        The sidebar component (<code>app-sidebar.tsx</code>) is collapsible and
        groups navigation by strategic intent:
      </p>

      <ul>
        <li>
          <strong>Command Center</strong> — Dashboard home
        </li>
        <li>
          <strong>Intelligence Hub</strong> — Competitor tracking and market news
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
            Live API (Phase 1 + 1.5)
          </h3>
          <ul className="mb-0 text-sm">
            <li>TanStack Query + centralized API client</li>
            <li>Portfolio — companies &amp; contacts with full CRUD</li>
            <li>Company 360 — live data (contacts, engagements, contracts, intel)</li>
            <li>Hunt — Kanban pipeline with engagement CRUD, linked to Company 360</li>
            <li>Vault — contracts table with CRUD, summary cards, company links</li>
            <li>Intelligence Hub — competitor tracker and intel feed with CRUD, static market signals preview</li>
            <li>Territories — map/list toggle, CRUD via /api/territories and /api/segment-labels, geo data via /api/geo/*, GeoJSON polygons</li>
            <li>Context-aware breadcrumbs (Hunt → Company 360 → back to Hunt)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="mt-0 mb-2 text-sm font-semibold text-amber-600">
            Pending
          </h3>
          <ul className="mb-0 text-sm">
            <li>1 page still uses mock data (Command Center)</li>
            <li>Hunt ↔ Vault cross-reference (contract indicators on pipeline cards)</li>
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
