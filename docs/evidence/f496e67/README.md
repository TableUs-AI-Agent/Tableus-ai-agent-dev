# Closed-beta readiness deployment evidence

Source candidate: `f496e6713d671e799082578af835047b59925208`

## Completed gates

- Public CI run `33572990627` completed successfully at the exact source SHA.
- Railway deployment `e8b7c1e1-7f12-46ce-bc4f-ce8a2da57965` passed its health
  gate. Readiness reports the exact source SHA, Supabase authentication, live
  Places, live Gemini, and staging telemetry.
- The runtime database uses Supabase's IPv4 session pooler and the existing
  least-privilege credential. A read-only operator check confirmed the active
  role is `tableus_runtime` and has `USAGE` on the private `app` schema. No
  credential was displayed, generated, or rotated.
- Vercel Preview deployment `dpl_EpX2TtZRH3BDeyuPwXDZbuFiZAFB` was built from
  the clean exact-SHA checkout and is Ready. Only
  `tableus-staging.vercel.app` was reassigned. `links.table-us.com`,
  `table-us.com`, and `www.table-us.com` remain on their prior deployment.

## Pending cumulative gates

- Budgeted live Places/Gemini smoke.
- Sequential exact-SHA deterministic, readiness, and telemetry mobile
  artifacts and their sanitized device evidence.
- Final cumulative evidence validation and separate merge approval.

No email, OTP, invite, share token, database URL, credential, Place ID,
location, restaurant content, prompt, or provider response is retained here.
