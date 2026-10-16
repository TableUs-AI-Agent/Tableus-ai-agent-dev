#!/usr/bin/env bash
# Generate TableUs art with GPT Image through the Codex CLI (ChatGPT sign-in).
# Usage: scripts/art.sh <prompt-name>...   |   scripts/art.sh --inbox
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
art="$root/design/art"
mkdir -p "$art/source" "$art/inbox"

if [[ $# -eq 0 ]]; then
  echo "Prompts:"; ls "$art/prompts" | grep -v '^_' | sed 's/\.txt$//; s/^/  /'
  exit 0
fi

if [[ "$1" == "--inbox" ]]; then
  shopt -s nullglob
  for file in "$art"/inbox/*.png; do mv -v "$file" "$art/source/"; done
  exit 0
fi

command -v codex >/dev/null || { echo "codex CLI not found; use the inbox (see design/art/README.md)"; exit 1; }

for name in "$@"; do
  prompt="$art/prompts/$name.txt"
  [[ -f "$prompt" ]] || { echo "No prompt at $prompt"; exit 1; }
  work="$(mktemp -d)"
  codex exec --skip-git-repo-check -s workspace-write -C "$work" \
    "Use your built-in image generation tool to create exactly one image from the prompt below, then copy the generated PNG into the current directory as out.png. Do nothing else. Prompt: $(cat "$prompt") $(cat "$art/prompts/_style.txt")" \
    >"$work/codex.log" 2>&1 || { echo "codex failed for $name; log at $work/codex.log"; exit 1; }
  [[ -f "$work/out.png" ]] || { echo "No image for $name; log at $work/codex.log"; exit 1; }
  mv "$work/out.png" "$art/source/$name.png"
  rm -rf "$work"
  echo "Saved design/art/source/$name.png"
done
