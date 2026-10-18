#!/usr/bin/env bash
# Deploy one commit of main to staging or production. See docs/deploy.md.
#
#   scripts/deploy.sh staging [api|web]      latest origin/main
#   scripts/deploy.sh production [api|web]   the commit staging is running
#
# Production only takes a commit that staging already runs. Run
# scripts/migrate.sh for the same environment first when the commit adds a
# migration. Deploys ship a clean `git archive` export, never the working tree.
set -euo pipefail

env="${1:-}"
part="${2:-all}"
staging_api="https://api-staging-3795.up.railway.app"
case "$env" in
  staging)
    railway_project="tableus-staging"
    vercel_project="tableus-staging"
    api="$staging_api"
    ;;
  production)
    railway_project="tableus-production"
    vercel_project="tableus-production"
    api="https://api.table-us.com"
    ;;
  *)
    echo "usage: scripts/deploy.sh staging|production [api|web]" >&2
    exit 2
    ;;
esac
case "$part" in all|api|web) ;; *) echo "part must be api or web" >&2; exit 2 ;; esac

build_of() {
  curl -fsS --max-time 15 "$1/health" | python3 -c 'import json, sys; print(json.load(sys.stdin).get("build") or "")'
}

git fetch --quiet origin main
if [ "$env" = staging ]; then
  sha="$(git rev-parse origin/main)"
else
  sha="$(build_of "$staging_api")"
  if [ -z "$sha" ]; then
    echo "Staging does not report a build, so there is nothing to promote." >&2
    exit 1
  fi
  if ! git merge-base --is-ancestor "$sha" origin/main; then
    echo "Staging runs $sha, which is not on origin/main." >&2
    exit 1
  fi
fi
echo "Deploying $sha to $env ($part)."

export_dir="$(mktemp -d "${TMPDIR:-/tmp}/tableus-$env.XXXXXX")"
trap 'rm -rf "$export_dir"' EXIT
git archive "$sha" | tar -x -C "$export_dir"

if [ "$part" != web ]; then
  (
    cd "$export_dir"
    railway link --project "$railway_project" --environment "$env" --service api >/dev/null
    railway variable set "TABLEUS_BUILD_SHA=$sha" --skip-deploys >/dev/null
    railway up --detach
  )
  echo "Waiting for $api to report $sha..."
  for _ in $(seq 1 60); do
    if [ "$(build_of "$api" 2>/dev/null || true)" = "$sha" ]; then break; fi
    sleep 10
  done
  [ "$(build_of "$api")" = "$sha" ] || { echo "The API did not come up on $sha." >&2; exit 1; }
  curl -fsS --max-time 30 "$api/health/ready" >/dev/null
  echo "API is live and ready on $sha."
fi

if [ "$part" != api ]; then
  (
    cd "$export_dir"
    vercel link --yes --project "$vercel_project" >/dev/null
    vercel deploy --prod --yes \
      --build-env "TABLEUS_DEPLOY_ENV=$env" \
      --build-env "TABLEUS_API_ORIGIN=$api" \
      --build-env "TABLEUS_BUILD_SHA=$sha" \
      --build-env "NEXT_PUBLIC_SOURCE_SHA=$sha"
  )
  echo "Web is deployed on $sha."
fi
