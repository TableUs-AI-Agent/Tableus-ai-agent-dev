# Closed-beta release runbook

Updated 2026-09-14. Start with [current state](current-state.md) and the
[active packet](task-packets/active.md). The recipes here do not grant authority
to create resources, send mail, deploy or start paid calls.

## 1. Establish what already exists

The deployed staging source is `c5b041c85f4f7b959436c13bef48c959622c624f`.
The owner-approved push/CI and existing Railway staging/Vercel Preview rollout
are complete. [Evidence](evidence/c5b041c/README.md) records exact deployment
IDs, readiness, Preview CORS and preservation of production targets.
The previous `daa89a0` live-smoke report was recovered and remains historical.
Those four historical daa89a0 completions had no recovered files/receipts.
The six newer c5b041c artifact/receipt pairs are now retained and reverified.
The frozen 6b9719b replacement changes client bytes and needs its own artifacts;
see the [preflight and execution request](evidence/replacement-6b9719b/README.md).
Do not repeat successful external operations solely because a coding model changed.

Keep three identities separate:

- **Application SHA:** the code actually deployed or compiled.
- **Operator-tooling SHA:** the checked-out helper used to validate inputs and
  create a detached candidate build.
- **Evidence commit:** a descendant storing reports, each labeled with the
  actual source it proves.

If product source, dependencies, compiled configuration or API contracts change,
finish the change and freeze a replacement candidate before expensive release
work. Never relabel old evidence with that new source.

## 2. Complete cheap local work first

The frozen local device-session and plan-refresh correction is described in the
[review](reviews/2026-09-14-device-session-plan-refresh.md). Local verification
passed for 6b9719b. Evidence-only updates reuse those checks when the actual
application, tooling and test bytes remain unchanged.

For implementation changes, run focused tests while iterating, then `make ready` once. Check generated
OpenAPI drift explicitly:

```bash
make ready
git diff --exit-code -- docs/openapi.json packages/api-client/src/schema.ts
```

`make ready` runs workspace/backend lint, types and tests, contract generation,
web/Expo-web builds, deterministic smoke and a report-only bundle-size baseline.
It does **not** include Playwright, native compilation/device journeys, live
provider evals, a real latency threshold or hosted verification. Public CI
contains additional Postgres migration, deterministic AI and Playwright checks.

Use locked dependencies and source-owned test configuration. Leave all providers
deterministic and telemetry off locally. The canceled plugin scan stays canceled.

## 3. Reconcile evidence and external scope

Before resuming an approved source, verify existing CI by SHA and public
`/health/ready`. For the selected candidate record actual Railway/Vercel IDs;
check both `tableus-staging.vercel.app` and `links.table-us.com`, CORS, AASA and
Android App Links. Keep `table-us.com` outside staging.

The previously recorded candidate's smoke succeeded; its report is historical
evidence, not authorization to spend again. A replacement deployment/live smoke
requires a matching, concrete approved scope and budget. Preserve completed
approvals, their exact source/scope and remaining limited-call allowances.

The `c5b041c` approval covered push/CI and the existing staging targets only.
Before another deployment, account for Vercel's automatic branch-push trigger,
set source-stamp inputs before the build, and verify the exact Preview URLs in
the API CORS allowlist. Keep the existing production target/aliases intact.
Do not push an evidence-only descendant merely to publish receipts if that
would automatically create an unapproved replacement Preview.

The [source delta](reviews/2026-09-12-security-delta.md) retains the older
`069473c` scan association. Version-one cumulative input retains its scan contract;
version two uses the distinct [accepted staging source review](evidence/source-review-6b9719b/README.md)
for 6b9719b. Bind its exact report/owner acceptance and preserve all remaining
source-bound gates. The report digest uses parsed JSON; native inspection receipts
hash their raw inspection-file bytes. Do not restart a scan for a stale checkbox.

## 4. Preflight every native build

Keep artifact outputs in durable private storage outside OS temp and outside
removable worktrees, for example the original checkout's ignored
`.artifacts/mobile/<application-sha>/`. Keep each artifact, inspection and
receipt together; copy only sanitized reports to tracked evidence.

Before compilation:

- Check Node 22, locked EAS CLI, Xcode/Java/Android tools, signer identifiers,
  available disk and absence of another native build.
- For Android explicitly set `ANDROID_HOME` or `ANDROID_SDK_ROOT` to the
  installed SDK. If both are set they must identify the same SDK. Confirm
  `platforms` and `build-tools` exist.
- Use `local-ios-<purpose>-<sha-prefix>` or
  `local-android-<purpose>-<sha-prefix>` for build IDs.
- Use new, separate artifact, inspection and receipt paths.
- Validate the candidate's checked-in EAS workflows when native/profile work
  changes. `make mobile-workflows-validate` uses the external current schema;
  it is not a credential-free/offline part of `make ready`.

Use the same inputs for a no-build check and the actual build:

