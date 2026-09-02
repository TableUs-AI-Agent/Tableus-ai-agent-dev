# Closed-beta release runbook

This is the operator sequence for clearing the remaining TableUs release gates.
It does not authorize cloud creation, secret changes, paid provider calls,
migrations, deployments, EAS builds, or store submissions. Obtain explicit user
approval immediately before each such action.

## 1. Establish the release candidate

1. Work from a clean `codex/<objective>` branch.
2. Run `make ready` with deterministic providers and no production secrets.
3. Record the candidate SHA with `git rev-parse HEAD`.
4. Require CI to pass for that exact SHA. Do not accept evidence from a newer or
   older commit.

## 2. Collect owner-controlled inputs

The owner supplies these through the target platform's encrypted environment or
secret manager, never in source control:

- Final HTTPS domain and support/privacy contact.
- Supabase project URL, anon key, database migration URL, and a separate runtime
  database URL.
- A pre-created PostgreSQL runtime login role name for
  `TABLEUS_RUNTIME_DB_ROLE`.
- Railway, Vercel, Expo/EAS, Apple, and Google Play project ownership.
- Apple Team ID, iOS bundle identifier, Android package name, and SHA-256
  fingerprints for every production/preview Android signing certificate.
- Google Maps, pinned Gemini, Sentry, and PostHog credentials and agreed budgets.

Use unique staging and production values. Never copy production database or
provider secrets into preview builds or CI.

## 3. Provision Supabase staging

After cloud-resource and secret approval:

1. Create the staging project in the intended US region.
2. Create a least-privilege login role for the API runtime. Keep the privileged
   migration credential separate. Set `DATABASE_URL` to the runtime connection,
   `MIGRATION_DATABASE_URL` to the migration connection, and
   `TABLEUS_RUNTIME_DB_ROLE` to the quoted-safe role name.
   `backend/scripts/provision_runtime_role.py` performs the role creation or
   credential update when those variables plus the process-only
   `TABLEUS_RUNTIME_DB_PASSWORD` are present; it never prints the password.
3. Keep the `app` schema private; do not expose it through the Supabase Data API.
4. With explicit staging-migration approval, run from `backend/`:

   ```bash
   uv run alembic upgrade head
   ```

5. In Supabase Authentication Hooks, configure **Before User Created** to call
   the Postgres function `app.hook_restrict_signup_to_validated_invite`. The
   migration grants the Auth administrator access when that built-in role is
   present.
6. Configure custom SMTP and an email OTP template that presents the OTP token.
   Configure approved redirect URLs only for the final HTTPS `/auth` and `/join`
   routes plus intentionally supported staging URLs.
7. Configure short OTP expiry and platform rate limits, then verify that an
   unvalidated email cannot create an Auth user.

Joining and returning sign-in are distinct. A new account validates and redeems
one invite before product access. A returning account requests OTP without a new
invite, then must pass the authenticated `/api/v1/me` profile check.

Create an invite only after the migration and hook are active:

```bash
cd backend
uv run python scripts/invites.py create --max-uses 1 --expires-hours 168
uv run python scripts/invites.py list
```

The plaintext invite is printed once. Transfer it through an approved secure
channel. Revoke a compromised invite with:

```bash
uv run python scripts/invites.py revoke <invite-id>
```

## 4. Configure the staging services

### Railway API

Set the backend variables from `backend/.env.example`, with at least:

- `ENVIRONMENT=staging`
- `DATABASE_URL`, `TABLEUS_RUNTIME_DB_ROLE`
- `TABLEUS_AUTH_MODE=supabase`
- `TABLEUS_PROVIDER_MODE=deterministic` initially
- `TABLEUS_DEMO_MODE=false`
- a generated `TABLEUS_APP_SECRET`
- `SUPABASE_URL`, `SUPABASE_JWT_AUDIENCE=authenticated`
- exact `ALLOWED_ORIGINS` and `BACKEND_PUBLIC_URL`

For staging verified-link evidence, `ALLOWED_ORIGINS` must contain exactly the
staging web alias and the canonical browser-fallback origin:
`https://tableus-staging.vercel.app,https://links.table-us.com`. Do not add
`https://table-us.com` until its production deployment is separately approved.
Verify both allowed origins with credential-free preflights after deployment;
an omitted link origin breaks signed-out web fallback even when AASA/App Links
are valid.

Do not store `MIGRATION_DATABASE_URL` in Railway. Apply each approved migration
from the trusted operator environment with the owner credential held outside the
service, then deploy the runtime with only the least-privilege application role.
Railway supplies `PORT`; the container reads it automatically. Confirm
`/health/live` and `/health/ready` after an approved staging deployment.

### Vercel web

Set the frontend variables from `frontend/.env.local.example`. For association
files, set `APPLE_TEAM_ID`, `IOS_BUNDLE_IDENTIFIER`, `ANDROID_PACKAGE_NAME`, and
comma-separated `ANDROID_SHA256_CERT_FINGERPRINTS`. The two endpoints return 503
until the values are structurally valid.

After an approved staging deployment, verify:

