# Active packet: deterministic native refresh verification

## Objective and authority

Verify the frozen plan-refresh correction on isolated local iOS and Android test
artifacts. The owner's request to continue advances the device-verification step
identified in the previous handoff. This is the only active implementation packet.
Use one primary agent, two sequential local test profiles, fixture providers,
demo identities and telemetry off. Existing signed-in devices stay preserved.

This local testing authority does not accept the new staging review, authorize
hosted deployment or other four native profiles, increase paid limits, send
sign-in messages or remove persistent devices. Live verification remains paused.

## Source and prepared evidence

- Application: `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`, frozen locally.
- Operator branch: `codex/plan-refresh-verification`, in the isolated
  `plan-refresh-controls` worktree. Build from an exact clean detached application
  checkout; execute the new flows from the separately identified operator source.
- [Execution plan and phase expectations](../evidence/plan-refresh-verification-2ad48a8/README.md).
- [Application regression findings](../reviews/2026-09-15-explicit-plan-refresh.md):
  component tests reproduced overlapping reads and ambiguous previous-vote success.
- [Focused staging source review](../evidence/source-review-2ad48a8/README.md):
  fourteen file hashes and seven areas validate, with eleven control files
  unchanged. Owner acceptance of this exact report remains pending for staging.
- [Existing replacement evidence](../evidence/replacement-6b9719b/README.md)
  remains bound to `6b9719b4e63e34803f2e7c2598e45851790df661`.

Candidate local readiness passed 216 JavaScript and 98 Python tests, with three
Postgres skips. New operator tooling passes one `make ready`: 219 JavaScript and
98 Python tests, three Postgres skips. Four focused probe/evidence tests and YAML
parsing for all five new flows pass. Both profile input preflights pass. None of
these preparation checks establishes native execution acceptance.

The [iOS result](../evidence/plan-refresh-verification-2ad48a8/ios-deterministic.json)
now passes actual artifact inspection, lifecycle, offline and all five refresh
phases under operator `cced1728628d594c1e957f9efc48a03428fa8f4a`. Seven screenshots
were reviewed. Its test simulator is stopped/retained and all three local service
ports are closed. Android is the remaining local phase. Before it starts, the
operator flow incorporates the previously verified scroll to the finalization
retry control; all existing assertions and application bytes remain unchanged.

## Execution order

1. Build `test-ios` as `local-ios-test-2ad48a8`; inspect the actual artifact,
   checksum, embedded source, simulator platform and source-bound receipt. Retain
   build logs, artifact and receipt in durable private storage.
2. Create only the new `TableUsRefresh2ad-iOS` simulator and record its returned
   identifier. Run deterministic lifecycle, then offline plus explicit refresh
   verification. The latter validates local app configuration before installation.
   It requires zero app writes, exact phase read counts, observed delay/error
   injection, unchanged prior vote and three screenshots. Stop and retain this
   simulator when done, including on a failure.
3. Only after iOS passes, build/inspect `test-android` as
   `local-android-test-2ad48a8`. Create the new private
   `TableUsRefresh2ad_Android` emulator with four cores and 2 GiB memory.
   Run the same lifecycle/offline/refresh phases, then stop and retain it.
4. Preserve failed attempts and investigate before preparing any retry. Do not
   recompile an accepted artifact merely to repair operator flow navigation.
   A real application change requires a new frozen source and matching evidence.
5. Record actual application and operator identities separately, update the four
   current documents, and hand off the observed results and remaining boundaries.

The refresh extension is opt-in through `--verify-plan-refresh true --refresh-sha
<application-sha>`. It rejects hosted controls, a different embedded SHA and
telemetry enabled. Its proxy counts all app writes, not only votes. Retain private
flow diagnostics on success and failure. No fabricated native pass is permitted.

## Resource and live-state boundaries

Builds run one at a time with at least 20 GiB free at start and stop below 9 GiB.
Do not start another build while any native stage is running or a prerequisite
has failed. Raw logs remain private. Stop on failed inspection or resource guard.
No cleanup of persistent test devices is authorized by this continuation.

The older live run is paused at 60/80 Places attempts and 3/4 sign-in messages,
zero new generation and three of five canaries per provider. Its backstop remains
349. Twenty Places attempts remain against an old allocation of thirty-six.
This local fixture verification spends none of that allowance. Preserve the
saved iOS simulator, `TableUs_API_36`, physical iPhone state, local helper, six
accepted old artifacts and partial readiness runners. Do not feed pending
readiness prompts or treat a new sign-in as proof of session survival.

The owner denied deliberate Android voting and reported the old saved vote plus
persistent loading during scrolling. Preserve the observed server write while
withdrawing intentional voting acceptance. Do not ask for another gesture
reconstruction; the new local test measures that behavior directly.

## Next boundary

After the two deterministic device phases, prepare the required hosted/native
execution request and matching source-review acceptance for the corrected source.
The source-review policy explicitly requires new acceptance when a source/report
changes; a Security Scan is never automatic. Production/privacy/retention, scaling,
stores, cohorts and native tab polish remain later objectives.
