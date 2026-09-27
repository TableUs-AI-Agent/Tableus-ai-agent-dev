# Pilot baseline integration review

Prepared September 27, 2026 for Priority 1. This is an integration review, not
staging/native/production acceptance or a new security scan.

## Source and scope

- Refreshed GitHub `main`: `e1184eca9b73e1a9f26d1007ab543df9d54c7124`.
- Reviewed realignment source: `6dac9960df8d8abe2e170b032a2f400276e6eb22`,
  165 commits ahead with no divergence. The application baseline is `4a2f9ec`.
- At publication, application, dependencies, CI, tests and operator code were
  byte-identical to final locally validated application
  `f3efa7a28010454275bf3b32ec52fc43792fdaee`. The CI portability correction below
  changes one test wrapper only; application and dependency bytes remain unchanged.
- Publication preparation adds only the Vercel Git-deployment guard and documentation.
  Its exact proposed head and hosted CI result belong to the integration PR.
- The separate native diagnostic branch is not merged. Diagnostics already in
  this lineage retain their source-bound meaning and closed execution allowances.

## Review and retained evidence

The cumulative diff was triaged by subsystem, with focused source inspection of
CI/migrations/grants, invitation admission, subject-bound deletion and recovery,
quota transactions, shared-content/replay cleanup, client account transitions and
bounded private-link handling. Existing test and release evidence was checked for
applicability instead of treating each historical commit as a separate acceptance.
No new consequential application defect was found in that scope. This is not an
exhaustive audit or fresh native/live-provider validation.

| Area | Review basis and limits |
| --- | --- |
| Earlier request/auth/replay controls and native compatibility | [f94a1d9 source review](../source-review-f94a1d9/README.md) and [staging closeout](../ios27-staging-f94a1d9/closeout.md) retain their original source/risk scope. Later source is not thereby accepted for deployment. |
| Dependency replacement | [Dependency disposition](../dependency-toolchain-2026-09-21/README.md), plus hosted CI [35661503170](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/35661503170) on `ed8330a`. No fresh advisory scan was run. |
| Lifecycle, migrations and restricted runtime | [PostgreSQL handoff](../../handoffs/2026-09-24-account-lifecycle-postgres.md); reviewed distinct runtime/migration roles, private queue/provenance grants, finite worker recovery, organizer blockers and transactional cleanup. Four later migrations still require separate rollout. |
| Quotas, operator access and recipient invites | [Cohort evidence](../cohort-controls-2026-09-24/README.md) and [invite evidence](../recipient-invites-2026-09-24/README.md); inspected atomic quota debit, trusted operator subjects, one-use admission and hook/grant compatibility. |
| Client transitions and private content | [Private-link evidence](../private-link-handling-2026-09-25/README.md), [content cleanup evidence](../deletion-content-implementation-2026-09-25/README.md) and [support evidence](../deletion-support-2026-09-25/README.md); inspected subject guards, deletion recovery, bounded capability storage and cache invalidation. |

The final local evidence retains **214 Python / 317 JavaScript passes, zero
skips**, contract/build/smoke checks and two final-page mocked browser journeys.
It includes an initial readiness failure followed by repair and continuation;
there was no fresh full-suite run in this integration preparation. Byte equality
supports reuse, not relabeling those observations as hosted or native results.

Hosted CI must run on the proposed head/integration tree before merge, including
restricted-role PostgreSQL, contract generation, builds, deterministic eval/smoke
and browser journeys. No additional live-provider or native allowance is implied.

## Hosted integration

[PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7) was published
with owner approval at `dc7989e9639c349bb51410a25966ddb3404713ad` against the base
above. Its synthetic merge `8f5e4359aeeb5f0ee17507d4e1535e93e3262b73` had the same
tree as the head: `f0c2ebb6b3d15ffbfdb4fb69b4615e6bd289e0fd`.

[Run 36297785261](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36297785261)
passed locked dependency installation, restricted database role setup, migrations,
lint and type checks. It stopped in the root JavaScript test suite: the Maestro
identity fixture wrapper tried a Homebrew-only Python path on Linux. Of 112 root
tests, 111 passed and that wrapper failed before its Python fixtures ran;
workspace tests and later checks were not reached.

The wrapper now resolves `python3` from `PATH`, matching neighboring wrappers,
with a named test, bounded execution and useful spawn-failure diagnostics. Its
four existing pure Python fixtures pass locally. No native device/toolchain test
or application behavior changed. A complete hosted pass on the replacement head
remains required; the failed run is not integration acceptance.

Post-publication provider reads found no new Vercel deployment and unchanged
production/preview targets. Railway's latest staging deployment remains
`24eefe75-9583-4a90-8d3e-48450818dec0` from September 21, with no pending work,
deployment triggers or PR environments. No deployment was performed.

## Publication and merge safeguards

[Read-only preflight](preflight.json) freshly records:

- `main` has no branch protection or repository rulesets; the owner/CI merge gate
  must still be followed explicitly. There were no open PRs at preparation.
- Vercel project `tableus-staging` has Git deployment enabled, production branch
  `main`, Preview deployment enabled and automatic custom-domain assignment.
- Railway project `tableus-staging` has no deployment triggers and `prDeploys=false`.
- Existing Vercel targets are recorded; no external settings or deployments changed.

`vercel.json` disables automatic Git deployment only for `codex/pilot-realignment`
and `main`. Other branch behavior is unchanged. This follows the
[official Git configuration](https://vercel.com/docs/project-configuration/git-configuration)
and was validated against the current schema for every configured property.
It allows GitHub publication/CI without an automatic Preview or production release.
Manual deployment remains separately gated; review other branches before pushing.

After publication, verify the expected Vercel skip and absence of new deployments.
Before any owner-approved merge, refresh `main`, confirm matching green CI and
recheck deployment triggers. Stop if these conditions changed. Do not bypass a
failed check, start a native campaign or deploy to make an integration check pass.
