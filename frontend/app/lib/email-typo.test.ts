import assert from "node:assert/strict";
import test from "node:test";

import { suggestEmail } from "./email-typo.ts";

test("suggests the usual fix for a mistyped mail domain", () => {
  assert.equal(suggestEmail("sam@gmail.cm"), "sam@gmail.com");
  assert.equal(suggestEmail("sam@gmail.co"), "sam@gmail.com");
  assert.equal(suggestEmail("sam@gmial.com"), "sam@gmail.com");
  assert.equal(suggestEmail("sam@hotmail.comm"), "sam@hotmail.com");
  assert.equal(suggestEmail("sam@icoud.com"), "sam@icloud.com");
});

test("leaves real addresses alone", () => {
  for (const address of ["sam@gmail.com", "sam@icloud.com", "sam@company.co", "sam@table-us.com", "sam@gmail.co.uk", "not-an-email"]) {
    assert.equal(suggestEmail(address), null, address);
  }
});
