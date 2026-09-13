# Active packet: native reliability verification for c5b041c

## Objective and source

Build and verify the frozen staging candidate on iOS and ARM64 Android.
The owner requested continuation after reviewing the native reliability
sequence. Start with `test-ios` and its deterministic lifecycle/offline flows,
then `test-android`; preserve artifacts, inspection reports and receipts in
durable private storage before the readiness/telemetry pairs.
Development uses Astra; application inference remains Gemini/Places.
This is the only active implementation packet.

Branch: `codex/astra-project-reassessment`.
Inherited source: `daa89a03e1ba09b4249125476c5d28b7f2a98f31`.
Frozen and deployed replacement:
`c5b041c85f4f7b959436c13bef48c959622c624f`.
The owner approved its push, CI, Railway staging and Vercel Preview rollout.
Do not attribute old smoke, scan or native reports to this source.

## Completed locally

- Read the referenced `Explore repository` task and its approval, scan
  cancellation, interrupted build history and partial evidence.
- Inventoried 426 inherited files and reviewed every subsystem's owning paths,
  tests, architecture, release configuration and planned objectives.
- Rechecked `daa89a0` public CI/API readiness and recovered its sanitized
  two-user live report. Native files/receipts were not recovered; the owner
  confirmed no manual copies. Treat them as unavailable for scheduling.
- Pinned the project development model to Astra, preserved application
  providers, and archived superseded planning narratives.
- Added build-ID, signer, SDK and output-path validation before native work,
  plus a no-build preflight. Existing post-build attestation stays mandatory.
- Reproduced the credential wait with no network. The replacement uses one
  request deadline for credentials, fetch, refresh and body parsing; late
  credentials cannot dispatch/retry writes.
- Bounded web/mobile startup reads to 15 seconds. Mobile has explicit
  restoration retry, preserves a pending invite/session on failure, and no
  longer signs out on a refresh transport error. Startup ignores stale results.
- Added behavioral shared-client and mobile recovery tests. Preserved the
  historical scan association in an [attributable source delta](../reviews/2026-09-12-security-delta.md).

## Current verification and next actions

1. Local verification is complete: `make ready` passed (197 JavaScript and
   98 Python tests; three Postgres checks deferred to CI), browser fixtures
   confirmed timeout/retry recovery, and contracts/locks are unchanged.
   [Evidence](../evidence/astra-reassessment/README.md) includes runtime hashes.
   The handoff commit freezes the replacement. This worktree has its own locked
   JavaScript/Python environments.
2. Approved hosted work is complete. Public CI run `34728044149` passed,
   including the three locally deferred Postgres assertions and four browser
   tests. Railway deployment `dcccd4a1-cca7-489b-9d7d-81e4019aad0c` and Vercel
   Preview `dpl_9zGVqXpFNQkCzSXBaecR18hqMs2M` use `c5b041c`. Public readiness
   and exact-origin CORS pass; an unrelated origin is rejected. Source-stamp
   updates and the CORS correction are recorded in
   [deployment evidence](../evidence/c5b041c/README.md). Production aliases and
   deployment protection were preserved. This evidence-only descendant stays
   local because a branch push would automatically build another Preview.
3. Resolve security-evidence acceptance before cumulative sign-off. The source
   delta is an ordinary review, not a new scan. The validator's current
   exact-candidate scan requirement remains in force; do not relabel the old
   scan or restart the canceled scan to fill it.
