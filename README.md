# CyberSIP — Cybersecurity Sales Intelligence Platform

A specialized CRM platform for cybersecurity sales teams — focused on **competitor tracking**, **market intelligence**, and **contract lifecycle management**.

> Don't just record what happened; predict what should happen next.

## Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript, shadcn/ui, Tailwind CSS |
| Backend        | Python, FastAPI, Pydantic                                 |
| Database       | PostgreSQL 16 + Prisma ORM                                |
| Infrastructure | Docker Compose                                            |

## Quick Start

```bash
# 1. Start PostgreSQL + FastAPI backend
docker compose up --build

# With sample data (153 companies)
SEED_DB=true docker compose up --build

# 2. Start the frontend
cd frontend && npm install && npm run dev
```

| Service       | URL                        |
| ------------- | -------------------------- |
| Frontend      | http://localhost:3000      |
| API / Swagger | http://localhost:8000/docs |

## Documentation

Full project documentation is available as a standalone site:

```bash
cd docs && npm install && npm run dev
```

Covers: Architecture, Installation Guide, Database Schema, Backend API (74+ endpoints), Frontend, UX/UI Design, and Roadmap.

## Questions & Collaboration

For questions, feedback, or collaboration opportunities:

- **Open an issue** — [GitHub Issues](../../issues)
- **Start a discussion** — [GitHub Discussions](../../discussions)
- **LinkedIn** — [Angelo Hernandez](https://www.linkedin.com/in/angelo-hernandez/)

.
