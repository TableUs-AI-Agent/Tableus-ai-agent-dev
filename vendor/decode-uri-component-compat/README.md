# Decoder compatibility adapter

Expo Router 57 uses query-string 7's named CommonJS API. Its decoder dependency
is vulnerable to malformed-input denial of service (GHSA-vcc3-ghjq-m6fr).
Upstream decode-uri-component 0.5.0 fixes that issue but changes to an ESM default
export; substituting it directly breaks query-string's callable `require()`.
Query-string 9 also changes its public export shape and cannot be dropped into
this router unchanged.

This adapter exposes the unmodified upstream 0.5.0 default as CommonJS. The npm
alias keeps the upstream package/version/integrity visible in the lockfile and
keeps the two module names distinct. Its local 0.2.3 adapter version satisfies
query-string 7's `^0.2.2` range; it is not an upstream release number. The root
file dependency supplies this adapter without a decoder override or install hook.
No decoding code is forked. Node 22.23.1 and Metro must both pass the focused
compatibility checks.

Remove this adapter and its root file dependency when the SDK's supported router
ships a compatible patched decoder. Do not use it as a new shared client package.

- https://github.com/SamVerschueren/decode-uri-component/releases/tag/v0.5.0
- https://github.com/advisories/GHSA-vcc3-ghjq-m6fr
