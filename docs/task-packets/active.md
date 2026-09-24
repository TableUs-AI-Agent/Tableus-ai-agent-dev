# Active packet: account lifecycle backend

Owner: Brian, sole developer for the current stage. User approved parallel
implementation and both product recommendations on 2026-09-24. This packet
applies only to this branch/worktree. Native validation remains in task
`01a0c678-55c8-7cc0-a3cb-e3200776906a` and its original worktree.

## Identity and isolation

- Branch: `codex/account-lifecycle-backend`.
- Worktree: `/Users/brianchei/.codex/worktrees/account-lifecycle-backend/Tableus-ai-agent-dev`.
- Exact base: `bcc9e52d8c501dba9f51e881a7350c0959301255`, C2 preparation, not native acceptance.
- Native application remains `8972865893a3f018a064594457dc9cc664f8a61f` in its own task.
- [Inherited native packet](../history/2026-09-24/native-packet-at-lifecycle-base.md)
  preserves the base's evidence and exhausted allowances; it authorizes no work here.

The owner explicitly authorized this exception to sequential roadmap execution.
The only active packet in this worktree is this file. Do not change the native
branch, candidate, packet, tools, simulators, sessions or shared staging state.
Later integration needs explicit merge approval and candidate-specific acceptance.

## Outcome

Backend callers can preserve shared plans by transferring ownership to an
existing approved participant, explicitly remove a sole-participant plan, and
request full account deletion with durable, truthful pending/completed status.
Deletion must recover after interruption and cannot be undone by a stale JWT.

## Scope and accepted choices

- Backend API, schemas, migration, trusted Auth adapter and finite recovery runner.
- Preserve current application-only deletion contract for existing clients.
- Separate opt-in full deletion endpoint; no client-side privileged credentials.
- Durable retries/leases, operator attention after bounded retries or rejection.
- Isolated local deterministic tests and generated API contracts.
- Web/mobile UI rollout, retention durations and broad release work follow separately.

## Acceptance and handoff

Verify organizer authorization, valid recipients, shared-plan preservation,
sole-plan removal, deletion/redeem races, atomic app/job writes, provider
failure/already-missing handling, lease ownership, restart-safe recovery and
stale-session denial. Review private-schema grants and migration behavior.
Run focused checks and one `make ready`, plus generated contract drift check.
Record PostgreSQL-only gaps explicitly if a local service is unavailable.
Update current-state/roadmap/decisions with implemented truth; finish with an
exact commit, observed evidence, residual risks and one next bounded objective.

## Gates

No real account deletion, live provider/Auth calls, native build/run, paid call,
cloud resource, secret provisioning, deployment, merge, production migration,
store submission, cohort activation or shared Notion edit is authorized.
No inherited native retry or budget is reopened. Canceled security scans remain
canceled. Preserve all other worktrees and artifacts.

## Status

Implementation and local deterministic verification complete; final commit and
handoff are being recorded. One `make ready` passed (296 JavaScript / 120 Python,
four PostgreSQL-only skips), with fresh SQLite migration and two-process durable
recovery evidence. No live behavior or release acceptance is claimed. Next bounded
objective: web/mobile account-management screens against this backend contract,
with deterministic UI checks; native validation remains in its existing task.