```bash
curl --fail https://<domain>/.well-known/apple-app-site-association
curl --fail https://<domain>/.well-known/assetlinks.json
```

### Expo/EAS mobile

Link the Expo project and set the values from `mobile/.env.example`, including
the final link host and EAS project ID. Ensure the iOS associated domain and
Android HTTPS intent filters produced by `mobile/app.config.ts` match the web
manifests. Preview and production use different EAS channels and credentials.

Use Expo Go for normal local work. Verified HTTPS links, credentials, native
configuration, and telemetry must be validated with a real development or
preview build. EAS Update is only for JavaScript-compatible changes whose
runtime version matches; native dependency or configuration changes require a
new store build.

### Canonical verified links

Use only `https://links.table-us.com` for shared auth and private-plan URLs. Add
that hostname to the existing Vercel staging project and create its Squarespace
DNS record without redirecting through the apex or `www` host. Set
`NEXT_PUBLIC_LINK_ORIGIN` and `EXPO_PUBLIC_LINK_HOST` to the canonical value.
Keep `/auth/confirm` browser-only; native associations cover `/join/*` and exact
`/auth`.

After an exact-SHA candidate passes `make ready`, one explicit owner gate covers
DNS/Vercel changes, public signing identifiers, the web deployment, EAS device
registration/capability sync, signed local builds, and one returning OTP per
platform. Build the physical-iOS and ARM64-Android `links-test-*` profiles
sequentially with file-backed logs and bounded native workers. Use EAS CLI
22.4.0 or newer so local-build credentials travel through the redacted
environment transport, never a process argument. On macOS Tahoe 26, the upstream
temporary-keychain validity bug may require the upstream `find-identity` fix in
a disposable local-build plugin copy; never modify or retain signing material to
work around it.

Extract the Apple Team ID and Android SHA-256 certificate from those signed
artifacts, configure the association endpoint environment, deploy the exact SHA,
and verify both files return JSON `200` with no redirect before installing the
apps. Then inspect each artifact:

```bash
make inspect-mobile-links PLATFORM=ios APP=<signed-app-or-ipa> SHA=<candidate-sha> API_URL=<staging-api> SUPABASE_URL=<supabase-url> LINK_HOST=links.table-us.com APPLE_TEAM_ID=<team-id>
make inspect-mobile-links PLATFORM=android APP=<signed-apk> SHA=<candidate-sha> API_URL=<staging-api> SUPABASE_URL=<supabase-url> LINK_HOST=links.table-us.com ANDROID_FINGERPRINT=<sha256-fingerprint>
```

The iOS inspector accepts Expo configuration from both the legacy
`assets/app.config` path and the Expo SDK 57 `EXConstants.bundle/app.config`
path. Any other missing configuration fails closed. On macOS Tahoe 26 only, the
inspector accepts the exact `CSSMERR_TP_NOT_TRUSTED` verification diagnostic
after independently validating signed entitlements and cryptographically
verifying the embedded profile's Apple CMS chain, Team ID, application
identifier, associated domain, and device list. The actual certificates selected
by both CMS `SignerInfo` records are validated: the app signer must match the
profile's `DeveloperCertificates`, and the profile signer must be Apple's
provisioning-profile signer. All other signature diagnostics remain terminal.

Confirm the web fallback before app installation. On iOS, require Apple
Associated Domains Diagnostics approval and a tap from Notes or Messages; a
Safari address-bar navigation is not evidence. On Android, reset and reverify
App Links and require `pm get-app-links com.tableus.app` to report the host as
`verified`.

Run the Android sanitized journey with the checked-in runner:

```bash
make mobile-links-e2e PLATFORM=android DEVICE=<emulator-serial> \
  APP=<signed-apk> BUILD_ID=<local-build-id> RECEIPT=<version-two-receipt> \
  SHA=<candidate-sha> API_URL=<https-staging-api> \
  SUPABASE_URL=<https-staging-supabase> \
  ANDROID_FINGERPRINT=<preview-fingerprint> \
  ORIGIN=https://links.table-us.com EVIDENCE=<sanitized-dir>
```

The runner accepts one rotated private URL and one returning account/code in the
interactive terminal, retains none of them in evidence, and deletes new raw
Maestro output.

Current Maestro releases do not support physical iOS devices reliably. For iOS,
install the inspected Apple-signed artifact only after AASA is live, approve the
host in Associated Domains Diagnostics, and tap public `/auth` plus the private
`/join/*` URL from Notes or Messages. Complete returning code authentication,
confirm the same join route returns, and capture the accessible terminal state
for a freshly rotated link. Record this as manual user-observed evidence, never
as automated Maestro evidence. If future tooling officially supports the target
physical device, `make mobile-links-e2e PLATFORM=ios ...` may replace the manual
journey after the runner is revalidated.

Store only exact SHA, build IDs, artifact checksums, public association
identifiers, verification booleans, and sanitized screenshots. Delete private
URLs, email addresses, verification codes, native logs, and temporary automation
workspaces. A simulator does not substitute for signed physical-device
association evidence.

## 5. Produce exact-SHA staging evidence

