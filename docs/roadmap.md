# Closed-beta roadmap

Updated 2026-09-25. Ship a bounded invite-only US beta on web, iOS and Android.
Preserve the implemented architecture; original `f94a1d9` isolated-staging acceptance
is complete, while the cumulative new application remains unaccepted for release. Each later feature
requires its own implementation and applicable verification. Each row is a separate task/worktree objective, narrowed further when
its acceptance cannot be reviewed in one change. Only the active packet in each explicitly authorized isolated worktree executes. The owner authorized account-lifecycle backend, client, PostgreSQL-readiness, cohort-control and recipient-invite development in parallel with the existing native-validation task on September 24; their candidates and acceptance remain separate.

| Order | Objective | Exit evidence | Boundary |
| --- | --- | --- | --- |
| 1 — complete | Close frozen `f94a1d9` staging verification | Original Android session renewed; final totals verified; owner accepted isolated-staging AppHang risk; cumulative validator passed; [handoff](handoffs/2026-09-21-staging-closeout.md) | Isolated staging only; remaining allowance is not a new evaluation budget |
| 2 — locally complete | Resolve dependency/toolchain exception for replacement graph | Zero critical/high npm findings; compatible fixes and three exact-use dispositions; focused checks and one passing `make ready`; [assessment](evidence/dependency-toolchain-2026-09-21/README.md) | No exception extension; old native/production and retained immutable web bytes remain |
| 2a — complete | Review replacement candidate and prepare rollout approval | [Exact-source review and phased proposal](evidence/dependency-rollout-2026-09-21/README.md); source/log/map hashes verified | Planning complete; owner approved Phase W only |
| 2b — complete | Replace affected staging web | [Exact-source CI, Preview and activation passed](evidence/web-dependency-rollout-2026-09-21/README.md); both staging aliases serve ed8330a; approved one-origin CORS append and one f94a1d9 API redeploy verified | Production/native unchanged; new API image recorded separately; one CI/Preview/API redeploy consumed; no cumulative mixed-SHA acceptance |
| 2c — locally complete | Preserve native diagnostic artifacts | [Retention evidence](evidence/native-diagnostic-retention-2026-09-21/README.md); durable success/failure/interruption attempts, hashed symbols/maps and separate operator/application binding; 24 focused checks and passing make ready | No native compilation or symbol usability acceptance; no SDK migration |
| 2d — incomplete; C8 diagnostic closed | Validate affected native replacement | Latest read at `981e2f9` records C8 postboot collector diagnostic passed, application acceptance false and zero remaining attempts; existing task prepares next Settings/offline campaign. [Read provenance](evidence/cumulative-release-acceptance-2026-09-25/source-snapshot.json) | Existing task retains native acceptance and approvals. Original refresh/AppHang, links/exports, physical/auth, Android and N2 remain; no retry or budget transfer |
| 3 — backend/clients/PostgreSQL locally complete; activation/retention open | Complete account lifecycle and retention | [Backend contract/recovery](account-lifecycle.md) implemented with local deterministic checks; web/mobile management and recovery screens pass local checks; PostgreSQL races, fresh/upgrade migration grants and worker operations now pass locally; hosted role/runner proof, affected release acceptance and retention policy remain | Owner approved plan preservation and self-service deletion; feature defaults off; secret provisioning, hosted activation and production migration remain gated |
| 3a — locally complete; rollout/legacy review open | Remove authored content and dependent output on account deletion | [Approved behavior and implementation](handoffs/2026-09-25-deletion-content.md): provenance, conservative unknown-legacy handling, dependent run/vote cleanup, replay fencing and organizer metadata recovery; 214 Python / 313 JavaScript tests, zero skips, and three production-build mocked Chrome journeys | Owner approved shared-result reset. No real cleanup or hosted migration. Legacy inventory/remediation, compatible client rollout and affected acceptance remain |
| 4 — quotas/operator/invites/private links locally complete | Bound cohort access and resource consumption | [Durable quotas, plan creation accounting and operator-only aggregate visibility](cohort-controls.md) pass local PostgreSQL checks and full readiness (162 Python / 314 JavaScript, no skips). [Recipient-bound one-use invites](recipient-invites.md) pass local PostgreSQL admission/concurrency, migration and role checks; full readiness is 193 Python / 314 JavaScript, no skips. [Private-link handling](private-link-handling.md) retains approved-member sharing; local readiness passes 196 Python / 311 JavaScript tests with zero skips and four production-build mocked Chrome journeys. Fragment emission stays off pending compatible readers, adoption and affected release acceptance | No hosted migration/operator/configuration or cohort activation; approximate history baseline and affected journey caps require release review |
| 4a — planning complete; execution gated | Accept one cumulative staging candidate | [Source-bound plan](cumulative-release-acceptance.md): `4846325` was the prior proposal; rebind to `72c592b` and expand deletion/repair acceptance; bind hosted inventory, native operator/profiles, compatible migration/rollback, recipient/test budget and exact approval scope | No inherited C8/provider allowance; no new execution authorized; actual hosted/device/adoption state remains unknown |
| 5a — specification complete; decisions/implementation remain | Prepare production trust, signing and retention/support | [Configuration specification](production-release-spec.md) binds known staging values, missing production targets, link transition, signing/update requirements and deterministic completion criteria. [Retention/support specification](retention-support-spec.md) records the implemented authored-content delta and remaining public-copy, schedule and support/external deletion-path gaps | Environment choice pending; TableUs Vercel access missing; no production resources or policy periods approved |
| 5b | Complete production configuration and native presentation | Approved target bindings implemented, authored-content/retention behavior resolved, usable symbols/maps, privacy/support parity, tab icons, rollback rehearsal and measured performance criteria | Native remains with its existing owner; resources, secrets, deployment and cleanup require explicit gates |
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
