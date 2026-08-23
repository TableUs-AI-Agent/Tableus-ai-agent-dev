#!/usr/bin/env bash
set -euo pipefail

cd backend
.venv/bin/python scripts/smoke.py
