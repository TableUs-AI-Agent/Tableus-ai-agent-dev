# Active packet: staging bootstrap

## Status

In progress as of 2026-08-19. Local release hardening is committed. The dedicated
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

Exact SHA `ab2d374d3c8917ba8b4af18a56675751d095924a` passed `make ready` and is
deployed to Railway as deployment `90dff841-ddbb-49e7-bd7c-2187f65c062a` and
Vercel as deployment `dpl_GAiLZdCQEJGHx1yw5Bvaxtjwcm26`. Railway liveness,
readiness, deterministic/Supabase modes, and Vercel CORS passed. Vercel public
routes passed and verified-link manifests failed closed as designed. A fresh
single-use invite is prepared for the remaining hosted authenticated journey.
Local browser review then identified that returning users had no sign-in path
without consuming a new invite. Web and mobile now separate invite-backed join
from returning OTP sign-in and verify the existing profile through `/api/v1/me`;
the next exact-SHA deployment remains an explicit gate.

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
