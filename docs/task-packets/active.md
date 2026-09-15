# Active packet: staging verification of the refresh correction

## Status and objective

Owner accepted the exact source review and approved execution on 2026-09-15. The authorized deterministic
local objective is complete. Carry the proven refresh correction into existing
staging and saved native devices, then finish the source-bound cumulative report.
Use one primary agent. This is the only active implementation packet.

The concrete [execution request](../evidence/plan-refresh-staging-2ad48a8/README.md)
is approved; [the decision](../evidence/plan-refresh-staging-2ad48a8/execution-approval.json)
binds the original plan and source report. Execute its bounded staging scope.

Hosted staging and Preview now pass the [deployment checks](../evidence/plan-refresh-staging-2ad48a8/deployment.json)
at exact source 2ad48a8. CI passes 216 JavaScript, 101 Python and four browser
tests. Production and protection are unchanged. Both CORS origins and canonical
associations pass; the configured provider backstop is 409, aggregate 329, and
new-run usage is zero. Xcode requires owner completion of license/setup prompts;
no native build has started. After that user action, repeat host/resource preflight,
then build and inspect `readiness-ios` first under the existing approval.

## Completed prerequisites

- Application source: `2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`, published on
  `codex/refresh-2ad48a8`; CI and existing hosted deployment checks pass.
- Operator branch: `codex/plan-refresh-verification` in `plan-refresh-controls`.
- Both [deterministic native records](../evidence/plan-refresh-verification-2ad48a8/README.md)
  pass inspection, lifecycle, offline recovery and all refresh phases. Scrolling
  makes zero reads/writes; delayed repeated taps make one request; explicit
  recovery makes one read. Votes remain unchanged. Fourteen screenshots reviewed.
- iOS operator: `cced1728628d594c1e957f9efc48a03428fa8f4a`. Android lifecycle:
  `62bef563373e64de144c1998c73d87dc3d18c7b3`; accepted offline/refresh:
  `ec909733c0242b7a10737dc0dda0402f5d5aa87e`. The accepted APK was never rebuilt
  for the three retained operator failures.
- Latest full readiness: 220 JavaScript and 98 Python passes, three Postgres
  skips. Later YAML-only input/navigation changes pass parsing and actual native
  execution. Both new test devices are stopped and retained; test ports closed.
- The [focused source review](../evidence/source-review-2ad48a8/README.md) validates
  fourteen source hashes/seven areas and transparently carries eleven unchanged
  controls. Exact owner acceptance now validates; no Security Scan is required.
- All four remaining native profile inputs pass preflight; no build has started.

## Approved execution

Publish/CI/deploy the frozen
source only to existing staging/Preview targets. Reuse the two test artifacts;
build the four remaining profiles sequentially and inspect before installation.
Verify saved sessions, links, deliberate voting, organizer finalization/reopening,
rotation, export/read-only deletion readiness, foreground/hidden-route/scroll/manual
refresh behavior, both directions of real surviving-session refresh, and delivered
source-bound telemetry. Assemble only genuine current-source cumulative evidence.

Approved caps: 80 additional Places attempts, four new sign-in messages, zero
Gemini generations, five events per telemetry provider and four native builds.
These limits are binding. Reconcile the fresh read-only provider baseline first
and track an independent new-run ledger. The linked request defines allocation,
backstop, stop conditions and staging-only rollback scope.

## Preserved state and boundaries

The older live run stays paused at 60/80 Places attempts, 3/4 messages, zero new
generation and three of five canaries per provider; its historical backstop was 349.
The latest recorded aggregate is 329 and the approved current backstop is 409.
Saved staging devices remain on 6b9719b; hosted staging now serves 2ad48a8.
Preserve their accounts, artifacts, helper state and partial
checklists; do not use newer-source answers to finish older checklists.

The owner denied deliberate Android voting and described persistent loading while
scrolling. Preserve the observed server write, but do not count it as intentional
owner voting. Do not request another reconstruction of gestures.

No production deployment, stores, cohorts, new resources/secrets, migration,
destructive cleanup or Security Scan is authorized. The two new local test
devices remain retained. The source-review policy explicitly requires new
matching acceptance when a source/report changes.
