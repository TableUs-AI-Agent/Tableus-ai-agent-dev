# Changelog

## 2026-08-19

- Stopped pre-filling the demo-only `tableus-beta` invite when the web client is
  configured for Supabase Auth, preventing a misleading invalid-invite failure
  in the staging OTP flow.
- Converted the Supabase staging Confirm signup and Magic Link templates to
  six-digit token delivery and verified a full invite, OTP, redemption, profile,
  and authenticated `/plans` journey with sanitized database counts.
- Removed Railway's automatic Alembic pre-deploy command so the hosted runtime
  never needs the privileged migration credential; migrations remain a separate
  approved operator action.
- Deployed Railway and Vercel staging from exact SHA
  `ab2d374d3c8917ba8b4af18a56675751d095924a`. Railway health/CORS and Vercel
  public routes passed; mobile association endpoints remained fail-closed until
  real signing identifiers are configured.

## Hackathon submission (baseline)

This is the state of the repo **as submitted for judging** (Cursor Hackathon 2026). Everything below was done **after** judging finished.

---

## Post-hackathon updates

### Backend (`backend/`)

- **Gemini responses:** Safer handling when the model returns empty or non-JSON text (`_response_text`, retries across models, resilient `parse_gemini_json`, clearer errors). Search and related endpoints no longer 500 on bad parses; food analysis returns a consistent JSON shape with defaults.
- **Search pipeline:** Natural-language query is applied **first** via Gemini (`filter_restaurants_by_user_query`), then quality sort and top-4 ranking. Removed the old heuristic cuisine pre-filter that ran ahead of the user’s wording.
- **Candidate cap:** Nearby/search candidate pool capped at **20** venues (constant `MAX_RESTAURANT_CANDIDATES`); `/api/restaurants/nearby` clamps request limits accordingly.
- **Google Places:** Nearby Search **pagination** (`next_page_token`) so the app can fill the candidate cap when the API returns more than one page.
- **Search API responses:** `nearby_restaurants` in search results reflects the **query-filtered** pool (up to the cap), not a fixed smaller slice.

### Frontend (`frontend/app/discover/`)

- **Nearby load:** Requests `limit: 20` to match the backend cap.
- **Orbit:** Shows up to **20** restaurant thumbnails (was fewer before).
- **Friends on orbit:** Each friend uses a **stable pseudo-random** angle offset and **orbit radius** so they are not all on one ring; **larger** avatar buttons and ring spacing adjusted.
- **Friend list in orbit:** Up to **6** friends shown in the social orbit (was 4) so the expanded demo roster fits.

### Demo data (`backend/data.py`)

- Added demo users **Derek Chen** and **Elena Ruiz**, wired into the **friend graph** with the core group (and Nina linked to Derek and Elena). Seeded **reviews** for both.

### Documentation

- **README:** 🏆 note for **2nd place — Cursor Hackathon 2026**.

### Reverted / not shipped

- **Spoke lines** from the orbit center to top restaurant cards were implemented, iterated (thickness), then **removed**; restaurant orbit went back to a **single radius** (45%) for all venues.

# 2026-08-16 — Closed-beta foundation

- Added Expo Router mobile development for iOS and Android.
- Added the persistent authenticated `/api/v1` shared-plan API and ranked voting.
- Added deterministic providers, generated contracts, CI/EAS workflows, tests,
  privacy/telemetry controls, and Vercel/Railway deployment configuration.
- Split the web Three.js scene into a client-only dynamic chunk and upgraded
  Next.js to the patched 16.3.1 release.

# 2026-08-17 — Release hardening

- Separated privileged Alembic and least-privilege runtime database credentials,
  moved application data into a private schema, and added an invite-only
  Supabase pre-signup hook plus hashed invite administration commands.
- Bound OTP invite validation to the authenticated email and made verified-link
  manifests fail closed until real Apple and Android identifiers are supplied.
- Added Railway port handling, Expo verified-link/update configuration, live
  Google Maps attribution, expanded beta privacy/terms disclosures, and a
  staging-aware closed-beta browser journey.
- Added an operator runbook that preserves explicit approval gates for external
  resources, secrets, migrations, paid providers, deployments, and submissions.

# 2026-08-17 — Staging bootstrap

- Created and linked the isolated `tableus-staging` Vercel project, configured
  for Node 22, Next.js, frozen npm installs, and the web workspace output. No
  environment secrets or deployment were added.
- Created and linked the isolated `TableUs Staging` Supabase project in East US.
  Created its separately credentialed, least-privilege `tableus_runtime` role
  and applied the closed-beta foundation through Alembic revision
  `5c9a1d7e2b3f`; Auth-hook activation, SMTP, and client environment wiring are
  not yet configured.
- Escaped URL-encoded database credentials before passing migration URLs through
  Alembic's interpolating configuration layer. Rotated the staging owner
  password and updated its macOS Keychain entry without exposing the replacement.
