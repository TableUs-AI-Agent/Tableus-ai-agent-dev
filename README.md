# TableUs

**Dinner, decided.** Start a plan, share one link, and everyone says what they
want in their own words. TableUs finds real places nearby with Google Places,
Gemini picks four that work for the whole group with a specific reason for each,
and the group votes. The organizer locks it in.

TableUs began as a Cursor Hackathon 2026 project (2nd place). It is being
rebuilt for a small test with real groups of friends; see the
[roadmap](docs/roadmap.md) and the [reset plan](docs/reset-plan.md).

## How a plan works

1. Sign in with an email code and set your name. Optionally save standing tastes
   ("vegetarian", "loves spicy food") that TableUs uses in every plan.
2. Start a plan for a neighborhood and share its link (2 to 8 people).
3. Each person adds wishes: plain-language notes, cuisines, needs and budget.
4. Anyone asks for four picks once two or more people are in.
5. Everyone ranks their top three; the organizer locks in the winner.

## Stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, Tailwind CSS 4 |
| Mobile | Expo Router (iOS and Android) |
| API | FastAPI, Python 3.12, async SQLAlchemy, Alembic |
| Data and sign-in | Supabase Postgres and Auth (email codes) |
| Restaurants and AI | Google Places API (New), Gemini 3.1 Flash-Lite |
| Hosting | Vercel (web), Railway (API), EAS (mobile builds) |

```text
backend/     FastAPI API, providers, migrations, AI eval
frontend/    Next.js landing page and web app
mobile/      Expo Router app
packages/    Generated API client and shared link/legal helpers
tests/e2e/   Playwright journeys
```

## Run it locally

Needs Node 22.12+, Python 3.12. No credentials: local runs use demo sign-in and
fixture restaurants.

```bash
make setup
make dev
```

Open <http://localhost:3000> and pick a demo person. Use a second browser to be
the other person.

Before asking for review, run `make ready` (lint, types, tests, contract check,
builds and smoke). `make ai-eval` checks how well picks fit groups; `--live`
calls Gemini and costs money.
