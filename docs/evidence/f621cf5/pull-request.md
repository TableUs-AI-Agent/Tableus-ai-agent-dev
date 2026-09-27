The pilot opens on Plans and exposes Plans and Account on web/mobile. Hidden Discover, Friends/People, Review, Taste/Profile and photo entry routes return to Plans while their code, data, API endpoints and export fields remain. Mobile gains an independent Account tab with legal/help links and preserves deletion recovery, auth and private Join.

Finalization records distinct voters from the active run without changing quorum or ranking. Deletion's strict event allowlist retains only an integer from 0–8 independently of removed candidates/runs. A bounded read-only report counts eligible retained plans once across reopen/re-finalize, requires two voters for success, and discloses unknown historical/deleted coverage. See `docs/pilot-measurement.md`.

Validation: [hosted CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36301151907)
passed 238 Python tests, 326 JavaScript tests and five browser journeys with zero
skips, including restricted PostgreSQL/migrations, lint/types, deterministic
evaluation, contracts, web/Expo-web builds and smoke. One local `make ready` and
contract drift check passed; local Chrome also passed five account/help recovery
and four private-Join cases. Existing dev-cache plan-detail timeouts passed on
unchanged application source after starting a fresh cache; diagnostics remain.
No application fixes were needed in hosted CI.

Base: `8ae3c94eb3e41b87f0840cd5aa2b0827c0882af4`. Preserves the eight pre-existing integration/packet/fresh-thread documentation changes. A pre-existing account test now selects its own plan event to avoid test-order dependence. Source-bound handoff: `docs/evidence/f621cf5/implementation.md`.

Vercel Git deployment is disabled for this branch and main; Railway has no triggers or PR environments on read-only preflight. This PR does not authorize a merge, deployment, migration, deletion activation, secret/resource change, signed native build, invitation or later roadmap priority.
