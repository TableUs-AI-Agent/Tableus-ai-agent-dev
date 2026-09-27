# Handoff: dependency rollout proposal → owner decision

Planning deliverable prepared on `codex/dependency-rollout-proposal` in
`/Users/brianchei/.codex/worktrees/83b4/Tableus-ai-agent-dev`.
Resolve the exact review/evidence commit after completion with:

```bash
git log -1 --format=%H -- docs/handoffs/2026-09-21-dependency-rollout.md
```

The final task response supplies the full SHA. Base and proposed application:
`ed8330a766b3c4b80a505e075535678394e275e9`. All changes in this task are
review/planning documents; this evidence commit is not a replacement application.
The operator reviewed is ed8330a; a future retention fix needs its own operator SHA.

## Result and evidence

[Concrete proposal](../evidence/dependency-rollout-2026-09-21/README.md) requests
Phase W only: exact ed8330a publication/CI, one existing-project Vercel Preview,
then conditional staging alias replacement after source/image/origin checks.
Keep API/native f94a1d9. No merge or Railway deployment. Missing CORS, production
alias coupling or old immutable-URL exposure must be reported, not worked around
with unapproved changes. No release execution is approved yet.

The exact source review supports the dependency dispositions. Fresh checks matched
eight source hashes, nine private logs, nine installed consumers and both Metro
maps; fourteen source objects were confirmed unchanged from f94a1d9.
[Associations](../evidence/dependency-rollout-2026-09-21/source-association.json) and
[planning validation](../evidence/dependency-rollout-2026-09-21/planning-validation.json).
Reuse the original frozen install/npm ls, eight regressions, Metro exports,
contract check, four Chrome journeys and one make ready (234 JS / 98 Python;
three PostgreSQL skips). No fresh suite, CI, hosted/device check or Security Scan.

Review clarifications:

- Next 16.3.4 re-enabled AVIF. Verify the pinned 16.3.5 image stack and benign
  image behavior; do not require AVIF rejection based on the older advisory text.
- The current local build helper deletes logs/temp output and exports no
  dSYMs/maps. Repair operator retention locally before any new native build.
- Later proposed native scope is two deterministic builds, followed by two
  readiness builds with separate approval. Native cold/warm link checks,
  UUID-matched usable symbols and account-export/relaunch diagnosis are explicit.
- Single-SHA cumulative/live runners cannot certify the mixed component release;
  link runner receipt profiles also differ. Keep focused evidence truthful.
- Valid live cold/warm link checks may exceed the closed run's remaining Places
  allowance. No new budget or telemetry allowance exists; leave those gates open.

## Next bounded objective and authority

Obtain the owner's Phase W decision against the concrete proposal. After approval,
create the requested fresh task/worktree from this review commit, freeze application
ed8330a separately and execute **only Phase W**. Read the four current documents
and this handoff; retrieve prior task context narrowly. Do not start from stale
main, mutate prior worktrees, publish the evidence descendant, or infer native
build authority from web approval. If W is deferred, preserve this decision state;
no rollout is complete. The later local operator-retention fix is a separate task.

No merge, deployment-triggering push, deployment, resource/secret creation,
paid/live-AI evaluation, native build, Security Scan, migration, destructive cleanup,
account deletion, store submission or cohort activation occurred or was approved.
Original f94a1d9 acceptance, private artifacts and saved sessions remain intact.
Its AppHang is still unexplained and accepted only for isolated staging. No old
dependency exception was extended. Eight Expo patch recommendations remain deferred.

Closed run: Places 92/100 from baseline 329 (8 unused), emails 2/4, canaries 6/6
per provider, fresh Gemini 0/0; backstop 429. This review spent zero. A new task,
web approval or unused allowance does not restart the live run.