Deploy all three deliverables from the same candidate SHA. Record deployment/build
IDs alongside that SHA. Do not reuse a Supabase account or plan from prior
evidence.

For the web journey, create an authenticated Playwright storage-state file in
the ignored `playwright/.auth/` directory, then run:

```bash
PLAYWRIGHT_BASE_URL=https://<staging-domain> \
PLAYWRIGHT_AUTH_STORAGE=playwright/.auth/staging.json \
npm run test:e2e
```

Confirm manually or with captured test evidence:

- invalid invite and unvalidated signup are rejected;
- approved email OTP creates and redeems exactly one profile;
- two users join one plan, receive exactly four deterministic candidates, rank
  votes, and allow only the organizer to finalize/reopen;
- constraint or participant changes invalidate stale recommendations and votes;
- rotated or expired links fail;
- export/deletion, foreground refresh, token refresh, and recoverable offline
  mutation errors behave as disclosed;
- AASA and asset links open the installed iOS/Android app and fall back to web.

Run the checked-in EAS build-artifact workflow on both test profiles only after
an approved build. The test profiles are compiled for the localhost-only demo
API; never point their demo identity at the Supabase-authenticated Railway
service and never enable demo authentication on that service. Start a clean,
in-memory provider fixture in one terminal:

```bash
./scripts/mobile-e2e-backend.sh
```

Install the resulting iOS simulator `.app` and Android `.apk` locally. The iOS
simulator reaches `127.0.0.1:8000` directly. Before Android testing, bridge the
same address from the selected emulator:

```bash
adb -s <emulator-serial> reverse tcp:8000 tcp:8000
```

Run `.maestro/smoke.yml` against each platform from separate clean backend
processes. A passing flow must dismiss the keyboard, require the title field to
reset after the create request, select the combined accessible plan-card label,
navigate into the created plan workspace, and explicitly reject any
authentication error. A build-completion status, a completed tap command, or
text left in the title input is not product evidence. EAS-hosted Maestro jobs
require a paid plan and are not part of the default closed-beta workflow.

For the two-user lifecycle, boot the target device and run the root orchestrator
against the downloaded exact-SHA artifact:

```bash
make mobile-e2e PLATFORM=ios DEVICE=<simulator-udid> APP=<path-to-TableUs.app> BUILD_ID=<eas-build-id> EVIDENCE=<sanitized-evidence-dir>
make mobile-e2e PLATFORM=android DEVICE=<emulator-serial> APP=<path-to-tableus.apk> BUILD_ID=<eas-build-id> EVIDENCE=<sanitized-evidence-dir>
```

The command refuses an occupied backend port or non-loopback API, verifies
deterministic/demo readiness, installs the artifact, configures Android port
reversal, switches only between the two seeded test identities, and cleans up
the backend, port reversal, temporary Maestro workspace, and ephemeral share
tokens. Do not replace this with demo authentication on Railway or retain the
raw Maestro workspace.
Store sanitized screenshots/logs with the candidate SHA and deployment/build
IDs; do not retain OTPs, invite codes, emails, full share tokens, precise
locations, photos, prompts, or provider responses.

For offline mutation resilience, inspect each new deterministic artifact before
device execution:

```bash
make inspect-mobile-local-e2e APP=<artifact> SHA=<candidate-sha> FORBIDDEN_ORIGINS=<railway-and-production-origins>
```

Then run each platform independently against a clean in-memory backend:

```bash
make mobile-offline-e2e PLATFORM=ios DEVICE=<simulator-udid> APP=<path-to-TableUs.app> BUILD_ID=<eas-build-id> EVIDENCE=<sanitized-dir>
make mobile-offline-e2e PLATFORM=android DEVICE=<emulator-serial> APP=<path-to-tableus.apk> BUILD_ID=<eas-build-id> EVIDENCE=<sanitized-dir>
```

The runner owns ports 7999–8001, installs the artifact, configures Android port
reversal, and removes its proxy/Maestro workspace. It records only artifact
checksums, booleans, counts, and named screenshots. It must prove no automatic
retry, no request while known offline, same-key successful replay after a
dropped committed response, exactly one plan, and exactly one finalized event.
The committed-response fault sends response headers and then truncates the body,
so the platform cannot treat it as a pre-response connection retry. Android
artifacts must also contain the local network retry policy that configures
OkHttp with `retryOnConnectionFailure(false)`.
Never retain raw proxy output or idempotency keys. The API idempotency cache is
process-local; restart or multi-instance replay evidence is intentionally not
claimed.

Run iOS and Android evidence sequentially and shut down the first simulator
before starting the second. Local Android artifacts target `arm64-v8a` only;
cap Gradle and CMake worker concurrency. Redirect verbose build and Maestro
output to temporary files, inspect only compact phase summaries, and delete the
raw logs after sanitized evidence is retained. These controls protect both host
memory and the Codex desktop task from multi-gigabyte native and tool-output
retention.

For real mobile authentication evidence, use the separately approved
`auth-test-ios` and `auth-test-android` artifacts. Verify their EAS metadata and
bundles first, then run each with a fresh one-use invite and a distinct
owner-controlled email:

