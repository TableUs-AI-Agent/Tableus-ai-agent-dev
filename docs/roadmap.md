# Closed-beta roadmap

Updated 2026-09-21. Ship a bounded invite-only US beta on web, iOS and Android.
Preserve the implemented architecture; the current staging candidate has completed acceptance. Each later feature
requires its own implementation and applicable verification. Each row is a separate task/worktree objective, narrowed further when
its acceptance cannot be reviewed in one change. Only the active packet executes.

| Order | Objective | Exit evidence | Boundary |
| --- | --- | --- | --- |
| 1 — complete | Close frozen `f94a1d9` staging verification | Original Android session renewed; final totals verified; owner accepted isolated-staging AppHang risk; cumulative validator passed; [handoff](handoffs/2026-09-21-staging-closeout.md) | Isolated staging only; remaining allowance is not a new evaluation budget |
| 2 — locally complete | Resolve dependency/toolchain exception for replacement graph | Zero critical/high npm findings; compatible fixes and three exact-use dispositions; focused checks and one passing `make ready`; [assessment](evidence/dependency-toolchain-2026-09-21/README.md) | No exception extension; old staging bytes still need replacement |
| 2a — next task | Review replacement candidate and prepare rollout approval | Exact source/lock impact review; bounded web/native verification proposal, symbols/hang diagnostic obligation, explicit owner decision | No merge, deployment, native build or fresh live allowance implied; prioritize old Next image-optimizer exposure |
| 3 | Complete account lifecycle and retention | Concrete Auth/application deletion ownership and behavior, retention/archival policy, export/deletion recovery evidence | Approve significant policy decisions before implementation; production migration remains gated |
| 4 | Bound cohort access and resource consumption | Operator-only usage visibility, per-actor quotas, lifetime plan limits, named one-use invites, reviewed capability exchange or explicit risk acceptance | Isolated staging risk acceptance does not cover broader cohort activation |
| 5 | Prepare production release configuration and native presentation | Reviewed production origins/signing/update policy, usable symbols/source maps, contact/privacy review, tab icons, rollback rehearsal and measured performance criteria | Resources, secrets, deployment and cleanup require their explicit gates |
| 6 | Validate TestFlight and Play closed testing | Signed install/update, auth/links, full shared journey, privacy declarations and symbolication on distributed builds | Separate store-submission approval |
| 7 | Activate the bounded beta | Named owner, participant cap, spend/health limits, support and stop/rollback procedure | Explicit cohort activation and invitation approval |

## Critical path and interruption policy

Do not rebuild six native profiles for a documentation update. Freeze an
application candidate after a complete code fix, validate cheap layers first,
and rebuild only what an explicit impact review requires. Never claim an older
artifact proves changed application bytes. [Workflow](development-workflow.md)
and [runbook](release-runbook.md) define the checks and handoff.

The dependency objective has a local remediation and explicit dispositions for
the replacement graph. The September 30 deadline is not extended for frozen
staging bytes. Review the new source and prepare a concrete owner-approved rollout
next: the old Next image optimizer is potentially runtime-reachable. Preserve
f94a1d9 receipts; local fixes and external deployment remain separate decisions.
A fresh task grants no additional live allowance.

## Completed foundations

Versioned API and storage, invite-approved auth, shared contracts and platform
clients, bounded auth restoration, local sign-out, explicit refresh, iOS scene
repair, isolated live Places/Gemini and privacy-limited observability are
implemented. Exact-source evidence and superseded runs remain in `docs/evidence/`;
the [old roadmap](history/2026-09-21/roadmap.md) preserves their chronology.

## Deferred

Broad redesign, new social features, mobile maps/3D, new AI providers and agent
frameworks remain outside the beta critical path. Horizontal scaling requires
durable idempotency and budget coordination first. No model switch by itself is
assumed to reduce billed usage; keep task context bounded and measure actual work.
