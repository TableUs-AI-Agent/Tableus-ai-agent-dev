# Decision log

- **2026-08-15:** Closed beta is invite-only and US-only.
- **2026-08-15:** Retain Next.js for web and add one Expo Router app for iOS and
  Android. Platform UI is not shared.
- **2026-08-15:** Deploy web to Vercel, API to Railway, and use Supabase Auth and
  Postgres.
- **2026-08-15:** Email OTP is preceded by invite validation. Supabase is used
  directly by clients only for authentication.
- **2026-08-15:** Shared plans are asynchronous, support 2–8 people, use top-three
  Borda voting (3/2/1), and require organizer finalization.
- **2026-08-15:** Deterministic Maps/AI fixtures are the default. Live AI gates
  are explicit, model-pinned, budgeted, and sanitized.
- **2026-08-15:** Mobile beta is native 2D. Mobile maps and 3D are deferred.
- **2026-08-15:** Legacy endpoints exist only for local demo compatibility while
  clients migrate to `/api/v1`.
- **2026-08-17:** Alembic uses a separately configurable migration credential;
  the API runtime role receives only schema usage and application-table CRUD.
- **2026-08-17:** Invite validation tokens are bound to a normalized email when
  Supabase OTP is used. Backend redemption remains the product-access authority;
  Supabase Auth hooks and rate limits are an additional staging control.
- **2026-08-17:** Verified HTTPS links cover `/join/*` and exact `/auth` only;
  the Supabase `/auth/confirm` callback remains web-only while email verification
  is code-based. Association manifests fail closed until real Apple and Android
  signing identifiers exist.
- **2026-08-17:** Pre-production web evidence uses the dedicated Vercel project
  `tableus-staging`; production remains a separate approval and configuration
  gate.
- **2026-08-17:** Supabase staging uses the isolated `TableUs Staging` project in
  East US. Its owner credential is stored outside the repository in macOS
  Keychain; runtime credentials and migrations remain separate gates.
- **2026-08-17:** The invite-only Before User Created hook is security-invoker.
  `supabase_auth_admin` receives only private-schema usage, hook execution, and
  read access to pending validation hashes; no client Data API role receives
  access to the application schema.
- **2026-08-19:** Routine, reversible implementation and staging configuration
  within an approved objective proceeds without repeated owner approval. The
  existing explicit gates remain for merges, cloud-resource creation, secret
  addition or rotation, paid live-AI evaluation, production migrations,
  deployments, store submissions, destructive cleanup, and significant product
  or architecture decisions.
- **2026-08-19:** Railway receives only the least-privilege runtime database
  credential. The privileged migration credential remains in the trusted
  operator environment; approved migrations run separately before deployment
  rather than through Railway's pre-deploy container.
- **2026-08-19:** Invite validation is required only when joining the beta.
  Returning users authenticate by email OTP and must prove an existing
  invite-approved application profile through `/api/v1/me`; signing in never
  consumes another invite.
- **2026-08-20:** Deterministic native E2E builds use a localhost-only demo API
  and never send demo identities to, or enable demo authentication on, the
  Supabase-authenticated staging service. Android reaches the operator's local
  API through `adb reverse`; local-network and cleartext allowances are compiled
  only into the dedicated test profiles.
- **2026-08-21:** One deterministic mobile artifact switches between the seeded
  organizer and guest through SecureStore only when the Expo test flag, demo
  mode, and loopback API URL are all active. The hidden deep link accepts no
  arbitrary subject, clears query caches on change, and is inert in preview and
  production builds.
- **2026-08-21:** Mobile Supabase authentication is owned by one app-level
  coordinator. Pending signup state may retain only an expiring redemption
  transaction in SecureStore; invite codes and OTPs are never persisted. Product
  navigation is authorized by the FastAPI approved profile, not merely by the
  presence of a Supabase session.
- **2026-08-21:** Real mobile auth evidence uses separate auth-test artifacts
  pointed at HTTPS staging with deterministic providers. Demo identities,
  loopback defaults, local networking exceptions, and local identity controls
  remain exclusive to deterministic test profiles.
- **2026-08-21:** Account export is a versioned application-data contract and
  excludes credential, invite, share-token, and provider secrets. Application
  profile deletion requires exact server-side confirmation and remains blocked
  while the user organizes a plan. Eligible deletion nulls the actor on retained
  plan audit events. Supabase Auth removal remains a separate trusted-operator
  action, and hosted evidence never exercises deletion against retained accounts.
