import type { Metadata } from "next";
import { Server } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Backend API",
};

function EndpointTable({
  endpoints,
}: {
  endpoints: { method: string; path: string; description: string }[];
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Method</th>
          <th>Endpoint</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {endpoints.map((ep, i) => (
          <tr key={i}>
            <td>
              <code
                className={
                  ep.method === "POST"
                    ? "text-green-600!"
                    : ep.method === "GET"
                      ? "text-blue-600!"
                      : ep.method === "PATCH"
                        ? "text-amber-600!"
                        : "text-red-600!"
                }
              >
                {ep.method}
              </code>
            </td>
            <td>
              <code>{ep.path}</code>
            </td>
            <td>{ep.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function BackendPage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Server className="h-4 w-4" />
        <span className="font-medium">Backend API</span>
      </div>
      <h1>Backend API Reference</h1>
      <p>
        The FastAPI backend provides <strong>74+ REST endpoints</strong> across{" "}
        <strong>11 router groups</strong>. All endpoints follow a consistent
        pattern with Pydantic validation for request/response schemas.
      </p>

      <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <strong>Interactive docs:</strong> With the server running, open{" "}
        <code>http://localhost:8000/docs</code> for the auto-generated Swagger
        UI where you can test every endpoint directly.
      </div>

      <h2>API Overview</h2>

      <table>
        <thead>
          <tr>
            <th>Router Group</th>
            <th>File</th>
            <th>Prefix</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Command Center</td>
            <td><code>command_center.py</code></td>
            <td>
              <code>/api/command-center/summary</code>,{" "}
              <code>/api/command-center/action-stream</code>
            </td>
          </tr>
          <tr>
            <td>Companies</td>
            <td><code>companies.py</code></td>
            <td><code>/api/companies</code></td>
          </tr>
          <tr>
            <td>Contacts</td>
            <td><code>contacts.py</code></td>
            <td><code>/api/contacts</code></td>
          </tr>
          <tr>
            <td>Engagements</td>
            <td><code>engagements.py</code></td>
            <td><code>/api/stages</code>, <code>/api/engagements</code></td>
          </tr>
          <tr>
            <td>Assignments</td>
            <td><code>assignments.py</code></td>
            <td><code>/api/assignments</code></td>
          </tr>
          <tr>
            <td>Products</td>
            <td><code>products.py</code></td>
            <td><code>/api/categories</code>, <code>/api/products</code></td>
          </tr>
          <tr>
            <td>Contracts</td>
            <td><code>contracts.py</code></td>
            <td><code>/api/contracts</code>, <code>/api/line-items</code></td>
          </tr>
          <tr>
            <td>Competitors</td>
            <td><code>competitors.py</code></td>
            <td><code>/api/competitors</code>, <code>/api/intel</code></td>
          </tr>
          <tr>
            <td>Territories</td>
            <td><code>territories.py</code></td>
            <td><code>/api/regions</code>, <code>/api/territories</code>, <code>/api/segment-labels</code>, <code>/api/company-territories</code></td>
          </tr>
          <tr>
            <td>Geographic Data</td>
            <td><code>geo.py</code></td>
            <td><code>/api/geo</code></td>
          </tr>
          <tr>
            <td>Team Members</td>
            <td><code>teams.py</code></td>
            <td><code>/api/team-members</code>, <code>/api/territory-members</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Schema Pattern</h2>

      <p>
        Each entity has three Pydantic models following a consistent pattern:
      </p>

      <ul>
        <li>
          <strong>Create</strong> — Fields required when creating a new record
        </li>
        <li>
          <strong>Update</strong> — All fields optional (partial update via PATCH)
        </li>
        <li>
          <strong>Response</strong> — Shape returned to the frontend
        </li>
      </ul>

      <pre>{`from pydantic import BaseModel, Field

class CompanyCreate(BaseModel):
    current_name: str = Field(..., min_length=1, max_length=255)
    status: CompanyStatus = CompanyStatus.prospect
    company_size: Optional[CompanySize] = None
    employee_count: Optional[int] = Field(None, ge=0)
    # ...

class CompanyUpdate(BaseModel):
    current_name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[CompanyStatus] = None
    # ... all fields optional

class CompanyResponse(BaseModel):
    id: str
    current_name: str
    status: CompanyStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True`}</pre>

      <h2>Command Center</h2>
      <p>
        Read-only aggregation for the home dashboard: pipeline value (sum of{" "}
        <code>total_value</code> on <strong>pending</strong>{" "}
        <code>our_contract</code> records), counts of active contracts and
        contracts expiring in the next 90 days (UTC), and a renewal radar list
        (active contracts with <code>end_date</code> in that window, with
        company, territory, and best-effort competitor label from intel).
      </p>
      <p>
        <strong>Action Stream (Phase 1.75 v1)</strong> —{" "}
        <code>GET /api/command-center/action-stream</code> merges recent{" "}
        <strong>engagements</strong> (by <code>created_at</code>, up to the{" "}
        <code>days</code> lookback) and <strong>new companies</strong> (by{" "}
        <code>created_at</code>, lookback capped at 14 days and at most 15
        rows) within a configurable window, sorted newest-first. Query
        params: <code>limit</code> (1–100, default 25), <code>days</code>{" "}
        (1–365, default 90). Each item includes <code>stream_type</code> for UI
        icons (<code>pipeline</code>, <code>win</code>, <code>loss</code>, etc.),
        <code>message</code>, <code>occurred_at</code>, optional{" "}
        <code>company_id</code> / <code>engagement_id</code>, and{" "}
        <code>source: crm</code> for future N8N enrichment.
      </p>
      <EndpointTable
        endpoints={[
          {
            method: "GET",
            path: "/api/command-center/summary",
            description:
              "Dashboard KPIs + renewal radar (contracts, companies, territories, competitor intel)",
          },
          {
            method: "GET",
            path: "/api/command-center/action-stream",
            description:
              "Merged timeline: recent engagements + newly created companies (DB-only v1)",
          },
        ]}
      />

      <h2>Companies</h2>
      <p>The central entity. All other entities connect to companies.</p>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/companies", description: "Create a new company" },
          { method: "GET", path: "/api/companies", description: "List companies (optional status; query skip, take ≤ 500)" },
          { method: "GET", path: "/api/companies/{id}", description: "Get a single company" },
          { method: "PATCH", path: "/api/companies/{id}", description: "Update a company" },
          { method: "DELETE", path: "/api/companies/{id}", description: "Delete a company" },
        ]}
      />

      <h2>Contacts</h2>
      <p>
        Stakeholders within client organizations. Each contact belongs to a
        company.
      </p>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/contacts", description: "Create a contact (requires company_id)" },
          { method: "GET", path: "/api/contacts", description: "List contacts (filter by company_id)" },
          { method: "GET", path: "/api/contacts/{id}", description: "Get a single contact" },
          { method: "PATCH", path: "/api/contacts/{id}", description: "Update a contact" },
          { method: "DELETE", path: "/api/contacts/{id}", description: "Delete a contact" },
        ]}
      />

      <h2>Engagements & Stages</h2>
      <p>
        Tracks interactions (calls, emails, meetings, demos) with companies.
        Includes pipeline stage management. Engagement responses are enriched
        with <code>company_name</code> and <code>stage_name</code> via Prisma
        relation includes.
      </p>

      <h3>Pipeline Stages</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/stages", description: "Create a stage (name + win probability %)" },
          { method: "GET", path: "/api/stages", description: "List all stages" },
          { method: "PATCH", path: "/api/stages/{id}", description: "Update a stage" },
          { method: "DELETE", path: "/api/stages/{id}", description: "Delete a stage" },
        ]}
      />

      <h3>Engagements</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/engagements", description: "Log a new engagement" },
          { method: "GET", path: "/api/engagements", description: "List engagements (filter by company, type, stage_id)" },
          { method: "GET", path: "/api/engagements/{id}", description: "Get a single engagement" },
          { method: "PATCH", path: "/api/engagements/{id}", description: "Update an engagement" },
          { method: "DELETE", path: "/api/engagements/{id}", description: "Delete an engagement" },
        ]}
      />

      <h2>Company Assignments</h2>
      <p>
        Assigns users (sales agents) to companies as <strong>owner</strong> or{" "}
        <strong>collaborator</strong>. Uses a composite key.
      </p>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/assignments", description: "Assign a user to a company" },
          { method: "GET", path: "/api/assignments", description: "List assignments (filter by company or user)" },
          { method: "PATCH", path: "/api/assignments/{company_id}/{user_id}", description: "Change the role" },
          { method: "DELETE", path: "/api/assignments/{company_id}/{user_id}", description: "Remove the assignment" },
        ]}
      />

      <h2>Products & Services</h2>
      <p>Product/service catalog with categories.</p>

      <h3>Product Categories</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/categories", description: "Create a category" },
          { method: "GET", path: "/api/categories", description: "List all categories" },
          { method: "PATCH", path: "/api/categories/{id}", description: "Update a category" },
          { method: "DELETE", path: "/api/categories/{id}", description: "Delete a category" },
        ]}
      />

      <h3>Products / Services</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/products", description: "Create a product/service" },
          { method: "GET", path: "/api/products", description: "List products (filter by category)" },
          { method: "GET", path: "/api/products/{id}", description: "Get a single product" },
          { method: "PATCH", path: "/api/products/{id}", description: "Update a product" },
          { method: "DELETE", path: "/api/products/{id}", description: "Delete a product" },
        ]}
      />

      <h2>Contracts</h2>
      <p>
        Tracks both internal and competitor contracts. Each contract can have
        multiple line items linking to products/services. Create and PATCH accept
        optional <code>engagement_id</code> when the engagement belongs to the
        same company; responses include <code>engagement_id</code> (nullable).
        Contract responses are enriched with <code>company_name</code> via
        Prisma relation includes.
      </p>

      <h3>Contracts</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/contracts", description: "Create a contract" },
          { method: "GET", path: "/api/contracts", description: "List contracts (filter by company, type, status)" },
          { method: "GET", path: "/api/contracts/{id}", description: "Get a single contract" },
          { method: "PATCH", path: "/api/contracts/{id}", description: "Update a contract" },
          { method: "DELETE", path: "/api/contracts/{id}", description: "Delete a contract (cascades line items)" },
        ]}
      />

      <h3>Contract Line Items</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/contracts/{id}/line-items", description: "Add a line item" },
          { method: "GET", path: "/api/contracts/{id}/line-items", description: "List line items for a contract" },
          { method: "PATCH", path: "/api/line-items/{id}", description: "Update quantity or price" },
          { method: "DELETE", path: "/api/line-items/{id}", description: "Remove a line item" },
        ]}
      />

      <h2>Competitive Intelligence</h2>
      <p>
        The key differentiator: tracking competitor presence within client
        organizations.
      </p>

      <h3>Competitors</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/competitors", description: "Register a competitor" },
          { method: "GET", path: "/api/competitors", description: "List all competitors" },
          { method: "GET", path: "/api/competitors/{id}", description: "Get a single competitor" },
          { method: "PATCH", path: "/api/competitors/{id}", description: "Update strengths/weaknesses" },
          { method: "DELETE", path: "/api/competitors/{id}", description: "Delete a competitor" },
        ]}
      />

      <h3>Competitor Intel</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/intel", description: "Log intel on a competitor at a company" },
          { method: "GET", path: "/api/intel", description: "List intel (filter by company, competitor, confidence)" },
          { method: "GET", path: "/api/intel/{id}", description: "Get a single intel record" },
          { method: "PATCH", path: "/api/intel/{id}", description: "Update an intel record" },
          { method: "DELETE", path: "/api/intel/{id}", description: "Delete an intel record" },
        ]}
      />

      <h2>Territories</h2>
      <p>
        Manages the geographic hierarchy: Regions → Territories (with segments)
        → Company assignments.
      </p>

      <h3>Regions</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/regions", description: "Create a region (name + code)" },
          { method: "GET", path: "/api/regions", description: "List all regions" },
          { method: "PATCH", path: "/api/regions/{id}", description: "Update a region" },
          { method: "DELETE", path: "/api/regions/{id}", description: "Delete a region (cascades)" },
        ]}
      />

      <h3>Territories</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/territories", description: "Create territory with segments" },
          { method: "GET", path: "/api/territories", description: "List territories with segments and assigned teams" },
          { method: "GET", path: "/api/territories/{territory_id}", description: "Get single territory with segments and teams" },
          { method: "PATCH", path: "/api/territories/{territory_id}", description: "Update territory" },
          { method: "DELETE", path: "/api/territories/{territory_id}", description: "Delete territory" },
        ]}
      />

      <h3>Segment Labels</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/segment-labels", description: "Create segment label" },
          { method: "GET", path: "/api/segment-labels", description: "List all segment labels" },
          { method: "PATCH", path: "/api/segment-labels/{label_id}", description: "Update segment label" },
          { method: "DELETE", path: "/api/segment-labels/{label_id}", description: "Delete segment label" },
        ]}
      />

      <h3>Company ↔ Territory Assignments</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/company-territories", description: "Assign company to territory" },
          { method: "GET", path: "/api/company-territories", description: "List assignments" },
          { method: "DELETE", path: "/api/company-territories/{company_id}/{territory_id}", description: "Remove assignment" },
        ]}
      />

      <h2>Geographic Data</h2>
      <p>
        Serves GADM GeoJSON data for map rendering. Provides region hierarchy,
        admin divisions, and batch feature fetching.
      </p>
      <EndpointTable
        endpoints={[
          { method: "GET", path: "/api/geo/regions", description: "List geographic regions with centers/zoom" },
          { method: "GET", path: "/api/geo/regions/{region_id}/subregions", description: "List subregions under a region" },
          { method: "GET", path: "/api/geo/subregions/{subregion_id}/countries", description: "List countries under a subregion" },
          { method: "GET", path: "/api/geo/countries-by-level", description: "Which countries have level 1/2 data" },
          { method: "GET", path: "/api/geo/admin-divisions/{gid_0}", description: "Level 1 divisions (states/provinces)" },
          { method: "GET", path: "/api/geo/admin-divisions/{gid_0}/{gid_1}", description: "Level 2 divisions (counties)" },
          { method: "POST", path: "/api/geo/features", description: "Batch-fetch GeoJSON features by GID list" },
        ]}
      />

      <h2>Team Members</h2>
      <p>
        Sales team members (individual people) assigned directly to territories.
        A territory acts as the team — whoever is assigned to it is part of that
        territory&apos;s team. Members can belong to multiple territories.
      </p>

      <h3>Team Members</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/team-members", description: "Create a team member" },
          { method: "GET", path: "/api/team-members", description: "List all members (filter by role)" },
          { method: "GET", path: "/api/team-members/{id}", description: "Get a single member" },
          { method: "PATCH", path: "/api/team-members/{id}", description: "Update a member" },
          { method: "DELETE", path: "/api/team-members/{id}", description: "Delete a member" },
        ]}
      />

      <h3>Territory ↔ Member Assignments</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/territory-members", description: "Assign member to territory" },
          { method: "GET", path: "/api/territory-members", description: "List assignments (filter by member or territory)" },
          { method: "DELETE", path: "/api/territory-members/{member_id}/{territory_id}", description: "Remove assignment" },
        ]}
      />

      <h2>Router Registration</h2>

      <p>All routers are registered in <code>app/main.py</code>:</p>

      <pre>{`from app.routers import (
    assignments, companies, competitors,
    contacts, contracts, engagements,
    geo, products, teams, territories,
)

app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(engagements.router)
app.include_router(assignments.router)
app.include_router(products.router)
app.include_router(contracts.router)
app.include_router(competitors.router)
app.include_router(territories.router)
app.include_router(geo.router)
app.include_router(teams.router)`}</pre>

      <DocsPager
        prev={{ title: "Database Schema", href: "/database", description: "Data models & relationships" }}
        next={{ title: "Frontend", href: "/frontend", description: "Next.js app & components" }}
      />
    </div>
  );
}
