#!/usr/bin/env bash
set -euo pipefail

# Start the ingestion service (port 3001) and admin app (port 3000).
# Ctrl+C stops both.

cd "$(dirname "$0")/.."

DATABASE_URL="postgres://aipromptsecret:aipromptsecret@localhost:5432/aipromptsecret"
export DATABASE_URL

cleanup() {
  echo ""
  echo "==> Stopping services..."
  kill "$ingestion_pid" "$admin_pid" 2>/dev/null || true
  wait "$ingestion_pid" "$admin_pid" 2>/dev/null || true
  echo "    Done."
}
trap cleanup EXIT INT TERM

echo "==> Starting ingestion service on port 3001..."
pnpm --filter @aipromptsecret/ingestion dev &
ingestion_pid=$!

echo "==> Starting admin app on port 3000..."
pnpm --filter @aipromptsecret/admin dev &
admin_pid=$!

echo ""
echo "Services running:"
echo "  Ingestion (public /s/* endpoint):  http://localhost:3001"
echo "  Admin (moderation UI):             http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services."

wait
