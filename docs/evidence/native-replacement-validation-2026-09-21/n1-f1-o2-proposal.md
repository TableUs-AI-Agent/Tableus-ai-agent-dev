# F1-O2 — resume the offline diagnostic with host monitoring

**Prepared only; unapproved and unexecuted.** [P2](n1-f1-p2-result.md) passed
three Settings flows with the revised host observer. O1's platform crash and the
original TableUs refresh failure remain unresolved. This amendment requests
**one additional offline/refresh run, at most 30 minutes**, with conditional
continuation through the existing link/export scope after each preceding gate
passes. It does not repeat the Settings probe or build the application again.

## Exact scope

Use application `8972865893a3f018a064594457dc9cc664f8a61f`, build
`local-ios-test-8972865-f1-01`, artifact
`98c1535bfe6f7cad0c8e467454f5128c71f4aae21b8b41a5aba1c1a33f1e391d`
and disposable simulator `CBB4FAB4-734C-413C-9F10-850329AC9A01`. Build operator
`16603dd0cf36d27b492e57a02d3c6c438a2563c4` remains unchanged. Require fresh
artifact/source/receipt inspection, exact clean frozen workspace, matching passed
D2/lifecycle/P2 records, idle local ports, stopped target, fresh output and at
least 20 GiB free before running.

The prepared operator preserves O1's eleven flows, five refresh phases, fault
counts, UI assertions, observation timeouts and durable request/control journal.
Runner changes are O2 provenance labels and approval gate only; the fault proxy
is byte-identical. The driver binds SpringBoard and its simulator parent before
launch, then observes host process identities and new target crash reports during
the run. Normal TableUs launches are expected. It stops on the first application
or platform failure, changed simulator identity, timeout or interruption. No
automatic retry, foreground workaround or restart after a SpringBoard crash.

The offline runner may reinstall only this exact disposable TableUs app, as in
O1. It uses local deterministic/demo services with live credentials and telemetry
disabled. Keep every old attempt untouched. Preserve failure counters before
service cleanup where possible; the append-only journal survives interruption.
Reserve 30 seconds within the 1,800-second bound for cleanup. Terminate the
disposable app on failure and verify services/process cleanup.

The [structured proposal](n1-f1-o2-proposal.json) pins the operator and prerequisite
adapters. Fresh output:
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/8972865893a3f018a064594457dc9cc664f8a61f/native-validation-f1/test-ios-offline-f1-o2`.
The separate execution gate is `TABLEUS_F1_O2_APPROVED=1`.

## Conditional continuation

After O2 returns, root reviews all eleven command records, all five refresh
phases and settled observations, identity/provenance, request journal and platform
health before using the immutable O2 result as the downstream prerequisite. An
operator exit alone is insufficient. Earlier failed results remain failures.

If that review passes, continue the already-authorized once-cold/once-warm custom
scheme matrix (22 cases per mode, 44 total, at most 30 minutes), then **exactly
two** local Account export/share-dismiss/background/foreground/relaunch/read
cycles, only after their predecessors pass. Preserve token/body oracles, blocked
invalid writes, local demo identity, one app export GET per cycle, private file
validation and passive native main-thread evidence. A measured native stall of
at least two seconds, blocked valid action, crash, missing required evidence,
unexpected traffic or failed command stops the sequence immediately. Never choose
an external share destination or repeat an export tap. Runtime selector
observation and root review remain part of implementation, not another routine
approval gate.

This rebinds the unused downstream scope to a fully verified O2 result. It adds
only one offline attempt and does not grant retries of failed link/export cases.
No additional LLDB/Hermes capture, lifecycle run, native build, cleanup, SDK change,
canonical/auth/physical probe, provider/OTP/canary use, deployment, merge or store
submission. Android still waits for all iOS gates and fresh 40 GiB capacity;
N2 and closed live budgets remain unchanged. No historical crash/AppHang clearance
or cumulative N1 acceptance follows merely from a passing local replay.

The new allowance is required because the owner-approved
[resumption](n1-f1-resumption-approval.json) and [O1 amendment](n1-f1-o1-approval.json)
retain the first-failure stop and prohibit automatic retries. P2 authorized only
its now-completed Settings diagnostic.
