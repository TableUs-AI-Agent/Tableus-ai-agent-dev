# Phase W — approved rollout, blocked before publication

September 21, 2026. **Checkpoint, not completion.** Brian Chei approved the
[concrete Phase W proposal](../dependency-rollout-2026-09-21/README.md) in task
`01a0c5de-c4a5-7cf2-8a2c-76494dd98c3b`; [approval.json](approval.json) records the
bounded retrieval and exact scope. Historical pending-approval wording is
superseded for Phase W only. No original artifacts, worktrees or sessions changed.

Application and repository operator remain
`ed8330a766b3c4b80a505e075535678394e275e9`; review base is
`89dac2d4f9deb428668c0bcf62828e31100b2968`. Evidence lives on
`codex/web-dependency-rollout` in `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev`.
The clean detached application checkout is `.artifacts/phase-w/source` there.
The intended release branch `codex/web-deps-ed8330a` is **unpublished**. The
checkpoint commit contains documentation/evidence only, not new application bytes.
The task-local Linux harness is separately hashed; it is not relabeled ed8330a tooling.

## Fresh observations

[Preflight](preflight.json) and [public probes](public-preflight.json) establish:

| Component | Actual identity / result |
| --- | --- |
| API | `d929fba2-9c1e-4428-8379-ffaae6a3c4d2`, active/ready at `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`; backstop 429 |
| Accepted retained Preview | `dpl_5iF8xTCbfuJghn2bRuUSGdKoRiJb`, READY, Git metadata f94a1d9 |
| Both actual staging aliases | `dpl_7yiJcGeeVGHBRzFggodNCLzoiAeX`, Git metadata `daa89a03e1ba09b4249125476c5d28b7f2a98f31` |
| Production target / apex / www | `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`, `e1184eca9b73e1a9f26d1007ab543df9d54c7124`; apex retains 308 to www |
| Installed native | Retained f94a1d9 artifacts and original acceptance; no build/install/device operation |
| Vercel build configuration | Node 22.x; root directory null; repository-root `npm ci`; web workspace build; `frontend/.next` output; vendor tracked in exact source |
| Git triggers | Vercel Git auto-deploy enabled, production branch main. CI has workflow_dispatch/PR/merge_group, no push trigger; no dispatch performed |

Staging aliases and the accepted old immutable Preview origin pass API CORS;
an unapproved origin returns 400 without allow-origin. Existing association
manifests return 200 JSON without redirects; Apple team `6MHJN5V9UJ`, app
`com.tableus.app`, exact `/auth` and `/join/*`, no `/auth/confirm`; Android signer
matches the retained manifest. These are old-host observations, not replacement acceptance.

[Linux check](linux-image-check.json): a fresh **local Linux ARM64** container
installed the full frozen repository (`npm ci --no-audit --no-fund`) from an
archive of the detached SHA. Node 22.23.1/npm 10.9.8; Next 16.3.5, sharp 0.35.4,
libvips 8.18.6, libheif 1.23.2. Generated benign 32×24 PNG/JPEG/AVIF fixtures all
optimized to 16×12 WebP; non-image text rejected with 400; prior-image cache
reuse and max-age passed. Fixtures, lock, adapter, optimizer, harness, image and
log hashes are retained. This does **not** prove Vercel's Linux x64 stack or CDN.

Eight validation-source hashes freshly match the review. Reused, not rerun:
original eight compatibility regressions, Metro exports, contract check, four
Chrome journeys and one `make ready` (234 JS / 98 Python, three PostgreSQL skips).
There is no new full suite, CI, hosted replacement browser/image check or scan.

## Publication blockers and proposed amendment

1. Vercel rejected preparing source stamps for the unpublished branch:
   `Branch "codex/web-deps-ed8330a" not found in the connected Git repository. (400)`.
   An earlier array request failed JSON validation; neither changed configuration.
   Final readback confirms all existing environment records unchanged and no new
   branch overrides. Publishing first would violate the approved ordering and
   immediately risk an unstamped build; no push occurred.
2. Preview inherits sensitive `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and
   `SENTRY_PROJECT`. Exact source enables the Sentry build wrapper and source-map
   upload when populated. Values are unavailable (`decrypted=false`); blank CLI
   output is redaction, not proof the setting is disabled. Upload logging is
   silent. The explicit no-symbol-upload boundary needs an empty branch override
   or a separate upload approval. The empty override is the proposed choice.
3. The API's eleven exact allowed origins contain no future release Preview.
   Once an immutable URL exists, append **that verified exact origin only** to
   the preserved allowlist and restart/redeploy the existing f94a1d9 API only with
   separate concrete owner approval. No wildcard, source change or new budget.
   This action is not authorized now and alias activation cannot pass without it.

**Requested publication amendment (not executed):** temporarily set existing
Vercel project's `previewDeploymentsDisabled=true`; confirm no new Preview can
start; publish only ed8330a to `codex/web-deps-ed8330a`; create its two plain source
stamps and a plain empty branch-scoped `SENTRY_AUTH_TOKEN` override; verify all
other values/targets unchanged; restore Preview auto-deploy to enabled; create
or reuse exactly one Git-backed Preview for the same SHA, inspecting for any
automatic trigger before an explicit creation. Run the one exact-source CI
workflow. If the service queues/replays an automatic build, reuse it and do not
create a duplicate. Stop if the one-deployment cap cannot be guaranteed.

This is a temporary project-wide Preview pause and a publication-order exception;
it could delay unrelated Preview builds during the window. It changes neither
production settings/target nor the existing Sentry secret. It requires additional
owner approval because Phase W permits only two branch-scoped stamp preparations.
[Official project API](https://vercel.com/docs/rest-api/projects/update-an-existing-project)
documents `previewDeploymentsDisabled`; [Git integration](https://vercel.com/docs/git/vercel-for-github)
documents automatic branch-push deployments. The exact config payloads are in
[publication-amendment.json](publication-amendment.json). Original one-CI/one-Preview
caps remain intact. The earlier empty-token question alone does not approve the
additional project setting or reordered publication.

## Residual exposure and next action

[Inventory](retained-deployments.json) records all 85 retained deployments returned
by the account (no next page). Anonymous probes of the accepted f94a1d9 Preview,
its earlier f94a1d9 Preview, and the current staging deployment's immutable URL
redirect to Vercel SSO. No claim is made for unprobed URLs or bypass holders.
Old bytes remain retained and reachable to authorized users. Public staging
aliases still serve the old daa89a0 deployment, and production aliases retain
e1184ec. No deletion or access restriction is authorized. **September 30 remains
unextended.** All project domains currently have no Preview branch binding;
future production deployments can reassign them. Reconfirm preservation and this
coupling before any alias change; no domain binding was changed here.

Counts: **0 CI / 0 Preview / 0 remote config changes / 0 alias moves**. Closed
live ledger remains Places 92/100 from baseline 329 (8 unused, not reopened),
emails 2/4, canaries 6/6 per provider, fresh Gemini 0/0. No paid/live provider
request, email, canary, symbol upload or native operation was initiated.

Continue this incomplete objective in the **same task** after the publication
amendment decision. Later request exact Preview CORS/API action before activation;
run the remaining Phase W checks and retain actual component identities. Brian
Chei owns rollback; do not restore vulnerable web automatically. Native retention
repair, native verification, merge, production and cohort gates remain separate.
Private files/logs/container are retained under `.artifacts/phase-w` in this
worktree; [manifest](private-manifest.json) records hashes without exposing values.
