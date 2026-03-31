import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "New UX/UI design (rollout)",
};

/** Single block to paste into Cursor / another AI to report progress and get the next steps. */
const ASSISTANT_PROMPT_TEMPLATE = `CyberSIP — "New UX/UI design" rollout (Sentinel-inspired). Repo: cybersip monorepo.

## Your job
1. Summarize what is DONE vs NOT DONE using the checklist below (user may edit brackets before sending).
2. Say what to implement NEXT (one Block A item OR one page only — never skip review gates).
3. Flag blockers (missing API data, unclear mockup, etc.).

## Rules (do not violate)
- Inspiration from repo folder \`design/\` + \`design/aegis_command/DESIGN.md\`; not a pixel-perfect HTML port.
- Preserve FastAPI contracts and TanStack Query hooks unless an optional read-only endpoint is explicitly agreed.
- Keep next-themes: light / dark / system; no hardcoded \`class="dark"\` on \`<html>\`; use semantic tokens (\`bg-background\`, \`bg-card\`, \`--chart-*\`).
- Charts use real or client-derived data; no fake "live" numbers when API is empty.

## Checklist — edit [ ] to [x] before pasting
Block A (finish ALL before any page):
- [ ] foundation-tokens — Phase 1: \`frontend/app/globals.css\` Sentinel \`.dark\`, Sophos \`:root\`, tame h1–h3 for app UI
- [ ] shell-sidebar-header — Phase 2: \`AppSidebar\`, \`PageHeader\`; light+dark OK
- [ ] viz-primitives — Phase 3: recharts + \`ChartPanel\` / \`MetricStatCard\`; theme-aware series

Pages (in order; do not start next until previous gate reviewed):
- [ ] §4.1 Command Center \`/\` — \`command_center_dark\`, \`command-center-dashboard.tsx\`
- [ ] §4.2 Hunt \`/hunt\` — \`the_hunt_dark\`, kanban + cards
- [ ] §4.3 Intelligence \`/intelligence\` — \`intelligence_hub\`, signal chart + table
- [ ] §4.4 Portfolio \`/portfolio\` — \`portfolio\`, forecast + table
- [ ] §4.5 Company 360 \`/portfolio/[id]\` — \`company_360\`, KPI + engagement velocity
- [ ] §4.6 Vault \`/vault\` — \`vault\`, KPI row + dense table

Closeout:
- [x] docs-design — full update \`docs/app/design/page.tsx\` (themes, charts, primitives, route map, seed note)
- [x] optional-seed — reviewed; existing \`backend/prisma/seed.py\` is sufficient for Sentinel KPIs/charts (no change)

## Key paths
- Spec: \`design/aegis_command/DESIGN.md\`
- Mockups: \`design/command_center_dark/code.html\`, \`the_hunt_dark\`, \`intelligence_hub\`, \`portfolio\`, \`company_360\`, \`vault\`
- Theme: \`frontend/components/theme-provider.tsx\`, \`theme-toggle.tsx\`
- Full human-readable plan: CyberSIP Docs → New UX/UI design (this rollout page)

## User notes (optional)
(Add context: branch name, screenshots, "stuck on X", etc.)
`;

