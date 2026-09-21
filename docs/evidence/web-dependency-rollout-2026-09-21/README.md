# Phase W — Preview verified, activation awaits API CORS approval

September 21, 2026. **Incomplete objective; continue in this task.** Exact
application `ed8330a766b3c4b80a505e075535678394e275e9` is published on
`codex/web-deps-ed8330a`. The [one CI run](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/35661503170)
passed and [one Preview](https://tableus-staging-pees2ewbm-briancheis-projects.vercel.app)
is READY. Staging aliases remain unmoved because the API rejects that exact
Preview origin. [Execution record](execution.json) binds actual identities,
configuration, checks and limits; no cumulative mixed-SHA acceptance is claimed.

## Authority and exact identities

Brian's original [Phase W approval](approval.json) and subsequent **approve** in
this task authorize the [publication amendment](publication-amendment.json).
The amendment was executed: temporarily pause Preview deployments, publish exact
source, set two branch source stamps plus an empty branch SENTRY_AUTH_TOKEN,
restore Preview deployments, then create/reuse one Preview and run one CI.
No automatic Preview was created during the pause or after restoration, so one
Git-backed Preview was explicitly created. All three overrides are plain,
Preview-only and scoped to `codex/web-deps-ed8330a`; all previous environment
records, the original Sentry secret and deployment protection were preserved.
No new secret, symbol upload or production change was initiated.

| Role | Identity |
| --- | --- |
| Application / repository operator | `ed8330a766b3c4b80a505e075535678394e275e9` |
| Review base / earlier checkpoint | `89dac2d4f9deb428668c0bcf62828e31100b2968` / `7357b5f263c59ba2f5b4f46125c487e332bba8d9` |
| Evidence branch / worktree | `codex/web-dependency-rollout` / `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev` |
| Clean detached application | `.artifacts/phase-w/source` under that worktree; evidence commits are not application candidates |
| New Preview | `dpl_3ec5bdvridE1meArFaYWAp8yabKM`, READY, target Preview, Git SHA ed8330a |
| API | `d929fba2-9c1e-4428-8379-ffaae6a3c4d2`, ready at `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Actual staging aliases | `dpl_7yiJcGeeVGHBRzFggodNCLzoiAeX`, Git metadata `daa89a03e1ba09b4249125476c5d28b7f2a98f31` |
| Production target / apex / www | `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`, `e1184eca9b73e1a9f26d1007ab543df9d54c7124`; apex redirect preserved |
| Accepted retained Preview | `dpl_5iF8xTCbfuJghn2bRuUSGdKoRiJb`, f94a1d9; untouched |
| Installed native | f94a1d9 original artifacts and acceptance; no build/install/device operation |

## Fresh verification and limits

- [CI](ci-result.json): checkout log confirms exact ed8330a, Node 22.23.2/npm
  10.9.8, full frozen install, disposable PostgreSQL migrations, lint/types,
  **234 JS / 101 Python / four browser / seven deterministic AI cases**, contract,
  Next 16.3.5 build and smoke passed. Deterministic evaluation cost is zero.
- [Hosted checks](hosted-checks.json): Vercel cloned the exact branch/SHA and ran
  root `npm ci`; Next 16.3.5 built successfully. Three served JS bundles contain
  the full SHA; bundle hashes retained. Attribution bytes match source. Auth
  redirects and invalid/missing links work. Both association manifests are 200
  JSON without redirects and preserve signer IDs, exact `/auth` and `/join/*`,
  excluding `/auth/confirm`.
- A benign non-Google image already referenced in application source optimized
  from JPEG to WebP; repeat returned `HIT` with identical bytes. An unallowlisted
  benign URL returned 400. No Places photo, malicious image or fixture deployment.
- [Linux x64](linux-x64-image-check.json), complementing the earlier
  [ARM64 check](linux-image-check.json): exact archived source and full frozen
  dependencies, Node 22.23.1/npm 10.9.8, Next 16.3.5, sharp 0.35.4,
  sharp-libvips-linux-x64 1.3.3, libvips 8.18.6, libheif 1.23.2. Benign PNG/JPEG/AVIF,
  invalid-image rejection and repeat/cache behavior pass. These are **measured
  local binaries**. Hosted sharp/libvips versions are inferred from the frozen
  graph, not introspected. Vercel reports Node 22.x but no minor. Its Git-deployment
  source-file-tree endpoint returned 404; exact Git, required file dependency,
  root install and CI establish vendor inclusion, not a fabricated remote hash.
- [Browser smoke](browser-smoke.json): seven public-shell checks pass on Chrome
  153.0.8010.52 using a fresh context and existing protection credential scoped to
  the exact host. Invite/auth mode, auth-confirm staying web-only, invalid and
  missing links pass; invite/link screenshots were inspected. The guard blocks
  external/API/telemetry traffic. Discovery automatically attempts a nearby POST;
  it was blocked, and its expected fetch-error state means live discovery data
  is **unverified**. No existing session was loaded. Missing bundled browser and
  two incorrect landing expectations were harness failures, retained separately;
  application bytes were never changed to satisfy them.
- Staging/canonical CORS pass; unapproved origin fails. **Exact new Preview CORS
  returns 400 without allow-origin.** API source, settings and backstop 429 remain
  unchanged. Production target, four aliases and protection were rechecked intact.

Original compatibility regressions, Metro exports, contract check, four local
Chrome journeys and one `make ready` (234 JS / 98 Python, three PostgreSQL skips)
remain reused. No repeated full local suite or Security Scan. Task-local harnesses
have separate hashes and are not relabeled as ed8330a operator code.

## Required next approval

[Exact CORS action](cors-approval-request.json), **prepared, not approved**:
append only `https://tableus-staging-pees2ewbm-briancheis-projects.vercel.app` to
`ALLOWED_ORIGINS` on existing Railway staging service `api`, preserving the eleven
current origins and every other variable. Set with `--skip-deploys`, then redeploy
**the existing f94a1d9 deployment once**, without `--from-source`; verify its
current deployment/image again before doing so. The existing image digest and
complete before/after nonsecret value are recorded in the request.

This is the separately gated Railway/API configuration deployment excluded from
both approvals so far. It can briefly interrupt the staging API. After approval,
require ready f94a1d9, allowed exact Preview/staging/canonical CORS and rejection
of unapproved origins. Then recheck production preservation and execute only the
already-approved conditional staging alias moves, with served SHA/assets and
association verification. Stop on failure; do not restore vulnerable web automatically.

## Retained risk and accounting

**One CI / one Preview consumed; no retries or additional deployment authorized.**
Five approved Vercel config mutations (pause, three overrides, restore); no API
mutation or alias move. Live ledger unchanged: Places 92/100 from baseline 329
(8 unused, not reopened), emails 2/4, canaries 6/6 per provider, fresh Gemini 0/0.
No live-provider request, email, deliberate canary, native build/install or symbol
upload was initiated. The original sessions, artifacts and worktrees remain intact.

[Old deployment inventory](retained-deployments.json) and
[prepublication checkpoint](prepublication-checkpoint.md) preserve the earlier
observations. Sampled old immutable URLs require Vercel SSO, but old bytes remain
accessible to authorized/bypass holders; unprobed URLs are not certified. Public
staging daa89a0 and production e1184ec remain exposed. All custom project domains
lack Preview branch binding, so future production deployments may reassign them;
no binding change or production promotion is authorized. **September 30 remains
unextended.** Native dependencies/AppHang, native retention tooling, merge,
production, stores and cohort remain separate. Brian Chei owns rollback.

Private artifacts remain under `.artifacts/phase-w` in the active worktree;
[original manifest](private-manifest.json) and
[execution manifest](execution-private-manifest.json) bind logs, fixtures, source
archive, browser attempts and local containers. Continue this objective in the
same task after the exact CORS decision; this is not a completion handoff.
