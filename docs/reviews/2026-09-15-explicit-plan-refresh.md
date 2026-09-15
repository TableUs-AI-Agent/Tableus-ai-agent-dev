# Plan scrolling, explicit refresh and vote feedback

Local candidate on `codex/plan-refresh-controls`, based on
`25e0397d7803651d39968f53868a2b73845817c3`. That base's application file matches
the installed `6b9719b4e63e34803f2e7c2598e45851790df661`. The correction has not
been compiled into a native artifact or deployed. Exact source identity will be
recorded at freeze. All local readiness targets now pass.

## Report and evidence correction

The owner reports that a vote from the previous session was already displayed;
they did not deliberately vote. They also report persistent loading while the
plan was open and repeated refresh when swiping down to scroll up. An accidental
pull gesture is possible. No further gesture reconstruction is required.

The [Android trace](../evidence/replacement-6b9719b/android-request-observation.json)
still establishes one join, one vote write and five successful detail reads.
Seven hydrated responses consumed 28 Places attempts against the expected 12.
The server write remains evidence, but it does not establish deliberate owner
intent. The [owner record](../evidence/replacement-6b9719b/android-owner-observations.json)
therefore no longer marks the intentional voting phase passed. No counters or
server events were removed.

## Local findings and correction

The old plan screen mounted a native `RefreshControl` and passed each refresh
callback directly to `plan.refetch`. Its spinner used `plan.isRefetching`, which
also covers automatic query refreshes. React Native documents the downward gesture
at the top of a scroll view as the refresh trigger; the component's spinner is
controlled by the application. [React Native reference](https://reactnative.dev/docs/refreshcontrol).

The installed TanStack Query implementation defaults `cancelRefetch` to true:
a second callback cancels the active query and starts another. The plan query
does not forward a cancellation signal to its API call. In a component test with
a delayed response, the two callbacks therefore invoked the API twice: three
total detail reads including initial load, where two were expected. This is a
reproduced overlapping-request defect, not proof of the native gesture frequency.
The documented false setting reuses a running request.
[TanStack reference](https://tanstack.com/query/latest/docs/framework/react/reference/interfaces/RefetchOptions).

The correction removes the plan's pull-to-refresh control and provides an
accessible `Refresh plan` button. The button is disabled while a query is fetching;
callbacks already queued before the disabled state propagates share the existing
read via `cancelRefetch: false`. Its spinner tracks only the manual operation and
clears in `finally`. The button is outside the loaded-plan conditional so a failed
initial request can be retried. Offline refresh still preserves cached data and
shows the existing offline message. Visible return/foreground/reconnect behavior
and hidden-route query unsubscription are unchanged.

The old `Ranked vote saved.` message was driven solely by `current.my_vote`, so
a previous vote appeared as a current success without a PUT request. The new
screen distinguishes previous saved votes, unsubmitted edits and a successful
current mutation. Mutation responses still update the cache without an extra GET.
The mutation endpoint, idempotency, ranking semantics and authorization are unchanged.

## Validation and limits

Before the correction, the five existing plan tests passed and the two new
regressions failed: overlapping manual reads and previous-vote success feedback.
After the correction, nine focused component tests pass. They cover slow manual
overlap, a queued manual callback during foreground loading, initial/manual
failure recovery, offline/reconnect, navigation/foreground request counts and
vote state. The actual query providers and mutation hook are used with fixture API
responses. Queued callback tests wrap the real button to capture its handler;
the rendered UI and query behavior remain under test.

These Jest tests use the repository's existing mocked native environment. They
do not run Android's gesture recognizer and cannot prove the reported endless
spinner or attribute all four extra live reads. No Security Scan, live provider
call, sign-in message, native build or deployment was used for this correction.
The six accepted native artifacts and existing source-review acceptance remain
bound to 6b9719b. Cumulative acceptance remains incomplete.

[Local validation](../evidence/plan-refresh-controls/local-validation.json) records
216 JavaScript and 98 Python passes, with three Postgres-only checks skipped.
Lint, type checking, contract generation, Next.js and Expo-web builds, deterministic
smoke and the report-only performance baseline pass. The initial `make ready`
passed lint/types but stopped on `listen EPERM` when the fault-proxy test opened a
loopback port. With local-listener access, `make test contract build smoke perf`
completed the remaining targets; passing lint/types were not repeated. Both logs
and the failing-before/passing-after component outputs are retained privately,
with their hashes in the public validation record. This is not a native build or
a fresh hosted CI/browser test result.

## Next verification boundary

After the local candidate is frozen, prepare its source-impact review and a
bounded execution request before native builds or deployment. First verify on
isolated deterministic devices: repeated upward/downward scrolling and overscroll
produce no detail reload, an explicit refresh makes one read, a delayed request
does not restart, and the indicator ends after success/failure. Preserve the saved
live-account devices. Then scope only the required source-bound readiness and
telemetry evidence, with a fresh calculation of remaining provider operations.

The existing run is paused at 60/80 Places attempts, three of four messages and
zero new generation. Its prior remaining plan requires 36 attempts against 20
available. No larger allowance is approved. Do not resume the frozen run or
silently transfer its acceptance to the correction. Production, store release,
dependency updates and broader refresh/data architecture remain deferred.
