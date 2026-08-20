# Active packet: staging bootstrap

## Status

In progress as of 2026-08-20. Local release hardening is committed. The dedicated
Vercel, Railway, and Supabase staging projects are provisioned and linked.
Supabase has a separately credentialed,
least-privilege `tableus_runtime` role and the database is migrated through
revision `57a2a71fa443`. The owner password is rotated and stored separately from
the runtime credential. The Before User Created invite hook is enabled and
verified, and Resend-backed custom SMTP is configured. Confirm signup and Magic
Link now deliver six-digit codes, and a real invite completed OTP verification,
redemption, profile creation, and the authenticated `/plans` redirect. Railway
and Vercel are deployed; the hosted deterministic browser journey, exact-SHA EAS
test builds, and tightened local native create/open smoke are green on iOS and
Android.
Revision `57a2a71fa443` replaced the Auth hook's inaccessible
`extensions.digest` dependency with PostgreSQL's built-in SHA-256 function. The
next OTP request passed the hook but Resend rejected the configured SMTP username;
the username is now corrected to `resend`. The subsequent retry reached Resend,
which rejected the unverified `table-us.com` sending domain. The domain is now
verified, and a fresh OTP request passed the hook and completed with HTTP 200 and
no SMTP error. The initial Confirm signup email used a confirmation link rather
than the six-digit token expected by the client; both templates are now
token-based and the subsequent journey succeeded. One earlier unused invite
remains active until 2026-08-27 with no recoverable plaintext; revoke it or allow
it to expire before external beta access. Follow `docs/release-runbook.md`.

Exact SHA `bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28` passed `make ready` and is
deployed to Railway as deployment `e438677b-548e-4dce-ae8e-7f05f086bc29` and
Vercel as deployment `dpl_vpVRmbpHXhQPb5AUScD8yJaPHJFD`. Railway liveness,
readiness, deterministic/Supabase modes, and the public branch SHA passed.
Vercel promoted the production alias. A hosted authenticated Browser session
showed the active `Jung` profile after the Supabase browser session changed,
verifying the deployed auth-state identity refresh. The earlier returning-user
OTP did not consume another invite; read-only staging aggregates remained at
one profile, one redemption, and one total invite use. A second invite-approved
account then redeemed successfully as `Jung`, bringing the sanitized aggregates
to two profiles, two redemptions, and two invite uses. The hosted two-user
deterministic plan journey is green: Jung created the plan, Brian joined through
the private link, both saved constraints, the provider returned exactly four
candidates, both submitted 3/2/1 votes, the 5–5 tie resolved deterministically
to Garden Mezze, Brian had no finalization control, and Jung finalized, reopened,
and refinalized the plan. Rotating the share token made the prior private link
fail with an explicit rotated-link message. Web and Expo account export/deletion
controls are implemented locally with typed destructive confirmation; exact-SHA
hosted/device evidence remains, and no staging account was deleted. Other
privacy/failure-state checks and iOS/Android evidence remain.

Expo authentication is complete and the correctly branded `@tableus/tableus`
project is provisioned as `0601c3b9-0082-454c-b636-45a1fe377f7b`. Five
preview-only public client values are configured. The preview build remains
Supabase-authenticated while `test-ios` and `test-android` explicitly select
deterministic demo mode. Preview, build-artifact test, and production workflow
schemas validate. EAS-hosted Maestro requires a paid plan, so the test workflow
produces an iOS simulator app and Android APK for local Maestro execution instead.
The original `bc0d2f3` test artifacts remain invalid because they send a demo
identity to Supabase-authenticated Railway. Replacement exact-SHA builds
`8d5ffefb-28ad-42a1-966d-426af059046b` (iOS simulator) and
`41e5ece8-58d9-4d5f-84ff-a67dd2dfa607` (Android APK) finished from
`9dd39fe9db72c52f96db4cf596401d32493a510f`. Both downloaded artifacts contain
the localhost deterministic endpoint and no Railway hostname match. Separate
clean-backend Maestro runs passed plan creation and workspace navigation on an
iPhone 17 Pro/iOS 26.5 simulator and an Android API 36 ARM64 emulator. The harness
dismisses the keyboard, requires the input to reset after the successful POST,
matches the combined accessible plan-card label, rejects authentication errors,
and requires `Your constraints`. Broader native journeys remain release work. No
production build, store action, staging redeploy, or paid provider action ran.

## Objective

Provision a deterministic, isolated staging environment from one exact commit
without enabling paid providers or taking any production/store action.

## Deliverables

- Provision, configure, and deploy the Vercel staging project from the exact
  candidate SHA.
- Authenticate and provision Supabase staging with separate migration/runtime
  roles, private `app` schema, Auth hook, custom SMTP, and deterministic mode.
- Authenticate and link an Expo/EAS project, then configure preview-only
  environment values without building or submitting an application.
- Provision or connect a Railway staging API and add only the approved staging
  secrets required by deterministic web/mobile evidence.
- Deploy one exact SHA after a separate deployment approval and capture sanitized
  browser, iOS, and Android evidence.

## Acceptance

All staging resources are isolated from production and reference one exact SHA.
Deterministic auth/planning journeys pass across web, iOS, and Android. Paid Maps
or AI, production migrations/deployments, and store submissions remain separate
approval gates.
