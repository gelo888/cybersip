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
        The FastAPI backend provides <strong>66 REST endpoints</strong> across{" "}
        <strong>9 entity groups</strong>. All endpoints follow a consistent
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
            <td><code>/api/regions</code>, <code>/api/territory-groups</code></td>
          </tr>
          <tr>
            <td>Teams</td>
            <td><code>teams.py</code></td>
            <td><code>/api/teams</code>, <code>/api/team-members</code></td>
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

      <h2>Companies</h2>
      <p>The central entity. All other entities connect to companies.</p>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/companies", description: "Create a new company" },
          { method: "GET", path: "/api/companies", description: "List companies (filter by status, pagination)" },
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
        multiple line items linking to products/services. Contract responses
        are enriched with <code>company_name</code> via Prisma relation
        includes.
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
        Manages the geographic hierarchy: Regions → Territory Groups →
        Company assignments.
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

      <h3>Territory Groups</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/territory-groups", description: "Create a territory group under a region" },
          { method: "GET", path: "/api/territory-groups", description: "List territory groups (filter by region)" },
          { method: "GET", path: "/api/territory-groups/{id}", description: "Get a single territory group" },
          { method: "PATCH", path: "/api/territory-groups/{id}", description: "Update a territory group" },
          { method: "DELETE", path: "/api/territory-groups/{id}", description: "Delete a territory group" },
        ]}
      />

      <h3>Company ↔ Territory Assignments</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/company-territories", description: "Assign a company to a territory group" },
          { method: "GET", path: "/api/company-territories", description: "List assignments (filter by company or territory)" },
          { method: "DELETE", path: "/api/company-territories/{company_id}/{territory_group_id}", description: "Remove assignment" },
        ]}
      />

      <h2>Teams</h2>
      <p>
        Sales teams assigned to territory groups with member management.
      </p>

      <h3>Teams</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/teams", description: "Create a team" },
          { method: "GET", path: "/api/teams", description: "List all teams" },
          { method: "GET", path: "/api/teams/{id}", description: "Get a single team (includes members & territories)" },
          { method: "PATCH", path: "/api/teams/{id}", description: "Update a team" },
          { method: "DELETE", path: "/api/teams/{id}", description: "Delete a team" },
        ]}
      />

      <h3>Team Members</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/team-members", description: "Add a user to a team" },
          { method: "GET", path: "/api/team-members", description: "List members (filter by team)" },
          { method: "PATCH", path: "/api/team-members/{team_id}/{user_id}", description: "Change member role (lead/member)" },
          { method: "DELETE", path: "/api/team-members/{team_id}/{user_id}", description: "Remove a user from a team" },
        ]}
      />

      <h3>Team ↔ Territory Assignments</h3>
      <EndpointTable
        endpoints={[
          { method: "POST", path: "/api/team-territories", description: "Assign a team to a territory group" },
          { method: "GET", path: "/api/team-territories", description: "List assignments (filter by team or territory)" },
          { method: "DELETE", path: "/api/team-territories/{team_id}/{territory_group_id}", description: "Remove assignment" },
        ]}
      />

      <h2>Router Registration</h2>

      <p>All routers are registered in <code>app/main.py</code>:</p>

      <pre>{`from app.routers import (
    assignments, companies, competitors,
    contacts, contracts, engagements,
    products, teams, territories,
)

app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(engagements.router)
app.include_router(assignments.router)
app.include_router(products.router)
app.include_router(contracts.router)
app.include_router(competitors.router)
app.include_router(territories.router)
app.include_router(teams.router)`}</pre>

      <DocsPager
        prev={{ title: "Database Schema", href: "/database", description: "Data models & relationships" }}
        next={{ title: "Frontend", href: "/frontend", description: "Next.js app & components" }}
      />
    </div>
  );
}
