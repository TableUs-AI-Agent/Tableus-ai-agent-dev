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