```bash
make inspect-mobile-auth PLATFORM=<ios-or-android> APP=<artifact> \
  SHA=<candidate-sha> API_URL=https://<staging-api> \
  SUPABASE_URL=https://<staging-supabase> LINK_HOST=links.table-us.com \
  ANDROID_FINGERPRINT=<required-for-android> \
  FORBIDDEN_ORIGINS=<comma-separated-production-origins>
```

This first verifies the embedded exact SHA and staging origins and rejects demo
identities, loopback endpoints, service-role markers, local-E2E enablement, and
the explicitly listed production origins. Then run the lifecycle:

```bash
make mobile-auth-e2e PLATFORM=ios DEVICE=<simulator-udid> \
  APP=<TableUs.app> BUILD_ID=<local-build-id> RECEIPT=<version-two-receipt> \
  SHA=<candidate-sha> EVIDENCE=<sanitized-dir> API_URL=https://<staging-api> \
  SUPABASE_URL=https://<staging-supabase>
make mobile-auth-e2e PLATFORM=android DEVICE=<emulator-serial> \
  APP=<tableus.apk> BUILD_ID=<local-build-id> RECEIPT=<version-two-receipt> \
  SHA=<candidate-sha> EVIDENCE=<sanitized-dir> API_URL=https://<staging-api> \
  SUPABASE_URL=https://<staging-supabase> \
  ANDROID_FINGERPRINT=<preview-fingerprint>
```

The runner requires Supabase/deterministic readiness, prompts interactively for
the email, display name, one-use invite, and both OTPs, and removes its raw
Maestro workspace. It must prove invalid-invite rejection, invite signup,
join-intent return, relaunch persistence, explicit refresh, foreground recovery,
sign-out, and returning sign-in. Report sanitized database aggregates afterward:

```bash
cd backend
uv run python scripts/auth_evidence.py --invite-id <ios-invite-id> --invite-id <android-invite-id>
```

Never redirect auth-test artifacts to loopback or enable demo identity variables.
Never retain the interactive inputs or raw Maestro results.

For account-control evidence, first apply the approved
`161b86fcb7f4` migration and deploy the exact candidate to staging. Reuse the
auth-test profiles so the build contains the aggregate-only account verification
surface without demo or local-E2E controls. Sign in an existing approved account
and run:

```bash
make mobile-account-e2e PLATFORM=ios DEVICE=<simulator-udid> APP=<path-to-TableUs.app> BUILD_ID=<eas-build-id> EVIDENCE=<sanitized-dir> API_URL=https://<staging-api>
make mobile-account-e2e PLATFORM=android DEVICE=<emulator-serial> APP=<path-to-tableus.apk> BUILD_ID=<eas-build-id> EVIDENCE=<sanitized-dir> API_URL=https://<staging-api>
```

The command requests one returning-sign-in OTP, validates only the versioned
export shape and deletion-readiness response, and retains aggregate counts plus
the authenticated account-check screenshot. Do not type `DELETE`, call
`DELETE /api/v1/me`, remove the application profile, or remove the Supabase Auth
user during evidence collection. Verify actual deletion only with disposable
local/Postgres fixtures.

## 6. Enable providers incrementally

Keep deterministic providers green while each integration is added:

1. Enable staging Google Maps with a restricted server key, Places API New field
   masks, and billing alerts. Confirm four valid Place IDs or the honest
   no-result state, refresh-only display data, and production attribution.
   Location resolution must prefer `postalAddress.regionCode`; city-level
   results that omit a postal address may use only the transient country address
   component as a `US` fallback. Persist neither source field, and reject a
   missing, conflicting, or non-US result.
   Create an isolated project, enable only Places API New, set the $10 monthly
   budget alerts at 50/80/100 percent, and cap Nearby, Text, and Details at 60
   requests/minute. Activate Railway Pro static outbound IPs before restricting
   the key to those IPs and Places API New. Store the key only in Railway staging
   and the operator Keychain; rollback restores deterministic Places and the
   previous deployment rather than silently falling back at runtime.
   After exact-SHA deployment and migration, run:

   ```bash
   TABLEUS_SUPABASE_URL=<staging-url> \
   TABLEUS_SUPABASE_ANON_KEY=<public-key> \
   TABLEUS_MAPS_BUDGET_CONFIRMED=true \
   TABLEUS_MAPS_KEY_RESTRICTIONS_CONFIRMED=true \
   make maps-staging-e2e API_URL=https://<staging-api> EVIDENCE=<sanitized-dir> \
     RAILWAY_DEPLOYMENT=<id> VERCEL_DEPLOYMENT=<id>
   ```

   Enter both existing approved account emails and newest returning codes only
   at the interactive prompts. Retain only the generated aggregate summary; it
   fails if account data, codes, tokens, queries, coordinates, Place IDs, Google
   content, responses, or keys are introduced.
2. Review privacy/terms and Google Maps attribution with the responsible owner
   before external beta use.
3. After the exact candidate passes deterministic `make ready`, obtain one
   explicit gate for the public push, isolated `TableUs Staging AI` project,
   billing, Gemini-only authorization key, paid evaluation, Railway/Vercel
   deployments, and two returning-code emails. Configure a `$5` monthly alert
   budget at 50/80/100 percent. Restrict the key to Gemini and Railway's static
   outbound IPs, then store it only in Railway and the operator Keychain.
