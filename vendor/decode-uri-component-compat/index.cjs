// query-string 7 expects a callable CommonJS export. Upstream 0.5 fixes
// GHSA-vcc3-ghjq-m6fr but exports an ESM default; retain that API boundary.
module.exports = require("decode-uri-component-upstream").default;
