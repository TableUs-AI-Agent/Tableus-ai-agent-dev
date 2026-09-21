# Handoff: staging closeout → dependency/toolchain exception

Use the exact commit containing this handoff as the new task's implementation
base. Resolve it with `git log -1 --format=%H -- docs/handoffs/2026-09-21-staging-closeout.md`
in `.worktrees/staging-closeout`; the final task response also records the SHA.
Branch: `codex/staging-closeout`. Do not start implementation from stale `main`.
The old worktrees and uncommitted evidence are preserved; no merge/push is implied.

## Completed outcome

Cumulative isolated-staging acceptance passes for application
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`. Same original Android session renewed
after iOS simulator sign-out, final provider totals are reconciled, six retained
artifacts/source review validate, hosted IDs remain active/READY, public readiness
and association digests match, and the cumulative validator passes.

The owner explicitly accepts the unexplained simulator AppHang as an isolated
staging risk, requiring symbols and a focused check before distribution. It is
not fixed. [Evidence matrix](../evidence/ios27-staging-f94a1d9/closeout.md).

Fresh checks in this objective: `make ready` (226 JavaScript, 98 Python, three
local PostgreSQL skips), source/artifact/report hashes, generated contract drift,
links/JSON, authenticated read-only database/deployment checks and the cumulative
validator. Original candidate CI/browser/native journeys retain their provenance;
no new native build, paid call, sign-in or canary ran in closeout.

## Next objective

Assess and resolve the developer-toolchain exception that expires September 30
or before production. Use one primary agent and one isolated `codex/` branch for
the new task. Replace `docs/task-packets/active.md` with this bounded objective
after inspecting the branch/source state; read the other three concise current
documents. Do not replay the previous long conversation.

1. Determine the locked dependency graph and original exception, then obtain
   current advisories and official compatible-patch guidance. Distinguish shipped
   runtime reachability from development/build tooling; preserve machine-readable
   findings and relevant dependency paths without starting a Security Scan.
2. Prepare the smallest compatible remediation or an explicit justified
   disposition. Routine local compatible fixes are authorized. Escalate material
   SDK/framework/provider changes or a proposed extension of the exception.
3. Run focused meaningful regressions and `make ready` once for the final code
   change. A new application candidate needs its own review/affected release
   evidence; never relabel f94a1d9 artifacts. Do not build native profiles or
   deploy merely to perform dependency assessment.
4. Commit the bounded result, checks, remaining risks and next handoff. Merging
   and release actions retain their explicit gates.

## Preserved limits and later work

Final run: Places 92/100 from baseline 329; emails 2/4; explicit telemetry 6/6
per provider; new Gemini 0/0. These are the closed run's limits, not a new
evaluation budget. No new scan, resource, secret, deployment, migration, native
build, destructive cleanup, account deletion, store or cohort action is authorized
by this handoff. Artifacts remain under the root checkout's private
`.artifacts/mobile/f94a1d9d1125e6c9111aa08eda496f014f20d0c0/`.

Later objectives: Auth/application deletion and retention; cohort quotas/invites
and capabilities; production trust/signing/symbolication and tab presentation;
TestFlight/Play verification; bounded cohort activation. Their criteria and
gates are in the roadmap and release checklist.
