import assert from "node:assert/strict";
import test from "node:test";

import { bordaScores } from "./index.ts";

test("Borda scoring awards 3/2/1 points", () => {
  assert.deepEqual(
    bordaScores([["a", "b", "c"], ["b", "a", "d"]]),
    { a: 5, b: 5, c: 1, d: 1 },
  );
});
