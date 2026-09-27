# PostgreSQL lifecycle and recovery readiness handoff

Local objective complete; feature remains disabled. Brian owns development at
this stage; earlier shared contributions retain their attribution.

- Application/worker commit: **`eab922ee6b7a21d193514d7008a47806c9e118e3`**.
- Branch: `codex/account-lifecycle-postgres`.
- Worktree: `/Users/brianchei/.codex/worktrees/account-lifecycle-postgres/Tableus-ai-agent-dev`.
- Exact base: `521345eaab6086496c6cc490843342c96fb8f2bb`; [client handoff](2026-09-24-account-lifecycle-clients.md).
- Evidence: [readme](../evidence/account-lifecycle-postgres-2026-09-24/README.md),
  [hashed manifest](../evidence/account-lifecycle-postgres-2026-09-24/verification.json).

## Result

Real PostgreSQL tests now cover deletion/redeem, ownership-transfer races,
competing transfers, worker exclusion, fresh and upgrade migrations and runtime
versus public-role grants. CI prepares a restricted runtime role instead of
running the application as its migration administrator. Local initialization
handles an already migrated schema without requesting schema-create permission.

The worker has aggregate status and refuses unavailable batches before claims.
An API retry during admission pause returns durable status without consuming an
unavailable attempt. [Operations](../account-lifecycle-operations.md) defines
finite scheduling, monitoring, support and API-off/worker-on draining.

## Verification

Fresh final make-ready: **139 Python, zero skips; 314 JavaScript**, lint/types,
contract generation, Next build, Expo web export and deterministic smoke. No
contract drift. PostgreSQL 17.11 fresh/upgrade role checks and a separate-process
worker proof passed. See evidence for initial setup failures and repairs.
Browser/device runs were not repeated: prior mocked-browser evidence remains
associated with client source; no affected release acceptance is inferred.

Root reviewed/integrated Sol's concurrency and worker changes, added permission
proof/CI setup, corrected the admission-pause bug, ran verification and retained
evidence. No merge/push, hosted CI, deployment, hosted migration, real Auth
operation, native build/run or shared Notion edit occurred.

## Remaining gates and next objective

Hosted credentials, actual grants/exposed-schema readback, a deployed scheduler,
retention/support policy and affected platform acceptance still precede activation.
The [prepared activation sequence](../account-lifecycle-activation-proposal.md)
binds this candidate and specifies limits/stop conditions; target reservation
and actual resource IDs must be verified before requesting external execution.
Native acceptance remains with task 01a0c678-55c8-7cc0-a3cb-e3200776906a. Its budgets
and September 30 dependency boundary are unchanged; canceled scans stay canceled.

The next independent development objective is **closed-beta cohort controls**:
operator-only usage visibility, enforceable per-actor quotas and lifetime plan
limits. Start from this handoff's documentation descendant in an isolated
worktree, inspect existing limits first, and keep native/hosted activation gated.
That work can proceed while native validation continues. Do not merge this
branch or begin a hosted activation campaign implicitly.

The local PostgreSQL server is stopped. Synthetic cluster data and logs remain
at `/Users/brianchei/.codex/artifacts/tableus/account-lifecycle-postgres-2026-09-24`; binaries/dependency installation is recorded. No destructive
cleanup was performed or authorized.
