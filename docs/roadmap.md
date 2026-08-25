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
  gate. Policy-safe live Maps infrastructure and mixed-provider deployment are
  configured; a fail-closed city-country validation correction and renewed
  exact-SHA evidence remain the active packet. Budgeted Gemini validation follows
  only after that evidence is green.

The active gate sequence and required owner inputs are maintained in
`docs/release-runbook.md`.
