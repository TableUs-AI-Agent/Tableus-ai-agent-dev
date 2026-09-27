# Handoff: dependency remediation → replacement-candidate review

Use the exact commit containing this handoff as the next task's base. Resolve it
with `git log -1 --format=%H -- docs/handoffs/2026-09-21-dependency-toolchain.md`
in `/Users/brianchei/.codex/worktrees/14a6/Tableus-ai-agent-dev`; the final task
response records the full SHA. Branch: `codex/dependency-toolchain-exception`.
Do not start from stale main or change this completed worktree. No merge/push.

## Completed local outcome

Next.js 16.3.5, compatible EAS transitive patches and Redocly/js-yaml remove all
critical/high npm findings. A small local CommonJS adapter exposes the unmodified
patched decoder 0.5.0 to Expo Router/query-string. It is an npm file dependency
under `vendor/`, with the upstream tarball locked via an alias; include the whole
repository in builds. Node >=22.12 <23. Expo 57.0.23, React Native 0.86.2 and
EAS 23.2.0 stay pinned; the iOS scene plugin is unchanged.

The full graph retains 17 affected package entries from three underlying tooling
advisories. UUID's affected buffered APIs are unused, diff's patch parser is
unused, and deep-merge is limited to EAS new-project scaffolding outside this
repository's workflow. Exact consumer/source hashes and limitations are in the
[assessment](../evidence/dependency-toolchain-2026-09-21/README.md). This is an
explicit justified disposition for this graph, not a blanket exception extension,
Security Scan or production acceptance. Eight Expo package patch recommendations
remain separately recorded; broader alignment was intentionally deferred.

Fresh checks: frozen offline npm install, `npm ls --all`, six Node compatibility
tests plus two actual-router Jest tests, iOS/Android Metro JavaScript exports
(no native build/bytecode), contract drift, four Chrome deterministic browser
journeys, and **one `make ready`**: 234 JavaScript / 98 Python passes, three local
PostgreSQL skips. Local source maps and Next runtime traces exclude the remaining
affected tooling. [Verification and log hashes](../evidence/dependency-toolchain-2026-09-21/verification.json).
No public CI or hosted/device validation of this replacement is claimed.

## Next bounded objective

Review the replacement source/lock and prepare a concrete, minimal rollout and
affected-release verification proposal for the owner. This takes precedence over
account lifecycle work because the old Next image optimizer is potentially
runtime-reachable. Use one primary agent, no Security Scan, a fresh task/worktree
and named `codex/` branch from this exact handoff; preserve existing worktrees.
Read the four current documents and replace the completed active packet. Do not
replay the old long conversation or rerun the full suite without new justification.

Determine affected web/native evidence and propose the smallest exact-source
candidate plan, including the decoder's device link checks, scoped EAS changes,
symbols and focused hang diagnostic. Obtain explicit approval for merge,
deployment and any new native build before those operations. Prepare everything
needed for a reviewable decision locally first. Do not interpret this handoff as
rollout approval or force a framework migration to eliminate audit counts.

## Preserve staging and limits

Frozen application `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` retains cumulative
isolated-staging acceptance and all original evidence. This patch has not changed
its hosted service, native binaries, accepted sessions or receipts; it still has
its old dependency risks and must not be promoted to production. September 30
(or before production) is not extended for those bytes.

Android's original session renewed after simulator-local sign-out. The owner
accepted the one unexplained simulator hang only for isolated staging; usable
symbols and a focused check remain due before distribution, and the cause is not
established. Original artifacts stay under the root checkout's private
`.artifacts/mobile/f94a1d9d1125e6c9111aa08eda496f014f20d0c0/`.

Closed live run: Places 92/100 from baseline 329, emails 2/4, explicit canaries
6/6 per provider, fresh Gemini 0/0. No new budget is granted. No merge,
deployment-triggering push, deployment, resource/secret creation, live-AI
evaluation, native build, scan, migration, destructive cleanup, account deletion,
store submission or cohort activation is authorized by this handoff.
