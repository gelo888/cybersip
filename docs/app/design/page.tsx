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

      <h2>Key Screen Layouts</h2>

      <h3>Command Center (Proactive Dashboard)</h3>
      <p>
        Instead of just showing &quot;Sales Volume,&quot; this dashboard
        prioritizes <strong>&quot;Upcoming Attacks&quot;</strong>:
      </p>
      <ul>
        <li>
          <strong>Renewal Radar</strong> — Horizontal scroll of cards showing
          competitor contracts expiring in the next 90 days
        </li>
        <li>
          <strong>Win/Loss Heatmap</strong> — Visual map showing which regions
          are &quot;Winning&quot; vs. &quot;Under Siege&quot;
        </li>
        <li>
          <strong>Action Stream</strong> — Timeline of recent CRM activity
          (engagements, new accounts); future phases can add external news and
          N8N-sourced alerts
        </li>
      </ul>

      <h3>Company 360-Degree View</h3>
      <p>Where the sales agent spends most of their time:</p>
      <ul>
        <li>
          <strong>Header</strong> — Company logo, stock ticker, AI-calculated
          &quot;Relationship Health Score&quot;
        </li>
        <li>
          <strong>Battle Card Sidebar</strong> — Sticky card showing the current
          incumbent, contract end date, and talking points
        </li>
        <li>
          <strong>Relationship Map</strong> — Interactive org chart showing
          Champion, Decision Maker, and Blocker nodes
        </li>
        <li>
          <strong>Tech Stack Timeline</strong> — Vertical timeline of historical
          security infrastructure changes
        </li>
      </ul>

      <h3>The Hunt (Competitive Kanban)</h3>
      <p>
        CyberSIP tracks <strong>&quot;Displacement Stages&quot;</strong> instead
        of traditional deal stages:
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
        Hover over a field to reveal a pencil icon. Click to transform text into
        an input. Auto-saves on blur with a green flash confirmation.
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
            <td><code>DataTable</code> + Editable Cells</td>
            <td>High-density data management</td>
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

      <h2>Theme, loading, and inline data (Phase 1.75)</h2>

      <ul>
        <li>
          <strong>Color theme</strong> — <code>next-themes</code> with{" "}
          <code>attribute=&quot;class&quot;</code> and{" "}
          <code>storageKey=&quot;cybersip-theme&quot;</code>; semantic tokens in{" "}
          <code>app/globals.css</code> for <code>:root</code> (light) and{" "}
          <code>.dark</code>. Quick toggle in the page header; Light / Dark / System
          in Settings → Appearance.
        </li>
        <li>
          <strong>Skeletons</strong> — Use <code>components/ui/skeleton.tsx</code>{" "}
          for layout-shaped placeholders. Shared{" "}
          <code>components/data-table-skeleton.tsx</code> for tables; route-specific
          shells include Vault contracts (summary + grid), Company 360, Territories
          (map vs list), and Hunt Kanban columns.
        </li>
        <li>
          <strong>Inline table editing</strong> — Portfolio companies and contacts:
          enum fields use compact borderless <code>Select</code> triggers; text and
          numbers use click-to-edit inputs (blur or Enter to save, Escape to cancel).
          Updates call <code>PATCH</code> with partial bodies only for changed fields.
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
        next={{ title: "Roadmap", href: "/roadmap", description: "Development phases & plans" }}
      />
    </div>
  );
}
