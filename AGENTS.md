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

- GPT-6 Astra (`gpt-6-astra`) is the development model for this project. The
  application's AI provider is a separate architecture decision.
- Read the four current documents above first. Historical packets and chat
  transcripts are context, not additional active requirements.
- Use a `codex/<objective>` branch and an isolated worktree for concurrent work.
- Keep one objective bounded enough to review and validate continuously.
- Preserve user changes and never rewrite unrelated work.
- Prefer deterministic providers locally and in CI. Live provider evaluation is
  an explicit, budgeted operation and never part of the normal test suite.
- Run focused checks while iterating, then `make ready` once before handoff.
- Use one primary agent by default. Delegate only when explicitly requested;
  give any delegated work a bounded question and budget. Never restart the
  canceled security scans without separate user authorization.
- Keep native builds sequential and file-backed. Validate build identifiers,
  output paths, SDK configuration, and the candidate before compilation. Keep
  accepted artifacts and receipts in durable private storage outside OS temp.
- Distinguish application source SHA, operator-tooling SHA, and evidence commit.
  Build and inspect the requested application SHA in a detached clean worktree;
  never relabel older reports or artifacts as evidence for a newer SHA.
- Report a completed phase, changed result, failure, or required action. Avoid
  repeated unchanged status checks and repeated full-suite runs.
- Handoffs include the exact commit SHA, checks run, observable evidence,
  residual risks, and intentionally deferred work.

## Approval gates

The user must explicitly approve merges, cloud-resource creation, adding or
rotating secrets, paid live-AI evaluation, production migrations, deployments,
store submissions, and destructive cleanup. Code and local deterministic tests
may be prepared without those external actions.

Routine, reversible implementation and staging configuration within an approved
objective do not require repeated approval. Escalate significant product or
architecture decisions and the explicit gates above; otherwise proceed and
report the result.

## Repository conventions

- `backend/` is Python 3.12, FastAPI, async SQLAlchemy, and Alembic.
- `frontend/` is the Next.js web client.
- `mobile/` is the Expo Router iOS/Android client; generated `ios/` and
  `android/` projects are not source-of-truth.
- `packages/api-client/` and `packages/domain/` are the only shared client
  packages. Do not share platform UI.
- Browser app data and mobile app data flow through `/api/v1`; direct Supabase
  client access is limited to authentication.
