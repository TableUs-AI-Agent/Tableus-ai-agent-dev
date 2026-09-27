# Priority 2 integration

## Scope and approval

Brian instructed this chat to continue with the next step after it identified
review and merge of [PR #8](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/8)
as the immediate action. This approves that integration. It does not approve
deployment, hosted migration, resource/secret changes, native builds, real
invitations or a later implementation priority. His standing preference for
development next steps in every response is recorded in `AGENTS.md` and
`docs/development-workflow.md` and included in this PR.

## Review and matching evidence

Base: `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4`.
Application candidate: `f621cf5dbf0c8663d92be5fe613b9910b68a9953`.
Reviewed published head before this documentation update:
`80a4aae040e03c173b447e8a54bb49d46ae34178`.

The integration review found no blocking findings in the changed code. It checked
the active-run vote query and unique-profile count, independent strict deletion
allowlist, retained-event measurement window and coverage gaps, account/recovery
route preservation, deferred-route redirects and tests. All three deferred mobile
implementations match the base after the move. No schema, dependency, contract or
ranking behavior changed. This is a focused integration review, not a renewed
security scan or native campaign.

[CI on the reviewed head](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36301497166)
passed 238 Python tests, 326 JavaScript tests and five browser journeys with zero
skips, including restricted PostgreSQL/migrations, lint/types, deterministic AI
evaluation, contracts, builds and smoke. The [implementation handoff](implementation.md)
records local readiness, account/private-Join checks and residual observations.
Only documentation and agent instructions change for this review; reuse matching
application checks and verify links/consistency. The automatically triggered CI
must finish before merging the updated head.

## Release safeguards and next development

Read-only preflight at 07:08:43 UTC on September 27 confirmed Vercel Git deployment
exclusions for this branch and `main`, unchanged production/preview target IDs,
zero Railway deployment triggers and `prDeploys=false`. Sanitized local evidence
is `/tmp/tableus-p2-merge-preflight.json`. Stop if those safeguards change.

Merge result is pending. Record the exact merge/head/tree and post-merge deployment
readback here once complete. Keep the branch and checkout; no cleanup is approved.

Next development objective is Priority 3 staging readiness in a fresh chat after
authorization. Its first concrete action is to replace the active packet with a
bounded staging inventory and preparation scope: verify actual migration head,
restricted grants, invite hook, full-journey quota/spend needs and deletion-worker
requirements. Prepare the complete synthetic rehearsal and approval request before
any gated external action. Physical native acceptance, Priority 4 signed builds,
real invitations and Priority 5 pilot operation remain deferred.