- **2026-08-22:** Mobile private query data is session-only and is never written
  to a disk persister. Product mutations are not queued, optimistically applied,
  or automatically replayed after reconnection. Known-offline and ambiguous
  failures require an explicit user retry using the original in-memory payload
  and idempotency key; editing or dismissal abandons that operation. If a read
  refresh observes the committed server state before an ambiguous retry, the
  retry/dismiss control remains available until the user resolves that attempt.
- **2026-08-22:** The closed-beta idempotency ledger remains a 24-hour,
  process-local response cache. Request-body fingerprints prevent one actor from
  reusing a key with a different body, but restart and horizontal-scaling replay
  safety require a later persistent-ledger migration.
- **2026-08-22:** Global mobile status banners render inside an explicit root
  safe-area provider and consume the top inset. Semantic alert labels do not
  substitute for visible bounds outside the system status bar.
- **2026-08-22:** Deterministic iOS Maestro flows dismiss keyboards by tapping a
  stable non-interactive heading when the next action remains visible. The
  platform driver's flaky `hideKeyboard` gesture is not an acceptance signal.
- **2026-08-22:** Resource-intensive local mobile evidence runs are sequential.
  Android test artifacts target ARM64 only and cap Gradle/CMake workers; verbose
  build and Maestro output is written to temporary files and summarized only at
  phase boundaries. This bounds native-worker memory and avoids retaining large
  tool streams in the Codex desktop task.
- **2026-08-23:** `https://links.table-us.com` is the single canonical host for
  invite, auth, and private-plan links. The dedicated host avoids same-origin
  browser navigation behavior and serves the same Next.js fallback when the app
  is unavailable. Share tokens stay in the current join URL and navigation
  process; auth UI receives no token and evidence retains no private URL. Native
  cold starts normalize the canonical host through Expo Router's
  `+native-intent`, retaining only the allowlisted auth mode or join token.
- **2026-08-24:** Local EAS builds require CLI 22.4.0 or newer so credential
  payloads use the redacted environment transport. Preview Android association
  trusts only the current signing certificate after rotation; superseded APKs
  require uninstall/reinstall. Expo SDK 57 iOS inspection reads
  `EXConstants.bundle/app.config` while retaining the legacy path and otherwise
  failing closed. Tahoe's exact trust-only `codesign` diagnostic is accepted only
  alongside independently validated signed entitlements and Apple provisioning
  profile authorization. Both CMS checks bind the actual `SignerInfo`
  certificate rather than accepting an unused certificate from the CMS bag.
- **2026-08-24:** Verified-link evidence on Android is automated against a signed
  ARM64 artifact. Until Maestro officially supports physical iOS devices, iOS
  association evidence uses exact-artifact inspection, Apple Associated Domains
  Diagnostics, and user-observed taps from Notes or Messages through returning
  code authentication and rotated-link rejection. A simulator does not replace
  association verification, and the result must not be labeled automated.
- **2026-08-24:** Places and AI provider modes are independently configured;
  their combined readiness may be `mixed` in staging, while production requires
  both live. Google Places staging persists long-lived Place IDs plus the user's
  own normalized plan label, never Google coordinates or display fields. Live
  location and restaurant fields are refreshed on demand, query data stays in
  client memory, and Maps paid-operation limits/usage accounting remain
  process-local for the closed beta.
- **2026-08-25:** US location validation prefers
  `postalAddress.regionCode`. Because live Text Search city results can omit the
  entire postal address, the adapter requests the transient country address
  component and accepts its `US` short code only when the postal region is
  absent. Any missing, conflicting, or non-US country remains fail-closed, and
  address components are never persisted or emitted to evidence or telemetry.
- **2026-08-25 (superseded):** Closed-beta Gemini uses only pinned
  `gemini-2.5-flash-lite` through `google-genai==1.75.0`. Restaurant identities
  are replaced with request-local aliases before inference, every AI output is
  schema- and privacy-validated, and there is no silent fallback. Live staging
  is bounded by per-user/global limits, a database-backed rolling `$4` estimated
  spend ceiling, and a one-process reservation lock; a future horizontally
  scaled service requires a durable reservation ledger. Paid evaluation is a
  separate explicit gate with an exact-SHA/fixture checkpoint and `$0.25` cap.
- **2026-08-25:** Gemini wire schemas contain only the provider's documented
  JSON Schema subset. Generated string `minLength`, `maxLength`, `pattern`,
  `additionalProperties`, and non-semantic `title` metadata are removed before
  transmission because live endpoints reject those generated forms with `400`;
  the original strict Pydantic models still validate every parsed response
  locally, so wire compatibility does not weaken domain, privacy, or safety
  enforcement.
