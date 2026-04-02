#!/usr/bin/env bash
# Creates DB hiring_assistant and applies sql/schema.sql (Postgres.app / local psql).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:${PATH}"
if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Add Postgres.app binaries to PATH or install PostgreSQL." >&2
  exit 1
fi
createdb hiring_assistant 2>/dev/null || true
psql -d hiring_assistant -v ON_ERROR_STOP=1 -f "$ROOT/sql/schema.sql"
echo "Database hiring_assistant is ready."
