# N1-R result: lifecycle/offline passed; link harness stopped

Recorded September 22, 2026 UTC after [N1-R approval](n1-r-approval.json).
Application `ed8330a766b3c4b80a505e075535678394e275e9`, build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4`, and inspected iOS artifact
`fda161a75d1d895ef88e3530847d9b7dde5dad3a5f1f01680c9ea0c06c9db0b9`
are unchanged. The lifecycle/offline runners came from exact application ed8330a.
Auxiliary log-retention and link harnesses have separate hashes in the
[machine-readable result](n1-r-result.json); they are not the build operator.
The commit containing this report is the evidence commit.

## Completed observations

| Check | Fresh result |
| --- | --- |
| Lifecycle, one invocation | Passed in 378.973 seconds; all seven flows completed. Two participants, four candidates, voting, finalize/reopen, rotated-link rejection, stale recommendations/votes cleared. |
| Offline/refresh, one invocation | Passed in 308.743 seconds; all eleven flows completed. Create and finalize each used two same-key requests with one resulting plan/finalization event. |
| Offline constraints | Zero queued requests while offline; one explicit recovered request. |
| Five refresh phases | Initial 1 read, scrolling 0, intentionally delayed refresh 1, failed refresh 3 synthetic 503s/0 upstream reads, recovered refresh 1. No writes; prior vote unchanged. |
| Artifacts and diagnostics | App checksum unchanged; source/Hermes/map associations retained; seven result screenshots plus detailed Maestro logs retained. No new target crash report through the result timestamp. |

The deliberate two-second network delay is a transport fixture, not evidence of
a native UI stall. These checks do not clear the historical AppHang or D1's
earlier debugger-run crash.

## Stop and diagnosis

The local link harness switched to Demo Guest successfully. Its first cold case
then stopped the app, dispatched `tableus://auth?mode=sign-in`, and incorrectly
expected `Welcome back.` within five seconds. Maestro returned a failed assertion
after 5,680 ms including overhead. The screenshot and accessibility hierarchy show
the Plans screen. The exact retained `_layout.tsx` puts auth behind
`Stack.Protected guard={!auth.approved}`; the demo actor was already approved.
This operator assumption was invalid. The observed screen is consistent with
the guard and does not establish an application regression or auth-mode parsing.

The failed openLink command took 2,167 ms. Command duration includes automation
and launch work; no passive main-thread sample was captured here, so it is not
evidence of a qualifying native stall. No new native crash report was found.
The app made two `GET /api/v1/plans` requests and zero writes. Thirteen synthetic
plans and one token rotation were prepared directly on the ephemeral loopback
fixture backend; no join case executed. Warm links and both export cycles remain
unstarted. The driver stopped its backend/proxy; the disposable app was terminated.
No runner was repeated, and no accepted device or session was operated.

The simulator's signed entitlements dictionary is empty. Canonical HTTPS auth,
join, wrong-origin and web-only auth-confirm cases were not delivered: no local
forced dispatch avoiding hosted navigation was established. This is a coverage
limitation, not observed OS refusal or parser rejection. Custom-scheme results
cannot replace that evidence. Auth-mode presentation is additionally unobservable
with the approved demo actor, regardless of the incorrect assertion.

## Retention, verification and next step

The private root remains
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/native-validation-2d`.
The result binds 200 private files: driver results, summaries, screenshots,
command metadata, logs, source associations and the proposed correction. Failed
evidence and original runner outputs are retained. This change is documentation
and evidence only; reuse 2c's 24 focused checks, `make ready` (244 JS / 98 Python,
three PostgreSQL skips) and contract drift. Fresh checks cover evidence hashes,
all eighteen passed flow command sets, exact source, JSON, links and diff scope.

[N1-R2](n1-r2-resumption.md) is prepared, not approved or executed. It removes
the impossible auth-screen assertion without relabeling the failed attempt and
proposes only remaining join checks and export cycles. Passing that subset would
still leave canonical/auth coverage open. N1 is incomplete; N2 remains gated.
One iOS build is consumed, Android's attempt is unused. Fresh free capacity is
19.91 GiB versus Android's 40 GiB start floor. No cleanup, new build, telemetry,
hosted product request, OTP/canary, live provider allowance, CI, deployment or
merge was added or performed under this approval.
