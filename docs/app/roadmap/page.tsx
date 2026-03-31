import type { Metadata } from "next";
import { Map } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Roadmap",
};

export default function RoadmapPage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Map className="h-4 w-4" />
        <span className="font-medium">Roadmap</span>
      </div>
      <h1>Development Roadmap</h1>
      <p>
        CyberSIP&apos;s development is structured in five phases across{" "}
        <strong>5+ weeks</strong>, progressing from core data connectivity
        through full API wiring, AI integration, automation, and UX polish.
        Development is accelerated with AI-assisted coding (Cursor).
      </p>

      <h2>Current State</h2>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <h3 className="mt-0 mb-2 text-sm font-semibold text-green-600">
            What&apos;s Working
          </h3>
          <ul className="mb-0 text-sm">
            <li>7 frontend pages (Next.js 16 + shadcn/ui)</li>
            <li>FastAPI backend with 9 CRUD routers (66 endpoints)</li>
            <li>Prisma schema with rich relationships</li>
            <li>Docker Compose (PostgreSQL + backend)</li>
            <li>Sidebar navigation grouped by strategic intent</li>
            <li>TanStack Query + centralized API client (get, post, patch, del)</li>
            <li>Portfolio connected to real API (companies + contacts CRUD)</li>
            <li>Company 360 page with live data (contacts, engagements, contracts, intel)</li>
            <li>Hunt page — live Kanban pipeline with engagement CRUD, linked to Company 360</li>
            <li>Vault page — contracts table with CRUD, summary cards, company links</li>
            <li>Intelligence Hub — live competitor tracker and intel feed with CRUD, static market signals preview</li>
            <li>Territories — map/list toggle, CRUD via /api/territories and /api/segment-labels, geo data via /api/geo/*, GeoJSON polygons, team member assignment</li>
            <li>Context-aware breadcrumbs (Hunt / Vault → Company 360 → back)</li>
            <li>Seed script with stages, engagements, products, contracts, and line items</li>
          </ul>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="mt-0 mb-2 text-sm font-semibold text-red-600">
            The Gap
          </h3>
          <ul className="mb-0 text-sm">
            <li>1 page still uses hardcoded mock data (Command Center)</li>
            <li>Company 360 contacts sub-section is read-only (no contact CRUD on the detail page)</li>
            <li>Hunt ↔ Vault cross-reference not yet implemented (contract indicators on pipeline cards)</li>
            <li>No authentication / authorization</li>
            <li>No AI integration</li>
            <li>No N8N automation workflows</li>
            <li>Missing key interactive components (CMD+K, drag-and-drop, inline editing)</li>
          </ul>
        </div>
      </div>

      <h2>Phase 1 — Connect & Core</h2>

      <div className="mb-6 rounded-l-none rounded-lg border-l-4 border-l-blue-500 bg-blue-500/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
          Week 1 — Done
        </p>
        <ol className="mb-0 text-sm">
          <li className="line-through opacity-60">Install TanStack Query, set up API client</li>
          <li className="line-through opacity-60">
            Connect Portfolio page to <code>/api/companies</code> and{" "}
            <code>/api/contacts</code>
          </li>
          <li className="line-through opacity-60">Add Create / Edit / Delete modals for companies and contacts</li>
          <li className="line-through opacity-60">
            Build the Company 360 page (<code>/portfolio/[id]</code>)
          </li>
        </ol>
      </div>

      <h2>Phase 1.5 — Connect the Rest</h2>

      <div className="mb-6 rounded-l-none rounded-lg border-l-4 border-l-blue-500 bg-blue-500/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
          Week 1–2
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          The backend already has full CRUD for all entities (66 endpoints across
          9 routers). These tasks wire the remaining static pages to real API
          data using the same pattern established in Phase 1: TanStack Query
          hook → replace mock data → add CRUD modals.
        </p>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wider">
          Priority 1 — High value, backend ready
        </p>
        <ol start={5} className="mb-4 text-sm">
          <li className="line-through opacity-60">
            Connect Hunt page to <code>/api/engagements</code> and{" "}
            <code>/api/stages</code> — live Kanban pipeline with engagement
            CRUD, company links, context-aware breadcrumbs
          </li>
          <li className="line-through opacity-60">
            Connect Vault page to <code>/api/contracts</code> and{" "}
            <code>/api/contracts/&#123;id&#125;/line-items</code> — contracts
            table with CRUD, summary cards, company links
          </li>
          <li className="line-through opacity-60">
            Connect Intelligence page to <code>/api/competitors</code> and{" "}
            <code>/api/intel</code> — competitor tracker and intel feed with
            CRUD, static market signals preview
          </li>
          <li>
            <strong>Sales Recon</strong> —{" "}
            <code>/sales-recon</code> GTM recon workspace: account picker
            (portfolio companies), illustrative signals for LinkedIn / social /
            hiring / news with external links; live ingestion via backend APIs
            next
          </li>
        </ol>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wider">
          Priority 2 — More complex wiring
        </p>
        <ol start={8} className="mb-4 text-sm">
          <li className="line-through opacity-60">
            Connect Territories page to <code>/api/territories</code>,{" "}
            <code>/api/segment-labels</code>, and <code>/api/geo/*</code> —
            map/list views with CRUD, GeoJSON polygons, hover tooltips
          </li>
          <li className="line-through opacity-60">
            Add team member assignment on Territories page —
            assign members to territories via{" "}
            <code>/api/team-members</code> and{" "}
            <code>/api/territory-members</code>
          </li>
          <li className="line-through opacity-60">
            Add CRUD to Company 360 sub-sections — create/edit/delete for
            engagements, contracts, and competitor intel (reuses Hunt / Vault /
            Intelligence dialogs with <code>scopedCompanyId</code>)
          </li>
          <li>
            Hunt ↔ Vault cross-reference — show contract status indicators on
            Hunt engagement cards (proposal submitted, contract signed) and
            link Vault rows to their related engagements
          </li>
        </ol>

        <p className="mb-1 text-xs font-semibold uppercase tracking-wider">
          Priority 3 — Dashboard & aggregation
        </p>
        <ol start={11} className="mb-0 text-sm">
          <li>
            Connect Command Center to real data — build KPI aggregation
            (pipeline value, contract counts, renewal radar) from connected
            entities
          </li>
        </ol>
      </div>

      <h2>Phase 2 — Make It Smart</h2>

      <div className="mb-6 rounded-l-none rounded-lg border-l-4 border-l-amber-500 bg-amber-500/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-500">
          Week 3
        </p>
        <ol start={12} className="mb-0 text-sm">
          <li>
            Add a <code>/api/ai/enrich-company</code> endpoint (OpenAI or
            similar)
          </li>
          <li>Build the Smart-Add Company modal with domain enrichment</li>
          <li>Add drag-and-drop stage transitions on Hunt kanban</li>
          <li>Add CMD+K command palette</li>
        </ol>
      </div>

      <h2>Phase 3 — Automate with N8N</h2>

      <div className="mb-6 rounded-l-none rounded-lg border-l-4 border-l-green-500 bg-green-500/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-green-500">
          Week 4
        </p>
        <ol start={16} className="mb-0 text-sm">
          <li>
            Set up N8N (add to <code>docker-compose.yml</code>)
          </li>
          <li>Build competitor news scraper workflow</li>
          <li>Build contract expiry notification workflow</li>
          <li>Connect Action Stream to real data</li>
        </ol>
      </div>

      <h2>Phase 4 — Polish</h2>

      <div className="mb-6 rounded-l-none rounded-lg border-l-4 border-l-purple-500 bg-purple-500/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-purple-500">
          Week 5
        </p>
        <ol start={20} className="mb-0 text-sm">
          <li>Dark mode toggle</li>
          <li>Skeleton loading states everywhere</li>
          <li>Inline editing on tables</li>
          <li>Battle Card generation with AI</li>
          <li>Displacement email template generation</li>
          <li>
            Advanced Hunt ↔ Vault integration — &quot;Create Proposal&quot;
            action from engagement cards, auto-stage transitions on contract
            signing, dedicated Proposal model with versioning and approval
            workflow
          </li>
        </ol>
      </div>

      <h2>AI-Powered Features</h2>

      <p>
        Planned AI integrations via FastAPI + OpenAI/Claude:
      </p>

      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Description</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Smart-Add Company</td>
            <td>
              Enter <code>acme.com</code>, AI enriches company data (industry,
              size, HQ, tech stack)
            </td>
            <td>
              <code>/api/ai/enrich-company</code>
            </td>
          </tr>
          <tr>
            <td>Battle Card Generation</td>
            <td>Auto-generate competitor talking points from intel data</td>
            <td>Company 360 view</td>
          </tr>
          <tr>
            <td>Relationship Health Score</td>
            <td>
              AI scores account health from engagement frequency, sentiment,
              contract proximity
            </td>
            <td>Command Center + Portfolio</td>
          </tr>
          <tr>
            <td>Displacement Email Templates</td>
            <td>
              Personalized outreach using competitor weakness + prospect context
            </td>
            <td>Intelligence Hub</td>
          </tr>
          <tr>
            <td>Action Stream Intelligence</td>
            <td>Summarize and prioritize news feeds into actionable alerts</td>
            <td>Command Center</td>
          </tr>
          <tr>
            <td>CISO Pain Points</td>
            <td>Extract insights from engagement notes via NLP</td>
            <td>Contact hover card</td>
          </tr>
        </tbody>
      </table>

      <h2>N8N Automation Workflows</h2>

      <table>
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Trigger</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Competitor News Scraper</td>
            <td>Scheduled (daily)</td>
            <td>Scrape CyberWire, NIST NVD, vendor blogs → push to Intelligence Hub</td>
          </tr>
          <tr>
            <td>Contract Expiry Alerts</td>
            <td>Cron (daily)</td>
            <td>Query contracts expiring in 30/60/90 days → Slack/email</td>
          </tr>
          <tr>
            <td>Company Enrichment</td>
            <td>Webhook on creation</td>
            <td>Call Clearbit/Apollo API → auto-fill company data</td>
          </tr>
          <tr>
            <td>CVE Monitor</td>
            <td>Scheduled</td>
            <td>Monitor NVD for CVEs affecting tracked competitors</td>
          </tr>
          <tr>
            <td>Deal Stage Alerts</td>
            <td>Webhook on update</td>
            <td>If deal stuck &gt;14 days → notify owner + manager</td>
          </tr>
          <tr>
            <td>Meeting Follow-Up</td>
            <td>Webhook after engagement</td>
            <td>AI generates follow-up email draft</td>
          </tr>
        </tbody>
      </table>

      <h2>Missing Frontend Features</h2>

      <h3>Missing Pages / Views</h3>
      <ul>
        <li>
          <strong>Company 360-Degree View</strong> (
          <code>/portfolio/[companyId]</code>) — Battle Card sidebar,
          Relationship Map, Tech Stack Timeline, Whitespace Analysis Matrix
        </li>
        <li>
          <strong>Contact Detail View</strong> — CISO Battle Card modal on hover
        </li>
      </ul>

      <h3>Missing Interactive Components</h3>
      <ul>
        <li>CMD+K Command Palette</li>
        <li>Smart-Add Company Modal (domain-first approach)</li>
        <li>Intelligence Drawer (right slide-over)</li>
        <li>Inline &quot;Ghost&quot; Editing on tables</li>
        <li>Drag-and-Drop on Kanban</li>
        <li>Multi-Step Engagement Wizard</li>
      </ul>

      <h3>Missing UX Patterns</h3>
      <ul>
        <li>Dark mode toggle</li>
        <li>Skeleton loading states</li>
        <li>Toast notifications (Sonner)</li>
        <li>Real-time Action Stream (WebSocket or polling)</li>
        <li>Filters and search across all pages</li>
      </ul>

      <h2>Quick Wins — High Value Additions</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          {
            title: "Activity Log / Audit Trail",
            desc: "Track who changed what and when. Essential for accountability.",
          },
          {
            title: "Dashboard Filters",
            desc: "Filter Command Center by territory, time range, or deal owner.",
          },
          {
            title: "CSV / Excel Export",
            desc: "One-click export from any table. Sales teams live in spreadsheets.",
          },
          {
            title: "Saved Views / Bookmarks",
            desc: 'Save filtered table views (e.g., "My EMEA accounts expiring Q2").',
          },
          {
            title: "Notification Center",
            desc: "Bell icon with unread alerts, separate from the Action Stream.",
          },
          {
            title: "Mobile PWA Support",
            desc: "Make the app installable as a PWA for reps on the road.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-border p-4"
          >
            <h3 className="mt-0 mb-1 text-sm font-semibold">{item.title}</h3>
            <p className="mb-0 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>Suggested Improvements</h2>

      <h3>Critical Must-Haves</h3>
      <ol>
        <li>
          <strong>Renewal Alert Engine</strong> — Automated system flagging
          contracts expiring in 30/60/90 days
        </li>
        <li>
          <strong>Competitive Displacement Score</strong> — Algorithm ranking
          prospects based on competitor weakness and contract expiry
        </li>
        <li>
          <strong>Deal Health Score</strong> — Auto-calculation based on
          communication frequency and stakeholder engagement
        </li>
        <li>
          <strong>Duplicate Detection</strong> — Flag similar company names or
          websites during creation
        </li>
      </ol>

      <h3>High-Value Additions</h3>
      <ol start={5}>
        <li>Visual Relationship Map (interactive org chart)</li>
        <li>Contract Timeline View (Gantt-chart style)</li>
        <li>Market Coverage Heatmap</li>
        <li>Product Penetration Matrix</li>
        <li>Lost Deal Post-Mortem</li>
        <li>Win/Loss Analytics</li>
      </ol>

      <h3>Nice-to-Have Features</h3>
      <ol start={11}>
        <li>
          <strong>Email Sync (Outlook / Gmail)</strong> — Automatic logging of
          emails into the engagement timeline via Microsoft Graph API or Gmail
          API. Match emails to companies/contacts by domain and auto-create
          engagement records, eliminating manual data entry for reps.
        </li>
        <li>
          <strong>LinkedIn Sales Navigator Integration</strong> — Browser
          extension or API integration to pull contact details, track job
          changes (your champion left → alert), and monitor LinkedIn activity
          for prospect intent signals.
        </li>
        <li>
          <strong>News Alert Triggers</strong> — Real-time notifications when a
          prospect appears in the news (funding rounds, data breaches, M&A
          activity). Feed via N8N scrapers into the Action Stream with
          AI-generated relevance scoring.
        </li>
        <li>
          <strong>Proposal Generator</strong> — One-click PDF generation
          pulling dynamic data from the database: company details, recommended
          products, competitive positioning, and pricing. Template-driven with
          customizable branding.
        </li>
        <li>
          <strong>Compliance Tracker</strong> — Track regulatory requirements
          (GDPR, HIPAA, SOC 2, PCI DSS) per client. Auto-flag when a
          prospect&apos;s industry has compliance mandates that align with your
          product offerings — turning compliance into a sales angle.
        </li>
        <li>
          <strong>Revenue Forecasting</strong> — Predictive revenue modeling
          based on pipeline stage probabilities (already stored in{" "}
          <code>engagement_stages.probability</code>), weighted by deal size,
          historical win rates, and engagement velocity.
        </li>
      </ol>

      <h2>Phase 5 — Enterprise Integrations & Analytics</h2>

      <p>
        Beyond the core platform, CyberSIP&apos;s decoupled architecture
        (FastAPI REST API + PostgreSQL) makes it ready for enterprise-grade
        integrations. The backend never exposes the database directly — every
        external system talks through the API, enabling clean integration
        without architectural changes.
      </p>

      <div className="mb-6 rounded-l-none rounded-lg border-l-4 border-l-cyan-500 bg-cyan-500/5 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-500">
          Future Expansion
        </p>
        <ol start={24} className="mb-0 text-sm">
          <li>Salesforce bidirectional sync (accounts, contacts, opportunities)</li>
          <li>Power BI dashboards via direct PostgreSQL or REST API connector</li>
          <li>Data enrichment pipeline (ZoomInfo / Apollo / Clearbit)</li>
          <li>Slack / Microsoft Teams real-time notifications</li>
          <li>Data warehouse export (Snowflake / BigQuery)</li>
          <li>Custom AI models trained on win/loss data</li>
        </ol>
      </div>

      <h3>Salesforce Integration</h3>

      <p>
        Salesforce is the most high-value integration because it eliminates the
        dual-entry problem — sales reps shouldn&apos;t have to enter data in
        two systems. CyberSIP becomes the{" "}
        <strong>intelligence layer on top of Salesforce</strong>, adding the
        competitor tracking, renewal radar, and displacement strategies that
        Salesforce can&apos;t do natively.
      </p>

      <table>
        <thead>
          <tr>
            <th>Pattern</th>
            <th>Direction</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Account Sync</strong>
            </td>
            <td>Salesforce → CyberSIP</td>
            <td>
              Pull Accounts into <code>companies</code>, Contacts into{" "}
              <code>contacts</code>, Opportunities into{" "}
              <code>engagements</code>. Map Salesforce fields to CyberSIP
              schema using a configurable mapping layer.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Intel Push-Back</strong>
            </td>
            <td>CyberSIP → Salesforce</td>
            <td>
              Push competitive intelligence (battle cards, displacement scores,
              competitor intel) back into Salesforce as custom objects or fields
              so reps see it where they already work.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Event-Driven Sync</strong>
            </td>
            <td>Bidirectional</td>
            <td>
              N8N webhooks listen for Salesforce events (new opportunity, stage
              change) and sync them into CyberSIP. CyberSIP updates trigger
              Salesforce field updates via the Salesforce REST API.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Auth Flow</strong>
            </td>
            <td>—</td>
            <td>
              OAuth 2.0 Connected App flow. Store tokens securely, handle
              refresh cycles. New FastAPI endpoint:{" "}
              <code>/api/integrations/salesforce/</code>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <strong>Object mapping:</strong> Salesforce Account → CyberSIP Company
        | Salesforce Contact → CyberSIP Contact | Salesforce Opportunity →
        CyberSIP Engagement | Salesforce Competitor (custom) → CyberSIP
        CompetitorIntel
      </div>

      <h3>Power BI / Analytics Integration</h3>

      <p>
        Power BI integration is the <strong>quickest win</strong> since it
        primarily needs a data source to query. Two connection strategies are
        available:
      </p>

      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Pros</th>
            <th>Cons</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Direct PostgreSQL</strong>
            </td>
            <td>
              Fastest setup — just a connection string. Full SQL access. Power
              BI data modeling maps nearly 1:1 to the Prisma schema.
            </td>
            <td>
              Bypasses business logic layer. Read-only connection recommended.
              Needs network access to DB.
            </td>
          </tr>
          <tr>
            <td>
              <strong>REST API Connector</strong>
            </td>
            <td>
              Uses the existing 66 FastAPI endpoints. Gets calculated fields
              (health scores, displacement rankings). Respects RBAC.
            </td>
            <td>
              Custom Power BI connector needed. Pagination handling. Slightly
              more setup.
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Potential Power BI Dashboards</h3>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          {
            title: "Renewal Pipeline",
            desc: "Competitor contracts expiring by quarter, territory, and deal size. Filterable by region and team assignment.",
          },
          {
            title: "Territory Performance",
            desc: "Win/loss heatmaps by region, team, and individual rep. Compare territory coverage against revenue targets.",
          },
          {
            title: "Competitive Landscape",
            desc: "Market share visualization showing which competitors own which accounts. Track displacement success rates over time.",
          },
          {
            title: "Pipeline Velocity",
            desc: "How fast deals move through displacement stages. Identify bottlenecks (e.g., deals stuck at 'Proof of Concept' > 14 days).",
          },
          {
            title: "Revenue Forecasting",
            desc: "Weighted pipeline value based on engagement_stages.probability, historical close rates, and deal aging.",
          },
          {
            title: "Rep Activity Scorecard",
            desc: "Engagement frequency, response times, meeting-to-close ratios. Manager visibility across team performance.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-border p-4"
          >
            <h3 className="mt-0 mb-1 text-sm font-semibold">{item.title}</h3>
            <p className="mb-0 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>Future Integration Landscape</h2>

      <p>
        The decoupled REST API architecture means any external system can
        integrate without touching the database directly. Here is the full
        landscape of planned and potential integrations:
      </p>

      <table>
        <thead>
          <tr>
            <th>Integration</th>
            <th>Category</th>
            <th>What It Enables</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Salesforce</strong>
            </td>
            <td>CRM Sync</td>
            <td>
              Bidirectional account/contact/opportunity sync. CyberSIP becomes
              the intelligence layer Salesforce lacks.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Power BI</strong>
            </td>
            <td>Analytics</td>
            <td>
              Executive dashboards, pipeline forecasting, territory performance
              heatmaps via direct PostgreSQL or API connector.
            </td>
          </tr>
          <tr>
            <td>
              <strong>LinkedIn Sales Navigator</strong>
            </td>
            <td>Enrichment</td>
            <td>
              Auto-enrich contacts, track job changes (champion left → alert),
              monitor prospect intent signals from LinkedIn activity.
            </td>
          </tr>
          <tr>
            <td>
              <strong>ZoomInfo / Apollo / Clearbit</strong>
            </td>
            <td>Enrichment</td>
            <td>
              Company enrichment for the Smart-Add modal flow. Auto-fill
              industry, employee count, revenue range, tech stack on company
              creation.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Slack / Microsoft Teams</strong>
            </td>
            <td>Notifications</td>
            <td>
              Real-time alerts when competitor contracts near expiry, deal stage
              changes, or new intel is logged. Channel-per-territory pattern.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Outlook / Gmail</strong>
            </td>
            <td>Email Sync</td>
            <td>
              Auto-log email interactions into engagement timeline. Match by
              contact email or company domain. Eliminate manual activity
              logging.
            </td>
          </tr>
          <tr>
            <td>
              <strong>NIST NVD / CyberWire</strong>
            </td>
            <td>Threat Intel</td>
            <td>
              Feed CVE and breach data into the Action Stream. Auto-correlate
              vulnerabilities with tracked competitors to create displacement
              opportunities.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Snowflake / BigQuery</strong>
            </td>
            <td>Data Warehouse</td>
            <td>
              Export historical data for long-term trend analysis beyond what
              PostgreSQL + Power BI handles. Cross-reference with external
              market data.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Custom AI Models</strong>
            </td>
            <td>ML / Prediction</td>
            <td>
              Train on historical win/loss data to predict displacement
              likelihood per account. Personalized next-best-action
              recommendations for reps.
            </td>
          </tr>
          <tr>
            <td>
              <strong>DocuSign / PandaDoc</strong>
            </td>
            <td>Documents</td>
            <td>
              One-click proposal generation from the Vault. Track document
              status (sent, viewed, signed) and auto-update contract records.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Calendly / Cal.com</strong>
            </td>
            <td>Scheduling</td>
            <td>
              Embed scheduling links in displacement emails. Auto-create
              engagement records when meetings are booked.
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <strong>Architecture advantage:</strong> All integrations connect
        through FastAPI endpoints (e.g.,{" "}
        <code>/api/integrations/salesforce/</code>,{" "}
        <code>/api/integrations/powerbi/</code>). The frontend never calls
        external services directly — keeping the security boundary clean and
        the integration logic centralized on the backend.
      </div>

      <DocsPager
        prev={{ title: "UX / UI Design", href: "/design", description: "Design system & patterns" }}
      />
    </div>
  );
}