- Enabled RLS on Alembic's public version table. Supabase's linked security and
  performance advisors report no warning-or-higher issues after migration.
- Enabled the staging Before User Created Auth hook against the private,
  security-invoker invite-validation function. Verified its unvalidated 403
  path, scoped `supabase_auth_admin` grants, and a clean advisor result.
- Configured Resend-backed custom SMTP for staging Supabase Auth without placing
  credentials in the repository. A real OTP delivery test remains pending
  recipient confirmation.

# 2026-08-19 — Staging Auth validation

- Reproduced the first invite-approved OTP request and traced its failure to the
  Auth hook's inaccessible `extensions.digest` dependency; no email was sent and
  no Auth user was created.
- Added Alembic revision `57a2a71fa443` to replace that dependency with
  PostgreSQL's built-in SHA-256 function, plus a Postgres migration regression
  assertion. Applied and verified the revision against staging; the hook now runs
  successfully under the intended invoker privileges and Supabase's security
  advisor reports no errors.
- Retried the approved OTP request. Supabase accepted the invite validation and
  ran the Auth hook, but Resend rejected the configured SMTP username with a 535
  response. No OTP was delivered; staging SMTP must use Resend's fixed `resend`
  username before the next attempt.
- Verified the SMTP username correction with one fresh OTP request. The request
  passed invite validation and the Auth hook, but Resend rejected the unverified
  `table-us.com` sender domain with a 550 response. No OTP was delivered, no Auth
  user was left behind, and the invite remains usable.
- Verified the public DKIM, SPF, and return-path MX records after the Resend domain
  was marked verified, then sent one fresh OTP request. Supabase Auth ran the
  invite hook and completed `/otp` with HTTP 200 and no SMTP error. The expected
  Auth user exists, while the application invite remains unredeemed until the
  recipient enters the code.
- Confirmed that staging's Confirm signup template still rendered
  `ConfirmationURL`, so the accepted email contained a link instead of the
  six-digit token required by the client. The consumed link confirmed the
  Supabase account; the TableUs invite remains unredeemed with zero uses. Both
  Confirm signup and Magic Link templates must render `{{ .Token }}` before the
  next authentication request.
- Added separate returning-user email-OTP sign-in states on web and mobile.
  Returning users now prove their existing invite-approved profile through
  `/api/v1/me` instead of validating and consuming a new invite.
- Deployed the returning-sign-in candidate to isolated Railway and Vercel
  staging from exact SHA `ec1635d2d5bf458c584d14bd59beb9a520f7541d` and
  verified API health, CORS, alias promotion, hosted UI state, and OTP request.
- Completed hosted returning-user OTP verification without another invite use.
  Updated the Supabase-backed web user context to load the authenticated profile
  and connections through `/api/v1` instead of showing legacy fallback people.

# 2026-08-20 — Authenticated identity staging evidence

- Deployed exact SHA `b6d308e00e9591fdc708b943fa86d3bce12101db` to Railway
  deployment `f15cc1d9-9df7-4a47-be4a-71a04c7c6bed` and Vercel deployment
  `dpl_C2n8j5ovo9gK3XNgvwmE9Xo5YgB9`.
- Verified Railway liveness/readiness in deterministic-provider and Supabase Auth
  modes, Vercel alias promotion, the exact remote branch SHA, authenticated
  `Brian` identity on `/plans`, absence of the demo switcher, and account
  navigation to `/profile`.
- Redeemed a second staging account as `Jung`; sanitized aggregates reached two
  profiles, two redemptions, and two invite uses. Added a Supabase auth-state
  listener so replacing the browser session reloads the authenticated profile
  and connections instead of retaining the prior user's identity.
- Deployed the identity-refresh candidate from exact SHA
  `90e8dc86bb77ff432f967ccca0918933e0fec550` to Railway deployment
  `9a1e1f92-424d-4156-82ce-01ff995e3b3c` and Vercel deployment
  `dpl_3QK4Tq2drGx25RFotVcXCq7D8d23`; verified Railway liveness/readiness,
  Vercel `READY` alias promotion, the public branch SHA, and the active `Jung`
  identity on the hosted `/profile` route.
- Completed the hosted two-user deterministic plan journey. `Jung` created the
  plan and acted as organizer; `Brian` joined by private link; both saved
  constraints and ranked three of exactly four candidates. Combined Borda totals
  produced a 5–5 tie between Garden Mezze and Trattoria Together, which resolved
  deterministically to Garden Mezze. Brian had no finalization control; Jung
  finalized, reopened with vote totals preserved, and refinalized the plan.
- Rotated the organizer-controlled share token and verified the previously
  retained private link fails with an explicit invalid-or-rotated message.
