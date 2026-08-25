# Verified HTTPS-link evidence

Artifact candidate: `341d67ec73c96f96f19c6e0e2911677e973a7d61`

## Deployment and associations

- Vercel deployed the candidate to the staging project and serves it at
  `https://links.table-us.com`.
- Both association endpoints returned direct JSON `200` responses without a
  redirect before either app was installed.
- Apple Associated Domains Diagnostics approved
  `6MHJN5V9UJ.com.tableus.app` for the canonical host.
- Android reported `links.table-us.com` as verified for `com.tableus.app` with
  the certificate embedded in the tested APK.

## Signed artifacts

- Physical iOS internal build: `local-ios-341d67e`
  - Artifact: `tableus-links-ios-341d67e.ipa`
  - SHA-256:
    `b2e683faefff1b59c5f49c45b7dcb27c3752a5d3dc6e8c3dcdf6846c8165c6ed`
  - Apple Team ID: `6MHJN5V9UJ`
- ARM64 Android internal build: `local-android-341d67e`
  - Artifact: `tableus-links-android-341d67e.apk`
  - SHA-256:
    `3c73bf168f0d94788a415c93bb8672d1090323218ced452243679c406dfa72d3`
  - Signing-certificate SHA-256:
    `02:FC:F9:A8:5F:EF:26:D4:61:43:F4:D8:28:7A:32:5B:05:21:1B:B6:77:23:91:32:4C:12:AA:78:60:C6:65:68`

Both inspectors matched the exact candidate SHA, HTTPS staging API, Supabase
staging configuration, canonical link host, native association configuration,
and expected public signing identity. They found no demo identities, loopback
URLs, local/auth E2E controls, service-role marker, Railway production origin,
or other production origin.

## Device results

- Android API 36 ARM64 automation passed web fallback, verified native `/auth`,
  signed-out private join, returning code authentication, retained join intent,
  and rotated-link rejection without a chooser.
- A physical iPhone 17 Pro Max on iOS 26.6 passed Apple diagnostics. User taps
  from Notes opened native `/auth` and `/join/*`, returning code authentication
  restored the retained join route, and the rotated private link displayed the
  accessible terminal error.
- `/auth/confirm` and unrelated paths remain web-only by manifest construction
  and deterministic routing tests.

Current Maestro documentation does not support physical iOS devices, and its
signed runner timed out after installation. The iOS result is therefore
explicitly recorded as user-observed physical-device evidence, not automated
Maestro evidence. The Android journey remains automated. Only sanitized JSON
summaries and screenshots are retained; no private URL, token, email, OTP,
native log, or Maestro workspace is committed.

