import type { Metadata } from "next";
import { Palette } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "UX / UI Design",
};

export default function DesignPage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Palette className="h-4 w-4" />
        <span className="font-medium">UX / UI Design</span>
      </div>
      <h1>UX / UI Design System</h1>
      <p>
        CyberSIP&apos;s UX philosophy is{" "}
        <strong>&quot;Enterprise Dark/Light Professional&quot;</strong> — a
        clean, high-contrast interface that mimics a{" "}
        <strong>Command Center</strong> rather than a traditional CRM. The
        design turns complex competitive data into actionable sales
        &quot;plays.&quot;
      </p>

      <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <strong>Core UX Goal:</strong> Don&apos;t just record what happened —{" "}
        <em>predict what should happen next</em>. The UI shifts from a
        &quot;Data Entry Tool&quot; to a &quot;Strategy Engine.&quot;
      </div>

      <h2>Application shell, theme, and charts</h2>
      <p>
        The Next.js app uses a <strong>Sentinel-inspired</strong> visual language
        (see <code>design/aegis_command/DESIGN.md</code> and per-page{" "}
        <code>design/*/code.html</code> mocks). Below is what is{" "}
        <strong>implemented in the repo</strong> today — prefer these paths when
        extending UI.
      </p>

      <h3>Dual theme (<code>:root</code> and <code>.dark</code>)</h3>
      <ul>
        <li>
          <strong>Tokens</strong> —{" "}
          <code>frontend/app/globals.css</code>: <code>:root</code> is a light
          Sophos &quot;ops desk&quot;; <code>.dark</code> is the Sentinel-style
          dark palette. Shared names (<code>--background</code>,{" "}
          <code>--primary</code>, <code>--chart-1</code> … <code>--chart-5</code>,
          sidebar vars) keep components theme-agnostic.
        </li>
        <li>
          <strong>Switching</strong> — <code>next-themes</code> with{" "}
          <code>attribute=&quot;class&quot;</code>,{" "}
          <code>storageKey=&quot;cybersip-theme&quot;</code> (
          <code>frontend/components/theme-provider.tsx</code>). Header toggle +
          Settings → Appearance (Light / Dark / System).
        </li>
        <li>
          <strong>In-app headings</strong> — Global <code>h1</code>–<code>h3</code>{" "}
          are tamed in <code>globals.css</code>; dashboards use local typography
          (e.g. <code>font-(family-name:--font-lexend)</code>) for hero titles.
        </li>
      </ul>

      <h3>Shell: sidebar, header, command palette</h3>
      <ul>
        <li>
          <code>frontend/components/app-sidebar.tsx</code> — Nav from{" "}
          <code>frontend/lib/app-nav.ts</code>; active route styling (pill / accent).
        </li>
        <li>
          <code>frontend/components/page-header.tsx</code> — Glass-style bar; search
          dispatches <code>COMMAND_PALETTE_OPEN_EVENT</code>.
        </li>
        <li>
          <code>frontend/components/command-palette.tsx</code> — Cmd/Ctrl+K; exports{" "}
          <code>COMMAND_PALETTE_OPEN_EVENT</code> for programmatic open. Mounted
          from <code>frontend/components/providers.tsx</code>.
        </li>
        <li>
          <strong>Page heroes</strong> — Many routes add an in-content block below
          the header: uppercase breadcrumb (
          <strong>Command center</strong> → current area), Lexend page title, and a
          short description. Examples: Vault, Portfolio overview, Intelligence hub,
          Territories, Sales recon, and Settings. Command Center (
          <code>/</code>) and Hunt use full-bleed layouts without that breadcrumb
          strip.
        </li>
      </ul>

      <h3>Visualization primitives (Recharts)</h3>
      <ul>
        <li>
          <strong>Library</strong> — <code>recharts</code> (single chart stack).
        </li>
        <li>
          <code>frontend/components/chart-panel.tsx</code> — Card shell, optional
          primary accent strip, title/description, loading + empty slots.
        </li>
        <li>
          <code>frontend/components/metric-stat-card.tsx</code> — Dense KPI tiles;
          optional left accent, decorative icon, progress bar.
        </li>
        <li>
          <code>frontend/hooks/use-chart-colors.ts</code> — Maps series to{" "}
          <code>--chart-*</code> CSS variables.
        </li>
        <li>
          <code>frontend/lib/recharts-tooltip-styles.ts</code> — Tooltip styles
          aligned with shadcn tokens.
        </li>
      </ul>

      <h3>Sentinel-style routes (main components)</h3>
      <p>
        Each area follows the same idea: semantic tokens, accent bars on key
        panels, uppercase table headers where tables appear, and{" "}
        <strong>honest empty states</strong> (no fake &quot;live&quot; series when
        the API returns nothing).
      </p>
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Primary UI files</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>/</code> Command Center
            </td>
            <td>
              <code>frontend/app/components/command-center-dashboard.tsx</code>{" "}
              (KPI bento, renewal radar, CRM grid, Recharts, action stream)
            </td>
          </tr>
          <tr>
            <td>
              <code>/hunt</code>
            </td>
            <td>
              <code>frontend/app/hunt/components/kanban-board.tsx</code>,{" "}
              <code>engagement-card.tsx</code>, dialogs
            </td>
          </tr>
          <tr>
            <td>
              <code>/intelligence</code>
            </td>
            <td>
              <code>frontend/app/intelligence/components/intelligence-hub.tsx</code>,{" "}
              <code>intel-confidence-chart.tsx</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>/portfolio</code>
            </td>
            <td>
              <code>frontend/app/portfolio/components/portfolio-overview.tsx</code>,{" "}
              <code>companies-table.tsx</code>, <code>contacts-table.tsx</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>/portfolio/[id]</code>
            </td>
            <td>
              <code>company-360-hero.tsx</code>,{" "}
              <code>company-engagement-velocity-chart.tsx</code>,{" "}
              <code>company-360-sidebar.tsx</code>, section tables under{" "}
              <code>components/</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>/vault</code>
            </td>
            <td>
              <code>frontend/app/vault/page.tsx</code>,{" "}
              <code>vault/components/contracts-table.tsx</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>/territories</code>
            </td>
            <td>
              <code>frontend/app/territories/page.tsx</code>,{" "}
              <code>territory-map-view.tsx</code>,{" "}
              <code>territory-list-view.tsx</code> — Sentinel panel + map/list
            </td>
          </tr>
          <tr>
            <td>
              <code>/sales-recon</code>
            </td>
            <td>
              <code>frontend/app/sales-recon/components/sales-recon-hub.tsx</code>{" "}
              — same hero/breadcrumb pattern as Vault/Portfolio
            </td>
          </tr>
          <tr>
            <td>
              <code>/settings</code>
            </td>
            <td>
              <code>frontend/app/settings/page.tsx</code> — accent-strip section
              cards, semantic success badges
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Optional demo data (seed)</h3>
      <p>
        <code>backend/prisma/seed.py</code> already creates a large, realistic
        slice of the model (regions, territories, ~150 companies, contacts,
        stages, engagements, contracts, competitors, intel). That is{" "}
        <strong>sufficient</strong> to populate Command Center summaries, Hunt,
        Intelligence charts, Portfolio mix, Company 360 velocity, and Vault KPIs
        without changes. Only extend the seed if you need edge cases (e.g. empty
        regions, single-contract tenants) for QA.
      </p>

      <h2>Brand Identity</h2>

      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name</td>
            <td>CyberSIP</td>
          </tr>
          <tr>
            <td>Theme</td>
            <td>&quot;Proactive Intelligence&quot;</td>
          </tr>
          <tr>
            <td>Typography</td>
            <td>Inter + Lexend</td>
          </tr>
        </tbody>
      </table>

      <h3>Color Palette</h3>

      <table>
        <thead>
          <tr>
            <th>Color</th>
            <th>Role</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-500" />{" "}
              Cyber Blue
            </td>
            <td>Primary</td>
            <td>Action items, highlights, CTAs</td>
          </tr>
          <tr>
            <td>
              <span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#0f172a]" />{" "}
              Deep Navy
            </td>
            <td>Trust</td>
            <td>Sidebars, headers, navigation</td>
          </tr>
          <tr>
            <td>
              <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500" />{" "}
              Success Green
            </td>
            <td>Positive</td>
            <td>Closed deals, active contracts, confirmations</td>
          </tr>
          <tr>
            <td>
              <span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500" />{" "}
              Alert Red
            </td>
            <td>Danger</td>
            <td>Competitor renewals, lost deals, destructive actions</td>
          </tr>
          <tr>
            <td>
              <span className="mr-2 inline-block h-3 w-3 rounded-full bg-gray-400" />{" "}
              Neutral Gray
            </td>
            <td>Background</td>
            <td>Workspace background, borders</td>
          </tr>
        </tbody>
      </table>

      <h2>Key screen layouts (product intent vs. shipped)</h2>

      <h3>Command Center (<code>/</code>)</h3>
      <p>
        <strong>Shipped</strong> in{" "}
        <code>command-center-dashboard.tsx</code>: KPI bento from live summary API,
        horizontal renewal radar, CRM signal grid, renewal-value bar chart and
        win-rate line (client-derived where needed), timeline action stream from{" "}
        <code>/api/command-center/action-stream</code>. No fabricated regional
        heatmap — any future map must bind to real territory data.
      </p>
      <ul>
        <li>
          <strong>Renewal radar</strong> — Competitor contracts approaching expiry
          (live)
        </li>
        <li>
          <strong>Action stream</strong> — Recent engagements and new companies
          (live); N8N/news optional later
        </li>
      </ul>

      <h3>Company 360 (<code>/portfolio/[id]</code>)</h3>
      <p>
        <strong>Shipped</strong>: Sentinel hero with metric strip, six-month{" "}
        <strong>engagement velocity</strong> bar chart (from{" "}
        <code>created_at</code>), sticky <strong>account snapshot</strong> sidebar
        (counts + jump links), contacts / engagements / contracts / intel sections
        with CRUD dialogs. Industry badges (primary vs secondary) in the hero.
      </p>
      <p className="text-muted-foreground text-sm">
        <strong>Roadmap / mock-only</strong> (not in app UI yet): relationship
        hierarchy map, AI relationship health score, generated battle-card pitch
        deck, tech-stack timeline.
      </p>

      <h3>The Hunt (<code>/hunt</code>)</h3>
      <p>
        <strong>Shipped</strong>: Kanban bound to pipeline stages; Sentinel-style
        column chrome, stats strip, dense engagement cards, DnD, contract hints,
        deep links <code>?company_id=</code> / <code>engagement_id=</code>.
      </p>
      <p>
        Stages are <strong>data-driven</strong> (seed names echo a displacement
        narrative); product copy still frames competitive displacement:
      </p>
      <ol>
        <li>Intelligence Gathering</li>
        <li>Vulnerability Identified (Renewal approaching)</li>
        <li>Initial Infiltration (First meeting)</li>
        <li>Proof of Concept</li>
        <li>Final Assault (Proposal)</li>
        <li>Extraction (Competitor removed / Deal won)</li>
      </ol>

      <h2>Specialized UI Components</h2>

      <h3>Competitor Displacement Badge</h3>
      <p>A small component placed next to every prospect:</p>
      <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
        <span className="font-mono text-red-500">Inplace: CrowdStrike</span>
        <span className="text-muted-foreground">|</span>
        <span className="font-mono text-amber-500">45 Days to Expiry</span>
      </div>

      <h3>Whitespace Analysis Matrix</h3>
      <p>A grid view for existing clients showing product penetration:</p>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Status</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Managed SIEM</td>
            <td>
              <span className="font-semibold text-green-600">Ours</span>
            </td>
            <td>Client uses our product</td>
          </tr>
          <tr>
            <td>Pen Testing</td>
            <td>
              <span className="font-semibold text-red-600">Competitor</span>
            </td>
            <td>Client uses a competitor&apos;s product</td>
          </tr>
          <tr>
            <td>EDR</td>
            <td>
              <span className="font-semibold text-muted-foreground">Empty</span>
            </td>
            <td>Upsell opportunity</td>
          </tr>
        </tbody>
      </table>

      <h3>CISO Battle-Card Modal</h3>
      <p>Quick-access pop-up when hovering over a contact showing:</p>
      <ul>
        <li>LinkedIn activity summary</li>
        <li>Past interactions timeline</li>
        <li>Known Pain Points (extracted from notes via AI/NLP)</li>
      </ul>

      <h2>CRUD UX Philosophy</h2>

      <p>
        The UX for data entry is{" "}
        <strong>&quot;Contextual & Frictionless.&quot;</strong> No long forms —
        instead, smart-fill, drawers, and inline editing.
      </p>

      <h3>1. Smart-Add Company Modal</h3>
      <p>
        Domain-first approach: user types <code>acme.com</code>, backend fetches
        metadata (logo, company name, industry), UI &quot;unfolds&quot; with
        pre-filled fields. Territory is auto-suggested based on HQ address.
      </p>

      <h3>2. Intelligence Drawer (Sheet)</h3>
      <p>
        A slide-over panel from the right side for adding competitor intel
        without leaving the company page. Includes searchable command-palette
        dropdown, confidence gauge, and expiry quick-select buttons.
      </p>

      <h3>3. CMD+K Command Palette</h3>
      <p>
        Global quick-action accessible via <code>Cmd + K</code>. Power users
        can type &quot;Add Contact to Acme Corp&quot; and get a mini-form
        inline. No page reloads.
      </p>

      <h3>4. Inline &quot;Ghost&quot; Editing</h3>
      <p>
        Pattern for future dense grids: hover to reveal edit, blur to save. The
        Portfolio companies/contacts register intentionally uses{" "}
        <strong>read-only rows + dialogs</strong> instead (see Phase 1.75+ above).
      </p>

      <h3>5. Multi-Step Engagement Wizard</h3>
      <p>
        Stepped progress bar for logging meetings: Stakeholders → Outcome → Next
        Action. Breaks the form into manageable steps.
      </p>

      <h3>6. Destructive Action Safety</h3>
      <p>
        Red-themed modal requiring the user to type the entity name to confirm
        deletion, followed by a temporary &quot;Undo&quot; toast (soft delete on
        backend).
      </p>

      <h2>Component Mapping</h2>

      <table>
        <thead>
          <tr>
            <th>Operation</th>
            <th>Component</th>
            <th>UX Impact</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Create (Quick)</td>
            <td><code>Command</code> (Cmd+K)</td>
            <td>Efficiency for power users</td>
          </tr>
          <tr>
            <td>Create (Main)</td>
            <td><code>Dialog</code> (Modal)</td>
            <td>Focused, distraction-free entry</td>
          </tr>
          <tr>
            <td>Read / Update</td>
            <td>
              Tables + row actions / dialogs (Portfolio register read-only in-grid)
            </td>
            <td>High-density lists without accidental edits</td>
          </tr>
          <tr>
            <td>Add Intel / Notes</td>
            <td><code>Sheet</code> (Drawer)</td>
            <td>Maintains context of the main page</td>
          </tr>
          <tr>
            <td>Notifications</td>
            <td><code>Sonner</code> (Toasts)</td>
            <td>Immediate feedback for API responses</td>
          </tr>
          <tr>
            <td>Field Validation</td>
            <td><code>Form</code> (React Hook Form + Zod)</td>
            <td>Real-time error messages</td>
          </tr>
        </tbody>
      </table>

      <h2>Theme, loading, and table editing (Phase 1.75+)</h2>

      <ul>
        <li>
          <strong>Color theme</strong> — Covered above: <code>next-themes</code>,
          <code>globals.css</code> <code>:root</code> / <code>.dark</code>, header +
          Settings Appearance.
        </li>
        <li>
          <strong>Skeletons</strong> — <code>components/ui/skeleton.tsx</code>;
          shared <code>data-table-skeleton.tsx</code>; route-specific loaders
          (Vault, Company 360, Hunt columns, Territories map/list, etc.).
        </li>
        <li>
          <strong>Portfolio tables</strong> — Companies and contacts lists are{" "}
          <strong>read-only in the grid</strong>; search/filters + pagination
          unchanged. Add / edit / delete uses dialogs; <code>PATCH</code> runs from
          those forms, not inline cells.
        </li>
        <li>
          <strong>Other surfaces</strong> — Hunt, Vault, Intelligence, Company 360
          sub-tables use row actions + modals where CRUD applies; prefer the same
          pattern for new dense tables.
        </li>
      </ul>

      <h2>Responsiveness</h2>

      <ul>
        <li>
          <strong>Mobile</strong> — Focuses on &quot;The Hunt&quot; and
          &quot;Contacts&quot; for sales reps on the road
        </li>
        <li>
          <strong>Desktop</strong> — Focuses on &quot;Intelligence&quot; and
          &quot;Reporting&quot; with compact table modes for 50+ lines without
          scrolling
        </li>
        <li>
          <strong>Dark Mode</strong> — Supported for SOC-style workflows; user choice
          persists in local storage
        </li>
      </ul>

      <h2>Performance Patterns</h2>

      <ul>
        <li>
          <strong>Skeleton screens</strong> — Ghost outlines of forms/tables
          while Prisma fetches data
        </li>
        <li>
          <strong>Optimistic updates</strong> — UI updates immediately on
          mutation, rolls back on error
        </li>
        <li>
          <strong>Background refetching</strong> — Stale data auto-refreshes via
          TanStack Query
        </li>
      </ul>

      <DocsPager
        prev={{ title: "Frontend", href: "/frontend", description: "Next.js app & components" }}
        next={{
          title: "Roadmap",
          href: "/roadmap",
          description: "Development phases & plans",
        }}
      />
    </div>
  );
}
