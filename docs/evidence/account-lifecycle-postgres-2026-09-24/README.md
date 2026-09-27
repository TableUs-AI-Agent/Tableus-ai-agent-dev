# PostgreSQL lifecycle evidence — 2026-09-24

Application and worker source: `eab922ee6b7a21d193514d7008a47806c9e118e3`. Base: `521345eaab6086496c6cc490843342c96fb8f2bb`.
[Manifest](verification.json) hashes all eight changed executable/config/test
files and accepted or diagnostic logs. Documentation descendants do not replace
this source association.

## Fresh checks

- `make ready`: **314 JavaScript / 139 Python, zero skips**, lint, types,
  generated contracts, Next production build, Expo **web** export, deterministic
  smoke. JavaScript size 2,772,470 bytes is report-only. Contract drift is empty.
- PostgreSQL 17.11, runtime `tableus_runtime` (not superuser/owner and cannot
  create schemas), separate migration administrator. Full readiness used fresh
  database `tableus_lifecycle_acceptance` on loopback port 55439.
- Six lifecycle concurrency cases use barriers and observed database waiters:
  both orders of deletion/redeem and transfer/recipient deletion, serialized
  competing transfers, worker claim exclusion. These also pass in full readiness.
- Real migration head `6d7e3b91a2c4`; both empty-database migration and upgrade
  from `8b1d4a6c2e90` with a preserved synthetic profile. Runtime CRUD succeeds;
  PUBLIC has no table grant; anon/authenticated have no schema/table privileges
  and actual SELECT/DELETE attempts fail SQLSTATE 42501.
- Separate CLI processes inspect a pending row while disabled, refuse a batch
  with exit 2, then complete it using enabled **demo** Auth and report pending 0 /
  completed 1. No provider request or real account was involved.
- CI YAML and embedded bootstrap Python parse; hosted CI was not dispatched.

## Observed failures and repairs

PostgreSQL was absent and Docker was stopped. Installed the PostgreSQL 17.11
Homebrew bottle with automatic cleanup/default post-install disabled; first
initdb found missing packaged data links. Added the expected share/lib links and
initialized only task-owned data. Installation also installed krb5 and updated
OpenSSL/readline/xz dependencies; see private install log. No Homebrew service
was registered or started and no existing database was used.

Initial restricted-role focused run: 10 passed / 9 setup errors. PostgreSQL checks
CREATE privilege even for CREATE SCHEMA IF NOT EXISTS. Local/test initialization
now inspects the schema first; rerun 19 passed. Mypy caught nullable schema typing
in that change; a narrowed local variable fixed it. Full readiness then passed
once on frozen source. No failure/budget was erased or reset.

The paused-API regression was found by code review: replaying an existing
request could claim an unavailable Auth attempt while admission was disabled.
The guard and meaningful regression are included in the final source.

## Reproduction and limits

Use a **new disposable** migrated PostgreSQL database for each full suite;
legacy tests retain named fixtures. Set ENVIRONMENT=test, deterministic providers,
demo auth, separate DATABASE_URL and MIGRATION_DATABASE_URL, and
TABLEUS_RUNTIME_DB_ROLE=tableus_runtime. Create unprivileged anon/authenticated
roles for the negative checks. Follow the checked-in CI bootstrap, migrate head,
then run make-ready. Never aim the test suite at hosted/customer data.

All private logs and retained cluster data are in
`/Users/brianchei/.codex/artifacts/tableus/account-lifecycle-postgres-2026-09-24`. Server shutdown was verified (`pg_ctl status` reports no server,
expected exit 3). PostgreSQL binaries remain installed. No cleanup was performed.

This proves local PostgreSQL behavior, not actual hosted grants/schema exposure,
provider acceptance, scheduler execution, signed-device behavior or beta readiness.
Native task 01a0c678-55c8-7cc0-a3cb-e3200776906a was active/inProgress on the compact
snapshot taken during this objective, with no newer completion message.
