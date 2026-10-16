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
  for file in "$art"/inbox/*.png; do
    python3 -c 'import sys; from PIL import Image; Image.open(sys.argv[1]).save(sys.argv[2], quality=94, method=6)' \
      "$file" "$art/source/$(basename "${file%.png}").webp" && rm "$file" && echo "Added $(basename "$file")"
  done
  exit 0
fi

command -v codex >/dev/null || { echo "codex CLI not found; use the inbox (see design/art/README.md)"; exit 1; }

generate() {
  local name="$1" prompt="$art/prompts/$1.txt" work ref=()
  [[ -f "$prompt" ]] || { echo "No prompt at $prompt"; return 1; }
  # Prompts that mention Pip get the reference sheet so the character stays consistent.
  grep -q "Pip" "$prompt" && ref=(-i "$art/prompts/_pip-reference.jpg")
  work="$(mktemp -d)"
  # The prompt goes on stdin because --image takes every argument after it.
  echo "Use your built-in image generation tool to create exactly one image from the prompt below, then copy the generated PNG into the current directory as out.png. Do nothing else. Prompt: $(cat "$prompt") $(cat "$art/prompts/_style.txt")" |
    codex exec --skip-git-repo-check -s workspace-write -C "$work" ${ref[@]+"${ref[@]}"} \
    >"$work/codex.log" 2>&1 || { echo "codex failed for $name; log at $work/codex.log"; return 1; }
  [[ -f "$work/out.png" ]] || { echo "No image for $name; log at $work/codex.log"; return 1; }
  # Masters are kept as high-quality WebP so the repo stays small.
  python3 -c 'import sys; from PIL import Image; Image.open(sys.argv[1]).save(sys.argv[2], quality=94, method=6)' \
    "$work/out.png" "$art/source/$name.webp"
  rm -rf "$work"
  echo "Saved design/art/source/$name.webp"
}

# Each image is its own Codex run, so several names generate in parallel.
status=0
for name in "$@"; do generate "$name" & done
for job in $(jobs -p); do wait "$job" || status=1; done
exit $status
