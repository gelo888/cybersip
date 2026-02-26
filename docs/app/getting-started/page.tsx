import type { Metadata } from "next";
import { Download } from "lucide-react";
import { DocsPager } from "@/components/docs-pager";

export const metadata: Metadata = {
  title: "Getting Started",
};

export default function GettingStartedPage() {
  return (
    <div className="docs-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
        <Download className="h-4 w-4" />
        <span className="font-medium">Getting Started</span>
      </div>
      <h1>Installation & Setup</h1>
      <p>
        This guide walks you through setting up CyberSIP locally — from
        prerequisites to running the full stack with Docker or manually.
      </p>

      <h2>Prerequisites</h2>

      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Version</th>
            <th>Check Command</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Python</td>
            <td>3.11+</td>
            <td>
              <code>python3 --version</code>
            </td>
          </tr>
          <tr>
            <td>Node.js</td>
            <td>18+</td>
            <td>
              <code>node --version</code>
            </td>
          </tr>
          <tr>
            <td>Docker & Compose</td>
            <td>Latest</td>
            <td>
              <code>docker compose version</code>
            </td>
          </tr>
          <tr>
            <td>PostgreSQL (optional)</td>
            <td>16+</td>
            <td>
              <code>psql --version</code>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <strong>macOS tip:</strong> Install PostgreSQL via Homebrew with{" "}
        <code>brew install postgresql@16</code>, or skip it entirely and use the
        Docker setup below.
      </div>

      <h2>Quick Start (Docker)</h2>

      <p>
        The fastest way to get everything running. This starts both PostgreSQL
        and the FastAPI backend in containers.
      </p>

      <h3>1. Clone the Repository</h3>
      <pre>{`git clone <repository-url>
cd new-project`}</pre>

      <h3>2. Start the Backend Stack</h3>
      <pre>{`# Build and start PostgreSQL + FastAPI
docker compose up --build

# With seed data (153 sample companies)
SEED_DB=true docker compose up --build

# Run in background
docker compose up --build -d`}</pre>

      <p>
        This will start PostgreSQL on port <code>5432</code>, wait for the
        health check to pass, push the Prisma schema, and start the FastAPI
        server on port <code>8000</code>.
      </p>

      <h3>3. Start the Frontend</h3>
      <pre>{`cd frontend
npm install
npm run dev`}</pre>

      <p>
        The frontend runs on{" "}
        <a href="http://localhost:3000" className="text-blue-500">
          http://localhost:3000
        </a>
        .
      </p>

      <h3>4. Verify</h3>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Frontend</td>
            <td>
              <code>http://localhost:3000</code>
            </td>
          </tr>
          <tr>
            <td>API</td>
            <td>
              <code>http://localhost:8000</code>
            </td>
          </tr>
          <tr>
            <td>Swagger Docs</td>
            <td>
              <code>http://localhost:8000/docs</code>
            </td>
          </tr>
          <tr>
            <td>Health Check</td>
            <td>
              <code>http://localhost:8000/health</code>
            </td>
          </tr>
          <tr>
            <td>PostgreSQL</td>
            <td>
              <code>localhost:5432</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Manual Setup</h2>

      <p>
        If you prefer running services directly on your machine instead of
        Docker.
      </p>

      <h3>1. Set Up the Database</h3>
      <pre>{`# Start only the PostgreSQL container
docker compose up db -d

# Or use a local PostgreSQL instance
# Create the database manually:
createdb cybersec_sip`}</pre>

      <h3>2. Set Up the Backend</h3>
      <pre>{`cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt`}</pre>

      <h3>3. Configure Environment</h3>
      <p>
        Create a <code>.env</code> file in the <code>backend/</code> directory:
      </p>
      <pre>{`DATABASE_URL="postgresql://admin:password@localhost:5432/cybersec_sip"`}</pre>

      <h3>4. Initialize the Database</h3>
      <pre>{`# Generate the Python Prisma client
prisma generate

# Push schema to the database (creates all tables)
prisma db push

# Optional: Seed with sample data
python prisma/seed.py`}</pre>

      <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
        <strong>Prisma Studio:</strong> Run <code>prisma studio</code> to open a
        visual browser UI at{" "}
        <code>http://localhost:5555</code> where you can browse and edit tables
        directly.
      </div>

      <h3>5. Start the Backend Server</h3>
      <pre>{`uvicorn app.main:app --reload --port 8000`}</pre>

      <h3>6. Start the Frontend</h3>
      <pre>{`cd frontend
npm install
npm run dev`}</pre>

      <h2>Docker Commands Reference</h2>

      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>docker compose up --build</code>
            </td>
            <td>Build & start DB + Backend</td>
          </tr>
          <tr>
            <td>
              <code>docker compose up --build -d</code>
            </td>
            <td>Same, but in background</td>
          </tr>
          <tr>
            <td>
              <code>SEED_DB=true docker compose up --build</code>
            </td>
            <td>Build, start, and seed the database</td>
          </tr>
          <tr>
            <td>
              <code>docker compose down</code>
            </td>
            <td>Stop everything (data preserved)</td>
          </tr>
          <tr>
            <td>
              <code>docker compose down -v</code>
            </td>
            <td>Stop & wipe all data</td>
          </tr>
          <tr>
            <td>
              <code>docker compose logs -f backend</code>
            </td>
            <td>Tail backend logs</td>
          </tr>
          <tr>
            <td>
              <code>docker compose ps</code>
            </td>
            <td>Show running containers</td>
          </tr>
        </tbody>
      </table>

      <h2>Seed Data</h2>

      <p>
        The seed script populates the database with realistic sample data so you
        can start building immediately.
      </p>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Count</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Regions</td>
            <td>3</td>
            <td>APJ, EMEA, Americas</td>
          </tr>
          <tr>
            <td>Territory Groups</td>
            <td>19</td>
            <td>Japan, DACH, US East, Latin America, etc.</td>
          </tr>
          <tr>
            <td>Industries</td>
            <td>16</td>
            <td>Across 7 sectors</td>
          </tr>
          <tr>
            <td>Companies</td>
            <td>153</td>
            <td>Distributed across all regions</td>
          </tr>
        </tbody>
      </table>

      <h3>Company Distribution by Size</h3>

      <table>
        <thead>
          <tr>
            <th>Size</th>
            <th>Count</th>
            <th>Percentage</th>
            <th>Employee Range</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SMB</td>
            <td>66</td>
            <td>43%</td>
            <td>10 – 150</td>
          </tr>
          <tr>
            <td>Mid-Market</td>
            <td>37</td>
            <td>24%</td>
            <td>290 – 1,900</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>37</td>
            <td>24%</td>
            <td>4,200 – 70,000</td>
          </tr>
          <tr>
            <td>Government</td>
            <td>13</td>
            <td>9%</td>
            <td>210 – 18,000</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
        <strong>Note:</strong> The seed script is idempotent — it clears all
        existing data before inserting. Safe to run repeatedly during
        development, but any manual data will be removed.
      </div>

      <h2>Project Structure</h2>

      <pre>{`new-project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/             # 9 CRUD routers
│   │   │   ├── companies.py
│   │   │   ├── contacts.py
│   │   │   ├── engagements.py
│   │   │   ├── assignments.py
│   │   │   ├── products.py
│   │   │   ├── contracts.py
│   │   │   ├── competitors.py
│   │   │   ├── territories.py
│   │   │   └── teams.py
│   │   └── schemas/             # Pydantic models
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.py              # Seed script
│   ├── requirements.txt
│   ├── Dockerfile
│   └── entrypoint.sh
│
├── frontend/                    # Next.js app
│   ├── app/                     # App Router pages
│   ├── components/              # UI components
│   └── package.json
│
├── docs/                        # This documentation site
│
└── docker-compose.yml           # DB + Backend orchestration`}</pre>

      <h2>Troubleshooting</h2>

      <h3>Port Conflicts</h3>
      <p>
        If port <code>5432</code> or <code>8000</code> is already in use, stop
        the conflicting service or change the host-side ports in{" "}
        <code>docker-compose.yml</code> (e.g., <code>&quot;5433:5432&quot;</code>
        ).
      </p>

      <h3>Prisma Client Issues</h3>
      <p>
        The <code>prisma-client-py</code> package is a community-maintained
        Python wrapper. If you encounter issues, ensure you&apos;re running{" "}
        <code>prisma generate</code> after any schema changes. The alternative
        is SQLAlchemy, but Prisma provides a single schema definition for the
        project.
      </p>

      <DocsPager
        prev={{ title: "Architecture", href: "/architecture", description: "System design" }}
        next={{ title: "Database Schema", href: "/database", description: "Data models & relationships" }}
      />
    </div>
  );
}
