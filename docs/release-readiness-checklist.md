# Closed-beta readiness checklist

Updated 2026-09-21. Candidate:
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`. **Cumulative staging acceptance is
incomplete.** The [candidate matrix](evidence/ios27-staging-f94a1d9/closeout.md)
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
- [ ] Server proof that the same Android session renewed after simulator sign-out.
- [ ] Final aggregate provider/email/telemetry budget reconciliation.
- [ ] Explicit disposition of the unexplained simulator AppHang.
- [ ] Complete cumulative input accepted by the validator with truthful observations.

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
| One unexplained simulator AppHang | One controlled repeat passed; missing native app symbols; cause unknown | Explicit staging disposition; usable symbols and affected journey reassessment before distribution |
| Local sign-out isolation | Local-scope implementation/tests; simulator session removed, Android read passes | Same-session post-sign-out renewal evidence for this candidate |
| Every full plan response hydrates Places | No polling/gesture refresh; hidden-query/coalescing tests pass; fixed run backstop | Fresh budget reconciliation and cohort spend sizing |
| Developer-toolchain/advisory exception | Locked inputs; prior patch warnings retained as historical observations | Current reachability/compatible-patch assessment before September 30, 2026 or production, whichever is earlier |
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
| Native source maps/symbols | Local-build upload exception; runtime telemetry observed | Demonstrated symbolication on store/distribution builds |
| Placeholder native tab glyphs | Known visual issue in deterministic screenshots | Explicit native tab presentation before distribution |
| Contacts, attribution and legal text | Owner attestations retained; Google asset and shared contact constants | Revisit changed scope; no counsel review is implied |

## Release decision

Current staging application remains `f94a1d9`; recovery is documentation/evidence
work on `codex/staging-closeout`. Merging, production deployment, store submission
and cohort activation are not authorized by a checked staging component.
Missing phases stay open; older candidate evidence cannot fill them.