```bash
make local-mobile-build PREFLIGHT_ONLY=true \
  PLATFORM=ios PROFILE=test-ios SHA=<application-sha> \
  BUILD_ID=local-ios-test-<sha-prefix> \
  APP=<durable-root>/test-ios.app \
  INSPECTION_REPORT=<durable-root>/test-ios-inspection.json \
  RECEIPT=<durable-root>/test-ios-receipt.json
```

Hosted profiles additionally require `API_URL`, `SUPABASE_URL` and
`LINK_HOST=links.table-us.com`; physical iOS profiles require `APPLE_TEAM_ID`;
Android requires `ANDROID_FINGERPRINT`. With an approved build scope, run the
same command without `PREFLIGHT_ONLY=true`.

Preflight validates inputs and candidate existence; it does not certify cloud
credentials, native toolchain compatibility or a future build. The orchestrator
still creates a clean detached checkout of the requested application SHA,
installs that source's lockfile, builds, runs its inspector and emits its
version-two receipt before export. Post-build attestation remains authoritative.

Build logs stay private and file-backed. On failure, record the phase and minimal
sanitized diagnosis; do not promote raw logs. Do not repeat identical builds
after the same unexplained failure. Preserve accepted artifacts before any
authorized cleanup. Existing unrelated temporary directories are not cleanup
authorization.

## 5. Validate each artifact family before moving on

All native builds, simulators and emulators remain sequential and memory-bounded.

1. Build/inspect `test-ios`; run `mobile-e2e` and `mobile-offline-e2e`.
2. Build/inspect ARM64 `test-android`; run the same deterministic journeys.
3. Only after both pass, build/inspect `readiness-ios` and
   `readiness-android`.
4. Build/inspect the two `telemetry-test-*` profiles and collect sanitized
   exact-release telemetry. Readiness artifacts contain no E2E canary controls.

Existing matching accepted artifacts may skip compilation after full
artifact/receipt verification. Do not use an older candidate's reports.

For deterministic journeys use `make mobile-device-preflight` to select the
simulator or online API 36+ ARM64 emulator, then:

```bash
make mobile-e2e PLATFORM=<ios-or-android> DEVICE=<device-id> \
  APP=<inspected-artifact> BUILD_ID=<build-id> EVIDENCE=<sanitized-directory>
make mobile-offline-e2e PLATFORM=<ios-or-android> DEVICE=<device-id> \
  APP=<inspected-artifact> BUILD_ID=<build-id> EVIDENCE=<sanitized-directory>
```

The deterministic runners use loopback/demo providers only. Never point them at
Supabase staging or send demo identity headers to hosted services.

## 6. Finish the real two-person journey

Use the selected source's `mobile-readiness-e2e`, `mobile-links-e2e`,
`telemetry-staging-e2e` and cumulative evidence commands. Each requires the
source-specific receipts and source-controlled origins shown by its Make target.

Preserve existing approved sessions. Request a new OTP only at a live prompt,
within explicit remaining authorization. Do not retain email, OTP, session,
private link, provider content or raw authenticated screenshots.

Use two distinct approved participants. Organizer creates a plan; guest joins;
both save constraints; organizer generates four candidates; both rank/vote;
organizer finalizes/reopens; guest refreshes; old rotated link is rejected.
Verify failure/recovery and read-only account-control availability.

Physical-iPhone association testing requires actual taps from Notes/Messages
and observed behavior. A simulator or browser address-bar navigation is not
equivalent. Request the user's observation when tooling cannot observe it; never
auto-confirm a manual checklist.

Local artifacts disable Sentry build-time upload only; verify runtime canaries
separately. Production/store builds must restore and demonstrate source-map and
native-symbol upload and usable symbolication before approval.

## 7. Collect cumulative evidence and decide

```bash
make cumulative-readiness-evidence API_URL=<staging-api> SHA=<application-sha> \
  INPUT=<validated-evidence-input.json> EVIDENCE=<sanitized-directory>
```

Require complete candidate-bound web, native, deterministic, association,
telemetry and security-delta evidence plus the recorded owner controls.
The validator's acceptance does not substitute for real observations or prove
that a referenced report was generated at a different SHA.

Use the [checklist](release-readiness-checklist.md) for risk ownership and the
[roadmap](roadmap.md) for later privacy, production configuration, stores and
cohort work. Merge remains a separate explicit approval.

Rollback owner remains Brian Chei. On a bad release stop collection/activation,
identify the last actually verified deployment/artifact, prepare its restoration,
and obtain any required deployment approval. Do not blindly restore a
superseded security-blocked candidate or issue unsigned OTA updates.

## Historical procedures

The previous detailed provisioning commands and candidate narrative are retained
in `docs/history/2026-09-12/release-runbook.md`. They explain past work and are
not instructions to reprovision the existing resources or rerun completed gates.
Consult current provider documentation when a future approved infrastructure
change requires them.
