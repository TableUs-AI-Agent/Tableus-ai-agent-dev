# Current state

Verified 2026-09-12 (America/Chicago; deployment receipts dated 2026-09-13 UTC).
Current staging application source:
`c5b041c85f4f7b959436c13bef48c959622c624f`, branch
`codex/astra-project-reassessment`. It adds bounded auth restoration,
development configuration, operator preflight and revised plans. The owner
approved its push, CI and existing Railway staging/Vercel Preview deployment.
[Deployment evidence](evidence/c5b041c/README.md) records the exact targets.

## Product and architecture

TableUs is an invite-only US group-dining beta for web, iOS, and Android. Its
primary acceptance journey is approved sign-in, a shared plan with at least two
participants, saved constraints, four grounded recommendations, ranked votes,
organizer finalization, reopen, and share-link rotation.

| Area | Implemented | Practical boundary |
| --- | --- | --- |
| Backend | FastAPI `/api/v1`, SQLAlchemy, Alembic, approved-profile authorization, invites, connections, reviews, account controls, plans and ranking | Hosted mode requires Postgres, Supabase auth and distinct runtime credentials; legacy routes are local/demo only |
| Web | Next.js plans, invite/OTP, account, discovery/review/profile surfaces; subject-separated state; explicit session/network recovery | Safari and canonical-link fallback still need current-candidate acceptance |
| Mobile | Expo Router iOS/Android, shared API/domain packages, coordinated auth, memory-only query state, foreground refresh, explicit mutation retry | Six distinct staging/test profiles; production builds are deliberately disabled |
| Providers | Deterministic local/CI providers; live Google Places and pinned Gemini 3.1 Flash-Lite through Agent Platform | No OpenAI application adapter; application-model migration is a separate decision |
| Privacy | Hashed capabilities, provider-data minimization, anonymous allowlisted PostHog, error-only Sentry, export and application-profile deletion | Supabase Auth removal is separate; production retention/deletion policy remains open |
| Reliability | Bounded admission/JWKS work, route/role-checked idempotent replay, plan locks, response-body deadlines | Idempotency cache and provider reservation locks are process-local; one API process only |
| Delivery | Locked dependencies, pinned CI/container inputs, clean detached native builds, signed inspection and version-two receipts | Production origins, signing, source maps, rollback and store approval remain release work |

The current candidate fixes the reproduced credential-wait gap. One API deadline
now covers credential/demo-identity lookup, fetch, one refresh and body parsing.
Late credentials cannot dispatch a write. Web and mobile startup reads time out
after 15 seconds; mobile provides an explicit restoration retry that preserves
pending invite/session data. SDK failures are recoverable, and mobile no longer
forces sign-out when refresh fails. Startup results are ignored after a newer
auth event or unmount. Deterministic tests cover the shared deadline and mobile
recovery; real-session/native acceptance remains outstanding.

## Evidence ledger

“Verified” means inspected during this reassessment. “Recorded” means an
existing report or prior task states the result; it has not been repeated.

