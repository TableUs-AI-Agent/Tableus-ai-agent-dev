# F1-O1 — proposed offline diagnostic amendment

**Prepared only; not approved or executed.** The [first F1 offline attempt](n1-f1-runtime-result.md)
failed while waiting for the configured refresh-error message. Its failed-phase
request counters were lost during cleanup, so the cause remains unresolved.
The requested extension is **one additional offline/refresh attempt, at most
30 minutes**, on the existing F1 application and disposable simulator. No native
build, application change, repeated lifecycle run or additional diagnostic
sampling capture is requested.

The prepared operator copies preserve the frozen runner's flow logic, eleven Maestro flows,
three-error fault configuration, UI assertions and observation timeouts. They
add durable backend/proxy logs, timestamped request/control events without
headers or bodies, and a counter snapshot before services stop on a flow failure.
Logging can add overhead; measured timings retain that instrumentation context.
A separate driver enforces approval, exact source/artifact bindings, a fresh
output directory, crash monitoring and timeout/cleanup. The preparation is
verified against pinned source hashes; exact prepared hashes and checks are in
the [manifest](n1-f1-offline-amendment.json).

## Scope and execution order

1. Record owner approval for this exact amendment. Recheck artifact/receipt,
   clean frozen workspace, matching passed D2/lifecycle proof, installed
   disposable simulator, free loopback ports and private output collision.
   Preserve the original failed directory and all earlier diagnostic attempts.
2. Run only the prepared F1-O1 offline/refresh operator, once, using the exact
   `8972865893a3f018a064594457dc9cc664f8a61f` app, build
   `local-ios-test-8972865-f1-01`, artifact
   `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`,
   on `CBB4FAB4-734C-413C-9F10-850329AC9A01`. The existing runner reinstalls only
   this disposable app; accepted native devices and their sessions are untouched.
   Use local deterministic/demo services, stripped live credentials and telemetry
   off. Retain every log and failed output privately.
3. Stop on the first new native failure, crash, unexpected behavior or time limit;
   no automatic retry. Save failure counters before local services stop where
   possible; the append-only proxy journal remains if the runner is interrupted.
   Terminate the disposable app on failure. Review actual event order against
   the Maestro tap and assertion timestamps; do not infer an error cause merely
   because the second run passes.
4. If all eleven flows and all five refresh phases pass with exact identities,
   record a separate O1 result. Amend only the downstream prerequisite paths to
   that immutable result; never overwrite or relabel the earlier failed run.
   Continue the existing once-cold/once-warm F1 custom-scheme matrix, then exactly
   two Account export/share-dismiss/background/foreground/relaunch/read cycles
   only after their predecessors pass, under the original first-failure stop.

Private proposed output:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-offline-f1-o1`.
The output must not exist before execution. Preparation files are independent
operator copies; the clean detached application workspace remains unchanged.

## Unchanged boundaries

This extension adds one offline attempt only. D2 is consumed; no additional
LLDB/Hermes capture is authorized. The original AppHang, prior debugger crash,
first diagnostic timeout and failed offline run remain retained and unresolved
unless new evidence specifically explains them. A passing local run is not
historical crash clearance or cumulative N1 acceptance.

Android still waits for all iOS gates and fresh 40 GiB capacity. Canonical HTTPS,
auth presentation, physical association probes, N2/readiness updates, deployments,
merges, stores, destructive cleanup and closed live budgets retain their separate
gates. No new provider, OTP, telemetry or hosted request allowance is requested.

The pause follows the owner's approved
[resumption record](n1-f1-resumption-approval.json), which sets
`stop_on_first_native_failure: true` and `automatic_retry: false`.
