# Current state

Updated 2026-09-21. Cumulative isolated-staging acceptance remains complete for
`f94a1d9`, including
the owner-accepted unresolved simulator AppHang risk. A local dependency
remediation now has zero critical/high npm findings; hosted/native bytes have not
changed. Replacement review and release actions remain separate objectives.
Only [the active packet](task-packets/active.md) directs
implementation. [Historical snapshots](history/2026-09-21/README.md) preserve the
previous narrative without making it an active checklist.

## Working identities

| Role | Value |
| --- | --- |
| Frozen application candidate | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Current task branch / worktree | `codex/dependency-toolchain-exception` / `/Users/brianchei/.codex/worktrees/14a6/Tableus-ai-agent-dev` |
| Implementation base | `5375e3389823b9c0736328709aab1cdc9be6ef98`; completed staging closeout |
| Previous task | `01a0c555-30b1-7403-9ac2-83d272d7ff62` (bounded retrieval) |
| Evidence index | [Current candidate](evidence/ios27-staging-f94a1d9/closeout.md) |

The root checkout is an older branch and is not the implementation base.
Application, operator and evidence commits are distinct. This task changes
dependencies and tests; its source requires replacement-candidate review. Existing
staging artifacts prove only their original application SHA.

## Implemented product

Invite-approved email sign-in, shared plans for 2–8 people, constraints, four
provider-grounded options, top-three ranked votes, organizer finalize/reopen,
private-link rotation and application-data export are implemented across Next.js,
Expo and FastAPI `/api/v1`. Supabase client access is authentication-only.
Gemini and Places remain the application providers; Astra is the development model.

Deterministic providers are the local/CI default. Mobile uses bounded requests,
explicit ambiguous-write retries, private in-memory queries and device-local
sign-out. The plan uses explicit refresh, coalesces in-flight reads and distinguishes
previous votes from new submissions. The candidate also repairs iOS 27 scene
startup with pinned Expo 57.0.23 and a reviewed local config plugin.

## Frozen f94a1d9 evidence

- Local candidate `make ready`: 226 JavaScript and 98 Python tests; three local
  PostgreSQL skips. Exact-source CI adds PostgreSQL/browser coverage: 101 Python,
  four browser tests and seven deterministic AI cases. These are recorded results,
  not a fresh CI run in this task.
- Six native artifact/receipt pairs passed inspection, including the signed
  physical-iPhone pilot. iOS 26.5 simulator and Android API 36 ARM64 deterministic
  lifecycle, offline and five refresh phases pass. Physical iOS 27 startup,
  relaunch, auth/private links, scroll and explicit refresh passed separately.
- Real votes, organizer finalize/reopen, participant permissions, export,
  deletion-readiness and cold/warm links passed. The recovered final owner report
  confirms old-link rejection and canonical cold/warm opening on both platforms.
- Exact-release web/iOS/Android/API telemetry delivery and the candidate's
  staging-only source review are accepted. No new scan or canary is needed.
- Simulator local sign-out removed its server session while Android's remained.
  On September 21 the owner confirmed Android's subsequent relaunch and account
  read succeeded without a code. Read-only reconciliation matches the same original
  Android session and proves renewal at September 17, 01:17:33 UTC, after the
  simulator sign-out at 00:55:07 UTC. No reverse-direction result is claimed.

## Dependency remediation and next work

The owner restored Supabase access and accepted the simulator hang as an
unresolved isolated-staging risk. Session renewal and provider totals are verified;
the closeout cumulative validator and public readiness check passed. The
[final report](evidence/ios27-staging-f94a1d9/final/closed-beta-readiness-summary.json)
and [handoff](handoffs/2026-09-21-staging-closeout.md) closed that objective.

Local fixes: Next.js 16.3.5, scoped EAS transitive patches, Redocly/js-yaml patch
and a CommonJS adapter to the unmodified patched URL decoder. Expo/React Native
pins are unchanged. [Assessment and exact-use dispositions](evidence/dependency-toolchain-2026-09-21/README.md)
replace the blanket exception for this graph only: 17 audit entries arise from
three tooling advisories outside the used vulnerable paths. No expiry extension
or production waiver; f94a1d9 still contains its original dependencies.

Fresh `make ready`: 234 JavaScript and 98 Python passes, three PostgreSQL skips;
contract unchanged. Actual router/EAS regressions and iOS/Android JavaScript
exports and four Chrome browser regressions pass. No new native artifact or
hosted check is claimed. Next: review the
replacement source and prepare a bounded rollout/verification proposal for owner
approval, prioritizing the potentially reachable old Next image-optimizer advisory.
Merge and release gates remain separate.

Latest provider observation: September 21, 19:20:36 UTC. Places totals
421 against baseline 329: **92/100 used, 8 remaining**. Emails **2/4**;
explicit telemetry **6/6 per provider**, exhausted; fresh Gemini generations
**0/0**. The closeout reconciled provider totals; email/canary counts retain their
execution-ledger/delivery provenance. A new task resets none of these limits.
The configured staging backstop was verified at 429.

The unexplained simulator AppHang, placeholder tab glyphs, eight Expo package
patch recommendations, replacement dependency rollout, privacy/retention/Auth deletion,
capability and quota controls, signing and symbolication remain tracked in the
[release checklist](release-readiness-checklist.md). A single-process API is still
required. Passed staging observations do not authorize production or distribution.
