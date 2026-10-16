# Decisions

Only durable choices go here, one or two lines each, with the reason. The full
prior log is in git history at `4a944e1`.

## Product

- **AI-first group decision** (Oct 15, 2026). The product is the shared plan:
  plain-language preferences, AI picks grounded in real places with specific
  reasons, a one-tap vote, and the organizer locks it in. Discover, friends,
  reviews, photo analysis and the 3D tabletop are removed, not hidden.
- **Groups of 2 to 8, Borda top-three voting.** The organizer can finalize at
  any time and reopen. These are simple and already work.
- **Join by private link.** Anyone with the link signs in by email code and
  joins. Plan creation is limited to an allowlist during the friends test.

## Architecture

- **Keep the stack.** FastAPI and Postgres on Supabase, Next.js on Vercel, Expo
  Router, Railway for the API. A rewrite costs weeks and fixes nothing users
  would notice.
- **`/api/v1` with a generated client.** Web and mobile share only the API
  client and domain helpers, never UI.
- **The AI can only pick real places.** Gemini returns candidate keys from an
  enum of places that Google Places actually returned, using structured
  output. This prevents invented restaurants.
- **Deterministic providers locally and in CI.** Live Places and Gemini cost
  money and run only with Brian's OK.
- **CI on ready PRs only** (Oct 16, 2026). One job runs the full check when a
  PR is marked ready and on later pushes; drafts and docs-only changes skip it.
  Several agents push draft PRs at once, so per-push CI was mostly noise.
- **Simple safeguards.** A per-user rate limit and a Google Cloud budget alert
  replace the quota, budget and replay layers.
- **Direct account deletion.** Deleting an account removes the profile, the
  Auth user and the user's own content in one request. App stores require
  this.
