# N1-R2 stopped: encoded plus changed to a space

The owner [approved N1-R2](n1-r2-approval.json). Its exact prepared harness ran
once against application `ed8330a766b3c4b80a505e075535678394e275e9`, existing iOS
build `local-ios-test-ed8330a-2d-01`, and disposable simulator
`2408A54F-A1C5-4388-8B46-6A987FE3B578`. No application or harness correction was
applied during this attempt. The [result JSON](n1-r2-result.json) binds private
outputs, source matches and approval/proposal hashes.

## Observed failure

Demo Guest restoration passed. The first cold case stopped the app, opened
`tableus://join/<synthetic-plan-uuid>?token=a%2Bb%2Fc%3D`, displayed the join screen
within the five-second observation limit, and tapped Join once. At
2026-09-22 03:35:33.604803 UTC the local proxy received:

```json
{"share_token":"a b/c="}
```

Expected value: `a+b/c=`. The demo identity and plan path were correct; the
decoded token differed. The proxy refused the request before forwarding it and
stopped the sequence. The native app made one plan-list GET and this one blocked
POST. The backend log contains no join request. Thirteen synthetic plans and one
rotation had been prepared directly on the isolated fixture backend. Post-matrix
snapshot comparisons did not run and are not claimed.

The synthetic token is shorter than the API's minimum token length; the expected
API status would have been 422 after its body was checked. This case measures
encoding at the boundary, not a successful capability join. The application uses
canonical HTTPS links and generates URL-safe tokens, so this does not establish
failure of currently issued production links or a regression introduced by the
dependency replacement.

The other twelve cold cases, all warm cases and both export cycles remain
unexecuted. The driver stopped Maestro/backend/proxy and the disposable app was
terminated. Because the proxy stop interrupted Maestro during the tap command,
the cold flow has its live log but no completed command manifest or screenshot;
the API event and log are the evidence. No additional native attempt was made.

## Read-only diagnosis

An offline reproduction uses the exact retained Expo Router modules. All three
loaded module files match `sourcesContent` in the exact app's composed source
map. It reproduces the same `a+b/c=` → `a b/c=` corruption:

1. TableUs's native-intent hook leaves the `tableus:` URL unchanged.
2. Expo Router `fork/extractPathFromURL.js` reads `URLSearchParams` and rebuilds
   a custom-scheme query from decoded values without re-encoding them. `%2B`
   becomes a literal `+` in `join/…?token=a+b/c=`.
3. The active native router's `fork/getStateFromPath-forks.js` parses that query
   using `URLSearchParams` again, converting the literal plus to a space.

Canonical-HTTPS and relative-path controls preserve the plus in this offline
reproduction. They do not verify native HTTPS dispatch. The existing component
regression tests use `react-navigation/core/getStateFromPath` directly, skipping
custom-scheme extraction and the active Expo router fork. Their passing result
did not cover this route pipeline.

The offline probe also exposes a harness-oracle gap: the active fork returns
replacement characters for malformed UTF-8 (`%FF%41` → `�A`, `%E2%82` → `�`),
whereas the unexecuted harness cases expected the legacy query-string decoder's
retained escapes. These are offline observations only; those native cases never
ran. Do not adjust expectations to green without defining and checking the
intended malformed-input behavior through the real route and hook boundary.

## Status and next bounded work

Lifecycle/offline passes from N1-R remain valid for their exact bytes. This
attempt establishes a failing custom-scheme token-preservation case. N1 remains
incomplete. Canonical HTTPS/auth-mode coverage, the original debugger-run crash,
historical AppHang, remaining link/export checks and Android remain unresolved.
The app, map and receipt identities are unchanged; no new target crash report
was found through the result timestamp. No build, cleanup, hosted product request,
provider/OTP/canary allowance, telemetry, CI, deployment, merge or N2 action was
added. Android still requires all iOS gates and at least 40 GiB free.

[N1-F1](n1-f1-local-remediation.md) is a prepared request to implement and verify
a bounded local link fix. It includes no native rebuild or retry. N1-R2 explicitly
excluded an automatic application patch, so no app source has been changed.
