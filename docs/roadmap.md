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
`9acf4fe2a648d4226be028d947ca8d08d7fc7029`: inspected local artifacts and clean
iOS/Android fault-proxy journeys prove no queued writes, stable-key replay after
ambiguous committed responses, and one backend transition per logical
operation. Verified Universal/App Links are the next evidence objective; live
Maps and budgeted Gemini validation remain subsequent packets.

The active gate sequence and required owner inputs are maintained in
`docs/release-runbook.md`.
