# Active packet: closed-beta cohort controls

Owner: Brian, sole developer at this stage; historical shared contributions stay
shared. User requested the recommended next independent development objective.

## Identity

- Branch: `codex/cohort-controls`.
- Worktree: `/Users/brianchei/.codex/worktrees/cohort-controls/Tableus-ai-agent-dev`.
- Base: `d665dc15291191d56da521e1bcde74e99c59acdc`.
- Inherited application: `eab922ee6b7a21d193514d7008a47806c9e118e3`;
  [handoff](../handoffs/ 2026-09-24-account-lifecycle-postgres.md).
- Native validation remains owned by task `01a0c678-55c8-7cc0-a3cb-e3200776906a`
  and its own worktree, candidate, approvals and budgets.

## Outcome

Durable per-account UTC-day logical AI/Places operation caps for live providers;
transactional lifetime plan-creation caps that transfers/deletes cannot refund;
operator-only aggregate provider usage with bounded reporting windows. Configure
operator subjects only on the server, default-deny. Existing minute/global
budgets remain, and horizontal scaling is still unapproved.

Proposed configurable defaults: 5 AI / 20 Places per UTC day and 20 plans lifetime.
Owner preference requested asynchronously; no deployment depends on these values.
Backfill surviving creation history plus current-organizer fallback; historical
deleted plans cannot be reconstructed. Counters store a stable subject digest,
not raw account IDs, and do not disappear with profile/plan removal.

## Acceptance and scope

Root owns API integration, regression review, local PostgreSQL setup, final
verification and handoff. Sol delegates own disjoint quota/model/migration/config
and operator/test components. Meaningful deterministic tests cover limit/retry,
rollback, concurrent increments/creates, plan transfer/deletion, default-denied
operator access, reporting privacy/window and migration/backfill/grants. Focused
checks then one passing make-ready and contract drift check at frozen source.

No native builds/devices, live provider/Auth calls, real account deletion,
cloud resources, secrets, deployments, production migration, merge/push, stores,
cohort activation or shared Notion edit. Use only synthetic local databases;
retain data/logs after shutdown. Account deletion stays disabled. Named one-use
invite issuance and capability-exchange policy remain separate roadmap work.

## Status

Local objective complete. Frozen source `25e34ec9e35e1935cebe8dbb8f34465fd2b313e0`
passes full make-ready: 162 Python with zero skips and 314 JavaScript, plus lint,
types, generated contracts, web builds/export and deterministic smoke. No contract
drift. Real PostgreSQL concurrency, fresh and populated upgrade/grants and
separate-process quota persistence pass. Initial test-interference failure and
correction remain recorded in the [handoff](../handoffs/2026-09-24-cohort-controls.md).
Local PostgreSQL is stopped with data/logs retained. No hosted/native activation.

Next independent objective: recipient-bound one-use invite issuance, after
inspecting existing reservation/redeem controls. Actual invites/sends and cohort
activation remain gated; capability-link policy remains a consequential release
decision. Proceed only in the next requested isolated objective.
