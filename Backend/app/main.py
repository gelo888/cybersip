from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

# Global Prisma client instance shared across the entire application.
# Import this from other modules (e.g. routers) to run database queries.
db = Prisma()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages the application lifecycle: connects to the database on startup
    and gracefully disconnects when the server shuts down."""
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(
    title="Cybersecurity Sales Intelligence API",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow the Next.js frontend (localhost:3000) to make cross-origin requests
# to this API. Without this, browser fetch calls would be blocked by CORS policy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register routers ─────────────────────────────────────────────────
# Each router handles a group of related endpoints (e.g. /api/companies).
# Import and include them here so FastAPI knows about them.
from app.routers import (  # noqa: E402
    assignments,
    companies,
    competitors,
    contacts,
    contracts,
    engagements,
    products,
    teams,
    territories,
)

app.include_router(companies.router)
app.include_router(contacts.router)
app.include_router(engagements.router)
app.include_router(assignments.router)
app.include_router(products.router)
app.include_router(contracts.router)
app.include_router(competitors.router)
app.include_router(territories.router)
app.include_router(teams.router)


@app.get("/health")
async def health():
    """Simple health check endpoint. Returns {"status": "ok"} if the server
    is running. Use this to verify the API is reachable before testing
    other endpoints."""
    return {"status": "ok"}
