#!/usr/bin/env bash
set -euo pipefail

if [[ -f frontend/.next/build-manifest.json ]]; then
  total_bytes=$(find frontend/.next/static/chunks -type f -name '*.js' -print0 | xargs -0 wc -c | awk 'NF == 2 && $2 != "total" {sum += $1} END {print sum + 0}')
  echo "Web JavaScript chunks: ${total_bytes} bytes (report-only baseline)"
else
  echo "No web build found; performance budget is report-only until a build exists."
fi
