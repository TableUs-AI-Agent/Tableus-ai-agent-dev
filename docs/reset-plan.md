# TableUs reset plan

October 15, 2026. Based on a full review of `main` at `4a944e1`: the original
hackathon build, every planning document and all backend, web and mobile code.

## What happened

TableUs started as an AI group dining planner. You picked a location, typed
what you were in the mood for, tagged friends, and Gemini combined everyone's
tastes into ranked restaurants with reasons. That was the product, and it won
second place at the hackathon.

Between August and October, 330 commits went into getting a "closed beta" ready.
Almost none of that work made the product better, and no real group has used it
yet. Here is where the effort went:

- **The AI went missing.** The current recommender sends Gemini each restaurant's
  cuisine label, price level and rating, but not its name, its description or
  anything about the food (`backend/tableus/providers/google_live.py:629`). The
  model ranks restaurants it can't actually see, so dietary notes and free-text
  wishes have nothing to match against. Cuisines are also a hard filter that
  intersects everyone's picks, so "Italian" plus "Japanese" returns nothing and
  fails (`backend/tableus/api.py:1470`).
- **Product scope shrank to a voting form.** Discover, friends, reviews and taste
  learning were all hidden. What's left is create plan, share link, constraints,
  four options, rank three, finalize.
- **Infrastructure grew in place of the product.** About 75% of the backend is
  operations and compliance work: recipient-bound invites, a deletion job queue
  and worker, content scrubbing on deletion, cohort quotas, layered spend budgets,
  an idempotency replay cache, audit events and pilot-measurement queries. The
  product logic itself is about 1,000 lines.
- **Process became the work.** The `docs/` folder has 619 files and 20,700 lines,
  more than the application code. That includes 9.7 MB of "evidence", a
  984-line decisions file that reads like a diary of approvals and mail-routing
  incidents, 81 scripts for evidence and release ceremony, 12 mobile build
  profiles, and a long run of rehearsals measured in "live minutes" and
  "restart allowances". There are also about 25 stale worktrees on disk.
- **The design was never done.** There's no landing page (`/` redirects to
  `/plans`), no design system on web or mobile, and mobile dark mode is broken.

The root cause is that every step was treated as a release gate for a
production launch, when the product still hadn't proven it was worth using.

## Direction

**TableUs is the fastest way for a small group to agree on where to eat.** The
AI is the reason to use it over a group chat.

The core loop:

1. Someone starts a plan with a place and a time, then shares the link.
2. Each person says what they want in plain language: "something light, I'm
   vegetarian, under $30, not too loud". Short chips cover the common cases.
3. TableUs finds real nearby restaurants (Google Places) and Gemini picks a short
   list that fits **everyone**, with a specific one-line reason for each pick
   ("vegetarian tasting menu, quiet back room, $$").
4. The group votes with one tap. The organizer locks it in and everyone gets the
   address and a maps link.

It should feel effortless and fast. The AI has to be visibly smart, because that
is the whole product.

Later, informed by real use: remembering a person's tastes across plans,
recurring groups, and booking or reservation links.

## What we keep

- **Stack:** FastAPI, Supabase (Postgres and email sign-in), Next.js on Vercel,
  Expo Router for iOS and Android, Railway for the API. None of these is the
  problem, and a rewrite would cost weeks without making anything better.
- **The `/api/v1` boundary**, with the OpenAPI-generated client shared by web and
  mobile.
- **The provider interface with deterministic fixtures**, so tests are free and
  fast. The Places API (New) client is solid.
- **Gemini structured output with an enum of allowed candidates.** This
  guarantees the model can only pick real places, and it's the best idea in the
  codebase.
- **Core data model:** profile, plan, participant, recommendation run, candidate,
  vote. Borda voting, row locks on plan changes, hashed share tokens, Supabase
  JWT verification.
- **Join-link and deep-link handling** (universal links, pending join through
  sign-in), which has been through real edge cases.
- **CI:** Postgres service, lint, types, tests, contract drift check, build and
  one Playwright journey.
- **Simple account deletion**, which the App Store requires. It becomes a direct
  delete of the profile, the Auth user and the user's own content, with no
  job queue.

## What we cut

Git history keeps all of it, so nothing is lost.

- **Hidden features:** discover with the 2,943-line Three.js tabletop scene,
  friends, reviews, profile, photo analysis, the legacy v0 API (`backend/main.py`
  legacy routes, `data.py`, `google_maps_service.py`), demo user switching, and
  mobile's deferred screens and `app/e2e` routes.
- **Ops machinery sized for production at scale:**
  - recipient-bound invites
  - the deletion job queue and worker, and content scrubbing
  - cohort quotas
  - the three-layer spend budgets
  - the idempotency replay middleware
  - audit events and pilot measurement
  - ownership transfer and metadata replacement
  - provenance and epoch columns

  These get replaced by a per-user rate limit and a Google Cloud budget alert.
- **Release ceremony:** about 75 evidence and inspection scripts, Maestro
  fault/offline/link suites, the custom Android retry module, the vendored iOS
  scene plugin, 9 of the 12 EAS profiles, and every evidence, history, handoff,
  review and rehearsal document.
- **Process rules:** "source-bound evidence", per-step approvals, task packets and
  the Codex review harness. `AGENTS.md` shrinks to a short set of conventions.

## The new shape

| Area | Target |
| --- | --- |
| Backend | About 2,000 lines. Core plan routes, a fresh single migration, and providers that pass place names, types, summaries and dietary signals to Gemini. Cuisine and price become soft preferences, not filters. Place details are cached briefly. |
| AI quality | Natural-language input from each person, real reasoning per pick, and an eval that scores fit rather than just counting results. |
| Web | A real landing page and a redesigned app, built with the frontend-design skill. Mobile web is first-class. |
| Mobile | Rebuilt screens using the Appllama skills and Mobbin references: native feel, dark mode, motion. Three EAS profiles: development, preview and production. |
| Docs | `README`, `docs/roadmap.md` (short), `docs/decisions.md` (only durable choices), `AGENTS.md`/`CLAUDE.md` (lean). |

## Milestones

1. **Strip (now).** Delete the cut list, collapse the schema to one fresh
   migration, trim configuration and CI, and rewrite the docs. The app keeps
   working on the deterministic providers throughout.
2. **Make the AI good.** Richer place data, natural-language preferences, soft
   constraints and a real quality eval. One small, budgeted live comparison
   against real restaurants, with your approval.
3. **Web redesign.** Landing page plus the plan flow, built with the
   frontend-design skill.
4. **Mobile redesign.** The same flow in Expo, using the Appllama skills and
   Mobbin.
5. **Friends test.** Deploy to staging, then have five real groups use it for
   real dinners. Ask what worked. No measurement scaffolding beyond plain
   database counts.

Gates that stay with you: merges to `main`, deploys, secrets, paid live-AI runs,
database resets, store submissions and invites to real people.
