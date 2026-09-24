# F1-C1 — Settings baseline and full offline campaign

Preparation only. Previous native allowances are exhausted. This proposal seeks
one approval for both connected stages, their root review and cleanup. Passing
checkpoints do not require another user approval. Native validation stays in this
task, as requested.

## Outcome and stages

1. Boot the retained iOS 27 target once, explicitly launch Settings, bind the
   returned PID to its pinned runtime process tree, and run one assertion and
   screenshot flow. Require expected-app hierarchy evidence and no observed
   Settings permission-operation markers. Shut down and verify cleanup.
2. Astra inspects the actual hash-bound PNG for the Settings title and substantive
   content. Blank or transitional UI stops the campaign. The simulator remains
   shut down during review. A successful review receipt binds the result,
   manifest, screenshot, commands, logs and host snapshots.
3. With that receipt and fresh preflight, boot the same target once more, launch
   Settings once to establish a fresh target/process binding, terminate Settings,
   reinstall the exact frozen TableUs app, and run all eleven offline flows and
   five refresh phases once. Retain failure traffic and startup diagnostics,
   terminate owned processes and verify shutdown. No user checkpoint between
   passing stages.

The new PID binding replaces the launchctl query; it does not prove launchctl
health or repair the unresolved simulator stalls. [Retained-evidence analysis](n1-f1-c1-analysis.md)
separates observed failures from hypotheses. Application bytes and UI assertions
remain unchanged.

## Scope and limits

| Item | Proposed allowance |
| --- | --- |
| Target | `0EFFA766-DCDD-49E5-84B0-D3593B68709A`, iPhone 17 Pro, iOS 27.0 / 24A434 |
| Application | `8972865893a3f018a064594457dc9cc664f8a61f` |
| Artifact SHA-256 | `98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d` |
| Stage 1 | 420s, including 60s final cleanup; one 240s flow including 30s owned cleanup |
| Stage 2 | 2100s, including 60s final cleanup; one 1800s runner including 30s owned cleanup |
| Aggregate | At most 2520s (42 minutes) of native operation time; offline root image-review time excluded |
| Attempts | Two boots, two explicit Settings launches, one Settings flow, one full offline runner, zero launchctl queries, zero retries |
| Individual checks | Settings launch at most 30s; host process query at most 5s; at least 20 GiB free before each boot and UI run |

Both older retained targets must remain Shutdown. Each stage uses a fresh output
directory and exact manifests; no output overwrite or implicit retry is allowed.
First required failure stops subsequent native actions except owned cleanup.
The agent then completes evidence review and any independent local fixes within
the existing objective. Unknown cleanup state fails the result.

Stage 2 explicitly includes uninstall/reinstall of **TableUs on this diagnostic
simulator**, which resets its local app data. It uses demo authentication, local
backend/proxy fixtures and deterministic providers. The first flow also uses
`launchApp.clearState: true`. Its inherited launchApp behavior can invoke
Maestro's default permission grants for TableUs; that behavior
is included in this proposed scope. The Settings flow omits launchApp and
permission commands. No Settings permission reset/revoke is proposed. Maestro
may start/restart its auxiliary XCTest runner as part of either stage.
The [P4 installed-JAR review](n1-f1-p4-proposal.json) documents the permission
behavior; both stages pin those same installed tool inputs.

No device erase/delete/create, general storage cleanup, new app build, live
provider traffic, deployment, merge or store submission is included. Retain
existing data outside the specified diagnostic app reset, frozen artifacts and
all attempt evidence. Passed Settings/offline diagnostics do not transfer iOS
26.5 runtime/lifecycle acceptance to iOS 27. Links, exports, Android and N2 remain
outside this campaign because their same-runtime prerequisites are unresolved.

## Verification and immutable inputs

The [structured proposal](n1-f1-c1-proposal.json) records the exact manifests,
archive hashes, checks and execution environment. Source, build-operator and
preparation/evidence identities remain separate. Approval applies to those exact
inputs and finite allowances, not an open-ended simulator retry budget.

Preparation passed five pure binding fixture groups, 15 Settings operator mocks,
eight offline operator/transition mocks, seven synthetic evidence integration
checks and five setup-journal fixtures. The mocks include one complete second-stage
invocation, early binding failure and cleanup failure. These validate the harness;
they do not establish native compatibility. One `make ready` passed: 295 JavaScript
and 98 backend tests, three PostgreSQL skips; contract check found no drift.
Review caught and replaced a stale second-stage XCTest helper with the repaired
T2 helper before the final freeze. No application source changed.

All 56 private archive files were verified, and the archived Settings source gate
passed without native approval or execution. The prior P4 archives' 37 files still
match their hashes. C1 archive index SHA-256:
`b9659fb42a7f2ecf7c241c7455ea180a0d9a20da8fdf8d7af4522fe52e9c2bd8`.
Stage 1 manifest:
`1c0d637fc6e8a5a2e9951b0e3c412e5cb576c3128ebaba8e551006877f026c18`.
Stage 2 manifest:
`7a2a24b2626c231b88cd6005b3835973d6e93d2eb36f125e017e83d196fa2b86`.
Durable root:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/runtime-preparation-c1`.