4. With the key available only through the process environment, run the pinned
   fixture subset under the hard `$0.25` ceiling:

   ```bash
   TABLEUS_LIVE_AI_APPROVED=1 make ai-eval-live \
     SHA=<exact-candidate-sha> EVIDENCE=<sanitized-dir>
   ```

   The checkpoint namespace binds the SHA, pinned model, and frozen fixture
   hash. Inspect only the sanitized aggregate report; never retain prompts,
   outputs, images, reviews, provider responses, Place IDs, or credentials. Do
   not raise the budget or weaken output validation to make a failure pass.
   Candidate `82c1d45f010a686df8802ab4b8a502731aa1be6f` passed public CI but
   failed this gate before inference: generated `additionalProperties` metadata
   caused `400`, and a sanitized corrected-schema probe then received generic
   `429 RESOURCE_EXHAUSTED` with active linked billing. The key was restored to
   the three Railway addresses, staging stayed deterministic, and no deployment
   or returning code followed. Retry only from a new exact-SHA checkpoint after
   the compatibility fix passes `make ready` and Google inference is usable.
   Agent Platform candidate
   `0b7de266d4b053d49267b2ac22bd85052ab3ab8f` passed public CI. Its first
   evaluation stopped before inference at `401`, zero tokens, and `$0` because a
   standard key has no IAM principal. The owner approved a project-only managed
   policy allowlist containing the existing Gemini API plus Agent Platform. A
   new service-account-bound authorization key restricted to Agent Platform and
   Railway reached inference; two of six cases passed for `$0.00140175`.
   Sanitized probes identified recommendation enum drift and a missing user role
   on multimodal content. Require both corrections, a new `make ready` candidate,
   and a fresh fully passing checkpoint before deployment or returning codes.
5. Only after the live evaluator passes, set Railway staging to live AI with
   `GEMINI_MODEL=gemini-3.1-flash-lite`,
   `AI_RUNTIME_MAX_USD_30D=4.00`, and `LIVE_AI_MAX_USD=0.25`, deploy Railway and
   Vercel from the same SHA, and run:

   ```bash
   make gemini-staging-e2e API_URL=<https-staging-api> \
     SHA=<exact-candidate-sha> EVIDENCE=<sanitized-dir> \
     RAILWAY_DEPLOYMENT=<id> VERCEL_DEPLOYMENT=<id>
   ```

   Provide Supabase public configuration through the environment and enter the
   two approved account emails/codes only at interactive prompts. Set the three
   operator confirmation flags only after independently verifying candidate-row
   persistence, budget alerts, and key restrictions. With the runtime database
   credential supplied only through the process environment, the read-only
   candidate/usage check is:

   ```bash
   cd backend && .venv/bin/python scripts/gemini_staging_evidence.py
   ```

   It emits only booleans, counts, token totals, and estimated cost. Readiness must report
   Supabase auth, live Places, live AI, compatibility `live`, and the exact SHA.
   Restore deterministic AI without changing Places if any check fails.
   This gate completed at exact SHA
   `2eb428a05913c60dd1af1ae59fdd79fb233c5ede`: public CI run
   `32915965276` passed; the live evaluator passed 6/6 for `$0.0018905`;
   Railway deployment `a1030828-a505-417e-8285-c2b49dbbb39c` and Vercel
   deployment `dpl_Ad4H9FqVAQJviSkP2KYTKWMkKxbt` are exact-SHA pinned; and
   the sanitized two-user journey passed with four distinct candidates and
   aggregate-only provider usage. `tableus-staging.vercel.app` points to the
   candidate's Preview deployment because this Vercel project's production
   target also owns `table-us.com`, `www.table-us.com`, and
   `links.table-us.com`; those production-facing aliases were intentionally
   left on their prior deployment. The superseded Developer API key is revoked.