- Added web and Expo account-data controls backed by `/api/v1/me/export` and
  `/api/v1/me`: user-initiated JSON export, typed `DELETE` confirmation, clear
  organized-plan blocking guidance, post-deletion sign-out, and links from the
  existing account/profile navigation. No staging account was deleted.
- Audited the EAS gate without creating cloud resources or builds. Local Expo
  config resolves to `com.tableus.app`, but the EAS project ID/update URL is
  absent and the CLI is unauthenticated, blocking project/build inspection and
  workflow-schema validation until an approved Expo login and project link.
- Deployed exact SHA `6487200af62646299df0109715840f02bbe75b6b` to Railway
  deployment `2ad41e97-7e5a-46e0-b046-f0c62510fa17` and Vercel deployment
  `dpl_824mqRVZdCtE8GRS5pULLTdw6cJ6`; verified the public branch, API health,
  Vercel readiness, and alias promotion.
- Created the correctly branded `@tableus/tableus` EAS project, configured five
  preview-only public client values, added explicit EAS environments to every
  build profile, and added deterministic demo mode for simulator/APK test builds.
  Preview/auth builds continue to use Supabase. Replaced paid EAS-hosted Maestro
  jobs with build-artifact jobs for local Maestro execution; all workflow schemas
  now validate without activating billing.
- Deployed exact SHA `bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28` to Railway
  deployment `e438677b-548e-4dce-ae8e-7f05f086bc29` and Vercel deployment
  `dpl_vpVRmbpHXhQPb5AUScD8yJaPHJFD`; verified the public branch, Railway health,
  Vercel readiness, and alias promotion.
- Disabled Sentry native artifact upload only in the EAS preview environment
  because no staging Sentry organization/project is configured, then completed
  exact-SHA iOS simulator build `1bf458de-c223-4301-9e5f-f161a0f54917` and Android
  APK build `f1b0a632-0587-4d17-8405-b534bff13989`. Downloaded artifacts passed
  archive integrity and embedded app identifier, staging endpoint, EAS project,
  and deterministic-profile checks. Local Maestro execution remains pending
  because this host has no Xcode simulator tools, Android platform tools, or
  Maestro installation. No store submission or production build was performed.
- Installed and verified the local native QA toolchain: Xcode 26.6 with an iOS
  26.5 simulator, Android platform tools 37.0.1 with an API 36 ARM64 emulator,
  and Maestro 2.8.0 with CLI analytics disabled during test runs.
- Ran both exact-SHA artifacts on devices. The original iOS flow appeared green
  only because its final selector matched `Beta dinner` in the input while the
  screen showed `Authentication required`; Android exposed the same underlying
  state. Tightened the flow to reject authentication errors and require entry
  into the created plan workspace, which now correctly fails both old artifacts.
- Isolated deterministic mobile E2E from Supabase staging: test builds now use a
  localhost in-memory backend, Android uses `adb reverse`, and cleartext/local-
  network exceptions are compiled only for test profiles. Added Expo Updates,
  Expo build properties, iOS exempt-encryption configuration, an operator script,
  and sanitized failure screenshots. New EAS test builds remain approval-gated.
- Pushed exact SHA `9dd39fe9db72c52f96db4cf596401d32493a510f` and completed
  replacement EAS builds `8d5ffefb-28ad-42a1-966d-426af059046b` (iOS
  simulator) and `41e5ece8-58d9-4d5f-84ff-a67dd2dfa607` (Android APK). Both
  artifacts embed the localhost deterministic endpoint and no Railway hostname.
- Hardened the native Maestro harness after device execution exposed keyboard-
  consumed input and a combined React Native accessibility label. Separate clean-
  backend runs now pass real plan creation and navigation to `Your constraints`
  on iPhone 17 Pro/iOS 26.5 and Android API 36 ARM64. Captured sanitized passing
  screenshots and artifact checksums. No staging redeployment, production build,
  store submission, or paid-provider action ran.
- Added a test-profile-only Expo identity route for switching between the seeded
  organizer and guest. It requires demo mode, a loopback API, and the Expo local-
  E2E flag; rejects arbitrary identities; stores the selection in SecureStore;
  and clears TanStack Query state before continuing.
- Added per-request demo identity resolution to the shared API client, explicit
  accessible candidate-ranking controls, persisted vote restoration, saved-state
  feedback, and constraint revision during voting with stale-run disclosure.
- Added a token-sanitizing `make mobile-e2e` runner and phased Maestro journeys
  for joining, constraints, four candidates, two votes, organizer authorization,
  deterministic finalization, reopening, rotated links, and stale-run cleanup.
  New exact-SHA EAS artifacts remain approval-gated.
- The first exact-SHA lifecycle run proved creation and identity switching but
  found that Maestro selected the `Join plan` navigation title instead of the
  identically named button, producing no join request. Renamed the action to
  `Join this plan`; both first artifacts are invalidated and must be replaced.
