# Active packet: Claude Code workflow migration

## Source and authorization

Brian authorized this local development-workflow migration on October 15, 2026,
in a fresh Claude Code thread that owns the pass. Worktree:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.worktrees/claude-code-migration`,
branch `codex/claude-code-migration`, created explicitly from remote `main`
`3a2357f888d075b766d9b1259abe9e0e04856bd5` (merge of mobile signup recovery
PR #12, verified with `git ls-remote` the same day).

The previous packet here, local mobile signup recovery, finished when PR #12
merged as `3a2357f`; Git history keeps its text. Priority 3 operations and
Priority 4 native preparation are owned by `codex/pilot-staging-readiness` in
`.worktrees/pilot-realignment` (`a400962`, eleven unpublished commits). That
checkout, its packet, services, private ledgers and allowances were not read
for operation, changed or imported here. The stale root checkout
(`codex/privacy-safe-observability`, `8e9625e`) and its untracked
`.worktrees/` and `docs/evidence/24be75a/` are preserved untouched.

## Objective and acceptance

Make Claude Code the primary development environment with Opus 5.5 as lead,
Haiku 5.5 and Sonnet 5.5 as read-only helpers, and GPT-6.1 Sol through the Codex
CLI as the optional independent reviewer. Done means a fresh Claude Code session
in this checkout loads the shared rules, starts on Opus, can call the intended
helpers, can resume from this packet and can run the documented Sol review.

Out of scope: application providers (Gemini), product behavior, architecture,
hosting, dependencies, roadmap priorities and every approval gate in `AGENTS.md`.
No push, merge, deployment, native build or publication without Brian's separate
approval. Canceled security scans and the simulator campaign stay closed.

## Migration checklist

- [x] Inventory source, worktrees and ancestry; select `3a2357f` as base.
- [x] Inventory instructions, `.codex/`, Claude settings and CLI tools.
- [x] Root `CLAUDE.md` importing `AGENTS.md`; `AGENTS.md` names tool config homes.
- [x] `.claude/settings.json`: `claude-opus-5-5`, medium effort, ask rules for
      pushes, merges and destructive git commands.
- [x] `.claude/agents/haiku-researcher.md` (no shell) and
      `sonnet-investigator.md` (read-only Bash by instruction, plan mode).
- [x] `scripts/codex-review.mjs` with mocked unit tests.
- [x] Workflow, decisions and current-state updated in place.
- [x] Focused tests, `make ready` and contract drift check.
- [x] Sol review of this migration and adjudication.
- [x] File-defined helper routing in a fresh Claude Code session.

Verification: `make ready` passed at `ee686e1` (375 JavaScript tests, 206 Python
tests with 36 PostgreSQL-only skips, lint/types, contracts with no drift,
web/Expo-web builds, smoke, report-only performance). Later commits changed only
the review wrapper and its tests; the root script suite (126 tests) passed again.
GPT-6.1 Sol (medium, read-only) reviewed `3a2357f..ee686e1` and found two valid
wrapper issues (stale output reuse, unchecked working-tree changes), fixed in
`f5542b1`; its re-review found one regression, fixed in `9ed3b2d`; the final
re-review was clean. After Brian logged in, a fresh `claude -p` session in this
worktree (Claude Code 2.1.300) reported `claude-opus-5-5` at startup, listed
`haiku-researcher` and `sonnet-investigator`, loaded `AGENTS.md` through
`CLAUDE.md`, and routed those helpers to `claude-haiku-5-5` and
`claude-sonnet-5-5` per its stream metadata. Version 2.1.300 removed the `/agents`
wizard; use `/tasks` or stream metadata to confirm routing.

`claude import codex --dry-run` offers only user-level items (three MCP servers,
the global Codex `AGENTS.md`, one held-back skill); none were imported. Remaining:
publishing this branch is a separate approval.

## Mapping from Codex

| Codex item | Disposition |
| --- | --- |
| `AGENTS.md`, nested `frontend/AGENTS.md`/`CLAUDE.md` | Retained as the shared source; imported by root `CLAUDE.md` |
| `.codex/config.toml` (Astra lead, Sol/medium children) | Retained for Codex sessions; not used by Claude |
| `.codex/agents/sol-implementer.toml` | Retained; Opus implements by default in Claude |
| `.codex/agents/luna-assistant.toml` | Adapted as `haiku-researcher` (read-only, low effort) |
| Codex review | Replaced by `scripts/codex-review.mjs` pinned to GPT-6.1 Sol |
| Codex desktop plugins, connectors, automations, auth | Left unavailable to Claude; not copied |

## Rollback

Revert this branch's commit, or delete `CLAUDE.md`, `.claude/settings.json`,
`.claude/agents/`, `scripts/codex-review.mjs` and its test, and restore the
documentation from `3a2357f`. `.codex/` is unchanged, so Codex sessions work
throughout. User-level Claude settings were not modified.
