# Closed-beta readiness checklist

Updated 2026-09-21. Candidate:
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`. **Cumulative isolated-staging acceptance is
complete, with the owner-accepted unresolved simulator hang.** The [candidate matrix](evidence/ios27-staging-f94a1d9/closeout.md)
owns detailed status and provenance. The [old checklist](history/2026-09-21/release-readiness-checklist.md)
is historical and does not direct current execution.

## Candidate acceptance

- [x] Exact-source local checks and recorded CI, including PostgreSQL/browser tests.
- [x] Candidate-bound API/Preview rollout, origin checks and association manifests.
- [x] Six inspected native artifact/receipt pairs retained; bytes rehashed on recovery.
- [x] Deterministic iOS/Android lifecycle, offline and explicit-refresh phases.
- [x] Physical iOS 27 startup/relaunch and real platform-specific links.
- [x] Deliberate native votes, web finalize/reopen, participant controls and exports.
- [x] Rotated-link rejection and canonical/private cold/warm owner observations.
- [x] Exact-release web/iOS/Android/API telemetry delivery, no remaining canary budget.
- [x] Exact-source staging review accepted; immutable source/report validation passes.
- [x] Android post-sign-out relaunch/account-read owner confirmation received.
- [x] Server proof that the same Android session renewed after simulator sign-out.
- [x] Final aggregate provider/email/telemetry budget reconciliation.
- [x] Explicit disposition of the unexplained simulator AppHang.
- [x] Complete cumulative input accepted by the validator with truthful observations.

Historical owner legal/privacy/attribution approval, mailbox delivery, template
correction and rollback ownership retain their August 26 provenance. Do not
request identical approvals merely because a task/model changed. Revisit them
when scope or public behavior changes. Staging source review is not production
security certification; the canceled scan remains canceled.

## Residual risks and release obligations

Brian Chei is accountable for release and rollback decisions. Old advisory
counts and provider observations are not fresh audits. The roadmap orders the
implementation work; the active packet alone authorizes the current objective.

| Risk or obligation | Current control/evidence | Required before broader release |
| --- | --- | --- |
| One unexplained simulator AppHang | Owner accepted isolated-staging risk September 21; one repeat passed; cause unknown | Usable symbols and focused affected-journey check before distribution; reopen on recurrence |
| Local sign-out isolation | Simulator session removed; same original Android session renewed; owner account-read passes | Preserve scoped proof; reverify affected behavior if changed |
| Every full plan response hydrates Places | No polling/gesture refresh; hidden-query/coalescing tests pass; fixed run backstop | Cohort spend sizing and an explicit new live scope before expansion |
| Dependency/toolchain disposition | [Local replacement graph assessed/patched](evidence/dependency-toolchain-2026-09-21/README.md): zero critical/high npm findings; three exact-use tooling dispositions; eight Expo patch recommendations retained | [Phase W approved but blocked before publication](evidence/web-dependency-rollout-2026-09-21/README.md); resolve publication/configuration gates and later native gates; old f94a1d9 bytes remain potentially affected by Next image-optimizer advisory. No extension beyond September 30 or production; no native acceptance transfer |
| Process-local idempotency/provider coordination | One API process, row locks, bounded replay/admission and explicit retries | Durable coordination before horizontal scaling |
| Private capability in canonical URL | Approval also required; random/hashed tokens, rotation and redaction | Reviewed exchange or explicit production risk acceptance |
| Shared provider quota fairness | Per-user/minute and global/rolling ceilings | Durable per-actor quotas before cohort expansion |
| Usage aggregates visible to approved profiles | Sanitized aggregates only | Operator-only boundary before cohort expansion |
| Reusable invite reservation renewal | Named one-use staging invitations; email binding and expiry | Server-bound recipient policy before expanded invitation use |
| Plan/event lifetime storage | Small invite-only staging cohort and bounded per-request work | Plan limits, retention/archival policy before production/cohort expansion |
| Auth versus application deletion | Confirmed export/deletion-readiness; application deletion guarded | Reviewed trusted Auth deletion, retention and recovery behavior |
| Locally attested deterministic artifacts | Exact-source receipts and independent inspection; release artifacts signed separately | Store/remote signing evidence for distribution |
| JWKS revocation delay up to five minutes | One bounded cache with refresh coalescing/negative cache | Reassess only if required revocation SLA is shorter |
| Staging Preview shares project with production-facing aliases | Exact deployment binding; production target/protection preserved | Separate approved production configuration and alias review |
| Production origins, signing and OTA | Production fails closed; OTA disabled | Approved trust anchors, Play fingerprint, signing and update policy |
| Native source maps/symbols | Old runtime telemetry observed; current build helper drops logs and does not retain symbols/maps | Fix operator retention before new builds; prove local symbolication and later approved store/distribution upload |
| Placeholder native tab glyphs | Known visual issue in deterministic screenshots | Explicit native tab presentation before distribution |
| Contacts, attribution and legal text | Owner attestations retained; Google asset and shared contact constants | Revisit changed scope; no counsel review is implied |

## Release decision

API/native and the retained accepted Preview remain `f94a1d9`; actual staging
aliases still serve `daa89a0` and production `e1184ec`. The ed8330a replacement is
in approved Phase W preflight on `codex/web-dependency-rollout`; no replacement
deployment yet. Merging, production deployment, store submission
and cohort activation are not authorized by a checked staging component.
The completed staging matrix does not clear the listed production obligations.
