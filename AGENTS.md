# TableUs engineering guide

## Mission

Ship the invite-only TableUs closed beta across web, iOS, and Android. The root
agent is the primary orchestrator and owns integration, verification, and the
final handoff for every objective.

## Source of truth

- `docs/current-state.md` records what is actually implemented.
- `docs/roadmap.md` records milestone order and acceptance criteria.
- `docs/decisions.md` records durable product and architecture decisions.
- `docs/task-packets/active.md` is the only active implementation packet.

Update these documents in the same change when their truth changes.

## Working agreement

- Use a `codex/<objective>` branch and an isolated worktree for concurrent work.
- Keep one objective bounded enough to review and validate continuously.
- Preserve user changes and never rewrite unrelated work.
- Prefer deterministic providers locally and in CI. Live provider evaluation is
  an explicit, budgeted operation and never part of the normal test suite.
- Run focused checks while iterating, then `make ready` once before handoff.
- Handoffs include the exact commit SHA, checks run, observable evidence,
  residual risks, and intentionally deferred work.

## Approval gates

The user must explicitly approve merges, cloud-resource creation, adding or
rotating secrets, paid live-AI evaluation, production migrations, deployments,
store submissions, and destructive cleanup. Code and local deterministic tests
may be prepared without those external actions.

## Repository conventions

- `backend/` is Python 3.12, FastAPI, async SQLAlchemy, and Alembic.
- `frontend/` is the Next.js web client.
- `mobile/` is the Expo Router iOS/Android client; generated `ios/` and
  `android/` projects are not source-of-truth.
- `packages/api-client/` and `packages/domain/` are the only shared client
  packages. Do not share platform UI.
- Browser app data and mobile app data flow through `/api/v1`; direct Supabase
  client access is limited to authentication.