| Evidence | Status at this review | Source / next step |
| --- | --- | --- |
| Public CI for `c5b041c` | Verified: 197 JavaScript, 101 Python, four browser tests and seven deterministic AI cases passed; all three Postgres migration tests ran | [Run 34728044149](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/34728044149) |
| Railway public readiness for `c5b041c` | Verified: exact candidate, Supabase, live Places/Agent Platform, staging anonymous/error-only telemetry | Deployment `dcccd4a1-cca7-489b-9d7d-81e4019aad0c`; public `/health/ready` passed |
| Vercel Preview for `c5b041c` | Verified READY: exact Git SHA; build completed after Preview source-stamp updates | Deployment `dpl_9zGVqXpFNQkCzSXBaecR18hqMs2M`; [Preview](https://tableus-staging-3e0h7umke-briancheis-projects.vercel.app); production target/aliases and deployment protection preserved |
| Preview API CORS | Verified: both new exact Preview URLs and both existing origins pass; unrelated origin rejected | Corrected the missing-origin configuration and redeployed the same API source; [receipt](evidence/c5b041c/staging-deployment.json) |
| Historical CI for `daa89a0` | Verified: completed successfully | [Run 33696336882](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/33696336882) |
| Historical two-user live provider smoke for `daa89a0` | Recovered recorded report: 2 participants, 4 distinct candidates, 8 operations, estimated $0.00443325 | `docs/evidence/daa89a0/live/daa89a0-gemini-staging-summary.json`; no paid call repeated |
| Native artifacts | Prior task reports `test-ios`, `test-android`, `readiness-ios`, `readiness-android` accepted | Files/receipts not recovered; owner saved no manual copies. Treat as unavailable and rebuild only after the next candidate freeze |
| Telemetry artifacts | Prior task began `telemetry-test-ios`; completion unknown; Android not reported complete | Require actual artifact/receipt pairs |
| Current-candidate device journeys and cumulative summary | Incomplete | No honest cumulative sign-off yet |
| Security | Recorded clean focused review at `069473c`, followed by source changes | [Attributable source delta](reviews/2026-09-12-security-delta.md); no new plugin scan authorized |
| Legal/contact/attribution | Owner confirmations recorded 2026-08-26 | Preserve the signed record; reconfirm only changed text or delivery conditions |

The canceled deep scan remains canceled. Historical superseded candidates are
preserved in `docs/history/2026-09-12/` and existing evidence namespaces.
A passing report from an older source must never be relabeled as a replacement.

## Local replacement verification

`make ready` passed after restoring isolated locked dependencies and removing
conflicting test-command environment overrides. JavaScript: 197 passing tests
(74 scripts, 19 web, 56 mobile unit, 9 mobile component, 25 shared API, 14 domain).
Backend: 98 passed; three Postgres-only migration assertions skipped locally.
Public CI subsequently passed all 101 against Postgres. Lint, types, contract generation, web and
Expo-web builds, and deterministic smoke passed. OpenAPI and lockfiles are
unchanged. Bundle size is a report-only 2,820,354 web JavaScript bytes.
Browser fixtures confirmed timeout → visible Retry → restored plans;
[local evidence](evidence/astra-reassessment/README.md) contains screenshots and
runtime-file hashes. These are not live-auth or device results.

## Development handoff

- Inherited staging application worktree: `.worktrees/closed-beta-readiness`, branch
  `codex/closed-beta-readiness`, at `daa89a0`.
- Current replacement application worktree: `.worktrees/astra-project-reassessment`, branch
  `codex/astra-project-reassessment`; deployed application remains `c5b041c`.
- This follow-up records deployment evidence and status only. An evidence
  descendant does not change the deployed application SHA. A branch push
  triggers Vercel Preview automatically, so the evidence-only commit stays
  local until a later approved push.
- The repository's original checkout remains on the older
  `codex/privacy-safe-observability` branch. Its status files are not the latest
  handoff; neither original worktree nor untracked evidence was overwritten.
- Project Codex default is `gpt-6-astra`. Existing task/CLI overrides can still
  take precedence. No global model, authentication, or permission setting was
  changed.
- Native preflight now rejects the historical malformed build ID, absent or
  conflicting Android SDK configuration, and overlapping output paths before
  dependency installation/compilation. `--preflight-only true` starts no build.

## Native verification in progress

The owner requested continuation into native reliability verification. Both
build-input preflights passed for `c5b041c`; sequential deterministic iOS then
ARM64 Android builds and lifecycle/offline tests are active. Durable private
storage is `.artifacts/mobile/<full-source-sha>/` in the original checkout.
Both test artifacts passed source/configuration/signature inspection and have
version-two receipts. The iOS 26.5 and Android API 36 ARM64 lifecycle and offline
journeys passed: two participants, four candidates, votes, finalization, reopen,
rotated-link rejection, stale-result clearing, same-key interrupted-write retry
and zero writes while offline. [Native evidence](evidence/c5b041c/native/README.md)
contains sanitized reports and synthetic screenshots. The four hosted profiles'
inputs/configuration passed; the signed iOS readiness build is active.
These simulator/demo results do not establish physical-device or live-auth
acceptance. Visual review found default tab glyphs; functional text labels remain,
and explicit icon/text-only styling is queued for the next client candidate.

## Remaining release constraints

Use the [roadmap](roadmap.md) for order and
[readiness checklist](release-readiness-checklist.md) for controls and risk owners.
Production/store/cohort work is not complete. In particular: production trust
origins and signed-update policy; end-to-end account deletion/retention;
share-link risk decision; quota/invite boundaries for the chosen cohort;
production symbol upload; signing/associations; rollback; and explicit external
approvals remain outstanding. Durable shared coordination is required before
horizontal scaling, not automatically a prerequisite for an approved single-
process pilot.

See the [Astra review](reviews/2026-09-12-astra-reassessment.md) for coverage,
findings, sources and the rationale for the revised sequence.
