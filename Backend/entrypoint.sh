#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until prisma db execute --stdin <<< "SELECT 1" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "Pushing Prisma schema to database..."
prisma db push --skip-generate

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  python -m prisma.seed
fi

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
