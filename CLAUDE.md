@AGENTS.md

# Claude Code

Shared project rules live in `AGENTS.md` above; keep them there. This file holds
only Claude Code specifics. Nested files such as `frontend/CLAUDE.md` still load
when you work in those directories.

- The lead session is Opus 5.5 (`claude-opus-5-5`) at medium effort, set in
  `.claude/settings.json`. Raise effort with `/effort` for difficult integration,
  conflicting evidence or final judgment; the lead remains accountable.
- Delegate only when it helps; do straightforward work directly. Project
  subagents: `haiku-researcher` (Haiku 5.5, read-only discovery, extraction and
  categorization) and `sonnet-investigator` (Sonnet 5.5, read-only tracing and
  evidence). Built-in Explore and Plan inherit the lead model.
- Each brief states the question, source/base commit, scope, constraints,
  expected evidence and completion condition. Check `/tasks` for the model that
  actually ran, and verify findings yourself before they drive implementation.
- Independent review uses GPT-6.1 Sol through the Codex CLI:
  `node scripts/codex-review.mjs --base <sha>` (see
  [docs/development-workflow.md](docs/development-workflow.md#independent-review)).
  It is an external read-only process, not a Claude subagent; adjudicate its
  findings and re-review only when changes or unresolved concerns warrant it.
- `.codex/` holds Codex-only preferences and is not a requirement here.
