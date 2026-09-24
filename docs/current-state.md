# Current state

Updated 2026-09-24 for the isolated account-lifecycle backend objective. Brian
owns all development at this stage. The owner approved this work in parallel
with native validation; only [this worktree's active packet](task-packets/active.md)
directs work here. Native evidence remains tied to its original candidate.

## Working identities

| Role | Value |
| --- | --- |
| Backend branch | `codex/account-lifecycle-backend` |
| Backend worktree | `/Users/brianchei/.codex/worktrees/account-lifecycle-backend/Tableus-ai-agent-dev` |
| Exact implementation base | `bcc9e52d8c501dba9f51e881a7350c0959301255` (C2 preparation only) |
| Native validation task | `01a0c678-55c8-7cc0-a3cb-e3200776906a`, Prepare native replacement validation |
| Native worktree | `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev` |
| Native application / build operator | `8972865893a3f018a064594457dc9cc664f8a61f` / `16603dd0cf36d27b492e57a02d3c6c438a2563c4` |
| Accepted API/native | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Staging web | `ed8330a766b3c4b80a505e075535678394e275e9` |
| Production, as recorded at base | `e1184ec` |

The saved root checkout is stale. No shared deployment or native worktree was
changed in this objective. The [base state](history/2026-09-24/current-state-at-lifecycle-base.md)
and [base native packet](history/2026-09-24/native-packet-at-lifecycle-base.md)
retain detailed source/evidence history. Their live/native allowances are not
reopened by this task or branch.

## Product foundation

Invite-approved email sign-in, shared plans for 2–8 people, constraints, four
grounded options, ranked votes, organizer finalize/reopen, private-link rotation
and application-data export exist across FastAPI, Next.js and Expo. Shared
clients use `/api/v1`; direct Supabase client access is authentication-only.
Local/CI providers are deterministic. Gemini and Places remain application
providers. Mobile has bounded restoration/requests, device-local sign-out,
explicit ambiguous-write recovery, private in-memory queries and explicit refresh.

## Account lifecycle backend

Implementation adds transfer to an existing approved participant, explicit
sole-participant plan removal, and a separately enabled full-account deletion
request/status API. App deletion and its durable Auth-removal record commit
atomically. Trusted Auth attempts are bounded and recoverable, with lease checks,
backoff and operator attention for rejected/exhausted requests. A minimal stable
subject-hash tombstone prevents stale-token re-redemption; raw Auth subject is
cleared on completion. Existing application-only deletion remains compatible.

The feature defaults off. Platform screens still use the old deletion path;
there is no client rollout, hosted migration, credential provisioning, deployed
worker or activation in this change. Broader retention durations remain open.
[Contract, data treatment and recovery](account-lifecycle.md) document the exact
scope. One complete `make ready` passed: 296 JavaScript tests, 120 Python tests
and four PostgreSQL-only skips, lint/type checks, contracts, web build/exports,
smoke and the report-only performance baseline. Fresh SQLite migration and a
two-process file-backed recovery probe passed. PostgreSQL concurrency/role
behavior remains unverified locally; SQLite results do not substitute for it.

## Native and release evidence inherited at the base

Original f94a1d9 isolated-staging acceptance remains intact, with owner-accepted
unresolved simulator AppHang risk. [Staging closeout](handoffs/2026-09-21-staging-closeout.md)
and [Phase W](handoffs/2026-09-21-phase-w-complete.md) retain their evidence.
Phase W placed ed8330a on both staging web aliases; the approved CORS/API redeploy
kept f94a1d9 application source. This is not cumulative mixed-source acceptance.

Replacement native acceptance remains incomplete. F1 artifact/runtime proof and
seven lifecycle flows passed on the recorded targets; the original refresh
failure and later setup/control/render failures remain unresolved. C1 stopped
before boot; C2 was prepared at this branch's base. This task makes no claim
about later native-task progress. Offline/links/exports, Android, canonical/auth
and N2 gates stay with that task. No native allowance transfers here.

The September 30 dependency boundary is unextended. Production and old immutable
artifacts are outside the replacement dependency disposition. Cohort quotas,
operator usage visibility, production configuration, distributed TestFlight/Play
acceptance and beta activation remain roadmap work. Canceled security scans stay
canceled; no broader cohort or release readiness is claimed.