export default function NewUxUiDesignPage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">UX / UI Design</span>
      </div>
      <h1>New UX/UI design (rollout plan)</h1>
      <p>
        Sentinel-inspired UI rollout for the Next.js app: dual theme (light +
        dark), shared chart/card primitives, then{" "}
        <strong>one route per review gate</strong>. Design references live in the
        repo under <code>design/</code> (see{" "}
        <code>design/aegis_command/DESIGN.md</code> and per-page{" "}
        <code>code.html</code> files).
      </p>

      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <strong>Copy for your assistant:</strong> Use the block below in Cursor
        (or any AI). Tick items in the checklist, add notes, then paste. Hover
        the block and use the copy button (top-right of the code area).
      </div>

      <h2>Assistant prompt (copy everything in the box)</h2>
      <pre className="mb-10 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed">
        <code>{ASSISTANT_PROMPT_TEMPLATE}</code>
      </pre>

      <h2>Goals and constraints</h2>
      <ul>
        <li>
          <strong>Inspiration, not a full HTML port</strong> — surfaces,
          typography roles, density, nav, charts/KPIs; bind to real or
          client-aggregated data.
        </li>
        <li>
          <strong>Preserve behavior</strong> — avoid breaking API shapes and
          hooks; optional read-only endpoints only if aggregation is impossible
          on the client.
        </li>
        <li>
          <strong>Theme switching</strong> — keep{" "}
          <code>next-themes</code> (<code>storageKey=&quot;cybersip-theme&quot;</code>
          ); semantic tokens only in components.
        </li>
      </ul>

      <h2>Incremental delivery (review gate per page)</h2>
      <p>
        Do <strong>not</strong> start Page N+1 until Page N is implemented and
        reviewed (visual + light/dark + smoke on that route).
      </p>
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>What ships</th>
            <th>Review focus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Block A</strong>
            </td>
            <td>Phases 1–3: foundation, shell, viz primitives</td>
            <td>Global theme, sidebar/header, primitives; toggle on 1–2 screens</td>
          </tr>
          <tr>
            <td>Page 1</td>
            <td>Command Center</td>
            <td>§4.1 checklist</td>
          </tr>
          <tr>
            <td>Page 2</td>
            <td>Hunt</td>
            <td>§4.2</td>
          </tr>
          <tr>
            <td>Page 3</td>
            <td>Intelligence Hub</td>
            <td>§4.3</td>
          </tr>
          <tr>
            <td>Page 4</td>
            <td>Portfolio</td>
            <td>§4.4</td>
          </tr>
          <tr>
            <td>Page 5</td>
            <td>Company 360</td>
            <td>§4.5</td>
          </tr>
          <tr>
            <td>Page 6</td>
            <td>Vault</td>
            <td>§4.6</td>
          </tr>
          <tr>
            <td>Closeout</td>
            <td>Docs + optional seed</td>
            <td>Full app pass</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>PR rhythm:</strong> one merge chunk for Block A, then one per
        page where possible.
      </p>

      <h2>Phase 1 — Foundation (dual themes)</h2>
      <ul>
        <li>
          <strong>.dark</strong> — Sentinel-style layered surfaces, primary ~
          mockup accent, chart tokens.
        </li>
        <li>
          <strong>:root</strong> — professional light “ops” counterpart (Sophos
          base); same CSS variable names.
        </li>
        <li>
          Tame global <code>h1</code>–<code>h3</code> for in-app UI; prefer
          scoped utilities for dashboards.
        </li>
        <li>
          Tonal separation over heavy borders (DESIGN.md “no-line” where
          possible); keep focus visible.
        </li>
      </ul>

      <h2>Phase 2 — Shell</h2>
      <ul>
        <li>
          <code>frontend/components/app-sidebar.tsx</code> — grounded sidebar,
          active pill/glow; routes unchanged (
          <code>frontend/lib/app-nav</code>).
        </li>
        <li>
          <code>frontend/components/page-header.tsx</code> — chrome aligned
          with mockups.
        </li>
        <li>
          <code>frontend/app/layout.tsx</code> — no forced dark class on{" "}
          <code>html</code>.
        </li>
      </ul>

      <h2>Phase 3 — Charts and shared primitives</h2>
      <ul>
        <li>
          Add <strong>recharts</strong> (or document an alternative); avoid two
          chart stacks.
        </li>
        <li>
          <strong>ChartPanel</strong> — card shell, capped header, optional
          primary accent.
        </li>
        <li>
          <strong>MetricStatCard</strong> — dense KPIs, optional progress/stacked
          footer.
        </li>
        <li>
          Series colors from <code>--chart-*</code> / semantic vars; tooltips
          match shadcn.
        </li>
        <li>
          Empty/loading states — no fabricated series when API returns nothing.
        </li>
      </ul>
      <p>
        <strong>Data hints:</strong> Command Center —{" "}
        <code>useCommandCenterSummary</code> + derived buckets; Intelligence —
        aggregate intel/competitor lists; Portfolio — revenue/exposure from
        company + hooks; Company 360 — engagements velocity; Vault — contracts
        KPIs.
      </p>

      <h2>Phase 4 — Page-by-page (checkpoints)</h2>

      <h3>4.1 Command Center (/)</h3>
      <ul>
        <li>
          Mockup: <code>design/command_center_dark/code.html</code>
        </li>
        <li>
          Files: <code>frontend/app/components/command-center-dashboard.tsx</code>
        </li>
        <li>
          KPI row, renewal radar, heatmap area, renewals-by-month bar, win-rate
          line, action stream; retire static region heatmap when data allows.
        </li>
        <li>
          <strong>Gate:</strong> / loads; light+dark; charts + action stream OK.
        </li>
      </ul>

      <h3>4.2 Hunt (/hunt)</h3>
      <ul>
        <li>
          Mockup: <code>design/the_hunt_dark/code.html</code>
        </li>
        <li>
          Files: <code>kanban-board.tsx</code>, <code>engagement-card.tsx</code>,
          dialogs.
        </li>
        <li>
          Column/card density; optional column metrics. No required charts.
        </li>
        <li>
          <strong>Gate:</strong> DnD + dialogs; light+dark; scroll.
        </li>
      </ul>

      <h3>4.3 Intelligence (/intelligence)</h3>
      <ul>
        <li>
          Mockup: <code>design/intelligence_hub/code.html</code>
        </li>
        <li>
          Files: <code>intelligence-hub.tsx</code> (+ folder dialogs).
        </li>
        <li>Table + signal volume chart + bento-style recon where data exists.</li>
        <li>
          <strong>Gate:</strong> table + chart empty states; CRUD modals.
        </li>
      </ul>

      <h3>4.4 Portfolio (/portfolio)</h3>
      <ul>
        <li>
          Mockup: <code>design/portfolio/code.html</code>
        </li>
        <li>
          Files: <code>frontend/app/portfolio/components/*</code>
        </li>
        <li>Table, forecast chart, intel-style panel if hooks support it.</li>
        <li>
          <strong>Gate:</strong> pagination + dialogs; chart empty states.
        </li>
      </ul>

      <h3>4.5 Company 360 (/portfolio/[id])</h3>
      <ul>
        <li>
          Mockup: <code>design/company_360/code.html</code>
        </li>
        <li>
          Files: <code>portfolio/[id]/components/*</code>,{" "}
          <code>page.tsx</code> if layout needs it.
        </li>
        <li>Stat grid, engagement velocity; skip heavy avatar relationship map.</li>
        <li>
          <strong>Gate:</strong> multiple company IDs; sections load.
        </li>
      </ul>

      <h3>4.6 Vault (/vault)</h3>
      <ul>
        <li>
          Mockup: <code>design/vault/code.html</code>
        </li>
        <li>
          Files: <code>frontend/app/vault/components/*</code>
        </li>
        <li>Four KPI cards, filters, dense contracts table.</li>
        <li>
          <strong>Gate:</strong> table + forms; KPIs honest when data thin.
        </li>
      </ul>

      <h3>Routes without mock</h3>
      <p>
        <code>/sales-recon</code>, <code>/territories</code>,{" "}
        <code>/settings</code> — inherit Block A only; small widgets only if
        clearly useful.
      </p>

      <h2>Phase 5 — Optional seed</h2>
      <p>
        Adjust <code>backend/prisma/seed.py</code> only if time-series or
        categories are too sparse to validate charts.
      </p>

      <h2>Testing</h2>
      <ul>
        <li>Per page: that page’s gate + light/dark + chart theming.</li>
        <li>
          After all pages: full six routes + shell; theme persistence; CRUD
          smoke.
        </li>
      </ul>

      <DocsPager
        prev={{
          title: "UX / UI Design",
          href: "/design",
          description: "Design system & patterns",
        }}
        next={{
          title: "Roadmap",
          href: "/roadmap",
          description: "Development phases & plans",
        }}
      />
    </div>
  );
}
