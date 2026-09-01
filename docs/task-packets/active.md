# Active packet: closed-beta cumulative staging readiness

## Status

Implementation is active on `codex/closed-beta-readiness`, branched from merged
`main` at `e1184eca9b73e1a9f26d1007ab543df9d54c7124`. Local deterministic checks,
the repository security scan, owner legal/contact confirmations, candidate
freeze, public CI, deployments, signed builds, and cumulative evidence must all
complete before this packet can be signed off.

The first exact-SHA device pass exposed Android's native transparent retry of a
pre-response POST. That candidate's artifacts are superseded. The replacement
candidate must include the Android OkHttp no-retry lifecycle policy, incomplete-
envelope handling, and the corrected cross-platform fault model before the
external evidence gate is repeated.

The next public candidate was stopped before deployment when manually dispatched
CI found two stale Playwright assertions: the former legal effective date and
the retired text-only Maps attribution. The replacement assertions target the
owner-approved date and the accessible official attribution image.

Exact candidate `38aab2d49088416a26704a391bcf2bf21288ee2b` passed public CI,
deployed cleanly, and produced four inspected local artifacts, but cumulative
iOS fault evidence found a stalled response body could leave a mobile write
pending indefinitely after the backend committed it. Those artifacts are
superseded. The replacement candidate adds an abortable client deadline that
remains active through response-body parsing: 10 seconds in gated local E2E and
45 seconds in production-shaped mobile builds.

Exact candidate `c8a506fcfb0add43b2a156321628653e177fc1bf` passed public CI,
deployed cleanly, produced four inspected local artifacts, and passed the live
two-user web lifecycle. Its private test link was rotated after the run. The
candidate is nevertheless superseded for cumulative sign-off: device execution
showed that ordinary lifecycle flows did not consume the app's intentional
explicit Retry state after an ambiguous response, and the readiness runner
asked for a mobile Sentry canary even though production-shaped profiles
correctly compile no telemetry test control. The replacement uses retry-aware
Maestro flows and binds a separate exact-SHA sanitized telemetry report from the
isolated telemetry-test profiles into cumulative evidence.

Exact candidate `017c40f7ad96fa9e241ec833392f321ab63421b7` passed public CI,
deployed cleanly, and produced all six inspected local artifacts. Device
diagnostics superseded those artifacts before cumulative acceptance. The iOS
lifecycle restored voting correctly after reopen, but its flow asserted the
submit action before scrolling it into view. More importantly, the committed-
response-drop test proved `expo/fetch` can ignore a post-header abort while
response-body parsing remains pending, so the nominal ten-second deadline did
not surface the explicit Retry state. The replacement candidate races the same
deadline against both fetch and body parsing even when abort is ignored, and
scrolls to the restored vote action before asserting it. The staged live smoke
was stopped at its first verification-code prompt and made no paid provider
call.

Exact candidate `ac099f37f38a959f3c5d86c51ce78a225a836d09` passed public CI,
deployed cleanly, passed the budgeted two-user live Places/Gemini smoke, built
all six inspected artifacts, and passed both iOS deterministic journeys. Its
Android lifecycle reproducibly reached the explicit recoverable state before
rotated-link rejection because that single lifecycle flow did not consume
`Retry joining plan`. The replacement adds the same bounded explicit retry
branch already required for every other lifecycle write. No Android evidence or
artifact from this candidate is accepted for cumulative sign-off.

Exact candidate `0de0c34c0806e25e6b0cea664159e0800fd2accf` passed public CI,
deployed cleanly, passed the budgeted two-user live Places/Gemini smoke, built
and inspected all six artifacts, and passed both iOS deterministic journeys.
On Android, the organizer vote persisted and the app rendered `Ranked vote
saved.`, but the status was below the viewport while the host flow used an
already-visible wait. The replacement scrolls to either the saved or bounded
retry state after vote submission in both organizer and guest flows and guards
that behavior. It also adds repository-owned current-schema EAS workflow
validation and a shared sanitized iOS/Android device preflight, applying the
Expo, iOS-debugging, and Android-emulator procedures to the cumulative run. No
artifact or partial Android evidence from `0de0c34` is accepted for cumulative
sign-off.

Exact candidate `d0955f5d08537b3251341720ed3a28453a70e13b` passed public CI,
staging deployment, live smoke, six artifact inspections, and the available
deterministic mobile, web, link, and telemetry checks. The final repository scan
then reported two P1 availability flaws: attacker-chosen credential headers
bypassed the request bucket, and public writes could fill an unbounded response
cache. It also reported P2 replay before current authorization. This candidate
and all external evidence are superseded. Local remediation now uses bounded
transport/global limits, reusable JWKS state, an authenticated route allowlist,
current profile/plan-role replay checks, and bounded success-only storage. A
fresh exact-SHA scan and `make ready` must pass before replacement freeze.
Physical-iPhone readiness also waits for the owner to allow app installation in
device ManagedConfiguration.

Local remediation commit `520630393c45ad992c63b2a45078235d2ef8aff0`
closed those three findings and passed `make ready`, but its sealed full scan
`0933625b-4d73-4da7-ba6a-946128c29089` found one further P1: multipart uploads
could be parsed and spooled before the handler's size check. It also found
staging fail-open defaults, append-only invite validations, cross-subject web
cache retention, unsafe live-evidence screenshot promotion, echoed operator
secrets, a revocation-insensitive connection replay, and mutable build inputs.
That local candidate is superseded and was never pushed or deployed. The active
remediation adds outer ASGI admission/body limits, secure hosted defaults,
invite reservation reuse/pruning, subject-partitioned web caches, summary-only
live evidence, no-echo prompts, current-consent connection retries, and
immutable CI/container inputs. Signed native inspection additionally rejects the
  local-network allowance found in the superseded iOS artifact and Android
  cleartext transport. Independent bypass review additionally closed CORS
  preflight admission, page-local cross-subject state, user-level Maestro-log,
  and mutable Expo Doctor gaps. A new exact SHA still requires `make ready`, an
  independent bypass review, and a fresh full scan before any external gate.

