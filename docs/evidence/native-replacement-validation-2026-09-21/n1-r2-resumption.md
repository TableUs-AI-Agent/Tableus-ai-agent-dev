# Proposed N1-R2: remaining local joins and export cycles

**Prepared, not approved or executed.** This is a bounded resumption after the
[N1-R harness failure](n1-r-result.md), not a reset of consumed attempts or
acceptance of incomplete link coverage. The owner-approved
[N1-R plan](n1-ios-resumption.md) says to stop on the first failure and not repeat
automatically. Its lifecycle and offline runners passed and must not be rerun.

Use only existing inspected `test-ios.app`, build `local-ios-test-ed8330a-2d-01`,
application ed8330a, and disposable simulator
`2408A54F-A1C5-4388-8B46-6A987FE3B578`. Keep telemetry off, stripped credentials,
loopback-only deterministic providers and private evidence. Accepted devices,
application bytes, signing, profiles and all earlier evidence remain unchanged.

## Prepared correction

The private `n1-r-tools/links-resumption-01-proposed.py` removes the auth-screen
assertion and auth dispatch from both matrices. The prior cold auth dispatch is
consumed and is not repeated. It records auth presentation and canonical HTTPS
delivery as unverified, and writes to a new `test-ios-links-resumption-01`
directory with exclusive creation. It requires `TABLEUS_N1_R2_APPROVED=1` before
execution. Python syntax passed; it has not started a test or local service.

Harness SHA-256:
`bc661bd1e4630553e7e5f75f0dfddc746ba344802941976d8c5ff337b1ef2b71`.
The exact diff from the executed harness is retained beside it as
`links-resumption-01-proposed.diff`; both hashes are bound in
[the result JSON](n1-r-result.json).

## Authorized scope if approved

1. Recheck exact artifact/source and free loopback ports. Run the prepared join
   harness once. It restores Demo Guest and uses one cold and one warm matrix
   of the thirteen **unexecuted** join cases: encoded `a+b/c=`, Unicode,
   plus/space, empty, missing, duplicate, `%FF%41`, trailing percent, incomplete
   UTF-8, invalid UUID, encoded separator, rotated old token and current token.
   Each case has a separate local fixture. The proxy checks decoded API body,
   identity, response status and request count; plan snapshots must remain
   unchanged except the one intended current-token join. No hosted URLs are
   opened. URLs remain at most 2 KiB; each UI observation is bounded at five
   seconds. Retain all Maestro output and stop on the first failure, unexpected
   write or new target crash. No automatic repeat or application patch.
2. Only if that executable subset passes, perform the still-unused one cold and
   one warm Account export/share-dismissal/background/foreground/terminate/
   relaunch/Account-read cycle from original N1. Use normal Account and demo
   data. Resolve the disposable app PID explicitly and retain timestamped
   passive native main-thread samples around export and share dismissal, plus
   UI responsiveness and session-continuity observations. Inspect the first
   sheet's actual accessibility controls before canceling it; never send/share
   externally. Any >=2-second native stall, crash, blocked valid action,
   invalid session or unexpected provider request stops the sequence. Five
   seconds remains an observation cutoff, not a relaxed stall threshold.
3. Preserve outputs and report the observed subset. Canonical HTTPS/auth-mode
   coverage remains blocked and N1 cannot be declared complete. Prepare a
   separate concrete solution for those cases after the local subset; do not
   silently add instrumentation, real auth, a profile or a build.

After explicit approval, the prepared command is:

```bash
TABLEUS_N1_R2_APPROVED=1 /usr/bin/python3 \
  /Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/native-validation-2d/n1-r-tools/links-resumption-01-proposed.py
```

This adds no lifecycle/offline retry, debugger injection, build/rebuild, SDK
download, deletion, hosted navigation, real OTP, telemetry, provider/canary
allowance, cloud operation, CI, deployment, merge, N2 update or risk waiver.
Android remains blocked by incomplete iOS gates and 19.91 GiB free versus its
40 GiB floor. All previous budget and stop conditions persist.
