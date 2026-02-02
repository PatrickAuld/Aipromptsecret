#!/usr/bin/env bash
set -euo pipefail

# Drop and recreate the database, then re-run migrations.
# Useful when you want a clean slate without removing the Docker volume.

cd "$(dirname "$0")/.."

echo "==> Dropping and recreating database..."
docker compose exec -T postgres \
  psql -U nulldiary -d postgres -c "DROP DATABASE IF EXISTS nulldiary;"
docker compose exec -T postgres \
  psql -U nulldiary -d postgres -c "CREATE DATABASE nulldiary;"

echo "==> Running migrations..."
docker compose exec -T postgres \
  psql -U nulldiary -d nulldiary < packages/db/migrations/0000_initial.sql

echo "    Database reset and migrated."
echo ""
echo "Run ./scripts/seed.sh to re-seed test data."
