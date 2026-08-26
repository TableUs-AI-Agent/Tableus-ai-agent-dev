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
  Pull request #3 is merged. Budgeted Gemini hardening is implemented on
  `codex/gemini-staging-validation`. Two public candidates passed CI, and their
  live checks stopped before inference with zero reported tokens and `$0`: the
  first exposed unsupported generated string-schema keywords, while the second
  proved the cloud configuration but found that new projects cannot generate
  with Gemini 2.5 Flash-Lite. The owner approved Google's stable replacement,
  pinned `gemini-3.1-flash-lite`, including its current cost accounting and
  minimal-thinking behavior. Exact candidate
  `82c1d45f010a686df8802ab4b8a502731aa1be6f` passed public CI, but its live gate
  exposed unsupported strict-object wire metadata and then a generic Google
  `429 RESOURCE_EXHAUSTED` before inference. The compatibility fix is local;
  TableUs therefore tested the same pinned model and evaluation contract on
  Gemini Enterprise Agent Platform, the renamed evolution of Vertex AI. Exact
  candidate `0b7de266d4b053d49267b2ac22bd85052ab3ab8f` passed public CI, but
  its first six-case Agent Platform evaluation stopped before inference at
  `401`, zero tokens, and `$0`. The owner approved a project-only policy
  allowance for Agent Platform alongside the existing Gemini API allowance, and
  a new service-account-bound, Railway-restricted authorization key reached
  inference. That repeat passed two of six cases for `$0.00140175`. Sanitized
  probes isolated an unconstrained recommendation outcome and a missing user
  role on multimodal content; enum-backed recommendation fields and the explicit
  photo role are now implemented locally. The next staging step is a new
  exact-SHA candidate and fully passing evaluation before deployment.

The active gate sequence and required owner inputs are maintained in
`docs/release-runbook.md`.
