# Closed-beta roadmap

Updated 2026-09-22. Ship a bounded invite-only US beta on web, iOS and Android.
Preserve the implemented architecture; the current staging candidate has completed acceptance. Each later feature
requires its own implementation and applicable verification. Each row is a separate task/worktree objective, narrowed further when
its acceptance cannot be reviewed in one change. Only the active packet executes.

| Order | Objective | Exit evidence | Boundary |
| --- | --- | --- | --- |
| 1 — complete | Close frozen `f94a1d9` staging verification | Original Android session renewed; final totals verified; owner accepted isolated-staging AppHang risk; cumulative validator passed; [handoff](handoffs/2026-09-21-staging-closeout.md) | Isolated staging only; remaining allowance is not a new evaluation budget |
| 2 — locally complete | Resolve dependency/toolchain exception for replacement graph | Zero critical/high npm findings; compatible fixes and three exact-use dispositions; focused checks and one passing `make ready`; [assessment](evidence/dependency-toolchain-2026-09-21/README.md) | No exception extension; old native/production and retained immutable web bytes remain |
| 2a — complete | Review replacement candidate and prepare rollout approval | [Exact-source review and phased proposal](evidence/dependency-rollout-2026-09-21/README.md); source/log/map hashes verified | Planning complete; owner approved Phase W only |
| 2b — complete | Replace affected staging web | [Exact-source CI, Preview and activation passed](evidence/web-dependency-rollout-2026-09-21/README.md); both staging aliases serve ed8330a; approved one-origin CORS append and one f94a1d9 API redeploy verified | Production/native unchanged; new API image recorded separately; one CI/Preview/API redeploy consumed; no cumulative mixed-SHA acceptance |
| 2c — locally complete | Preserve native diagnostic artifacts | [Retention evidence](evidence/native-diagnostic-retention-2026-09-21/README.md); durable success/failure/interruption attempts, hashed symbols/maps and separate operator/application binding; 24 focused checks and passing make ready | No native compilation or symbol usability acceptance; no SDK migration |
| 2d — D2/lifecycle passed; platform stop | Validate affected native replacement | Candidate 8972865 artifact/runtime proof and seven lifecycle flows passed; [O1 stopped on SpringBoard crash](evidence/native-replacement-validation-2026-09-21/n1-f1-o1-result.md) before create retry, with no retry POST; earlier refresh failure unresolved | O1 allowance exhausted; [Settings-only platform probe](evidence/native-replacement-validation-2026-09-21/n1-f1-platform-probe.md) prepared, awaiting approval. Offline/links/exports, Android and canonical/auth gates remain; historical crashes unresolved; no N2 or cumulative acceptance |
| 3 | Complete account lifecycle and retention | Concrete Auth/application deletion ownership and behavior, retention/archival policy, export/deletion recovery evidence | Approve significant policy decisions before implementation; production migration remains gated |
| 4 | Bound cohort access and resource consumption | Operator-only usage visibility, per-actor quotas, lifetime plan limits, named one-use invites, reviewed capability exchange or explicit risk acceptance | Isolated staging risk acceptance does not cover broader cohort activation |
| 5 | Prepare production release configuration and native presentation | Reviewed production origins/signing/update policy, usable symbols/source maps, contact/privacy review, tab icons, rollback rehearsal and measured performance criteria | Resources, secrets, deployment and cleanup require their explicit gates |
| 6 | Validate TestFlight and Play closed testing | Signed install/update, auth/links, full shared journey, privacy declarations and symbolication on distributed builds | Separate store-submission approval |
| 7 | Activate the bounded beta | Named owner, participant cap, spend/health limits, support and stop/rollback procedure | Explicit cohort activation and invitation approval |

The owner-authorized [GPT-6 development workflow](evidence/gpt6-development-workflow-2026-09-22/README.md)
is a prerequisite governance update within the current native task: Astra leads,
Sol implements, Luna provides bounded support. It adds no application rollout or
new native/live allowance.

## Critical path and interruption policy

Do not rebuild six native profiles for a documentation update. Freeze an
application candidate after a complete code fix, validate cheap layers first,
and rebuild only what an explicit impact review requires. Never claim an older
artifact proves changed application bytes. [Workflow](development-workflow.md)
and [runbook](release-runbook.md) define the checks and handoff.

The dependency objective has a local remediation and explicit dispositions for
the replacement graph. The September 30 deadline is not extended for frozen
staging bytes. Phase W replaced both staging web aliases; production e1184ec and
retained immutable deployments remain outside that patch. Preserve f94a1d9
receipts. Local native diagnostic retention is complete. Next is separately approved native
replacement validation (2d); another diagnostic capture, Android compilation and
subsequent rollout retain their stated gates.
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
