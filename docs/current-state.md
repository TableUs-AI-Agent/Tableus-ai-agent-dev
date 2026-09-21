# Current state

Updated 2026-09-21. Original f94a1d9 isolated-staging acceptance remains intact,
including the unresolved simulator AppHang risk. Replacement application ed8330a
is published, exact-source CI passed and one Vercel Preview is verified. Phase W
remains incomplete: exact Preview CORS needs separately approved API configuration
and redeployment before staging aliases can move. API/native, existing staging
aliases and production remain unchanged.
Only [the active packet](task-packets/active.md) directs
implementation. [Historical snapshots](history/2026-09-21/README.md) preserve the
previous narrative without making it an active checklist.

## Working identities

| Role | Value |
| --- | --- |
| Accepted API/native and retained Preview candidate | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Current task branch / worktree | `codex/web-dependency-rollout` / `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev` |
| Replacement application / repository operator | `ed8330a766b3c4b80a505e075535678394e275e9`; completed dependency remediation |
| Previous task / evidence base | `01a0c5de-c4a5-7cf2-8a2c-76494dd98c3b` (approval retrieved); `89dac2d4f9deb428668c0bcf62828e31100b2968` |
| Evidence index | [Current candidate](evidence/ios27-staging-f94a1d9/closeout.md) |

The root checkout is an older branch and is not the implementation base.
Application, operator and evidence commits are distinct. This task records Phase W
preflight and local Linux evidence; application and repository operator bytes remain
ed8330a. The evidence commit does not replace that identity. Detached application
source is `.artifacts/phase-w/source` in the active worktree. Existing staging
artifacts prove only their original application SHA.

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

The prior `make ready` (234 JavaScript, 98 Python passes, three PostgreSQL skips),
router/EAS regressions, Metro exports and four Chrome journeys are reused. Fresh
review matched eight source hashes, nine private logs, nine installed consumers
and both Metro maps; backend/shared/config source objects are unchanged.
[Phase W execution](evidence/web-dependency-rollout-2026-09-21/README.md): owner
approved the original scope and the temporary Preview-pause/publication amendment.
Application ed8330a is on `codex/web-deps-ed8330a`; CI 35661503170 passed with
234 JS / 101 Python / four browser / seven deterministic AI cases. Preview
`dpl_3ec5bdvridE1meArFaYWAp8yabKM` is READY with exact served source stamps,
provider-free browser, benign hosted image/cache/error and association checks.
Measured local Linux ARM64 and x64 image stacks pass; hosted sharp/libvips versions
are lock-derived, not directly introspected. Discovery's automatic nearby request
was blocked by the browser guard; live data behavior is not part of this proof.

Only the new exact Preview origin fails API CORS. The [concrete request](evidence/web-dependency-rollout-2026-09-21/cors-approval-request.json)
adds that one origin and redeploys existing f94a1d9 once; approval is pending.
API d929fba2 remains f94a1d9; actual staging aliases remain daa89a0; production
remains e1184ec. The accepted f94a1d9 Preview is retained separately. Three
branch-only nonsecret overrides are verified (two stamps and empty Sentry upload
token); Preview auto-deploy was restored and previous settings/protection preserved.
One CI / one Preview allowance is consumed. Keep this incomplete rollout in this task.
Next 16.3.4 re-enabled AVIF, so the new image check must test the patched stack,
not expect AVIF rejection. Native builds first need an operator fix: the current
helper deletes logs and does not preserve symbols/maps. Later verification is
proposed as two deterministic and two readiness artifacts, with separate approvals
and unresolved telemetry/live-read gates. No cumulative replacement acceptance.
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
