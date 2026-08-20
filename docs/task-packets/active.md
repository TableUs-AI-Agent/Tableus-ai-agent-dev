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
and Vercel are deployed; the hosted deterministic browser journey and EAS remain
gated. Revision `57a2a71fa443` replaced the Auth hook's inaccessible
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

Exact SHA `b6d308e00e9591fdc708b943fa86d3bce12101db` passed `make ready` and is
deployed to Railway as deployment `f15cc1d9-9df7-4a47-be4a-71a04c7c6bed` and
Vercel as deployment `dpl_C2n8j5ovo9gK3XNgvwmE9Xo5YgB9`. Railway liveness,
readiness, deterministic/Supabase modes, and the public branch SHA passed.
Vercel promoted the production alias. A hosted authenticated Browser session
showed the real `Brian` profile on `/plans`, no legacy demo-user switcher, and
working account navigation to `/profile`. The earlier returning-user OTP did not
consume another invite; read-only staging aggregates remained at one profile,
one redemption, and one total invite use. A second invite-approved account then
redeemed successfully as `Jung`, bringing the sanitized aggregates to two
profiles, two redemptions, and two invite uses. Switching the Supabase session
exposed a stale global web identity cache; the local auth-state refresh fix must
be deployed before the full two-user deterministic plan journey continues.
iOS/Android evidence remains.

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
