# Account-lifecycle backend handoff

Local backend implementation complete. Application commit:
`5f8569e5b16088f64f358c64056e6dce4b191901`. Base: `bcc9e52d8c501dba9f51e881a7350c0959301255`.
Branch: `codex/account-lifecycle-backend`. Worktree:
`/Users/brianchei/.codex/worktrees/account-lifecycle-backend/Tableus-ai-agent-dev`. A following documentation-only commit records this handoff;
its code, tests and contracts are identical to this verified application commit.

## Delivered

- Organizer-only transfer to another approved existing participant, preserving
  shared plans; exact-confirmation deletion of sole-participant plans.
- Transfer replay handles a lost success response only for the original caller's
  cached result while membership, successor and plan timestamp still match.
- Additive full-deletion request/status API with atomic application removal and
  durable Auth job; existing application-only endpoint remains compatible.
- Bounded server-only Auth adapter, durable leased retries, operator recovery,
  raw-subject clearing on completion and stale-token re-enrollment protection.
- Migration, generated contract, private-schema/runtime grants, environment
  placeholders and [recovery/data-treatment guide](../account-lifecycle.md).

Brian owns current development. Sol implemented bounded backend work; Astra
implemented/reviewed the provider boundary and integrated/verified the objective.
Historical shared contributions have not been reassigned or relabeled.

## Fresh verification

One `make ready` passed: 296 JavaScript / 120 Python tests, four PostgreSQL-only
skips; lint, type checks, generated contracts, Next.js build, Expo web export,
smoke and report-only performance check. `npm run contract:check` passed after
staging the regenerated contract. No native build or simulator was used.
Fresh local SQLite migration reached `6d7e3b91a2c4`. A two-process file-backed
probe persisted a failed request, reopened it in a new interpreter, retried with
a fake provider and verified completion plus raw-subject removal. Source and
private log hashes are in [verification.json](../evidence/account-lifecycle-backend-2026-09-24/verification.json).

## Remaining limits and gates

The feature defaults off. Web/mobile account screens have not been changed.
No hosted migration, Auth call, credential, recovery schedule, deployment, merge,
store submission or cohort activation occurred. PostgreSQL advisory-lock races,
actual migration-role grants and live Auth behavior remain unverified. Local
SQLite tests do not establish those guarantees. Verify create-vs-delete,
recipient-delete-vs-transfer, join-vs-sole-delete and simultaneous worker claims
on PostgreSQL before activation, in addition to existing migration assertions.

Pending requests require a deployed/monitored recovery runner, especially after
the user's session expires. Backups, logs, provider audit retention and tombstone
purging require a separate reviewed policy. Already application-deleted legacy
accounts still need operator Auth completion. Plan content survives transfer;
event scrubbing is not a general free-text anonymizer. Transfer cache expiry or
plan changes require read-based client reconciliation before another mutation.

Native validation remains in task `01a0c678-55c8-7cc0-a3cb-e3200776906a`.
This branch preserves its frozen application and evidence; later integration
must assess the resulting candidate. No inherited native or provider allowance
was reset. No shared Notion page was edited.

## Next bounded objective

Implement web/mobile account-management screens against this exact contract:
list organized plans, transfer/remove eligible plans, show full-deletion scope,
confirm irreversible removal, represent pending/attention/completed states and
recover from a lost response without falsely restoring a deleted profile.
Use deterministic UI/component tests and keep platform UI separate. Continue in
an isolated branch from this handoff while native validation proceeds. Do not
activate the feature until PostgreSQL verification, trusted worker/credential
setup, retention review and affected release acceptance are separately handled.
