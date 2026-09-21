# Current decisions

Consolidated 2026-09-21. This index contains durable choices; run progress belongs
in evidence and the active packet. The [full prior decision log](history/2026-09-21/decisions.md)
is retained with original dates and superseded decisions. Consult it by topic
when changing a subsystem; it is not a second active task packet.

## Product and platform

- Invite-only US beta across Next.js web and one Expo Router iOS/Android app.
  Platform UI is separate; only API-client and domain packages are shared.
- FastAPI `/api/v1` owns product data/authorization; Supabase clients are auth-only.
  Supabase Postgres, Railway API and Vercel web remain the hosting architecture.
- Plans support 2–8 people, four grounded options, top-three Borda voting (3/2/1),
  organizer finalization/reopening and rotatable private links. Finalized plans
  reject new joins, constraints and regeneration until reopened.
- Native beta is 2D; maps/3D, broad redesign and new provider/framework work are
  deferred. Astra is the development model, not a change to application inference.

## Authentication, data and privacy

- Email-bound invite validation precedes first OTP sign-in; returning users need
  an existing approved application profile and consume no new invite. The API
  profile, not the Supabase session alone, authorizes product navigation.
- One mobile auth coordinator owns restoration and transitions. Persist only
  expiring redemption state, never invite/OTP material. Credential lookup,
  refresh and response-body work are bounded; failed restoration offers retry.
- Sign-out explicitly uses local scope; clear local state on success and show a
  sanitized retry error on failure. Subject transitions clear private caches.
- Queries stay in memory. Writes are not queued or automatically replayed;
  ambiguous failure retains the original payload/idempotency key for explicit
  user retry. Android transparent connection retry is disabled.
- Runtime database credentials are least-privilege; migration credentials remain
  separate. Client Data API roles do not receive application-schema access.
- Export excludes credentials, invite/share tokens and provider secrets. Current
  application deletion requires exact confirmation and is blocked for organizers;
  Auth deletion and production retention require a separate trusted workflow.
- Places persistence retains Place IDs and user-owned labels, not provider display
  fields, coordinates or content. Live details are transient and refreshed on demand.
- Canonical links use `links.table-us.com`, exact `/auth` and `/join/*`; auth
  confirmation stays web-only. Capability URL risk remains open; authentication,
  hashed storage, rotation and redaction mitigate isolated staging only.

## Reliability, providers and telemetry

- Local/CI providers are deterministic. Live Places/Gemini use explicit bounded
  approvals. Gemini remains pinned to `gemini-3.1-flash-lite` through
  `google-genai==1.75.0` and the existing Agent Platform transport. Keep strict
  local schema/privacy validation and no silent fallback. Historical accounting
  rates/quotas are recorded configuration, not a fresh provider-price assertion.
- One API process owns bounded idempotency, provider reservations and JWKS refresh
  coordination. Plan mutations row-lock current state and replay rechecks access.
  Horizontal scaling requires durable coordination. JWKS key-set cache is bounded
  to five minutes with no indefinite per-key cache.
- Request admission enforces transport/global limits and body caps before auth,
  parsing and provider work. CORS is inside that boundary. Hosted builds reject
  demo modes, unapproved origins and insufficient runtime credentials.
- Plan detail does not poll. Hidden routes unsubscribe, foreground refresh is
  coordinated, explicit refresh coalesces reads and scrolling triggers no refresh.
  Previous saved votes, unsent changes and fresh submission success are distinct.
- PostHog is anonymous and allowlisted with a random process-memory UUID: no
  account identity, persistence, person profiles, GeoIP, autocapture or replay.
  Sentry is error-only with private data scrubbed; no tracing/profiling, replay,
  attachments or breadcrumbs. Canary delivery must be observed per platform;
  each mobile canary also sends one API companion and both count against the cap.
- Existing cohort quota fairness, operator usage visibility, invite reservation
  abuse and plan retention limits require explicit release work before expansion.

## Native builds and evidence

- Keep CNG source in Expo config/plugins, not generated iOS/Android projects.
  The current candidate pins Expo 57.0.23 and an attributed adaptation of the
  experimental scene plugin; actual generation and SDK 27 artifact checks guard
  iOS startup compatibility. No general SDK migration is approved.
- EAS CLI is locked at 23.2.0. Native builds are sequential, exact-source detached
  builds with frozen dependencies, bounded workers and durable private outputs.
  Receipts bind source/lock/artifact/inspection/signing; inspect again before use.
- Deterministic test profiles alone allow demo identities and loopback transport.
  Readiness profiles are staging-only, production-shaped and have no E2E controls.
  Telemetry canaries use separate gated profiles. Inspect signed native transport,
  not just Expo config. Preserve failed attempts and distinguish harness failures.
- Physical iPhone link acceptance requires observed taps; simulator results do
  not substitute. Owner reports, UI observations and server aggregates retain
  their actual provenance. A passed mocked test is not live session proof.
- Application source, operator tooling and evidence commits are distinct. Reuse
  matching bytes; never relabel older artifacts. Staging source-review version two
  binds accepted report and owner approval to immutable candidate/file hashes.
  Legacy scan records keep their original meaning. No new scan without approval.

## Production and operating boundaries

- Production trust origins, signing, store associations and credential policy are
  separate gates. Expo Updates remains disabled until signed-update authority is
  approved. Local source-map/native-symbol upload exception does not apply to stores.
- Toolchain/advisory exception expires before production or 2026-09-30. Assess
  reachable advisories and compatible patches before release; old counts are not
  a fresh audit. Do not force upgrades inside a frozen verification run.
- Brian Chei owns legal/contact review and rollback. Preserve the August 26
  legal/attribution/mailbox attestations unless their scope changes. Contact
  details and Google's unmodified attribution assets remain source-controlled.
- Explicit gates remain for merge, resources, secrets, paid AI, production
  migration, deployment, stores, destructive cleanup and significant product or
  architecture decisions. Approved routine reversible work proceeds without
  repeated permission. Staging acceptance does not authorize a cohort.

## Task lifecycle — adopted 2026-09-21

Use one bounded feature/fix per conversation and named worktree. Keep current
state concise, detailed observations in evidence and a compact commit-based
handoff for the next task. Read a referenced previous task before relying on it;
retrieve only needed turns. One primary agent, no unrequested delegation. Preserve
budgets/approvals across tasks and distinguish measured usage from assumptions
about model cost. See [development workflow](development-workflow.md).
