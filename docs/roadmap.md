# Closed-beta roadmap

1. **Foundation** — control plane, npm workspaces, uv project, deterministic CI.
2. **Backend v1** — providers, persistence, invite auth, plans, ranking, privacy.
3. **Clients** — shared generated contract, web transition, Expo iOS/Android.
4. **Evidence** — unit/integration/E2E suites, AI evaluation, performance budgets,
   verified-link manifests, an operator release runbook, and exact-SHA evidence.
5. **Staging** — Supabase, Railway, Vercel, EAS, Maps, then budgeted Gemini.
6. **Closed beta** — dogfood followed by a small invite-only US cohort.

Every milestone must be deterministic and credential-free in CI before the next
external integration is enabled.

Exact-SHA mobile offline mutation resilience is complete from candidate
`9acf4fe2a648d4226be028d947ca8d08d7fc7029`. Verified HTTPS routing through
`links.table-us.com` is complete from candidate
`341d67ec73c96f96f19c6e0e2911677e973a7d61`: DNS/TLS, Apple and Android
associations, signed artifact inspection, browser fallback, native auth/join,
retained in-memory join intent, and rotated-link rejection passed on Android and
  a physical iPhone. Production Play App Signing remains part of the later store
  gate. Policy-safe live Maps staging is complete from exact candidate
  `4a790b4ee40a12cdba8540fb12da586b3373a895`, including mixed-provider
  deployment, restricted egress/key configuration, fail-closed US location
  resolution, policy-safe persistence, and sanitized two-user evidence.
  Pull request #3 is merged. Budgeted Gemini hardening and Agent Platform staging
  validation are complete from exact candidate
  `2eb428a05913c60dd1af1ae59fdd79fb233c5ede`. Public CI, the frozen six-case
  paid evaluation, exact-SHA Railway/Vercel deployment, and sanitized two-user
  staging evidence are green. Staging now runs Supabase auth, live Places, and
  live Gemini with the restricted service-account-bound key and application
  spend ceiling. Privacy-safe observability is now the active closed-beta
  readiness packet: anonymous aggregate PostHog events and error-only Sentry
  reporting must pass replacement exact-SHA leakage and staging evidence after
  the first live pass caught and fixed anonymous-ingestion configuration,
  before cumulative web/iOS/Android smoke evidence and owner-reviewed
  release/rollback decisions.

The active gate sequence and required owner inputs are maintained in
`docs/release-runbook.md`.
