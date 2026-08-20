#!/usr/bin/env bash
set -euo pipefail

export ENVIRONMENT=test
export DATABASE_URL='sqlite+aiosqlite:///:memory:'
export TABLEUS_AUTH_MODE=demo
export TABLEUS_DEMO_MODE=true
export TABLEUS_PROVIDER_MODE=deterministic
export TABLEUS_SHARED_PLANS_ENABLED=true
export SUPABASE_URL=
export GEMINI_API_KEY=
export GOOGLE_MAPS_API_KEY=
export SENTRY_DSN=
export POSTHOG_KEY=

cd "$(dirname "$0")/../backend"
exec .venv/bin/uvicorn main:app --host 127.0.0.1 --port "${TABLEUS_E2E_PORT:-8000}"
