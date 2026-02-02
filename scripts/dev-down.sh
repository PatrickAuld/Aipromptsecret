#!/usr/bin/env bash
set -euo pipefail

# Stop Postgres and remove the container. Data is preserved in the Docker volume.

cd "$(dirname "$0")/.."

echo "==> Stopping Postgres..."
docker compose down
echo "    Done."
echo ""
echo "Data is preserved in the postgres_data volume."
echo "To wipe everything: docker compose down -v"
