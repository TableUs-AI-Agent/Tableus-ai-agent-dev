# F1-T2 — local XCTest log-discovery repair

The [P3-R1 review](n1-f1-p3r1-result.md) found actual Maestro 2.8.0 XCTest logs that
the live observer did not recognize. Repository discovery now includes the exact
registered debug layout: top-level `xctest_runner_YYYY-MM-DD_HHMMSS.log` and
`<registered flow stem>/logs/device-xctest.log`. Legacy Session/scheduling handling,
failure latching, registration/symlink checks and scan/retention limits remain.
Nearby names, other flow layouts and general Maestro logs are not newly included.

This is a local source repair for future operators. **The operator actually invoked
by P3-R1 and all its evidence remain unchanged.** Recognizing clean logs still sets
`acceptance:false`; it is not a substitute for visible UI evidence. The blank
screenshot discrepancy remains unresolved, and no new native run occurred.

## Verification

Sol implemented the helper and focused regressions; Astra reviewed/integrated it.
All 16 focused Python cases passed, including actual-layout discovery/retention,
both existing failure markers, latching after log disappearance and nearby-name
rejection. Root replayed copies of the two exact retained P3-R1 logs: both recognized,
no known startup marker, `acceptance:false`, no subprocess/signal execution. Original
native files were rehashed unchanged.

One fresh deterministic `make ready` passed in 44.783s: **293 JavaScript tests**
(225 TAP + 68 Jest), **98 backend tests**, three PostgreSQL skips, lint/type checks,
builds and smoke. The report-only bundle budget completed. Explicit
`npm run contract:check` passed with no generated schema/OpenAPI drift.
Application source is unchanged; only the helper and its Python tests changed.

[Machine-readable result](n1-f1-t2-result.json) records source hashes, exact private
archive and verification. Its ten-file index is
`19893bcae3f7aba9c492afcd13c9a91f25af0c50c19cc81cbb058d70904fc4a7`.
The separate final check summary adds Jest counts to the initial TAP-only count;
its SHA-256 is `77e1b30051626a3c0409d6edd98494756c497502f2a3044cfa22e7ebbf141211`.
No retained raw receipt or earlier archive was relabeled.

Native compatibility of this repair is unverified. Before another native proposal,
review the retained screenshot/device logs and prepare stronger visual evidence
criteria. Any future operator must be freshly bound to this source; do not patch
the old frozen operator. Existing application/live gates and budgets remain.
