# Astra reassessment local evidence

This is local deterministic evidence for the runtime file hashes in
`verification.json`. The commit containing this directory identifies the
replacement candidate. These files do not supersede prior hosted evidence.

- `make ready`: passed, including 197 JavaScript and 98 Python tests; three
  Postgres migration assertions require the CI Postgres service.
- `web-auth-timeout.png`: an expired fake session with a deliberately stalled
  browser auth response reaches a recoverable error screen.
- `web-auth-recovered.png`: explicit Retry with successful loopback fixtures
  restores the profile and plans screen.
- Shared API and mobile component tests cover rejected/hung/late credentials,
  refresh, pending invite recovery and sign-out superseding restoration.

No real session, account, OTP, mail, paid provider call, native build or deployed
candidate was used for this local evidence. The browser fixture initially
needed a route-handler correction; the captured recovery was observed after
that correction. No application change was needed for the fixture.
