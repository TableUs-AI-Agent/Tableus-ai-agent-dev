# Active packet: account export and deletion readiness

## Status

Local implementation and deterministic verification are complete on
`codex/account-controls` from the completed mobile-auth evidence baseline
`5ff55f82c6c0db21fec77a148d9f93f2a4931a02`. The packet is awaiting an exact
candidate commit and the existing approval gates for public push, staging
migration/deployment, EAS builds, and hosted evidence.

## Objective

Make application-data export complete and machine-verifiable, make deletion
eligibility explicit before any destructive request, and harden application
profile deletion without deleting either retained staging test account or its
Supabase Auth identity.

## Deliverables

- Replace the ad hoc export payload with a typed, versioned export containing
  the profile, connections, reviews, invite-redemption timestamps, plan
  memberships and the user's constraints, the user's votes, and plan events
  authored by the user. Exclude email hashes, invite codes/hashes, share-token
  hashes, provider payloads, access tokens, and other participants' private data.
- Add a read-only account-control endpoint that reports whether application
  profile deletion is currently allowed, organized-plan blockers, the deletion
  scope, and the separate operator-assisted Supabase Auth removal requirement.
- Require the exact `DELETE` confirmation at the API boundary. Continue to
  reject deletion while the user organizes any plan.
- Allow an otherwise eligible participant profile to be removed while retaining
  plan audit history with a null actor. Implement and test the corresponding
  Alembic migration, but do not apply it to staging without a separate gate.
- Update web and Expo account screens to show deletion readiness and export
  scope. Mobile export must share a JSON file rather than placing the full export
  body in share-sheet text.
- Add an auth-test-only mobile account verification surface that validates the
  export schema and deletion-readiness response but exposes only pass/fail and
  aggregate counts.
- Add deterministic backend and client tests plus operator commands for local
  web/mobile account-control evidence. Retain only sanitized summaries and
  screenshots.

## Acceptance

- Export output is versioned, deterministic in ordering, typed in OpenAPI, and
  contains all in-scope application data with no restricted secret fields.
- Deletion readiness and deletion use the same blocker calculation; API deletion
  refuses a missing/incorrect confirmation and organized-plan accounts.
- A disposable local non-organizer account with authored plan events can be
  deleted without removing the shared plan or its audit events; the actor becomes
  null. Organizer deletion remains blocked.
- Web and mobile expose accessible success, blocker, failure, and retry states.
- The mobile test surface is enabled only in auth-test artifacts and returns no
  raw export records, identifiers, tokens, hashes, reviews, constraints, or
  locations.
- Focused checks and `make ready` pass before an exact candidate is frozen.
- Public push, staging migration/deployment, new EAS builds, OTP delivery, and
  hosted evidence each require their existing explicit gates.

## Boundaries

- Do not delete either retained application profile or Supabase Auth user.
- Do not add a service-role or secret key to Railway, Vercel, web, or mobile.
- Supabase Auth deletion remains a separate trusted-operator action after
  application profile deletion; the product continues to deny product access
  once the application profile is absent.
- Plan ownership transfer/removal, legal-review approval, verified links,
  offline mutation evidence, paid providers, production builds, store
  submissions, and production deployment are outside this packet.
