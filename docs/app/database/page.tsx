import type { Metadata } from "next";
import { Database } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Database Schema",
};

export default function DatabasePage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Database className="h-4 w-4" />
        <span className="font-medium">Database Schema</span>
      </div>
      <h1>Database Schema</h1>
      <p>
        CyberSIP uses <strong>PostgreSQL 16</strong> with{" "}
        <strong>Prisma ORM</strong> for type-safe database access. The schema is
        defined in <code>backend/prisma/schema.prisma</code> and contains 20+
        tables with rich relationships.
      </p>

      <h2>Entity Relationship Overview</h2>

      <pre>{`companies
  ├── company_names          (historical tracking)
  ├── company_sites          (physical locations)
  ├── company_industries ──► industries
  ├── contacts               (stakeholders)
  ├── contracts
  │     └── contract_line_items ──► products_services
  ├── competitor_intel ──────► competitors
  ├── engagements ───────────► engagement_stages
  ├── company_assignments ──► users
  └── company_territories ──► territories

territories (level 0=country, 1=state, 2=county)
  ├── territory_segments ──► segment_labels
  └── territory_members ──► team_members (individual people)

regions (APJ, EMEA, Americas) — standalone, no territory relationship

products_services
  └── product_categories`}</pre>

      <h2>Core Entity Tables</h2>

      <h3>companies</h3>
      <p>The central registry for all potential and current clients.</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code></td>
            <td>UUID PK</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>current_name</code></td>
            <td>VARCHAR(255)</td>
            <td>Official legal name</td>
          </tr>
          <tr>
            <td><code>status</code></td>
            <td>ENUM</td>
            <td>prospect, active_client, previous_client, lost, disqualified</td>
          </tr>
          <tr>
            <td><code>company_size</code></td>
            <td>ENUM</td>
            <td>SMB, Mid-Market, Enterprise, Government</td>
          </tr>
          <tr>
            <td><code>employee_count</code></td>
            <td>INT</td>
            <td>Total headcount</td>
          </tr>
          <tr>
            <td><code>revenue_range</code></td>
            <td>VARCHAR</td>
            <td>e.g., &apos;$10M–$50M&apos;</td>
          </tr>
          <tr>
            <td><code>website</code></td>
            <td>VARCHAR</td>
            <td>Corporate website URL</td>
          </tr>
          <tr>
            <td><code>stock_ticker</code></td>
            <td>VARCHAR</td>
            <td>For public companies (useful for news alerts)</td>
          </tr>
          <tr>
            <td><code>country</code></td>
            <td>VARCHAR</td>
            <td>HQ country</td>
          </tr>
        </tbody>
      </table>

      <h3>company_names</h3>
      <p>
        Tracks historical names to ensure continuity during M&A or rebranding.
      </p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>company_id</code></td>
            <td>UUID FK</td>
            <td>Reference to companies</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td>VARCHAR</td>
            <td>Previous name</td>
          </tr>
          <tr>
            <td><code>valid_to</code></td>
            <td>DATE</td>
            <td>Date name became obsolete</td>
          </tr>
          <tr>
            <td><code>reason</code></td>
            <td>VARCHAR</td>
            <td>Merger, Acquisition, Rebranding</td>
          </tr>
        </tbody>
      </table>

      <h3>company_sites</h3>
      <p>
        Tracks physical presence — critical for calculating per-site security pricing.
      </p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>site_name</code></td>
            <td>VARCHAR</td>
            <td>e.g., &apos;West Coast Data Center&apos;</td>
          </tr>
          <tr>
            <td><code>site_type</code></td>
            <td>ENUM</td>
            <td>hq, branch, data_center, warehouse</td>
          </tr>
          <tr>
            <td><code>employee_count</code></td>
            <td>INT</td>
            <td>Headcount at this site</td>
          </tr>
          <tr>
            <td><code>is_primary</code></td>
            <td>BOOLEAN</td>
            <td>True if HQ</td>
          </tr>
        </tbody>
      </table>

      <h2>Stakeholder Management</h2>

      <h3>contacts</h3>
      <p>Detailed profiles of individuals within client organizations.</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>company_id</code></td>
            <td>UUID FK</td>
            <td>Reference to companies</td>
          </tr>
          <tr>
            <td><code>first_name</code>, <code>last_name</code></td>
            <td>VARCHAR</td>
            <td>Contact name</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td>VARCHAR</td>
            <td>e.g., &apos;CISO&apos;, &apos;IT Director&apos;</td>
          </tr>
          <tr>
            <td><code>seniority</code></td>
            <td>ENUM</td>
            <td>C-Suite, VP, Director, Manager</td>
          </tr>
          <tr>
            <td><code>role_in_deal</code></td>
            <td>ENUM</td>
            <td>decision_maker, influencer, champion, blocker</td>
          </tr>
          <tr>
            <td><code>is_active</code></td>
            <td>BOOLEAN</td>
            <td>False if they left the company</td>
          </tr>
        </tbody>
      </table>

      <h2>Competitive Intelligence</h2>

      <h3>competitors</h3>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>VARCHAR</td>
            <td>e.g., &apos;CrowdStrike&apos;, &apos;Palo Alto&apos;</td>
          </tr>
          <tr>
            <td><code>strengths</code></td>
            <td>TEXT</td>
            <td>Talking points for sales</td>
          </tr>
          <tr>
            <td><code>weaknesses</code></td>
            <td>TEXT</td>
            <td>Counter-arguments for sales</td>
          </tr>
        </tbody>
      </table>

      <h3>competitor_intel</h3>
      <p>
        Specific intelligence about a competitor&apos;s presence within a client.
      </p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>company_id</code></td>
            <td>UUID FK</td>
            <td>Which client</td>
          </tr>
          <tr>
            <td><code>competitor_id</code></td>
            <td>UUID FK</td>
            <td>Which competitor</td>
          </tr>
          <tr>
            <td><code>product_name</code></td>
            <td>VARCHAR</td>
            <td>What product they have installed</td>
          </tr>
          <tr>
            <td><code>contract_end</code></td>
            <td>DATE</td>
            <td>Estimated expiry date</td>
          </tr>
          <tr>
            <td><code>confidence</code></td>
            <td>ENUM</td>
            <td>confirmed, rumor, inferred</td>
          </tr>
        </tbody>
      </table>

      <h2>Contract Management</h2>

      <h3>contracts</h3>
      <p>Tracks both internal contracts and known competitor contracts.</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>type</code></td>
            <td>ENUM</td>
            <td>our_contract, competitor_contract</td>
          </tr>
          <tr>
            <td><code>status</code></td>
            <td>ENUM</td>
            <td>active, expired, renewed, pending</td>
          </tr>
          <tr>
            <td><code>end_date</code></td>
            <td>DATE</td>
            <td>Critical for renewal alerts</td>
          </tr>
          <tr>
            <td><code>total_value</code></td>
            <td>DECIMAL</td>
            <td>Total contract value</td>
          </tr>
          <tr>
            <td><code>renewal_notice_days</code></td>
            <td>INT</td>
            <td>Days before expiry to trigger alert</td>
          </tr>
          <tr>
            <td><code>engagement_id</code></td>
            <td>UUID FK (nullable)</td>
            <td>
              Optional link to a pipeline <code>engagements</code> row (same
              company). Cleared if the engagement is deleted (
              <code>ON DELETE SET NULL</code>).
            </td>
          </tr>
        </tbody>
      </table>

      <h3>contract_line_items</h3>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>contract_id</code></td>
            <td>UUID FK</td>
            <td>Reference to contracts</td>
          </tr>
          <tr>
            <td><code>product_service_id</code></td>
            <td>UUID FK</td>
            <td>Reference to products_services</td>
          </tr>
          <tr>
            <td><code>quantity</code></td>
            <td>INT</td>
            <td>Number of units/seats</td>
          </tr>
          <tr>
            <td><code>unit_price</code></td>
            <td>DECIMAL</td>
            <td>Price per unit</td>
          </tr>
        </tbody>
      </table>

      <h2>Engagement & Pipeline</h2>

      <h3>engagement_stages</h3>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>VARCHAR</td>
            <td>e.g., &apos;Prospecting&apos;, &apos;Pitched&apos;, &apos;Proposal&apos;</td>
          </tr>
          <tr>
            <td><code>probability</code></td>
            <td>INT</td>
            <td>Win probability %</td>
          </tr>
        </tbody>
      </table>

      <h3>engagements</h3>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>company_id</code></td>
            <td>UUID FK</td>
            <td>Reference to companies</td>
          </tr>
          <tr>
            <td><code>stage_id</code></td>
            <td>UUID FK</td>
            <td>Current pipeline stage</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td>ENUM</td>
            <td>call, email, meeting, demo</td>
          </tr>
          <tr>
            <td><code>outcome</code></td>
            <td>TEXT</td>
            <td>Result of the interaction</td>
          </tr>
          <tr>
            <td><code>next_action_date</code></td>
            <td>DATE</td>
            <td>Follow-up deadline</td>
          </tr>
        </tbody>
      </table>

      <h2>Territory & Team Management</h2>

      <p>
        A three-tier geographic hierarchy that organizes companies and sales
        teams globally.
      </p>

      <h3>regions</h3>
      <p>
        Top-level geographic divisions with a fixed set via enum. The Region
        model still exists but no longer has a relationship to territories.
      </p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>VARCHAR UNIQUE</td>
            <td>e.g., &apos;Asia Pacific & Japan&apos;</td>
          </tr>
          <tr>
            <td><code>code</code></td>
            <td>ENUM UNIQUE</td>
            <td>APJ, EMEA, Americas</td>
          </tr>
        </tbody>
      </table>

      <h3>segment_labels</h3>
      <p>Labels for market segments (e.g., commercial, enterprise, public sector).</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code></td>
            <td>UUID PK</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td>VARCHAR UNIQUE</td>
            <td>e.g., &apos;commercial&apos;, &apos;enterprise&apos;, &apos;public_sector&apos;</td>
          </tr>
          <tr>
            <td><code>short_description</code></td>
            <td>VARCHAR</td>
            <td>Optional description</td>
          </tr>
        </tbody>
      </table>

      <h3>territories</h3>
      <p>Geographic territories with hierarchical levels (country, state/province, county).</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code></td>
            <td>UUID PK</td>
            <td>Unique identifier</td>
          </tr>
          <tr>
            <td><code>name</code></td>
            <td>VARCHAR</td>
            <td>Territory name</td>
          </tr>
          <tr>
            <td><code>level</code></td>
            <td>INT</td>
            <td>0=country, 1=state/province, 2=county</td>
          </tr>
          <tr>
            <td><code>color</code></td>
            <td>VARCHAR</td>
            <td>Hex color for map display</td>
          </tr>
          <tr>
            <td><code>region_id</code></td>
            <td>VARCHAR</td>
            <td>Code from regional_territories.json (e.g., &apos;APJ&apos;). Not a FK to regions.</td>
          </tr>
          <tr>
            <td><code>subregion_id</code></td>
            <td>VARCHAR</td>
            <td>e.g., &apos;APJ-002&apos;</td>
          </tr>
          <tr>
            <td><code>gid_0</code></td>
            <td>VARCHAR</td>
            <td>Optional. ISO3 country code, required if level ≥ 1</td>
          </tr>
          <tr>
            <td><code>gid_1</code></td>
            <td>VARCHAR</td>
            <td>Optional. GADM GID_1, required if level = 2</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td>JSON</td>
            <td>Array of &#123;id, name&#125; objects</td>
          </tr>
          <tr>
            <td><code>created_at</code>, <code>updated_at</code></td>
            <td>DateTime</td>
            <td>Timestamps</td>
          </tr>
        </tbody>
      </table>

      <h3>territory_segments</h3>
      <p>Join table linking territories to segment labels.</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>territory_id</code></td>
            <td>UUID FK</td>
            <td>Reference to territories</td>
          </tr>
          <tr>
            <td><code>segment_label_id</code></td>
            <td>UUID FK</td>
            <td>Reference to segment_labels</td>
          </tr>
        </tbody>
      </table>

      <h3>team_members</h3>
      <p>Individual sales team members who can be assigned to territories.</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>id</code></td>
            <td>UUID PK</td>
            <td>Primary key</td>
          </tr>
          <tr>
            <td><code>first_name</code></td>
            <td>String</td>
            <td>First name</td>
          </tr>
          <tr>
            <td><code>middle_name</code></td>
            <td>String?</td>
            <td>Middle name (optional)</td>
          </tr>
          <tr>
            <td><code>last_name</code></td>
            <td>String</td>
            <td>Last name</td>
          </tr>
          <tr>
            <td><code>role</code></td>
            <td>MemberRole</td>
            <td>sales_team or leadership</td>
          </tr>
          <tr>
            <td><code>position</code></td>
            <td>String</td>
            <td>Job title (e.g. Account Executive)</td>
          </tr>
          <tr>
            <td><code>email</code></td>
            <td>String (unique)</td>
            <td>Email address</td>
          </tr>
          <tr>
            <td><code>phone_number</code></td>
            <td>String?</td>
            <td>Phone number (optional)</td>
          </tr>
        </tbody>
      </table>

      <h3>territory_members</h3>
      <p>Join table assigning team members to territories. A territory acts as the team.</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>team_member_id</code></td>
            <td>UUID FK</td>
            <td>Reference to team_members</td>
          </tr>
          <tr>
            <td><code>territory_id</code></td>
            <td>UUID FK</td>
            <td>Reference to territories</td>
          </tr>
        </tbody>
      </table>

      <h3>company_territories</h3>
      <p>Join table linking companies to territories (replaces company_territory_groups).</p>
      <table>
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>company_id</code></td>
            <td>UUID FK</td>
            <td>Reference to companies</td>
          </tr>
          <tr>
            <td><code>territory_id</code></td>
            <td>UUID FK</td>
            <td>Reference to territories</td>
          </tr>
        </tbody>
      </table>

      <p>
        Territories act as teams — team members are assigned directly to
        territories via <code>territory_members</code>. A member can belong to
        multiple territories.
      </p>

      <h2>Access Control</h2>

      <h3>RBAC Permission Matrix</h3>
      <table>
        <thead>
          <tr>
            <th>Permission</th>
            <th>Admin</th>
            <th>Manager</th>
            <th>Sales Agent</th>
            <th>Viewer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>View All Companies</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Own Only</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Create/Edit Companies</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>No</td>
          </tr>
          <tr>
            <td>View Contract Values</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Own Only</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Delete Records</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>No</td>
            <td>No</td>
          </tr>
          <tr>
            <td>User Management</td>
            <td>Yes</td>
            <td>No</td>
            <td>No</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Export Data</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>No</td>
            <td>No</td>
          </tr>
        </tbody>
      </table>

      <DocsPager
        prev={{ title: "Getting Started", href: "/getting-started", description: "Installation & setup" }}
        next={{ title: "Backend API", href: "/backend", description: "66 REST endpoints" }}
      />
    </div>
  );
}
