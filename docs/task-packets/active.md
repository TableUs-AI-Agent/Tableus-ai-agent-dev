# Review packet: dependency rollout proposal — prepared

Prepared 2026-09-21; owner execution decision pending. One primary agent;
planning/review only, no Security Scan.

## Identities

- Branch: `codex/dependency-rollout-proposal`.
- Active worktree: `/Users/brianchei/.codex/worktrees/83b4/Tableus-ai-agent-dev`.
- Base and proposed application/operator SHA: `ed8330a766b3c4b80a505e075535678394e275e9`.
- Provisioned checkout was clean and detached at that exact base; established the
  named branch before edits. Prior worktrees remain unchanged.
- Previous task: `01a0c571-6045-7643-ac66-ff2e208fbd7f`, retrieved narrowly;
  committed [handoff](../handoffs/2026-09-21-dependency-toolchain.md) is authoritative.
- Frozen staging application: `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.
- The commit containing this packet records review/evidence only; it is not a new
  application candidate or deployment.

## Observable outcome

Commit an exact-source impact review and minimal phased web/native rollout and
affected-release verification proposal that the owner can approve concretely.
Replace stale current status and preserve the original source/evidence identities.

## Work and acceptance

1. Review the exact dependency/runtime/tooling delta and bind prior validation
   source/log hashes to the completed commit. Distinguish reuse from fresh checks.
2. Define web deployment targets, CI/hosted checks, native profile/device scope,
   link parsing cases, EAS packaging implications, symbols and the focused
   account-export/relaunch AppHang diagnostic, with stop and rollback criteria.
3. Record explicit approval choices, spend limits and remaining release gates.
   Check changed-file scope, Markdown links, JSON and evidence/source associations.
   Reuse the original `make ready` while executable bytes are unchanged.
4. Commit the review/planning result and hand off its exact SHA plus one next
   bounded objective. Approval-dependent execution remains pending, not passed.

## Authority and stop conditions

No merge, deployment-triggering push, deployment, resources/secrets, live-AI
evaluation, native build, Security Scan, migration, destructive cleanup, account
deletion, store submission or cohort activation. Do not silently expand scope on
a failed check. Preserve original private artifacts, worktrees and saved sessions.
An application/tooling change needs a separate bounded implementation objective.

Closed-run limits persist: Places 92/100 from baseline 329 (8 unused, no fresh
allowance), emails 2/4, canaries 6/6 per provider, fresh Gemini 0/0. The old
AppHang acceptance is isolated-staging-only; usable symbols and focused diagnosis
remain required before distribution. The old dependency deadline is not extended.

## Prepared result

[Proposal](../evidence/dependency-rollout-2026-09-21/README.md) and
[source associations](../evidence/dependency-rollout-2026-09-21/source-association.json)
are complete: web-first Phase W, operator symbol/log retention prerequisite, then
two deterministic and two readiness native artifacts with separate gates. The
earlier AVIF-disable interpretation is corrected for Next 16.3.5. Fresh hash and
planning checks passed; original local application tests are reused.

The only requested execution decision is Phase W. No gate has been approved and
no deployment/build/live check has run. After the owner decision, use a fresh
task for the approved next bounded objective; preserve this proposal branch.
See the [handoff](../handoffs/2026-09-21-dependency-rollout.md).
