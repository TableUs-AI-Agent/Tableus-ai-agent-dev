# Development workflow

Adopted 2026-09-21; GPT-6 role and autonomy update authorized 2026-09-22.
Astra orchestrates and has final technical authority. Sol implements most bounded
work alongside useful Astra review/integration; Luna handles narrow read-only
summaries or extraction. Astra may take tiny, ambiguous or consequential work
directly. Delegates do not delegate or grant approvals.

## Start one bounded objective

1. Read the active packet and current state; load roadmap and decisions when
   relevant. Inspect branch, worktree status and the last handoff before selecting
   a base. The task's default directory may be stale. Preserve dirty files;
   record any recovery copy by hash.
2. When a previous task is referenced, read only the necessary recent turns and
   retrieve older context for a concrete unresolved question. Do not replay the
   entire transcript or print raw build logs into the new task.
3. Use a named `codex/<objective>` branch and an isolated worktree for this task.
   Record base, application candidate, operator version, previous task and active
   worktree. A fresh conversation does not reset authority, spend or evidence.
4. Define one observable outcome, scope, exclusions, acceptance checks and stop
   conditions in `docs/task-packets/active.md`. Keep later objectives in roadmap
   order. Do not create a new active packet for every intermediate test phase.

Give Sol a bounded implementation brief with stable instructions first and task
facts last: goal; owned files; acceptance; constraints and approvals; checks;
time/attempt budget. Ask for changed paths, check results, unresolved risks and
the exact commit when authorized, rather than full logs. Give Luna a similarly
bounded read-only summary brief: question; source paths/task turns; output shape;
uncertainty to escalate; time budget. Explicit model selection at delegation is
the fallback when the host cannot select a named agent. Mixed-model delegates need
a self-contained brief with bounded or no inherited history because full-history
forks inherit the parent's model. Project agent defaults do not reconfigure a
running task. Reuse an existing bounded child for the same work when possible;
keep stable role instructions before variable task facts and avoid churning tool
definitions or prepending timestamps and logs. Cache effects are model-specific;
do not claim cross-model sharing or measured savings without evidence. Codex owns
API request caching; project agent configuration has no Responses API cache keys.

### Reusable delegation briefs

Sol implementation (Astra fills the task facts before dispatch):

```text
Implement this bounded objective through meaningful verification and repair.
Goal: <observable result>. Own: <files>. Acceptance: <behaviors/checks>.
Constraints: <existing approvals, exclusions, exact source, attempt/spend limits>.
Budget: <time/attempt bound>. Continue routine decisions and fixes without
returning for first-draft approval. Escalate material ambiguity or an actual gate
with evidence; finish independent work. Return changed paths, checks and risks.
```

Luna summary:

```text
Summarize <question> using only <source paths/turns>, within <time/output bound>.
Work read-only. Preserve exact identifiers and unresolved failures; cite sources,
distinguish observations from assumptions, and flag uncertainty for Astra.
```

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
| Developer-only instructions/agent config | TOML syntax, host config, links and conflicting-instruction checks; no `make ready` or native rebuild solely for these files |
| Application, contract, application config, dependency or executable tooling | Focused meaningful regressions while iterating; `make ready` once for the completed objective; generated contract drift check |
| Candidate release verification | Exact-source CI/hosted checks plus affected inspected native artifacts and real platform observations; approval and budget preflight before external steps |

Run `make ready` once for a completed application or executable change. Reuse
its exact-source passing result for later developer-only or evidence checkpoints
when application, tooling and tests are byte-identical. Record reused versus
fresh checks explicitly. Public CI, native/device checks, paid evaluation and
measured performance are not included in `make ready`.

Freeze application bytes before expensive verification. Documentation and evidence
commits do not silently replace the application SHA. On a code change, perform an
impact review and freeze/review the replacement; never relabel older artifacts.
Keep native compilation sequential. Verify toolchain, inputs, output storage and
disk before starting. Reuse only matching artifact bytes, receipts and inspections.
Honor the active packet's native stop-on-first-failure rule and recorded attempt,
disk, time and live-provider budgets. A new delegate or workflow edit grants no
native retry, external action or extra allowance. Routine deterministic local
test failures can be fixed and retested within the approved implementation scope.

## Finish and move to a fresh task

The handoff includes the exact commit, branch/worktree, application SHA, outcome,
checks with fresh/reused attribution, evidence paths, unresolved risks, remaining
approval/budget and one proposed next objective. Do not call an objective complete
while required checks or decisions are missing. Local implementation completion,
merge approval, staging acceptance and production activation are distinct outcomes.
For authorized work, implementation includes meaningful checks, review, fixes and
commit/handoff; a first draft is not the approval point. Existing user approval
persists. Seek input only for a missing consequential decision or a still-unapproved
merge, resource, secret, paid live-AI evaluation, production migration, deployment,
store submission or destructive cleanup, after finishing independent preparation.
If a skill requires a pause, link and quote its exact rule and distinguish that
requirement from interpretation. User instructions supersede repository and skill
guidelines within higher-priority constraints.

Once the objective is complete, create a fresh task for the next feature/fix as
requested by the owner. Seed it with the handoff and exact approved starting ref;
do not carry the full chat history. If integration is pending, say so and preserve
the branch; do not silently start from stale `main` or merge it. Keep the completed
worktree and artifacts until cleanup is explicitly authorized. An access outage
or paused approval gate is a checkpoint in the existing task, not completion.

Agent setup reference: [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
Behavior guidance: [GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md)
and [prompt design](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).

Caching reference: [GPT-6 prompt caching](https://openai.com/index/better-prompt-caching-for-gpt-6/)
and [API details](https://developers.openai.com/api/docs/guides/prompt-caching).
