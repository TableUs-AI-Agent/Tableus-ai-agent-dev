# Roadmap

Reset on October 15, 2026. See [reset-plan.md](reset-plan.md) for why. The
previous roadmap is in git history at `4a944e1`.

## Goal

Five real groups use TableUs to pick a real dinner, and say they'd use it again.

## Milestones

1. **Strip** (current). Remove hidden features, ops machinery, release ceremony
   and process documents. Collapse the schema to one fresh migration. The app
   keeps working on deterministic providers, and `make ready` passes.
2. **Make the AI good.** Gemini sees each place's name, types, summary and
   dietary or service signals. Each person gives preferences in plain language.
   Cuisine and price are soft preferences, not filters. Place details are cached
   briefly. The eval scores how well picks fit, and one budgeted live comparison
   runs with Brian's OK.
3. **Web redesign.** A landing page and the full plan flow, built with the
   frontend-design skill. It works well on a phone browser.
4. **Mobile redesign.** The same flow in Expo, built with the Appllama skills
   and Mobbin references, with dark mode.
5. **Friends test.** Deploy to staging and invite five groups Brian knows. Learn
   what works from conversations and plain database counts.

## Later, only if the friends test earns it

Remembering tastes across plans, recurring groups, reservation links, App Store
and Play distribution, and production hosting.
