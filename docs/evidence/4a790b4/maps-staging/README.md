# Maps staging evidence

- Candidate SHA: `4a790b4ee40a12cdba8540fb12da586b3373a895`
- GitHub CI run: `32827863841` (`ci` passed in 4m56s)
- Railway deployment: `d9149f0e-080b-441d-8d17-f6498e0ba030`
- Railway image digest:
  `sha256:650be35720550084cc9fb054e1e8bb8264ddeb765c147dddf8b308d1954547de`
- Vercel deployment: `dpl_GRdJeZMAfKc7e4dPJESvaYZVnou6`
- Readiness: exact SHA, Supabase auth, live Places, deterministic AI, and
  compatibility mode `mixed`.
- Infrastructure: high-availability static egress active; server key restricted
  to those IPs and Places API New; $10 monthly budget alerts and 60-RPM method
  preferences confirmed.
- Journey: two existing approved users authenticated, one location resolved, one
  plan created and joined, four distinct candidates generated, and all candidate
  details refreshed from Google.
- Persistence: the latest evidence plan has a Place ID, null stored coordinates,
  two participants, four candidates, and no Google display-data columns in the
  candidate schema.
- Privacy: the retained JSON passed its exact field allowlist and content scan.
  No email, verification code, query, coordinate, Place ID, name, address,
  provider response, API key, token, or session is retained.

Commands used:

```bash
make ready
gh run watch 32827863841 --exit-status
make maps-staging-e2e \
  API_URL=https://api-staging-3795.up.railway.app \
  EVIDENCE=docs/evidence/4a790b4/maps-staging \
  RAILWAY_DEPLOYMENT=d9149f0e-080b-441d-8d17-f6498e0ba030 \
  VERCEL_DEPLOYMENT=dpl_GRdJeZMAfKc7e4dPJESvaYZVnou6
```

The first staging attempt on the superseded candidate is not release evidence.
It retained no raw artifacts and led to the fail-closed city-country validation
correction included in this candidate.
