# TableUs engineering guide

## Mission

TableUs helps a small group decide where to eat together: create a shared plan,
invite friends, collect constraints, compare four grounded options, rank them and
let the organizer finalize. The current milestone is a staging pilot in which real
groups complete real dinner decisions on web, iOS and Android. Production, store
distribution and a wider cohort follow the pilot.

## Source of truth

- `docs/current-state.md` records what is implemented and deployed now.
- `docs/roadmap.md` records the milestone, ordered priorities and exit criteria.
- `docs/decisions.md` records durable product, architecture and operating choices.
- `docs/task-packets/active.md` directs the current objective in this worktree.

Update these documents in place, in the same change, when their truth changes.
Handoffs, reviews, history snapshots and evidence retain provenance and scoped
approvals; they do not start new work or reset budgets. Feature contracts such as `docs/account-lifecycle.md` describe
implemented behavior and stay current with their code.

## Working agreement

- Brian Chei owns product decisions and approvals. Whichever agent leads a task
  owns its integration, verification and handoff. Codex-specific model and
  subagent defaults live in `.codex/` and are not project requirements.
- Start from the active packet and current state. The root checkout may be stale;
  confirm the branch and base before editing, and preserve uncommitted work.
- Start each authorized major development pass in a fresh thread, with a compact
  handoff to the current packet, source state and approval boundaries. A thread
  created for that pass satisfies this rule; keep its fixes and verification there.
  A fresh thread does not require a fresh worktree or authorize the next priority.
- Use a named `codex/<objective>` branch and prefer reusing a suitable checkout
  for sequential work. Create another worktree when concurrency or isolation
  requires it; choose the base by ancestry and accepted work, not edit recency.
- Keep one objective small enough to review, then finish it: implement, check,
  fix and hand off without stopping at intermediate findings.
- Prefer deterministic providers locally and in CI. Live provider evaluation is
  an explicit, budgeted operation and never part of the normal test suite.
- Follow the impact-based checks in `docs/development-workflow.md`: focused checks
  and one `make ready` for application or executable changes; links and consistency
  for documentation. Reuse checks only while their relevant inputs are unchanged.
- Create formal source-bound evidence at merge, deployment, native pilot build,
  distribution and activation gates. Summarize routine checks in the handoff and
  retain useful failure diagnostics; no per-command commit or evidence file.
- Keep native builds sequential with file-backed logs, and check disk and memory
  before building. Pilot acceptance uses physical devices and the checklist's
  bounded lost-response test; the long simulator campaign remains superseded.
- Do not restart the canceled security scans without new owner authorization.
- Handoffs identify the base commit and any uncommitted changes, checks run,
  observable evidence, residual risks and intentionally deferred work.

## Approval gates

The owner must explicitly approve merges, pushes that trigger deployments,
cloud-resource creation, adding or rotating secrets, paid live-AI evaluation,
staging or production migrations, deployments, signed native builds for pilot
or store distribution, store submissions, invitations to real users and
destructive cleanup. Code and local deterministic tests may be prepared without
those external actions. Product alignment does not itself authorize a release.

Within an approved objective, routine reversible implementation and fixes need no
repeated approval. Before asking for a gated action, finish the independent work
and present the complete scope, limits and stop conditions in one request.
Escalate significant product or architecture decisions.

## Repository conventions

- `backend/` is Python 3.12, FastAPI, async SQLAlchemy, and Alembic.
- `frontend/` is the Next.js web client.
- `mobile/` is the Expo Router iOS/Android client; generated `ios/` and
  `android/` projects are not source-of-truth.
- `packages/api-client/` and `packages/domain/` are the only shared client
  packages. Do not share platform UI.
- Browser app data and mobile app data flow through `/api/v1`; direct Supabase
  client access is limited to authentication.
