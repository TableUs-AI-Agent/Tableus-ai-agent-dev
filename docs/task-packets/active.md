# Active packet: staging bootstrap

## Status

In progress as of 2026-08-19. Local release hardening is committed. The dedicated
Vercel and Supabase staging projects are provisioned and linked; Vercel has no
secrets or deployment, while Supabase has a separately credentialed,
least-privilege `tableus_runtime` role and the database is migrated through
revision `5c9a1d7e2b3f`. The owner password is rotated and stored separately from
the runtime credential. The Before User Created invite hook is enabled and
verified, and Resend-backed custom SMTP is configured. Auth delivery evidence,
client Auth wiring, Railway, and EAS remain gated. Follow `docs/release-runbook.md`.

## Objective

Provision a deterministic, isolated staging environment from one exact commit
without enabling paid providers or taking any production/store action.

## Deliverables

- Provision and configure the Vercel staging project without deploying it.
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
