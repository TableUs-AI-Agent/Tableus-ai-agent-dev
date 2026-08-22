# Active packet: mobile staging authentication and session resilience

## Status

This packet is release-complete on `codex/mobile-staging-auth` from exact
candidate `d6d1b3a99318aff5c904029328e6395a6e4236e4`. The cumulative
`make ready` gate passes. Exact-SHA auth-test artifacts passed bundle inspection
and the complete real Supabase lifecycle on both platforms. Sanitized summaries,
returning-session screenshots, commands, checksums, and read-only invite
aggregates are retained in `docs/evidence/d6d1b3a/`.

The first candidate `88a6d3bcf00c9342765cf17d9bade16b7ddfced0` was pushed,
but EAS rejected the build request before creating an artifact because its
current schema disallows empty-string environment values. The auth profiles now
omit demo identity variables entirely. This correction requires a replacement
candidate and renewed exact-SHA approval; the rejected request is not evidence.

Replacement candidate `9477a8ede5047df45d7cdca634dab5c9f7fb3e2a` produced
iOS build `253b72be-e7a2-4f69-90f1-37b23ee06d17`; its first artifact inspection
then exposed an overbroad operator assertion that rejected localhost strings
embedded by Expo/Sentry even though the TableUs `:8000` API endpoint was absent.
Android build `181c2a41-7282-4d6a-b2ac-ac79fcba3d65` was cancelled before
completion. The inspector now rejects the actual TableUs loopback API origins.
Per the packet, that iOS artifact and cancelled Android job are invalid and a
new candidate plus two new builds are required.

Candidate `ac60838bae1617d5b91b34f63c8077d1a5dab2c5` produced iOS build
`05451027-bb24-4ded-b810-c6ea6c78f5f7` and Android build
`74ed8a66-9a9f-462b-88f5-2f1c87bdd05d`. Both artifacts passed exact-SHA and
configuration inspection. The first iOS evidence phase then reproducibly failed
before signup because Maestro could not hide an already-unavailable keyboard.
The flow now dismisses keyboards by tapping stable static text. Per the packet,
both otherwise-valid artifacts are invalidated; the two created one-use invites
remain unused and no OTP was sent.

Candidate `ff4f7e2f3f3d299862ffefa452d161605bfb1978` fixed keyboard
dismissal and passed the invalid-invite phase. Its iOS join-intent phase then
showed that the static auth alert and the navigation button exposed the same
"Sign in to join" accessibility text, allowing Maestro to tap the alert. The
alert now has the distinct accessible text "Authentication required" while the
button retains the required product copy. No invite was consumed and no OTP was
sent; artifacts from this candidate are invalidated.

Candidate `b3691bd8df821467db363b6861e14ca0a3ca69f6` completed iOS
invite signup, OTP verification, redemption, join-intent return, relaunch
persistence, and explicit refresh. The foreground phase then restored the
approved user to protected Plans as designed, while the flow incorrectly
expected the test-only refresh route to persist across app termination. The flow
now asserts protected Plans first and explicitly reopens the gated refresh route
before checking session status. The corrected iOS phases then passed foreground
recovery, sign-out, and returning sign-in.

The same `b3691bd8` artifacts were used only to stabilize Android before freezing
the replacement candidate. An API 36 ARM64 run passed invalid-invite rejection,
signup, redemption, join-intent return, persistence, explicit refresh,
foreground recovery, sign-out, and returning sign-in across redacted resumable
segments. The flow now waits for React Native readiness before Android deep
links, uses Maestro's supported long-form `openLink`, waits for sign-out cleanup,
and makes returning sign-in self-contained. Host GPU acceleration removed the
emulator system-process stalls seen with software rendering; bounded recovery
for a startup ANR remains in the flows. Maestro parameters now use its supported
`MAESTRO_` shell variables so invite and OTP values do not appear in process
arguments. Both one-use invites are redeemed and both test accounts are retained.
Because these corrections occurred after `b3691bd8`, neither artifact was final
evidence: a new clean candidate, two new builds, two fresh identities/invites,
and four new operator-entered codes were then required.

Final candidate `d6d1b3a99318aff5c904029328e6395a6e4236e4` produced iOS
simulator build `8bbf7822-ffa7-4a61-9670-2ebc6e16cad7` and Android APK build
`3d6d40ad-43ed-45c6-ab8c-ad254c076322`. Both artifacts matched the exact SHA,
used HTTPS Supabase-authenticated Railway staging with deterministic providers,
and passed the required forbidden-marker inspection. Clean full journeys passed
on iPhone 17 Pro/iOS 26.5 and an API 36 ARM64 Android emulator. Each fresh
one-use invite has one use and one redemption, and neither has an active pending
validation. The Android invite has three historical validations because an
operator destination correction required a cooldown retry; only one validation
was redeemed. No interactive authentication value or raw Maestro workspace is
retained.

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
