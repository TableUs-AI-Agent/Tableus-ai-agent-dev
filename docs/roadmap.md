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
`links.table-us.com` is synchronized with recovered `main`. DNS, TLS, Apple
registration/capabilities, and the replacement Android association are live.
Artifact inspection discovered an Expo SDK 57 iOS configuration-path gap, so the
remaining active work is a corrected exact-SHA readiness gate, replacement
iOS/Android artifacts, retained in-memory join-intent, and rotated-link device
evidence. Live Maps and budgeted Gemini validation remain subsequent packets.

The active gate sequence and required owner inputs are maintained in
`docs/release-runbook.md`.
