# Active packet: verified Universal Links and Android App Links

## Status

Local implementation and readiness verification are complete on
`codex/verified-links`, branched from offline evidence commit
`e1e9b2263541346db19f535c90c4f985b6b34d97`. DNS/Vercel configuration,
signing-identifier publication, Apple device registration, staging deployment,
signed local EAS builds, and two returning-sign-in OTP emails remain one
explicit owner gate against the frozen candidate SHA.

## Objective

Make `https://links.table-us.com` the single durable HTTPS host for TableUs auth
and private-plan links. Installed signed apps open the exact Expo Router route;
devices without the app continue through the Next.js fallback.

## Deliverables

- Shared fail-closed HTTPS builders used by every web and mobile share action.
- Exact iOS `/join/*` and `/auth` AASA rules plus matching Associated Domains;
  `/auth/confirm` remains web-only.
- Exact verified Android join-prefix and auth-path filters plus an EAS signing
  certificate association.
- Inline web auth and mobile protected routing that retain a join URL only in
  the current navigation process and never persist its share token.
- Accessible invalid/expired/rotated-link states on both clients.
- Supabase-authenticated link-test profiles, signed-artifact inspection, and a
  redacted physical-iOS/Android evidence runner.

## Acceptance

- Association files return JSON `200` directly from the canonical HTTPS host,
  without redirects, and contain only the intended app IDs, certificates, and
  paths.
- Signed exact-SHA artifacts contain the canonical host and staging services but
  no demo identity, loopback URL, local/auth E2E control, service-role marker, or
  production origin.
- `/auth` and `/join/*` open TableUs without an Android chooser and through an
  approved iOS Associated Domains result; unrelated routes and `/auth/confirm`
  stay on the web.
- A signed-out user opens a private join URL, completes one returning OTP, lands
  back on the same join route, and sees a clear terminal response for a rotated
  token.
- Without the app installed, both supported URLs render a usable web fallback.

## Boundaries

- No backend schema/API change, Railway deployment, new invite, production
  build, store submission, paid provider, account deletion, or magic-link auth.
- The preview Android certificate is additive; the Google Play App Signing
  fingerprint is added later before store distribution.
- Apple CDN propagation is awaited and the app is reinstalled when necessary;
  development-mode associated domains are not accepted as final evidence.
