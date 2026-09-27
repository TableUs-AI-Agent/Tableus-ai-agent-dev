# Recipient-bound invite verification

Application and operator source: `29edb5e9f47ab7ac74034f2bac5e271a162ea620`.
Base: `c33479e80eef4ddd154783dda677cd016dc1a936`. Evidence commits only update docs.
[Machine-readable receipt](verification.json) hashes source files and private logs.
[Handoff](../../handoffs/2026-09-24-recipient-invites.md) states scope and residual gates.

## Fresh observations

- One full `make ready` passed at frozen source: 193 Python tests, zero skips;
  314 JavaScript tests; lint/types; generated contracts; Next production build;
  Expo web export; deterministic smoke. Contract drift is empty. Report-only
  JavaScript baseline is 2,772,474 bytes, not a performance acceptance threshold.
- Root focused API/legacy regression plus hook run passed 55 tests before the
  additional legacy-approved-account regression; the full suite includes that
  regression. CLI final focused tests: 8. Final hook/role tests: 11.
- Actual PostgreSQL 17.11 restricted runtime roles, fresh migration, observed row
  contention with one winning redemption, and committed revocation denying
  waiting redemption passed. The test revocation transaction uses the same row
  lock as the CLI; CLI metadata/issuance tests use isolated SQLite.
- Auth admin invoker tests accept normalized recipient and deny wrong/legacy,
  expired/revoked/consumed invites and expired/redeemed reservations. Auth admin
  lacks table writes; PUBLIC/browser roles cannot execute the hook or access
  the private invitation tables. No external Auth instance was used.
- Populated `ab72e4f39d10` upgrade retained legacy invite, reservation, profile and
  redemption. Head refused legacy signup. Synthetic downgrade restored predecessor
  admission and removed extra Auth-admin SELECT; re-upgrade refused it again.
- Database server on loopback port 55441 is stopped; data and logs retained in
  `/Users/brianchei/.codex/artifacts/tableus/recipient-invites-2026-09-24`.

Root reviewed the implementation and evidence; delegated work was bounded to
schema/hook and CLI with tests. Review fixed getpass echo fallback and SQLite
fixture schema handling before freeze. Initial Alembic invocation from root
failed on its relative script directory before executing schema changes;
using backend succeeded. Full readiness passed on its first attempt.

Existing Alembic path_separator and Node module-type warnings are non-failing.
Cached npm install emitted deprecation notices; dependency bytes were unchanged
and no audit/security scan was run. No native, provider, actual invite, hosted
migration, deployment, shared Notion or store action took place.