Full scan `2c12edd1-65ce-4cee-af11-c78c0b21ae85` reviewed all 386 tracked files
at exact local SHA `b2823652ffb795469ffb84de13ccabbf4468a89d`. Its 95 raw
findings included duplicates, but 12 distinct high-severity root causes remained,
so that SHA is security-blocked and will not be deployed. The active local
remediation closes every high path: global-limit poisoning, hosted demo fallback,
slow/body and health amplification, mutable web/mobile trust origins, mutable EAS
project/update authority, and unsigned production OTA. It additionally closes the
highest-confidence medium paths through serialized idempotency, plan row locks,
bounded/coalesced JWKS refreshes, hosted invite email binding, separate runtime
and migration roles, review and paid-Places ceilings, no provider-backed mobile
polling, and exact closed-schema evidence. Focused tests are green; `make ready`,
candidate freeze, and a fresh exact-SHA scan remain.

Replacement candidate `9fbdf48afb237ae3c831d4f90798553cdc8672ab` passed
`make ready`, but sealed scan `b8e34c01-ad8c-4bec-8d1d-f5212f94570d`
reported four distinct high-severity root causes across JWKS revocation and the
local mobile artifact trust chain. It is security-blocked and will not be
deployed. Current remediation removes indefinite outer signing-key retention,
requires structured single-config/native-signer inspection, binds device
installation to a verified private artifact copy and version-two receipt, and
replaces post-hoc receipt generation with an isolated detached exact-SHA build
orchestrator. Cumulative evidence now validates the complete receipt rather than
accepting a caller-supplied pass flag or checksum alone. Focused regressions are
green. Formal remediation diff scan
`9c5756d1-65d2-4c2f-8641-125352d5c935` found that PyJWT's separately enabled
per-key LRU still had no TTL; the replacement now disables that tier and tests
the real configured client rather than a cache-free fake. The replacement still
requires the full repository gate and a fresh sealed scan.

## Objective

Close the remaining pre-production gates without changing the public API,
database schema, or product behavior. Establish one exact source SHA across
Railway, Vercel, web, a registered physical iPhone, and an ARM64 Android
emulator, with policy-safe retained evidence and an accountable rollback owner.

## Deliverables

- Canonical `support@table-us.com` and `privacy@table-us.com` contacts shared by
  web and mobile legal notices.
- Owner-reviewed terms/privacy copy with direct Google Maps Platform Terms and
  Google Privacy Policy links and retained Supabase, Gemini, Sentry, PostHog,
  location, photo, retention, export, and deletion disclosures.
- The official unmodified Google Maps attribution asset in the same visual
  container as provider content, with accessible labeling and policy guards.
- Expo SDK 57 patch releases only, Expo Doctor/dependency/audit evidence, and a
  time-bounded exception for build-tool-only `uuid` reachability if no supported
  SDK 57 fix is available.
- A repository-wide authentication, authorization, secret, provider-boundary,
  telemetry, CORS, configuration-gate, and dependency-reachability scan.
- Production-shaped `readiness-ios` and `readiness-android` profiles, signed
  artifact inspection, guided device runners, and one-SHA cumulative evidence
  validation.
- Live-schema validation for every checked-in EAS workflow and a shared local
  preflight that verifies the exact simulator/APK shape, may boot an explicitly
  selected iOS simulator, and requires an online API 36+ ARM64 Android emulator.
- Exact-SHA auxiliary `telemetry-test-ios` and `telemetry-test-android`
  artifacts used only to emit sanitized canaries; production-shaped readiness
  artifacts retain no telemetry E2E control.
- Cross-platform ambiguous-response evidence that disables Android transport
  retries, requires explicit user Retry, and preserves one idempotency key.
- Bounded mobile request deadlines that convert a stalled fetch or response body
  into the same explicit ambiguous-response Retry state.
- A signed security/privacy checklist, residual-risk register, release-candidate
  procedure, and rollback matrix naming the repository owner as accountable.

## Acceptance

- Deterministic CI and `make ready` require no provider or cloud credentials.
- Expo Doctor passes; the shipped runtime graph reports zero critical/high
  findings. Any release-tool-only high or moderate advisory is documented by
  reachability and a production-blocking expiry.
- No P0/P1 security finding, exposed credential, or exploitable high runtime
  issue remains.
- The owner confirms the final legal copy, attribution presentation, and actual
  delivery to both public contact mailboxes before candidate freeze.
- Public CI and all retained Railway, Vercel, web, deterministic mobile,
  production-shaped mobile, link-association, telemetry, and security evidence
  reference one exact candidate SHA.
- Evidence contains only approved identifiers, checksums, counts, booleans,
  policy versions, and deterministic synthetic screenshots. Live authenticated
  runners retain no screenshots; evidence contains no personal, secret,
  private-plan, location, restaurant, or provider response data.

## External gates

After a clean local candidate exists, one explicit owner approval is required
before the public push, Supabase OTP-template change, contact-alias creation,
Railway/Vercel staging deployment, budgeted live smoke, four sequential release
artifacts, two auxiliary telemetry-test artifacts, or returning OTP delivery. A
separate explicit approval is required to merge the evidence descendant into
`main`.

## Boundaries

No migration, public API or OpenAPI change, production deployment, TestFlight,
Google Play, production signing fingerprint, store submission, new invite,
account deletion, or cohort invitation is included. Production/store/cohort
activation remains a separate objective.
