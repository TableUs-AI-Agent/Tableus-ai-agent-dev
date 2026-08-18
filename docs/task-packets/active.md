# Active packet: staging bootstrap

## Status

In progress as of 2026-08-17. Local release hardening is committed. The dedicated
Vercel and Supabase staging projects are provisioned and linked; Vercel has no
secrets or deployment, while the Supabase database owner password exists only in
macOS Keychain. Runtime-role creation, remote migration, Auth/SMTP configuration,
Railway, and EAS remain gated; follow `docs/release-runbook.md`.

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
