# Active packet: release hardening

## Status

Local acceptance is complete as of 2026-08-17. Deterministic `make ready`, the
closed-beta Playwright lifecycle, Expo configuration resolution, and an Alembic
upgrade/downgrade/upgrade cycle pass. The next packet begins only after approval
to provision staging resources and secrets; follow `docs/release-runbook.md`.

## Objective

Close source-level release gaps before any staging resources, credentials, paid
provider calls, or store accounts are provisioned.

## Deliverables

- Separate migration and runtime database credentials and document the
  least-privilege role boundary.
- Bind invite redemption to the email validated before OTP and add local invite
  administration tooling.
- Make Railway port handling, verified web links, EAS Update configuration, and
  staging browser evidence production-shaped without requiring live resources.
- Surface Google attribution for live Places results and expand privacy, terms,
  deletion, and beta-safety disclosures on web and mobile.
- Record exact external inputs still required for AASA, Android asset links,
  Supabase hooks, deployment evidence, and store submission.

## Acceptance

Focused security and configuration tests plus `make ready` pass without external
credentials. No cloud resource, secret, paid live-AI run, remote migration,
deployment, or store action occurs in this packet.
