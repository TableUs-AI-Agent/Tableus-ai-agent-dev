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
