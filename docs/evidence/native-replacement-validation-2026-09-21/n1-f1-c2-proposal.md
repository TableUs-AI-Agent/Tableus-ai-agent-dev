# C2 — static tool identity, then the complete native campaign

Preparation only. [C1](n1-f1-c1-result.md) stopped before boot because its
`maestro --version` subprocess exceeded 20 seconds. Static inspection found that
the CLI initializes dependencies and schedules update work before recognizing
version-help. The actual stalled step remains unknown.

C2 checks the local version resource inside the exact hash-pinned CLI JAR without
running Java or Maestro for that purpose. Both stages retain the installed
launcher, five JAR and Xcode identity checks. The first actual CLI startup occurs
inside the instrumented flow, which retains its startup logs. This removes an
unnecessary initialization; it is not a proven remedy for JVM/XCTest stalls.
Assertions, timeouts and acceptance requirements are unchanged.

## One approval for both stages

1. One retained-target boot and explicit Settings launch; exact launch-PID and
   runtime/process binding; one Settings assertion/screenshot flow; owned cleanup
   and verified Shutdown.
2. Astra reviews the actual hash-bound screenshot for a visible Settings title
   and substantive content. The simulator remains shut down during review. The
   receipt also binds commands, logs, permission audit, process snapshots and
   the complete stage result. Blank or transitional output stops the campaign.
3. If those gates pass, fresh preflight and one second boot of the same target;
   one Settings launch to establish fresh binding, followed by its termination;
   one TableUs uninstall/reinstall and the complete eleven-flow offline suite
   with all five refresh phases; cleanup and evidence review.

Passing stages and root review need no additional user checkpoint. First required
failure stops further native stages, with cleanup and independent local analysis
still completed. No retries and no reuse of C1's unused conditional allowance.

| Item | Proposed allowance |
| --- | --- |
| Target | `0EFFA766-DCDD-49E5-84B0-D3593B68709A`, iPhone 17 Pro, iOS 27.0 / 24A434 |
| Application | `8972865893a3f018a064594457dc9cc664f8a61f` |
| Artifact SHA-256 | `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d` |
| Settings stage | 420s including 60s final cleanup; 240s flow including 30s owned cleanup |
| Offline stage | 2100s including 60s final cleanup; 1800s runner including 30s owned cleanup |
| Aggregate | 2520s (42 minutes) native operation time; offline image-review dwell excluded |
| Attempts | Two boots, two explicit Settings launches, one Settings flow, one full offline runner, zero launchctl queries, zero version CLI invocations, zero retries |
| Per-call/capacity | Settings launch at most 30s; host queries at most 5s; fresh 20 GiB minimum before each boot and UI run |

Both older retained targets must remain Shutdown. Fresh output directories and
exact manifest binding prevent overwrites. Unknown cleanup state fails the result.
The root screenshot review is a prerequisite, not a transferable application pass.

## Diagnostic mutations and limits

The offline stage includes resetting **TableUs only on this diagnostic simulator**:
one uninstall/reinstall and the first flow's `launchApp.clearState: true`. That
flow retains Maestro's default TableUs permission behavior. Settings has no
launchApp or permission command, and permission-operation markers fail its audit.
No Settings permission reset/revoke is authorized. Auxiliary XCTest setup is part
of the test. The Maestro CLI may schedule its own update fetch during actual flow
startup despite the supplied update-display suppression flag; no completed fetch
was established in C1. C2 does not patch the installed CLI.

Application traffic uses the local deterministic backend/fault proxy and demo
authentication. No live application provider traffic, paid evaluation, general
storage cleanup, device creation/erase/deletion, new build, merge, deployment or
store submission is included. Links, exports, Android and N2 remain separately
gated. iOS 26.5 runtime/lifecycle proof does not transfer to this iOS 27 target.

The [structured proposal](n1-f1-c2-proposal.json) binds the complete prepared scope,
checks, archive and operator commands. C1 failure evidence and all prior artifacts
remain immutable. Approval would grant this new finite campaign only.

## Verification and freeze

Four static identity fixture groups, 16 Settings operator mocks, nine offline
operator mocks, seven synthetic evidence checks and five setup-journal fixtures
pass. Identity mismatches block before boot; mocked success and failure paths
verify attempt limits and cleanup. One `make ready` passed with 296 JavaScript
and 98 backend tests, three PostgreSQL skips; contract checks show no drift.
The archived static source gate passed under a process/signal audit hook.
These are local harness checks, not native compatibility evidence.

All 56 C2 archive files and all 74 C1 preparation/execution files match their
hashes. C2 archive index:
`d2be61df14b6f57cf4c64c933dd1caa9e65fc3e968bd5c3ef68715629019b324`.
Settings manifest:
`627e8e21be83344ec78c3b13b316f0e8654aa92751d4276b0f6e480cc25d3336`.
Offline manifest:
`37f76e7acc996e4bde06e9cdde0fd9063a7d64a1abbd4adb53e658fd57ab631e`.
Durable archive:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/runtime-preparation-c2`.