- **2026-08-25:** Closed-beta Gemini is pinned to
  `gemini-3.1-flash-lite` through `google-genai==1.75.0`. Google lists it as the
  stable replacement for Gemini 2.5 Flash-Lite, which returned `404` for the
  newly created staging project despite successful authorization and catalog
  discovery. Cost accounting uses `$0.25` per million input tokens and `$1.50`
  per million output/thinking tokens. Gemini 3 thinking cannot be fully
  disabled, so TableUs requests the documented `minimal` level and continues to
  include thinking tokens in spend limits. This model change requires a new
  exact-SHA checkpoint namespace and live evaluation before staging activation.
- **2026-08-25:** A public-CI-green Gemini 3.1 candidate may not deploy merely
  because request validation succeeds. Paid activation remains fail-closed when
  Google returns generic `429 RESOURCE_EXHAUSTED`, even with active linked
  billing and no reported client rate-limit or overload signal. Keep staging AI
  deterministic, preserve the Railway-only credential restriction, and require
  a new exact-SHA evaluation after provider capacity becomes usable.
- **2026-08-25:** TableUs staging uses Gemini Enterprise Agent Platform, Google's
  evolution of Vertex AI, instead of the standalone Gemini Developer API. Keep
  `google-genai`, `gemini-3.1-flash-lite`, the global endpoint, strict schemas,
  and existing spend ceilings; select the SDK's explicit `enterprise=True`
  transport. Railway authenticates with the existing service-account-bound
  authorization key restricted to `aiplatform.googleapis.com` and its static
  egress addresses. The bound identity receives only
  `roles/aiplatform.expressUser`. This permits eligible Google Cloud credits and
  avoids depending on AI Studio prepaid billing without adding Agent Runtime,
  Agent Studio, grounding, tools, or persistent agent state.
- **2026-08-25:** A standard API key restricted to
  `aiplatform.googleapis.com` is not an acceptable Agent Platform runtime
  credential. Exact-SHA evidence returned `401` with zero tokens because the key
  has no bound IAM principal, matching Google's current authentication
  documentation. The required service-account-bound authorization key cannot be
  created while the managed `disableServiceAccountApiKeyCreation` policy omits
  Agent Platform. The unused standard key was revoked and the prior Developer
  API credential restored without deployment. Staging remains deterministic
  until the owner approves either a narrowly scoped policy allowance, a
  workload-identity-capable runtime, or continued standalone Developer API
  billing.
- **2026-08-25:** For staging validation only, the project-level managed policy
  allowlist preserves `generativelanguage.googleapis.com` and adds only
  `aiplatform.googleapis.com`. The Agent Platform key is bound to the existing
  service account whose sole project role is `roles/aiplatform.expressUser`, and
  is restricted to Agent Platform plus Railway's three static IPs. Production
  credential architecture remains a later gate. Live contract failures do not
  weaken local validation: recommendation outcomes and request-local candidate
  keys are represented as provider enums, while Pydantic remains authoritative;
  multimodal content explicitly declares the user role.
- **2026-08-25:** Exact candidate
  `2eb428a05913c60dd1af1ae59fdd79fb233c5ede` is the validated live-Gemini
  staging baseline. It passed public CI, the frozen six-case paid evaluation,
  and sanitized two-user evidence with live Places and live Agent Platform.
  The active service-account-bound key remains restricted to
  `aiplatform.googleapis.com` and Railway's three static IPs; the superseded
  Developer API key is revoked. The Vercel staging alias uses an exact-SHA
  Preview deployment because the project's Production target also controls
  production-facing TableUs domains. Moving those domains or using a Production
  deployment requires a separate production gate; a dedicated staging Vercel
  project should be considered before beta release.
- **2026-08-26:** Closed-beta analytics are default-on but anonymous and
  aggregate-only. Each web page/app process creates a random memory-only session
  UUID; TableUs does not persist it, associate it with an account, call PostHog
  `identify`, create person profiles, use GeoIP, autocapture, surveys, feature
  flags, or replay. Sentry is error-only: stacks and safe release/component/
  request identifiers remain while messages, users, request contents, query
  strings, private URL segments, contexts, breadcrumbs, profiling, tracing,
  replay, and attachments are excluded. Staging uses three isolated Sentry
  projects and one isolated US PostHog project; production remains a later gate.
