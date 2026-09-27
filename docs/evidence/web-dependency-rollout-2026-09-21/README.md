# Phase W — staging web rollout complete

September 21, 2026. Both [staging web](https://tableus-staging.vercel.app) and
[canonical links](https://links.table-us.com) serve exact application
`ed8330a766b3c4b80a505e075535678394e275e9` from verified Preview
`dpl_3ec5bdvridE1meArFaYWAp8yabKM`. [Execution](execution.json) records the whole
phase; [activation](activation.json) binds the final API, aliases and checks.
This is component staging acceptance, not cumulative replacement or production acceptance.

## Authority and identities

Brian approved [Phase W](approval.json), the [publication amendment](publication-amendment.json)
and then the [exact CORS/API action](cors-approval-request.json) with **approve**.
The temporary Preview pause, exact branch publication, two branch source stamps,
empty branch SENTRY_AUTH_TOKEN and restored triggers completed before the one CI
and one Git-backed Preview. All three overrides are plain, branch-only Preview
values; prior secrets, environment records and protection were preserved.

The subsequent approved action appended only the immutable Preview origin to
ALLOWED_ORIGINS, preserving eleven origins and every other API variable. Setting
with `--skip-deploys` caused no deployment; one `railway redeploy` without
`--from-source` then deployed the existing f94a1d9 source. After readiness/CORS and
build-input provenance checks, two individual alias assignments activated staging.
No production promotion, domain-binding change, additional Preview or CI occurred.

| Role | Identity |
| --- | --- |
| Application / repository operator | `ed8330a766b3c4b80a505e075535678394e275e9` |
| Release ref | `codex/web-deps-ed8330a` at exact ed8330a |
| Evidence base / previous checkpoint | `89dac2d4f9deb428668c0bcf62828e31100b2968` / `514a0136e1eb2ea0c52c315bf92efaf92809dfc9` |
| Evidence branch / worktree | `codex/web-dependency-rollout` / `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev` |
| Detached application | `.artifacts/phase-w/source` under that worktree; evidence commits are not application candidates |
| Preview / both staging aliases | `dpl_3ec5bdvridE1meArFaYWAp8yabKM`, READY, ed8330a |
| Current API | `24eefe75-9583-4a90-8d3e-48450818dec0`, SUCCESS/ready, `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| API image | `sha256:92d1605c9100bd54b84c5e5295a93d6eef32c138e00984c2c2788d6a27b82272` |
| Previous API | `d929fba2-9c1e-4428-8379-ffaae6a3c4d2`, f94a1d9; original artifact evidence retained |
| Production target / apex / www | `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`, `e1184eca9b73e1a9f26d1007ab543df9d54c7124`; apex 308 preserved |
| Accepted retained Preview | `dpl_5iF8xTCbfuJghn2bRuUSGdKoRiJb`, f94a1d9; untouched |
| Installed native | f94a1d9 original artifacts and acceptance; no build/install/device operation |

## Verification and limits

- [One CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/35661503170)
  passed exact ed8330a: full frozen install, PostgreSQL migrations, lint/types,
  **234 JS / 101 Python / four browser / seven deterministic AI cases**, contract,
  Next 16.3.5 build and smoke. Node 22.23.2/npm 10.9.8; evaluation cost zero.
  [CI details](ci-result.json).
- [Hosted Preview](hosted-checks.json): exact Git checkout, root npm ci, Next
  16.3.5 build; three served bundles contain the full SHA. Attribution matches
  source. Benign JPEG-to-WebP optimization and repeat/cache HIT pass; unallowlisted
  image returns 400. No Google image/provider calls or fixture deployment.
- Measured local [Linux x64](linux-x64-image-check.json) and
  [ARM64](linux-image-check.json): Node 22.23.1/npm 10.9.8, Next 16.3.5,
  sharp 0.35.4, libvips 8.18.6, libheif 1.23.2; benign PNG/JPEG/AVIF,
  invalid image and cache checks pass. Hosted sharp/libvips versions are frozen-lock
  inference, not introspected; Vercel reports only Node 22.x. Its Git file-tree
  endpoint returned 404, so vendor inclusion is established by exact Git, required
  file dependency and frozen installs, not an invented remote file hash.
- [Preview browser](browser-smoke.json): seven guarded public-shell checks pass.
  Discovery's automatic nearby POST was blocked; live data behavior is unverified.
  Existing sessions were untouched. Earlier harness failures are retained and
  distinct from application results; no source changed to satisfy checks.
- [Activation](activation.json): API ready at f94a1d9; exact Preview, staging and
  canonical origins return 200 with matching allow-origin; an unapproved origin
  returns 400 without allow-origin. Both public aliases pass 12 HTTP checks each:
  routes, auth-confirm staying web-only, invalid/missing links, attribution,
  association JSON with no redirects, and three identical source-stamped bundles.
  Signers and exact `/auth` and `/join/*` associations remain unchanged.
- Four fresh anonymous alias browser checks pass on Chrome 153.0.8010.53 with no
  page errors. Network guards blocked API/external/telemetry requests; no bypass
  credential or saved session was used. Canonical invalid-link screenshot inspected.
- Railway rebuilt the existing source instead of reusing image bytes. The old and
  new logs use identical digest-pinned Python/uv images and frozen install commands.
  All 47 new dependency pins match the unchanged f94a1d9 lock; 46 readable old
  package names/versions match. One old httpcore name is corrupted in provider logs;
  its version and the source lock match. New image identity is recorded separately.
  Fresh API checks cover readiness/CORS, not a full authenticated/live journey.
- The final Vercel project response equals the pre-activation response. Production
  apex/www response bytes and redirects match preflight. All 85 prior deployments
  plus the single new Preview remain; no native change or protection weakening.

Original compatibility regressions, Metro exports, contract check, four local
Chrome journeys and one `make ready` (234 JS / 98 Python, three PostgreSQL skips)
are reused. No full-suite rerun or Security Scan. Task-local harness hashes are
separate from the repository operator SHA. The [completion handoff](../../handoffs/2026-09-21-phase-w-complete.md)
provides the next bounded objective and commit lookup.

## Accounting and retained risks

Consumed: **one CI, one Preview, one API redeploy**, five Vercel project/env
mutations, one ALLOWED_ORIGINS update and two alias assignments. No retries or
further external rollout authority remain. Zero new live-provider calls, OTPs,
deliberate canaries, native builds/installs or symbol uploads.
Closed ledger: Places 92/100 from baseline 329 (8 unused, not reopened), emails
2/4, canaries 6/6 per provider, fresh Gemini 0/0; configured backstop 429.

Production e1184ec remains public and outside this staging patch. The
[old deployment inventory](retained-deployments.json) is retained; sampled old
immutable URLs still require Vercel SSO, but authorized/bypass holders can access
old bytes. Unprobed URL protection is not certified. Unbound custom domains may
be reassigned by future production deployments. **September 30 is unextended.**
Native dependencies/AppHang, native retention tooling, merge, production, symbols,
stores and cohort remain separate. Brian Chei owns rollback; no automatic return
to vulnerable web is authorized.

Private files remain under `.artifacts/phase-w` in this worktree. The
[original](private-manifest.json), [execution](execution-private-manifest.json)
and [activation](activation-private-manifest.json) manifests bind raw evidence,
fixtures, browser attempts and task-local harnesses. Preserve artifacts, containers,
worktrees and sessions. Earlier checkpoints remain historical in Git and the
[prepublication record](prepublication-checkpoint.md).
