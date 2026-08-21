# Active packet: mobile staging authentication and session resilience

## Status

Implementation is complete locally on `codex/mobile-staging-auth`. The
cumulative `make ready` gate passes. Source and focused tests cover the durable
auth transaction, approved-profile gate,
foreground refresh lifecycle, one-retry API token refresh, protected navigation,
join-intent restoration, explicit sign-out, isolated auth-test profiles, and
sanitized operator tooling. Exact-SHA EAS artifacts and real Supabase evidence
remain gated external work; this packet is not release-complete until both
platform journeys pass from the forthcoming exact candidate SHA.

The first candidate `88a6d3bcf00c9342765cf17d9bade16b7ddfced0` was pushed,
but EAS rejected the build request before creating an artifact because its
current schema disallows empty-string environment values. The auth profiles now
omit demo identity variables entirely. This correction requires a replacement
candidate and renewed exact-SHA approval; the rejected request is not evidence.

The deployed staging baseline remains Railway deployment
`e438677b-548e-4dce-ae8e-7f05f086bc29` and Vercel deployment
`dpl_vpVRmbpHXhQPb5AUScD8yJaPHJFD`, both from
`bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28`. This packet does not redeploy
either service.

## Objective

Prove invite signup, returning sign-in, session persistence, refresh, foreground
recovery, join-intent return, and sign-out against Supabase-authenticated staging
on both mobile platforms without compiling deterministic demo controls into the
auth artifacts.

## Deliverables

- Coordinate `loading`, `signed_out`, `pending_verification`, `redeem_pending`,
  and `approved` states above all mobile routes.
- Persist only a versioned, expiring email/display-name/redemption transaction;
  never persist an invite code or OTP.
- Validate invites before signup, prevent account creation during returning
  sign-in, validate restored sessions with `/api/v1/me`, and retain verified
  sessions across retryable redemption failures.
- Start Supabase auto-refresh only in the foreground and retry one API `401`
  with the original idempotency key after an explicit token refresh.
- Protect product routes, retain signed-out join intent in navigation memory,
  and clear pending state plus user-scoped query data on sign-out/account change.
- Add isolated `auth-test-ios` and `auth-test-android` profiles and a gated
  pass/fail refresh surface with no token output.
- Provide interactive, redacting `make mobile-auth-e2e` orchestration and a
  read-only invite aggregate report.

## Acceptance

- `make ready` passes and a clean exact candidate SHA is recorded.
- After explicit approval, both auth-test artifacts match that SHA, use HTTPS
  Supabase staging with deterministic providers, and contain no demo identities,
  loopback endpoint, local networking allowance, service-role credential, or
  production endpoint.
- One fresh account and one one-use invite per platform prove invalid-invite
  rejection, signup, protected routing, join-intent return, relaunch persistence,
  explicit and foreground refresh, sign-out, and returning sign-in.
- Sanitized evidence retains build IDs, checksums, commands, screenshots, and
  invite aggregates but no email, invite code, OTP, hash, access token, or share
  token.
- No schema migration, staging redeployment, production build/store submission,
  paid-provider activation, account deletion, or verified-link work occurs.
