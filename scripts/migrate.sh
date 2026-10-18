#!/usr/bin/env bash
# Show, then optionally apply, the Alembic migrations an environment is missing.
# See docs/deploy.md.
#
#   scripts/migrate.sh staging|production            print the pending SQL
#   scripts/migrate.sh staging|production --apply    run it
#
# The SQL comes from this checkout, so run it from the commit you are about to
# deploy. It runs through the Supabase Management API as postgres, linked in a
# throwaway directory so the two projects can't be mixed up.
set -euo pipefail

env="${1:-}"
apply="${2:-}"
case "$env" in
  staging) ref="mrwdhdeubdiiydmmvlda" ;;
  # Set when the "TableUs Production" project exists.
  production) ref="" ;;
  *) echo "usage: scripts/migrate.sh staging|production [--apply]" >&2; exit 2 ;;
esac
[ -n "$ref" ] || { echo "No Supabase project is set for $env yet." >&2; exit 1; }

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d "${TMPDIR:-/tmp}/tableus-migrate-$env.XXXXXX")"
trap 'rm -rf "$work"' EXIT

supabase link --project-ref "$ref" --workdir "$work" </dev/null >/dev/null 2>&1
query() { supabase db query --linked --workdir "$work" --agent=no -o csv "$@" 2>/dev/null; }

current=base
if [ "$(query "select to_regclass('public.alembic_version') is not null" | tail -n 1)" = true ]; then
  current="$(query "select version_num from public.alembic_version" | tail -n 1)"
fi
[ -n "$current" ] || { echo "Could not read $env's migration version." >&2; exit 1; }
cd "$root/backend"
# Offline mode only needs a PostgreSQL dialect, not a reachable database. The
# runtime role gets the API's row grants and must already exist.
offline() {
  ENVIRONMENT=development DATABASE_URL="postgresql+asyncpg://offline@localhost/offline" \
    TABLEUS_RUNTIME_DB_ROLE="${TABLEUS_RUNTIME_DB_ROLE:-tableus_runtime}" \
    .venv/bin/python -m alembic "$@"
}
head="$(offline heads | awk '{print $1}')"
echo "$env is at $current; this checkout's head is $head."
if [ "$current" = "$head" ]; then
  echo "Nothing to migrate."
  exit 0
fi

range="$head"
[ "$current" = base ] || range="$current:$head"
offline upgrade "$range" --sql > "$work/migration.sql"
cat "$work/migration.sql"

if [ "$apply" != "--apply" ]; then
  echo
  echo "Dry run. Re-run with --apply to run this on $env."
  exit 0
fi
query -f "$work/migration.sql" >/dev/null
echo "$env is now at $(query "select version_num from public.alembic_version" | tail -n 1)."
