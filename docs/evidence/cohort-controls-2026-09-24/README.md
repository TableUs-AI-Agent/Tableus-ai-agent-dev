# Cohort-control evidence — 2026-09-24

Frozen verification candidate: `25e34ec9e35e1935cebe8dbb8f34465fd2b313e0`.
Application implementation: `1066dcbbae5a0685719d88864d751e606a05d866`;
the next commit isolates test fixtures only. Base:
`d665dc15291191d56da521e1bcde74e99c59acdc`.

## Verification scope

Final make-ready passes **162 Python, zero skips; 314 JavaScript**, lint/types,
contract generation, Next build, Expo web export and deterministic smoke.
Generated-contract drift is empty. The [manifest](verification.json) binds files
and logs; report-only web JavaScript size is 2,772,470 bytes.
It uses PostgreSQL 17.11 as a distinct restricted runtime role, with migrations
under the local test administrator; SQLite cannot attest to the role/concurrency
checks. All accounts, counters, plans and provider responses are synthetic.

- Atomic concurrent provider and plan counters admit only the configured number.
  Concurrent API creates return one 200 and one 429 at cap 1, with exactly one plan.
- Daily periods reset at UTC day boundaries; counters survive profile removal/
  recreation and separate Python interpreters. A two-process proof returns
  admitted=true/used 1, then admitted=false/used 1, without calling a provider.
- Plan deletion/transfer and successful idempotency replay do not refund or
  re-charge creation slots. A failed create transaction rolls back its debit.
- Mock live-provider failure consumes its quota; the next attempt is blocked
  before dispatch. Global-budget rejection before actor admission consumes none.
- Operator tests cover empty/exact allowlists, ordinary users, forged client
  headers under mocked trusted auth, 1–30 day window boundary and updated-settings
  revocation. This is no claim of instant environment hot reload or hosted Auth.
- Actual PostgreSQL grants allow runtime SELECT/INSERT/UPDATE on quota counters
  but deny DELETE/TRUNCATE and browser-role access. The new migration explicitly
  revokes inherited runtime defaults before granting intended privileges.
- Populated-schema upgrade from 6d7e3b91a2c4 to ab72e4f39d10 preserves four plans:
  known creator 2, missing-creator/current-organizer fallback 1, legacy fallback 1;
  duplicate creation event counts once. The fallback is approximate attribution,
  not complete historical reconstruction.
- Documented aggregate-only operator SQL runs without exposing subject digests.
  Generated OpenAPI/client diff is the bounded `days` query and operator-only
  documentation; no platform UI or native artifact was changed.

## Findings, failures and repairs

Review found the existing post-commit Places hydration path in vote/finalize/
reopen could return 429 after a successful write once a daily cap was reached.
Three regressions reproduced persisted mutations on failure before the fix.
Hydration now precedes mutation; all three cases confirm unchanged state on 429
and exactly one hydration with a committed 200 on successful retry. Failed plan
creation transaction and quota tests also verify rollback behavior.

The first full make-ready on 1066dcb stopped at Python tests: 161 passed / 1 failed.
An earlier minute-limit test intentionally filled the global Places window, so
the new daily-quota test observed the correct earlier 429 instead of its intended
mock-provider 404. The corrective 25e34ec test commit temporarily installs fresh
minute-window fixtures and restores prior state afterward. It does not disable
application limits. The passing rerun uses a new database; both logs are retained.

Alembic emits a non-failing `path_separator` deprecation warning when the role
test reads the current migration head. The agent database initially applied the
migration before its runtime-grant correction and was adjusted only for focused
tests; root fresh and populated-upgrade databases validate the final migration.
No such adjustment substitutes for final fresh-migration evidence.

## Boundaries

Private logs and retained local database files:
`/Users/brianchei/.codex/artifacts/tableus/cohort-controls-2026-09-24`.
Use a new disposable database for full-suite reproduction because legacy tests
retain named fixtures. Never run tests against hosted/customer data. Follow the
CI role bootstrap with separate DATABASE_URL/MIGRATION_DATABASE_URL,
TABLEUS_RUNTIME_DB_ROLE=tableus_runtime, ENVIRONMENT=test, demo auth and
deterministic providers; migrate head before make-ready.

No hosted CI, hosted migration, operator provisioning, paid provider/Auth call,
merge/push, deployment, native build/run, invitation or beta activation occurred.
Native task 01a0c678-55c8-7cc0-a3cb-e3200776906a remained active/inProgress in its
compact snapshot, with no newer final message. Its candidate/evidence and
September 30 dependency boundary remain separate; canceled scans stay canceled.

Local PostgreSQL shutdown is verified: pg_ctl reports no server (expected exit 3).
The task-owned cluster data and all prior logs are retained; no cleanup occurred.