4. Native continuation is now authorized by the owner's “continue with the
   next steps.” Keep `c5b041c` frozen and run native builds sequentially.
   iOS and Android build-input preflights passed; use the existing dedicated
   iOS 26.5 simulator and API 36 ARM64 emulator. Artifacts and receipts belong
   in the original checkout's ignored `.artifacts/mobile/<full-source-sha>/`,
   outside disposable worktrees and OS temp. Finish each deterministic
   platform's fault flows before the readiness/telemetry pairs. Real-session,
   physical-device and paid-provider acceptance remain separately attributable.
   Both test artifacts, receipts, lifecycle and offline mutation journeys passed.
   All four hosted profiles passed input/configuration checks and were built
   sequentially: readiness iOS, readiness Android, telemetry iOS, telemetry Android.
   All six artifacts passed inspection, receipt and final source/lockfile/digest
   checks. The signed iOS readiness profile covers the paired iPhone. Both
   telemetry artifacts contain the current source literal in their bundles.
   The owner restored TableUs PostHog and Sentry access; current-release canary
   baselines are empty. Both readiness builds are installed. The owner confirmed
   the physical iPhone restores its approved session, preserves it after full
   close/relaunch, and opens the canonical `/auth` link from Notes. PostHog
   received an exact-release iOS app-open event. Android's signed domain is
   verified; returning authentication now passes after one approved message.
   The owner has now
   approved the bounded returning sign-ins, cross-client journey and dedicated
   canaries described below. No cumulative acceptance is claimed.
   Sanitized reports and synthetic screenshots are retained in
   `docs/evidence/c5b041c/native/`. Partial readiness reports explicitly remain
   incomplete. Do not confirm the runner's remaining phases without actual
   observations. The iPhone now shows the new web-created plan after foreground
   refresh and awaits its private-link observation. Android returning sign-in,
   relaunch persistence and canonical auth/join opening pass. Android initially
   used the organizer's account, leaving one participant; the owner approved an
   additional message to switch it to the existing second approved account.
   The switch passed and both the owner and database confirm two participants.
   Guest constraints and physical iPhone private-link confirmation are pending
   before the single recommendation generation. Android's runner awaits
   changed-state foreground recovery. Android became
   responsive after the idle iOS simulator was stopped; the cause of the earlier
   unresponsiveness is not conclusively established.
   Web sign-in, the single plan creation, organizer constraints and account
   export/deletion-readiness checks pass. The web canary reached PostHog and
   Sentry with the exact release. Creating the plan used two Places attempts;
   no Gemini call has run. The telemetry iOS artifact is re-inspected and
   installed, but its simulator is shut down to keep native checks sequential.
   [Approval and usage baseline](../evidence/c5b041c/native/live-approval-and-baseline.json)
   records the unchanged existing quota; current execution uses private deltas.

## Acceptance and stopping rules

- Focused tests, one successful completed `make ready` after fixes, clean diff,
  unchanged contracts/locks, and an exact-commit handoff establish local
  readiness. They do not establish native, hosted or production acceptance.
- No new security-plugin scan or paid AI evaluation is part of local checks.
- Diagnose a repeated identical build failure instead of blindly rerunning it.
- Use only sanitized counts, booleans, source/deployment IDs and hashes in
  shared evidence. Keep artifacts/logs private and durable.
- Device claims require actual observations; request the owner only when a
  concrete step requires a physical device or a current verification code.

## Authorization carried forward

The owner's “approve” (2026-09-13 UTC) authorized three returning sign-in
messages, one each for Android, the iOS telemetry simulator and web only where
an existing session is unavailable. The owner subsequently explicitly approved
one extra Android message to use the existing second approved account: four
messages total at most. The same approval covers one two-person live dining
journey using existing approved accounts, with at most $0.25 additional estimated
Gemini spend and 50 Places outbound attempts; and anonymous/error-only canaries
from web, API, iOS and Android. Observe usage before and between provider-backed
steps, stop before the approved allowance or existing staging quota is exhausted,
and do not regenerate recommendations merely to repeat a passed assertion.
At authorization, no sign-in message or paid-provider call from this run had
been sent. Record requested messages and actual usage deltas as execution proceeds;
an interrupted or failed attempt still consumes its applicable allowance.

The old task approved public push, CI, existing staging deployment, bounded
live smoke and six sequential native artifacts for `daa89a0`. Completed work
does not need repeated approval, and consumed limited-call/OTP allowances do
not reset. On 2026-09-12 the owner's `APPROVE` supplied the matching scope for
the `c5b041c` push, CI and existing staging deployments. Those operations are
complete. The later continuation request authorizes the native reliability
sequence described above. The latest explicit approval supplies only the bounded
paid-provider and returning-message scope above. No security scan,
production/store/cohort action or credential creation is implied.

The owner's scan cancellation remains binding. This packet grants no merge,
production migration/deployment, resource/secret creation, store submission,
mail beyond the four returning messages, new invites, account deletion,
destructive cleanup or cohort activation.
There are no unanswered intake questions. Later roadmap objectives and their
explicit gates are queued, not active work.
