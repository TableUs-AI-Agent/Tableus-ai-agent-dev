# Cohort controls handoff

Local objective complete; hosted rollout and cohort activation remain gated.

Candidate `25e34ec9e35e1935cebe8dbb8f34465fd2b313e0`; application implementation
`1066dcbbae5a0685719d88864d751e606a05d866`, followed by a test-isolation fix.
Branch `codex/cohort-controls`, worktree
`/Users/brianchei/.codex/worktrees/cohort-controls/Tableus-ai-agent-dev`.
Base `d665dc15291191d56da521e1bcde74e99c59acdc`;
[previous handoff](2026-09-24-account-lifecycle-postgres.md).

## Outcome

Daily live AI/Places admission and lifetime plan creation are durably counted by
account digest. Proposed settings 5 AI / 20 Places per UTC day and 20 creations
are configurable and undeployed. Failed/ambiguous provider operations remain
counted; plan debit commits with the new plan. Transfer/deletion/restart cannot
refund it. Migration ab72e4f39d10 seeds surviving history with documented fallback
attribution, rather than claiming deleted history is recoverable.

Provider usage is operator-only through an exact server subject allowlist,
empty by default, with 1–30 day reports and no user identity fields. The
[cohort contract and operations](../cohort-controls.md) describe settings, private
aggregate SQL, retained counters and configuration rollout semantics.

Review caught quota failure after a committed vote/finalize/reopen; these actions
now hydrate before mutation and reuse that data for their response. At a Places
cap, full plan reads/actions requiring hydration can still be blocked until the
UTC reset. Default caps need realistic journey review before activation.

## Verification and evidence

Fresh passing make-ready: **162 Python with zero skips, 314 JavaScript**, plus
lint/types, contract generation, Next production build, Expo web export and
deterministic smoke. Contract drift is empty.

See [evidence](../evidence/cohort-controls-2026-09-24/README.md) and its
[hashed manifest](../evidence/cohort-controls-2026-09-24/verification.json) for final
readiness totals, real PostgreSQL concurrency/grants/fresh and upgrade paths,
separate-process persistence and red-to-green mutation regressions. All providers
were deterministic or mocked; no paid request or live Auth action occurred.
The first readiness failure was test interference from previously exhausted
minute-limit windows; the fixture was isolated and the full run repeated against
a fresh database. Prior failure remains in evidence.

Root integrated and reviewed Sol's quota and operator changes, corrected the
post-commit response issue, verified migrations/grants and owns final acceptance.
Brian owns current development; earlier shared contributions stay shared.

## Next bounded objective and remaining gates

Next independent development: **recipient-bound one-use invites**. The current
`backend/scripts/invites.py` defaults max_uses to 1, supports up to 8, and has no
intended-recipient binding. Inspect validation/reservation/redeem and implement
named admission without raw-email exposure or outbound sends. Keep actual invite
issuance, cohort size, cloud/secret/deployment and budget activation gated.
Capability-link disposition remains a separate product/architecture decision.

Account deletion stays disabled. No native work was run; its existing task owns
validation, budgets and shared environment. No host deployment/CI, merge/push or
Notion edit occurred. Before quota rollout, approve exact targets and quiesce old
writers during migration; review backfill/retention and quota impact, configure
operators, verify hosted grants and complete affected release acceptance. Durable
actor quotas do not authorize scaling the single-process global budget system.

Retained local artifacts:
`/Users/brianchei/.codex/artifacts/tableus/cohort-controls-2026-09-24`.
Local PostgreSQL shutdown is verified; data and logs remain. No destructive
cleanup is authorized or performed.
