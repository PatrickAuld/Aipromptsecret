#!/usr/bin/env bash
set -euo pipefail

# Drop and recreate the database, then re-run migrations.
# Useful when you want a clean slate without removing the Docker volume.

cd "$(dirname "$0")/.."

echo "==> Dropping and recreating database..."
docker compose exec -T postgres \
  psql -U aipromptsecret -d postgres -c "DROP DATABASE IF EXISTS aipromptsecret;"
docker compose exec -T postgres \
  psql -U aipromptsecret -d postgres -c "CREATE DATABASE aipromptsecret;"

echo "==> Running migrations..."
docker compose exec -T postgres \
  psql -U aipromptsecret -d aipromptsecret < packages/db/migrations/0000_initial.sql

echo "    Database reset and migrated."
echo ""
echo "Run ./scripts/seed.sh to re-seed test data."
