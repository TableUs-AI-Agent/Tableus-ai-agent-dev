# TableUs

**Decide where to eat, together.**

TableUs replaces the group-chat debate about dinner with one shared plan. The
organizer creates a plan and shares a private link, each person adds their
constraints, TableUs proposes four nearby restaurants grounded in Google Places
and ranked with Gemini, diners rank their top three, and the organizer finalizes
the choice. Each diner uses their own account; the organizer can finalize before
all votes arrive. Learned tastes are deferred.

TableUs began as a Cursor Hackathon 2026 project (2nd place) and is now preparing
an invite-only closed beta in the US on web, iOS and Android.

## Status

An earlier shared-plan implementation runs on staging with live Places and Gemini.
The cumulative web/iOS/Android baseline is integrated into `main` and passes
hosted CI; it still needs release acceptance.
The next milestone is a staging pilot on all three platforms with
real groups; see the [roadmap](docs/roadmap.md) and [current state](docs/current-state.md).
The Priority 2 candidate focuses web/mobile on Plans and Account. Deferred discovery,
friends, review, taste-profile and photo code/data remain; hidden entry routes lead
to Plans. Finalization records distinct voters for the bounded
[pilot measurement](docs/pilot-measurement.md); this candidate is not deployed.

## How a plan works

1. Sign in by email code with an invite (returning users just sign in).
2. Create a plan for 2–8 people with a location, then share its private link.
3. Each participant saves constraints such as cuisines and price.
4. Generate four grounded restaurant options.
5. Diners rank their top three (3/2/1 points).
6. The organizer finalizes, or reopens the vote to change the outcome.

The three-week pilot targets five real groups and completion of at least half
of plans that gain a second participant. A successful pilot decision requires at
least two independent votes; this is a measurement rule, not a new API quorum.
Organizer follow-up asks whether the group went and would use TableUs again.

## Technology

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, Tailwind CSS 4 |
| Mobile | Expo Router (one iOS and Android app) |
| API | FastAPI, Python 3.12, async SQLAlchemy, Alembic |
| Data and auth | Supabase Postgres and Auth (email OTP) |
| Restaurants and AI | Google Places API (New), Gemini 3.1 Flash-Lite |
| Hosting | Vercel (web), Railway (API), EAS (mobile builds) |
| Telemetry | Anonymous PostHog events, error-only Sentry |

## Repository

```text
backend/     FastAPI API, persistence, auth, providers, ranking, migrations
frontend/    Next.js web client
mobile/      Expo Router iOS/Android client
packages/    Generated API client and shared domain logic
scripts/     Build, evidence and operator tooling
tests/       Playwright browser journeys
docs/        Current state, roadmap, decisions, runbook and evidence
```

## Quick start

Prerequisites: Node.js >=22.12 <23 with npm, Python 3.12, and Expo Go for the fastest
mobile loop. Credentials are needed only for live mode.

```bash
git clone https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev.git
cd Tableus-ai-agent-dev
make setup
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
cp mobile/.env.example mobile/.env
make dev
```

The defaults use deterministic restaurant and AI fixtures, demo access and local
SQLite, so no credentials are required. Open <http://localhost:3000> for web or
scan Expo's QR code. You can also run `npm run dev:web`, `npm run dev:mobile`, and
`cd backend && .venv/bin/uvicorn main:app --reload` separately.

For application or executable changes, run focused checks and `make ready` once
before handoff. It runs lint, types, tests, contract generation, builds,
deterministic smoke and a report-only bundle measurement. Documentation changes
use link and consistency checks; see the workflow for release-specific checks.

## Contributing

Read [AGENTS.md](AGENTS.md) and the [development workflow](docs/development-workflow.md).
[Decisions](docs/decisions.md) records durable product and architecture choices,
and the [release runbook](docs/release-runbook.md) covers staging and release steps.