6. Enable observability last from an exact-SHA candidate. Create three isolated
   Sentry staging projects (`api`, `web`, and `mobile`) and one isolated US
   PostHog staging project. Keep Sentry source-map credentials build-only and use
   separate read-only API tokens for evidence. Enable staging telemetry/E2E only
   in Railway, Vercel Preview, and the `telemetry-test-ios` /
   `telemetry-test-android` profiles. Deploy/build one exact SHA, authenticate
   existing approved evidence accounts, and trigger only the synthetic canaries.
   Then run:

   ```bash
   TABLEUS_SENTRY_READ_TOKEN=<read-only-token> \
   TABLEUS_SENTRY_ORG=<org> \
   TABLEUS_SENTRY_API_PROJECT=<api-project> \
   TABLEUS_SENTRY_WEB_PROJECT=<web-project> \
   TABLEUS_SENTRY_MOBILE_PROJECT=<mobile-project> \
   TABLEUS_POSTHOG_READ_TOKEN=<read-only-token> \
   TABLEUS_POSTHOG_PROJECT_ID=<staging-project-id> \
   make telemetry-staging-e2e API_URL=https://<staging-api> \
     SHA=<exact-candidate-sha> EVIDENCE=<sanitized-dir>
   ```

   Keep each client alive through its analytics flush window. Confirm the web
   request is not dropped by its `before_send` guard, and confirm the backend
   canary records platform `api` rather than the caller's platform. Inspect
   provider dashboards for release/source-map correlation and absence of
   messages, users, headers, bodies, queries, private URL segments, emails,
   reviews, location data, photos, prompts, provider responses, and complete
   share tokens. Retain only the aggregate report and sanitized screenshots.
   If leakage occurs, disable telemetry/E2E, remove build tokens, roll back both
   deployments, and rotate a credential only when integrity is uncertain.

   PostHog's browser SDK filters Playwright's default headless identity as a bot
   before `before_send`; that is not evidence of an application sanitizer
   failure. Keep bot filtering enabled. Drive the staging web canary with a
   normal Chrome identity (or a headed real browser), require a successful
   PostHog ingestion response, and then require the aggregate reader to find the
   exact release and `web` platform.

   This gate completed at exact SHA
   `4920d99b11b06c4e0aa1c4afc3f91763bb53ee1c`. Railway deployment
   `bed50df4-5ced-465f-8492-a24147e8f663` and Vercel deployment
   `dpl_4M7eSvsht9UNB2wqmCjZ1pVUmHiD` passed exact-SHA readiness. Local build
   receipts `local-ios-4920d99` and `local-android-4920d99` passed artifact
   inspection. Aggregate evidence contains one exact-release issue per Sentry
   project and PostHog platforms `android`, `api`, `ios`, and `web`, with no raw
   payload retained. The preserved approved iOS session was sufficient; no new
   OTP was sent.

## 7. Cumulative readiness candidate

Before source freeze, the owner must confirm all three human-controlled items:

1. Final terms and privacy text are accepted for closed-beta staging.
2. Google's official attribution is visually acceptable on web, physical iOS,
   and Android and remains adjacent to provider content.
3. Test messages are delivered to both `support@table-us.com` and
   `privacy@table-us.com`.

Then run the deterministic gate, freeze the source commit, and require public CI
at that exact SHA. After the single approved external gate, update the Supabase
template to say “verification code”, deploy Railway and the Vercel staging
Preview without moving production-facing aliases, and build sequentially:

Use `https://tableus-staging.vercel.app` for the web organizer journey. Do not
substitute `https://table-us.com`; that is a production-facing alias and may
serve a different source SHA. Test a canonical private link by tapping it from
Notes or Messages into the installed app. If iOS remains in Safari, distinguish
the browser fallback from the installed Expo app before diagnosing a native
loading failure. The browser fallback itself must still authenticate and call
the staging API from the allowlisted `https://links.table-us.com` origin.

The live lifecycle order is: organizer creates the plan and saves constraints;
guest opens the private link, authenticates, joins, and saves constraints;
organizer then generates four options; both users vote; organizer finalizes and
reopens; finally rotate and reject the old link. Do not treat recommendation
generation as failed while the plan still has fewer than two eligible
participants.

Before freezing, validate the checked-in Expo workflows against Expo's current
schema (this operator check requires network access and the EAS CLI):

```bash
make mobile-workflows-validate
```

The validator must use the repository-installed `eas-cli@23.2.0`; `eas`, `npx
eas-cli@latest`, or an environment-selected executable is not accepted. Run
`npm audit --omit=dev --audit-level=high` against the frozen lock before the
external gate. The production graph must contain no critical/high advisory. The
full developer audit may rely only on the time-bounded EAS/Expo release-tool
exception recorded in the security/privacy checklist; it may not conceal a
runtime-reachable finding.

Every local artifact must be created by `make local-mobile-build`; do not run a
build and issue a receipt afterward. The orchestrator creates a fresh detached
worktree at `SHA`, performs the frozen install and one memory-bounded EAS local
build, validates the single active Expo config plus native transport/signing
state, and exports a version-two receipt bound to the artifact and inspection.
Run one platform/profile at a time. Example:

```bash
make local-mobile-build PLATFORM=android PROFILE=readiness-android \
  SHA=<source-sha> BUILD_ID=<sanitized-local-build-id> \
  APP=<new-apk-output> INSPECTION_REPORT=<new-inspection-json> \
  RECEIPT=<new-receipt-json> API_URL=<https-staging-api> \
  SUPABASE_URL=<https-staging-supabase> LINK_HOST=links.table-us.com \
  ANDROID_FINGERPRINT=<preview-fingerprint> \
  FORBIDDEN_ORIGINS=<production-origins>
```

The output paths must not already exist. Raw build logs remain file-backed in
the private temporary workspace and are deleted. Direct execution of
`local-mobile-build-receipt.mjs`, staged/untracked source, duplicate embedded
configuration, a mismatched signer, or artifact mutation must fail closed.

1. `test-ios`, then shut down and remove raw logs.
2. ARM64 `test-android`, then shut down and remove raw logs.
3. Apple-signed physical-device `readiness-ios`, then shut down build workers.
4. ARM64 signed-APK `readiness-android`.

