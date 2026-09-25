# Shared-content deletion implementation evidence

Application: `72c592b511bba6b74bba2521524c6111b9cf5916`.
Verification source: `390cd2f7531dbc955317556b3693546ee3eadead` (test assertion only).
[Machine-readable results](results.json), [source/artifact hashes](manifest.json),
and [handoff](../../handoffs/2026-09-25-deletion-content.md).

One `make ready` invocation passed lint/types then stopped on the pre-existing
six-action mobile assertion after this change added two recoverable actions.
The correction checks all eight actions and explicit keys on their own lines.
`make test contract build smoke perf` then passed all remaining stages. This is
completed readiness with a recorded repair, not a claim that the initial command
exited successfully. No second full readiness invocation was run.

## Scope and observations

- 214 Python tests on restricted-role PostgreSQL, zero skips. New tests cover
  both generation/deletion orderings, overlapping deletions, private provenance
  grants, historical dependencies, independent surviving runs, legacy unknowns,
  metadata repair, exports and both deletion endpoints' stale response fencing.
- 313 JavaScript tests, zero skips, including 71 rendered mobile component tests.
- Three mocked Chrome journeys pass against the production Next build: metadata
  repair before generation, refresh after stale 409 without duplicate mutation,
  and ignoring an obsolete location result after the query changes.
- Fresh migration reaches `9a1f2e7c4b80`. Separate populated predecessor upgrade
  preserves old rows and marks unknown provenance; no bulk cleanup is performed.
- Generated contract is unchanged after export. Next build, Expo web export,
  deterministic smoke and report-only chunk-size measurement pass.
- Review found a race across awaited lock release in the response middleware;
  the final generation check now occurs after release, with two regression cases.

Private logs/build outputs remain under the worktree paths in the manifest.
`make-ready.log` retains the first failure; `ready-remaining.log` records the
successful continuation; `production-browser.log` records the final browser run.
Source-import identity was checked after cloning the Python environment and
correcting its editable path to this worktree. Reused dependencies are not reused
application build evidence. No real providers or native devices were involved.

Full readiness environment: `ENVIRONMENT=test`, deterministic/demo auth/providers,
telemetry off, empty Sentry/PostHog values; database role `tableus_runtime` with
separate local migration administrator on `127.0.0.1:55937/tableus_content_ready`.
The isolated database has synthetic data and loopback-only access. The production
browser config in the manifest starts `npm run start` on 3404 and mocks API routes.
Both ports were verified closed after task-owned service shutdown. Retained files
and data were not deleted. Warnings were existing Alembic config deprecation,
color-environment and unconfigured local Sentry notices, not failed acceptance.

These checks do not prove hosted privileges, legacy remediation, native behavior,
real Auth removal, provider/backup retention, distributed acceptance or measured
performance. Prior native/staging evidence retains its original SHA and limits.
