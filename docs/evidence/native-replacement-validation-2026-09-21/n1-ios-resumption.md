# Proposed N1-R: resume remaining deterministic iOS checks

**Prepared, not approved or executed.** [D1](d1-result.md) established runtime
app/route source-map usability. The earlier debugger-run crash remains unresolved;
this requests resumption after that stop, not acceptance of the crash or a new
build allowance. The [original N1 proposal](README.md) supplies the full matrix,
budgets and stop conditions; this amendment does not reset consumed attempts.

Use only disposable simulator `2408A54F-A1C5-4388-8B46-6A987FE3B578` and existing
`test-ios.app`, build `local-ios-test-ed8330a-2d-01`. Source remains ed8330a; no
rebuild, application change, reinstall on accepted devices or debugger-injected
profiler is included. Native evidence can use passive OS samples as originally
approved. Keep telemetry off and all product requests on the deterministic
loopback backend.

## Execution order

1. Recheck artifact/receipt/config and the recorded disposable device. The exact
   application workspace is clean at ed8330a. Prepare an ignored `backend/.venv`
   symlink to the existing `/Users/brianchei/repos/Tableus-ai-agent-dev/backend/.venv`;
   its Python 3.12.2 and FastAPI/Uvicorn/SQLAlchemy/aiosqlite imports are available.
   Recheck free loopback ports 7999–8001 and strip hosted/provider credentials
   from the runner environment. Retain private stdout/stderr and enforce the
   original 30-minute cap for each runner.
2. Run the existing lifecycle runner once. On success, run the existing
   offline/refresh runner once with all five refresh phases. Stop at the first
   failed runner; do not repeat to green or change application bytes.
3. Perform the original one cold and one warm synthetic link matrix, including
   malformed/Unicode/encoded-token cases and rotated-link rejection. Use only
   local delivery/fixtures; retain decoded boundary observations and verify no
   unauthorized writes. OS refusal or an unreachable parser case remains an
   explicit limitation, not a pass. No hosted navigation substitutes.
4. Perform exactly one cold and one warm local Account export/share-dismissal/
   background/foreground/terminate/relaunch/Account-read cycle, with timestamped
   passive native samples and observations. Any >=2-second stall, crash, blocked
   action, invalid session or unexpected provider request stops N1 immediately.
   Keep the original crash and AppHang reports; success applies only to the
   observed cycles, not historical crash clearance.

Run these commands sequentially from the retained exact application workspace:

```bash
RUN_ROOT=/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/native-validation-2d
cd "$RUN_ROOT/test-ios.diagnostics/workspace"
node scripts/mobile-device-preflight.mjs --platform ios \
  --device 2408A54F-A1C5-4388-8B46-6A987FE3B578 --boot true \
  --app "$RUN_ROOT/test-ios.app" --evidence "$RUN_ROOT/test-ios-device"
node scripts/mobile-e2e.mjs --platform ios \
  --device 2408A54F-A1C5-4388-8B46-6A987FE3B578 \
  --app "$RUN_ROOT/test-ios.app" --build-id local-ios-test-ed8330a-2d-01 \
  --evidence "$RUN_ROOT/test-ios-lifecycle"
node scripts/mobile-offline-e2e.mjs --platform ios \
  --device 2408A54F-A1C5-4388-8B46-6A987FE3B578 \
  --app "$RUN_ROOT/test-ios.app" --build-id local-ios-test-ed8330a-2d-01 \
  --evidence "$RUN_ROOT/test-ios-offline" --verify-plan-refresh true \
  --refresh-sha ed8330a766b3c4b80a505e075535678394e275e9
```

The runners retain their actual operator identity, ed8330a, separate from build
operator 16603dd and this evidence commit. Do not batch the next stage before
reviewing its predecessor. No extra debugger capture, automatic retry, native
build, deletion/cleanup, SDK download, live provider/OTP/canary, CI, deployment,
merge, upload, N2 update or acceptance-risk waiver is included. Android remains
unstarted until all iOS gates and its 40 GiB start floor pass; current space is
26.93 GiB. Preserve all devices and evidence.