After those four release artifacts, build `telemetry-test-ios` and
`telemetry-test-android` sequentially as auxiliary exact-SHA artifacts. They are
the only mobile artifacts allowed to expose the sanitized telemetry canary
route. Emit the fixed canaries, run `telemetry-staging-e2e`, and retain only its
aggregate summary. Do not attest to a canary from `readiness-*`; those profiles
intentionally compile no telemetry E2E control.

Candidate `017c40f7ad96fa9e241ec833392f321ab63421b7` is superseded despite
passing public CI, staging deployment, and all six artifact inspections. Its
iOS device diagnostics found a missing post-reopen scroll in lifecycle
automation and a response-body parser that could remain pending when
`expo/fetch` ignored a post-header abort. Do not reuse its artifacts or partial
device output. A replacement candidate must prove the independent deadline
race, rebuild every artifact, and restart exact-SHA evidence from a clean
backend.

Candidate `ac099f37f38a959f3c5d86c51ce78a225a836d09` is also superseded. It
passed public CI, exact-SHA staging deployment, live-provider smoke, all six
artifact inspections, and both iOS deterministic journeys. Android twice
reached the app's intended status-zero `Retry joining plan` state during the
rotated-link phase, but that one Maestro flow lacked the bounded explicit retry
branch used by all other lifecycle writes. The replacement must include and
guard that branch, rebuild every artifact, and restart exact-SHA evidence.

Candidate `0de0c34c0806e25e6b0cea664159e0800fd2accf` is superseded as well. It
passed public CI, exact-SHA staging deployment, live-provider smoke, all six
artifact inspections, and both iOS deterministic journeys. Android persisted
the organizer vote and rendered `Ranked vote saved.`, but the label was below
the viewport while the host flow waited for an already-visible element. The
replacement must scroll to the saved-or-retry state after organizer and guest
vote submission, guard both flows, rebuild every artifact, and restart
exact-SHA evidence.

Candidate `d0955f5d08537b3251341720ed3a28453a70e13b` is security-blocked and
superseded despite passing CI, staging deployment, live smoke, six artifact
inspections, and available web/mobile/link/telemetry phases. Exact-SHA scan
`b737ba37-01d4-4ba8-841d-f1da1d09d61a` reported two P1 availability flaws in
unverified-header rate identity and unbounded public idempotency caching, plus a
P2 replay-before-current-authorization flaw. A replacement must preserve the
24-hour retry contract with bounded source/global limits, process-wide JWKS
reuse, an authenticated route allowlist, current profile/plan-role checks, and
fixed entry/byte/request/response limits. It must pass a fresh exact-SHA scan and
`make ready` before any external evidence is reused. The physical iPhone must
also permit app installation under Screen Time or device management before the
signed readiness artifact is installed; never request or retain an OTP before
installation succeeds.

Local remediation `520630393c45ad992c63b2a45078235d2ef8aff0` is also
superseded and must never be deployed. Sealed scan
`0933625b-4d73-4da7-ba6a-946128c29089` found that multipart parsing remained
outside the body cap plus four medium and five low findings. The replacement
must pass declared and chunked body-limit tests, secure-staging configuration
tests, invite reservation/pruning tests, web subject-isolation tests, no-echo
prompt and no-live-screenshot tests, immutable build-input tests, Expo Android
autolinking resolution, `make ready`, and a fresh full exact-SHA scan.

Inspect production-shaped artifacts before installation:

The signed-artifact inspection must read the native `Info.plist` or Android
manifest and reject `NSAllowsLocalNetworking=true` or
`usesCleartextTraffic=true`; an embedded `localE2E=false` assertion alone is not
transport evidence.

For the local Expo loop, open the `mobile/` workspace and use the Codex Run,
Run iOS, Run Android, Run Web, Run Dev Client, or Expo Doctor actions. The same
entrypoint is `mobile/script/build_and_run.sh`; it deliberately contains no EAS
build or submission action. The Doctor action resolves locked
`expo-doctor@1.20.4` from the installed workspace and does not install mutable
registry code.

```bash
make inspect-mobile-readiness PLATFORM=ios APP=<artifact> SHA=<source-sha> \
  API_URL=<https-staging-api> SUPABASE_URL=<https-staging-supabase> \
  LINK_HOST=links.table-us.com APPLE_TEAM_ID=<team-id> \
  FORBIDDEN_ORIGINS=<production-origins>

make inspect-mobile-readiness PLATFORM=android APP=<artifact> SHA=<source-sha> \
  API_URL=<https-staging-api> SUPABASE_URL=<https-staging-supabase> \
  LINK_HOST=links.table-us.com ANDROID_FINGERPRINT=<preview-fingerprint> \
  FORBIDDEN_ORIGINS=<production-origins>
```

