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

- GPT-6 Astra (`gpt-6-astra`) orchestrates and has final technical authority.
  Delegate most bounded implementation to GPT-6 Sol (`gpt-6-sol`) while Astra
  handles integration, review, verification and consequential decisions. Use
  GPT-6 Luna (`gpt-6-luna`) for narrow read-only summaries or extraction. Tiny
  changes need no delegate. Children do not delegate. The application's AI
  provider is a separate architecture decision.
- At objective start read the active packet and current state; load roadmap and
  decisions when relevant. Historical packets and chats are context, not active
  requirements.
- Use one feature/fix per Codex task, with a named `codex/<objective>` branch
  and isolated worktree. Record the base and active worktree in the active packet;
  do not assume the task's default checkout is current.
- Follow `docs/development-workflow.md`. On completion, hand off the exact commit,
  remaining gates/budget and next bounded objective to a fresh task. Preserve an
  incomplete objective in its current task; do not mistake a checkpoint for done.
- Keep current documents concise. Replace stale status rather than appending
  the same phase narrative to every document; retain detailed history in evidence.
- Read referenced prior tasks with bounded retrieval before relying on them;
  load older turns only for a concrete unresolved question, not the entire log.
- Keep one objective bounded enough to review and validate continuously.
- Preserve user changes and never rewrite unrelated work.
- Prefer deterministic providers locally and in CI. Live provider evaluation is
  an explicit, budgeted operation and never part of the normal test suite.
- Match checks to impact. Application/executable changes get focused checks and
  one `make ready` before handoff. Developer-only instruction/config changes get
  syntax, host-config and instruction-consistency checks; no native rebuild.
- Give delegated work owned files, acceptance checks, constraints and a budget.
  Astra retains approval, budget, integration and final acceptance. Never restart
  the canceled security scans without separate user authorization.
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

Treat an action request as authority to complete its intended scope: implement,
check, review, fix and finish the authorized handoff. Choose reasonable defaults
for routine gaps and keep moving; ask only when missing information materially
changes the result or a real approval gate remains.

Routine, reversible implementation and staging configuration within an approved
objective do not require repeated approval. Escalate significant product or
architecture decisions and the explicit gates above. Existing authorization
persists across tasks; finish independent work and present a concrete result
before seeking any still-required approval. Fix and retest routine deterministic
failures without repeated permission. Native stop-on-first-failure and recorded
attempt, disk and budget limits remain in force. User instructions supersede
repository and skill guidelines within higher-priority constraints; if a skill
actually requires a pause, cite and quote its rule rather than inferring one.

## Repository conventions

- `backend/` is Python 3.12, FastAPI, async SQLAlchemy, and Alembic.
- `frontend/` is the Next.js web client.
- `mobile/` is the Expo Router iOS/Android client; generated `ios/` and
  `android/` projects are not source-of-truth.
- `packages/api-client/` and `packages/domain/` are the only shared client
  packages. Do not share platform UI.
- Browser app data and mobile app data flow through `/api/v1`; direct Supabase
  client access is limited to authentication.
