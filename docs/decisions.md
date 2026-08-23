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
- **2026-08-17:** Verified HTTPS links cover `/join/*` and `/auth*`. Association
  manifests fail closed until real Apple and Android signing identifiers exist.
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
