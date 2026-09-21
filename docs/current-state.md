# Current state

Updated 2026-09-21. TableUs is implemented for isolated staging; cumulative
staging acceptance is still incomplete. Production, stores and cohort activation
are separate objectives. Only [the active packet](task-packets/active.md) directs
implementation. [Historical snapshots](history/2026-09-21/README.md) preserve the
previous narrative without making it an active checklist.

## Working identities

| Role | Value |
| --- | --- |
| Frozen application candidate | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Current task branch / worktree | `codex/staging-closeout` / `.worktrees/staging-closeout` |
| Recovery base | `33d79b6` on `codex/ios27-scene-lifecycle`; original worktree and its uncommitted files preserved |
| Previous task | `01a097ad-4b11-7d62-9813-6ae4cf75f3f5` (read during recovery) |
| Evidence index | [Current candidate](evidence/ios27-staging-f94a1d9/closeout.md) |

The root checkout is an older branch and is not the implementation base.
Application, operator and evidence commits are distinct. This recovery changes
planning/evidence only; it does not create a new application candidate.

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

## Candidate evidence

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
  read succeeded without a code. Server proof of its post-sign-out token renewal
  remains open; a cached screen alone is not renewal evidence.

## Remaining work and limits

The Supabase connector denied read-only reconciliation on September 21. The owner
is restoring access. Final session-renewal proof, provider totals, AppHang risk
disposition and source-bound cumulative validation remain. No final acceptance
report has been issued. See [closeout status](evidence/ios27-staging-f94a1d9/closeout.md).

Last verified provider observation: September 17, 00:51:31 UTC. Places totals
421 against baseline 329: **92/100 used, 8 remaining**. Emails **2/4**;
explicit telemetry **6/6 per provider**, exhausted; fresh Gemini generations
**0/0**. These counts are historical until reconciled; a new task resets none.
The configured staging backstop was verified at 429.

The unexplained simulator AppHang, placeholder tab glyphs, developer-toolchain
exception expiring September 30, production privacy/retention/Auth deletion,
capability and quota controls, signing and symbolication remain tracked in the
[release checklist](release-readiness-checklist.md). A single-process API is still
required. Passed staging observations do not authorize production or distribution.