Run deterministic lifecycle and offline evidence with the existing `mobile-e2e`
and `mobile-offline-e2e` commands. Run the production-shaped cross-client phases
with `mobile-readiness-e2e`, passing the matching version-two `RECEIPT`; auth and
link evidence runners require their matching receipts as well. Each runner
copies the receipted artifact to a private directory, performs structured
inspection there, and re-hashes it immediately before installation. Account,
invite, OTP, or private-link prompts are not shown until this binding succeeds.
Use preserved approved sessions where possible and
confirm that a truncated committed response exits pending state within the
gated 10-second local deadline and exposes explicit same-key Retry. Production-
shaped mobile requests retain a 45-second deadline through body parsing. Send
at most one returning code per platform only when installation requires it.
No email, code, private URL, share token, Place ID, restaurant content,
coordinate, prompt, provider response, or raw native/Maestro log may survive.
Live authenticated runners retain no screenshots; deterministic seeded runners
may retain synthetic screenshots. OTPs, invites, account emails, and private
URLs must be entered with the shared no-echo TTY prompt, never arguments or
environment variables.

The deterministic runners invoke `mobile-device-preflight` automatically. It
boots only the explicitly named iOS simulator and requires Android to already be
an online, boot-complete API 36+ ARM64 emulator. To diagnose a target before a
run without retaining its hardware identifier:

```bash
make mobile-device-preflight PLATFORM=ios DEVICE=<simulator> APP=<TableUs.app> BOOT=true
make mobile-device-preflight PLATFORM=android DEVICE=<adb-serial> APP=<tableus.apk>
```

Use Xcode runtime UI snapshots/screenshots after an iOS launch and adb UI-tree
coordinates, crash-buffer logs, and a focused `gfxinfo`/`meminfo` snapshot for
Android diagnostics. Raw native logs, UI trees, traces, memgraphs, and heap dumps
stay in run-specific temporary directories and are deleted after a sanitized
finding summary. Capture memgraphs or long performance traces only for a narrow
reproduction; routine cumulative evidence does not retain them.

Assemble the already-sanitized summaries, including the exact-SHA telemetry
summary, and validate one source SHA:

```bash
make cumulative-readiness-evidence API_URL=<https-staging-api> \
  SHA=<source-sha> INPUT=<sanitized-input.json> EVIDENCE=<sanitized-output-dir>
```

The input must bind Railway, Vercel, web, both signed artifacts, deterministic
mobile evidence, AASA/App Links, security results, policy/contact/legal
attestations, and telemetry canaries to the source SHA. Commit only the accepted
summary and sanitized screenshots as an evidence-only descendant. Opening and
merging that pull request are separate approval gates.

### Rollback matrix

Brian Chei is the accountable rollback owner. Codex may execute approved steps
but does not replace the human account owner.

| Failure | Immediate action | Restore point |
| --- | --- | --- |
| Railway/API readiness, live provider, auth, or telemetry failure | Stop evidence; set the affected provider to deterministic or disable telemetry; redeploy only with approval. | Railway `bed50df4-5ced-465f-8492-a24147e8f663` is the prior observability deployment; use the latest independently validated API deployment recorded with the final candidate if newer. |
| Vercel web, link manifest, or telemetry failure | Remove the staging alias from the failed Preview and reassign it to the prior validated Preview; do not move production domains. | Vercel `dpl_4M7eSvsht9UNB2wqmCjZ1pVUmHiD`. |
| Signed mobile regression | Uninstall the readiness artifact and restore the prior inspected internal artifact; do not issue EAS Update across an incompatible runtime. | Latest prior exact-SHA signed link/telemetry artifact receipt in retained evidence. |
| Credential integrity uncertainty | Disable the affected integration and revoke/rotate only the scoped credential with explicit approval. | Deterministic providers and telemetry disabled. |
| Restricted data enters evidence or telemetry | Stop collection, disable telemetry if involved, quarantine the material, and request approval before destructive cleanup or credential rotation. | No evidence is accepted until a fresh sanitized run passes. |

No database rollback is part of this packet because it introduces no migration.

## 8. Release decision

Security closure for this packet is deliberately bounded: use the retained
sealed repository baselines, focused source triage, deterministic regressions,
and one exact-candidate diff review. Deep scan
`2482f6f3-b05c-4c40-bc9f-e5d5a0ec41a0` was canceled for excessive weekly usage
and its unsealed candidates are not accepted findings. Do not resume it or start
another deep scan without separate owner confirmation.
Focused exact-diff scan `528a703f-7ff1-4505-828d-1a8b1de1fdc5` completed for
candidate `069473c24e7921e5b4b2ad51faa04e71899721ad` with complete coverage and
zero findings. Public CI run `33566981168` then exposed a Playwright-only
loopback rewrite mismatch. Replacement source candidate
`d025b567447cb2226233e49aca33994c1945aae9` corrects only that development path,
adds production fail-closed regression coverage, and passes `make ready`. The
focused scan remains the final security-plugin scan for this packet unless the
owner explicitly authorizes another one.

The closed beta may advance only when deterministic CI, exact-SHA staging web,
iOS, and Android evidence are green; the security/privacy checklist is signed;
legal and attribution review is complete; rollback owners are named; and all
residual risks are recorded in `docs/current-state.md`.

Production migration, deployment, EAS production build, TestFlight/Play closed
testing submission, and invitations to the cohort are separate explicit
approval gates. Record the approved action, exact SHA, time, operator, result,
and rollback reference for each gate.
