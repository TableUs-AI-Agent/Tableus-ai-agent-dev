#!/usr/bin/env bash
set -euo pipefail

(cd backend && .venv/bin/uvicorn main:app --reload --host 127.0.0.1 --port 8000) &
backend_pid=$!
npm run dev:web &
web_pid=$!
trap 'kill "$backend_pid" "$web_pid" 2>/dev/null || true' EXIT
npm run dev:mobile
