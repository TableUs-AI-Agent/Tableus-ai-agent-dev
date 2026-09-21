# Development workflow

Adopted 2026-09-21 from the owner's request for one feature/fix per conversation.
The orchestrator owns scope, integration, checks and the handoff. One primary
agent is the default; delegation requires an explicit request.

## Start one bounded objective

1. Read the four source-of-truth documents listed in `AGENTS.md`. Inspect branch,
   worktree status and the last handoff before selecting a base. The task's default
   directory may be stale. Preserve dirty files; record any recovery copy by hash.
2. When a previous task is referenced, read only the necessary recent turns and
   retrieve older context for a concrete unresolved question. Do not replay the
   entire transcript or print raw build logs into the new task.
3. Use a named `codex/<objective>` branch and an isolated worktree for this task.
   Record base, application candidate, operator version, previous task and active
   worktree. A fresh conversation does not reset authority, spend or evidence.
4. Define one observable outcome, scope, exclusions, acceptance checks and stop
   conditions in `docs/task-packets/active.md`. Keep later objectives in roadmap
   order. Do not create a new active packet for every intermediate test phase.

## Keep state small and truthful

- `current-state.md`: what exists and is verified now, plus current blockers.
- `roadmap.md`: ordered future outcomes and their exit conditions.
- `decisions.md`: durable product, architecture and operating choices.
- `task-packets/active.md`: next actions, exact identities and remaining authority.
- `evidence/<candidate>/`: dated observations, failures, receipts and run ledger.

Replace obsolete current-state paragraphs instead of appending another account of
the same phase to all four documents. Archive prior narratives before condensation.
Keep detailed technical decisions discoverable by topic. Commit at meaningful
phase boundaries, not for every button press. Store private logs outside tracked
files and print only the relevant failure or phase summary.

A budget ledger retains the original baseline and links amendments separately.
Count failed operations and companion telemetry events before starting a phase.
Reconcile at meaningful live-phase boundaries; do not poll unchanged state.
A new task, candidate or elapsed time grants no additional allowance.

## Verify according to impact

| Change | Required verification |
| --- | --- |
| Planning/evidence only | Changed-file scope, links/JSON, evidence hashes and source associations; retain the original application validation by exact SHA |
| Application, contract, config, dependency or executable tooling | Focused meaningful regressions while iterating; `make ready` once for the completed objective; generated contract drift check |
| Candidate release verification | Exact-source CI/hosted checks plus affected inspected native artifacts and real platform observations; approval and budget preflight before external steps |

The repository handoff check remains `make ready`; run it once before this
recovery handoff. Do not repeat it for each later evidence checkpoint when the
application, tooling and tests are byte-identical to the recorded passing run.
Record reused versus fresh checks explicitly. Public CI, native/device checks,
paid evaluation and measured performance are not included in `make ready`.

Freeze application bytes before expensive verification. Documentation and evidence
commits do not silently replace the application SHA. On a code change, perform an
impact review and freeze/review the replacement; never relabel older artifacts.
Keep native compilation sequential. Verify toolchain, inputs, output storage and
disk before starting. Reuse only matching artifact bytes, receipts and inspections.

## Finish and move to a fresh task

The handoff includes the exact commit, branch/worktree, application SHA, outcome,
checks with fresh/reused attribution, evidence paths, unresolved risks, remaining
approval/budget and one proposed next objective. Do not call an objective complete
while required checks or decisions are missing. Local implementation completion,
merge approval, staging acceptance and production activation are distinct outcomes.

Once the objective is complete, create a fresh task for the next feature/fix as
requested by the owner. Seed it with the handoff and exact approved starting ref;
do not carry the full chat history. If integration is pending, say so and preserve
the branch; do not silently start from stale `main` or merge it. Keep the completed
worktree and artifacts until cleanup is explicitly authorized. An access outage
or paused approval gate is a checkpoint in the existing task, not completion.
