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

The current evidence objective is exact-SHA mobile offline mutation resilience:
artifact inspection plus clean iOS and Android fault-proxy journeys must prove
no queued writes, stable-key replay after ambiguous commit responses, and one
backend transition per logical operation. Verified Universal/App Links, live
Maps, and budgeted Gemini validation remain subsequent packets.

The active gate sequence and required owner inputs are maintained in
`docs/release-runbook.md`.
