# TableUs engineering guide

## What we're building

TableUs is the fastest way for a small group to agree on where to eat. Each
person says what they want in plain language, TableUs finds real nearby
restaurants and the AI picks a short list that fits everyone with a specific
reason per pick, the group votes, and the organizer locks it in. The AI quality
is the product; everything else should be simple.

Read `docs/roadmap.md` for the current milestone and `docs/decisions.md` for
durable choices. Update them in the same change when they stop being true.

## How we work

- Build the smallest thing that serves the current milestone. No speculative
  infrastructure, compliance machinery or release ceremony ahead of real users.
- Prefer deleting code to adding configuration. If a feature isn't in the
  roadmap, it doesn't belong in `main`.
- Branch as `codex/<objective>` from `main`. Commit at meaningful points with
  plain messages. No evidence files, handoff documents or per-step logs.
- Local and CI runs use the deterministic providers. Live Google Places or
  Gemini calls cost money and need Brian's OK.
- Run `make ready` before asking for review.
- CI skips draft PRs and docs-only changes, and runs when a PR is marked ready.
  Verify locally while drafting, batch commits and push at checkpoints, and
  don't push or re-run CI just to see it pass. When a draft needs hosted proof,
  run `gh workflow run CI --ref <branch>` once.

## Brian decides

Merges to `main`, deploys, adding or rotating secrets, paid live-AI runs,
database resets or production migrations, store submissions, and inviting real
people. Everything else: use judgement, do it, and report the result.

## Repository

- `backend/`: Python 3.12, FastAPI, async SQLAlchemy, Alembic.
- `frontend/`: Next.js web app and landing page. UI work uses the
  frontend-design skill.
- `mobile/`: Expo Router iOS/Android app. UI work uses the Appllama skills and
  Mobbin references. Generated `ios/` and `android/` folders are not source.
- `.claude/skills/` holds motion, polish and accessibility skills (see its
  README). They sit under frontend-design and Appllama, which still set the
  visual direction: reach for `animate` (web) or `animate-expo` (mobile) when
  adding motion, `review-animations` before merging motion changes, `break-ui`
  on new screens, and `accessibility` (web) for WCAG checks. Don't commit their
  `plans/` or prototype output, and don't install audit tools globally.
- `packages/api-client/` (generated from the OpenAPI contract) and
  `packages/domain/` are the only shared client code. Don't share platform UI.
- Clients talk to `/api/v1`; Supabase on the client is for sign-in only.
