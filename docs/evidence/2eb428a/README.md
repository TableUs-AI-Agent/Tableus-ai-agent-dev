# Gemini Agent Platform staging evidence

Candidate: `2eb428a05913c60dd1af1ae59fdd79fb233c5ede`

## Result

- Public GitHub CI run `32915965276` passed all checks.
- The frozen live evaluator passed 6/6 cases in six attempts using
  `gemini-3.1-flash-lite` through Agent Platform.
- Evaluator usage was 2,960 input tokens, 767 output/thinking tokens, and
  `$0.0018905` estimated cost.
- Railway deployment `a1030828-a505-417e-8285-c2b49dbbb39c` reports Supabase
  auth, live Places, live AI, `provider_mode=live`,
  `ai_backend=agent-platform`, and the exact candidate SHA.
- Vercel deployment `dpl_Ad4H9FqVAQJviSkP2KYTKWMkKxbt` is the exact-SHA clean
  Preview deployment assigned only to `tableus-staging.vercel.app`.
- The sanitized two-user journey passed with two participants, four distinct
  candidates, policy-safe candidate persistence, and aggregate-only usage of
  925 input tokens, 220 output/thinking tokens, and `$0.00056125` estimated
  cost.
- The `$5` Google Cloud monthly alert budget is active at 50%, 80%, and 100%.
- The active authorization key is restricted to Agent Platform and Railway's
  three static egress addresses. The superseded Developer API key is revoked.

## Retained artifacts

- `gemini-live-eval/2eb428a-ai-eval-live.json` contains sanitized per-case
  booleans, attempts, aggregate tokens, estimated cost, latency, model, fixture
  hash, and SHA.
- `gemini-staging/2eb428a-gemini-staging-summary.json` contains sanitized
  deployment identifiers, readiness booleans, counts, and aggregate usage.

No prompts, outputs, images, reviews, emails, OTPs, sessions, Place IDs, queries,
coordinates, provider responses, or credentials are retained.

## Operational notes

The first staging-evidence attempt ended on a transient location-resolution
timeout. No raw artifact was retained. The explicitly approved retry completed
successfully.

While deleting the already superseded Developer API key, the Google CLI printed
that key's value after revocation. The credential was already revoked, was
removed from Railway and the operator Keychain, and cannot authorize new calls.
The active Agent Platform credential was not exposed. No raw key value is
retained here.

The Vercel project currently shares its Production target with
`table-us.com`, `www.table-us.com`, and `links.table-us.com`. The staging release
therefore used a Preview deployment and reassigned only
`tableus-staging.vercel.app`; production-facing aliases were not changed.

## Deferred risks

- AI spend reservations use a one-process lock; horizontal scaling requires a
  durable reservation ledger.
- The Vercel staging/production alias topology should be separated before the
  production release gate.
- Existing npm audit findings in the Expo/React Native toolchain remain tracked.
- Production deployment, EAS/store actions, telemetry activation, account
  deletion, and cohort invitation were outside this gate.
