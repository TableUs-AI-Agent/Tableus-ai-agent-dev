# Active packet: PostgreSQL lifecycle verification and recovery readiness

Owner: Brian, sole developer at this stage. Historical shared contributions remain
shared. User requested continuation of the recommended parallel objective.

## Identity

- Branch: `codex/account-lifecycle-postgres`.
- Worktree: `/Users/brianchei/.codex/worktrees/account-lifecycle-postgres/Tableus-ai-agent-dev`.
- Exact base: `521345eaab6086496c6cc490843342c96fb8f2bb`.
- Inherited application: `98f082088fe76c2768178302e8b7dca6beec29ef`;
  [client handoff](../handoffs/2026-09-24-account-lifecycle-clients.md).
- Native validation remains owned by task `01a0c678-55c8-7cc0-a3cb-e3200776906a`,
  Prepare native replacement validation, in its existing worktree and budgets.

## Outcome and acceptance

Prove account deletion/redeem and ownership-transfer concurrency on isolated local
PostgreSQL; exercise the real migration and runtime/public-role grants. Prepare
bounded worker scheduling, privacy-safe pending/attention visibility, support retry
and rollback procedures. Feature remains disabled. Keep exact-source evidence.

Root owns local database setup, role/migration proof, integration and acceptance.
Sol delegates own disjoint concurrency tests and worker CLI/runbook/test files.
Focused checks then one passing make-ready and contract drift check for executable
changes. SQLite-only results cannot close PostgreSQL criteria.

## Gates and exclusions

Local deterministic tests and disposable local database setup are in scope. No
native build/device/simulator operation, live Auth/provider calls, real account
deletion, cloud resources, credential provisioning/rotation, deployment, merge,
production migration, stores, beta activation or shared Notion edits. Canceled
security scans remain canceled; no exhausted allowance resets. Retain local data
and evidence after stopping the test server; no destructive cleanup.

## Status

Local objective complete. Application/worker source `eab922ee6b7a21d193514d7008a47806c9e118e3` passes fresh
make-ready: 139 Python with zero skips and 314 JavaScript, plus all other local
readiness checks. Fresh/upgrade PostgreSQL migrations and actual runtime/browser
role operations pass; separate-process synthetic worker proof passes. Server is
stopped, data retained. [Handoff](../handoffs/2026-09-24-account-lifecycle-postgres.md)
binds exact evidence, failures/repairs and remaining gates. Full deletion remains
disabled; no hosted or native acceptance is claimed.

Next independent objective: closed-beta cohort controls (operator-only usage,
per-actor quotas and lifetime plan limits), in another isolated worktree once
requested. Activation is a separately gated campaign, not the next implied action.
