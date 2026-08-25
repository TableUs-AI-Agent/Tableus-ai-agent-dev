# Active packet: verified Universal Links and Android App Links

## Status

Complete on `codex/verified-links` from exact artifact candidate
`341d67ec73c96f96f19c6e0e2911677e973a7d61`. DNS/TLS, the canonical Vercel
deployment, Apple App ID and Associated Domains, registered physical iPhone,
preview Android signer, direct manifests, signed artifacts, and both platform
journeys are green. Android ran through the sanitized automated runner. Physical
iOS passed Apple diagnostics and a user-observed Notes/auth/retained-join/rotated
journey; it is intentionally not labeled automated because Maestro does not
currently support physical iOS devices. Sanitized evidence is committed under
`docs/evidence/341d67e/`.

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
- The preview Android association contains only the current signer. Superseded
  local APKs must be uninstalled because the rotated certificate cannot update
  them in place; Google Play App Signing remains a later separate fingerprint.
- Apple CDN propagation is awaited and the app is reinstalled when necessary;
  development-mode associated domains are not accepted as final evidence.

## Evidence

- Vercel canonical staging deployment: exact artifact candidate `341d67e`.
- iOS build `local-ios-341d67e`, SHA-256
  `b2e683faefff1b59c5f49c45b7dcb27c3752a5d3dc6e8c3dcdf6846c8165c6ed`.
- Android build `local-android-341d67e`, SHA-256
  `3c73bf168f0d94788a415c93bb8672d1090323218ced452243679c406dfa72d3`.
- Apple diagnostics approved `6MHJN5V9UJ.com.tableus.app`; Android reported
  `links.table-us.com` verified for `com.tableus.app`.
- Both platforms opened native `/auth` and `/join/*`, retained the private join
  intent across returning authentication, and showed the explicit rotated-link
  state. No private URL, account, or code is retained in evidence.
