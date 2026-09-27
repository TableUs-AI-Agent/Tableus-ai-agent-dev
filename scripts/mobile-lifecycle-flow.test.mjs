import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const flow = (name) => readFileSync(new URL(`../mobile/.maestro/${name}`, import.meta.url), "utf8");
const runner = readFileSync(new URL("./mobile-e2e.mjs", import.meta.url), "utf8");

test("lifecycle create targets the explicit accessibility label", () => {
  const create = flow("lifecycle-create.yml");
  assert.match(create, /text: "Plan title"/);
  assert.doesNotMatch(create, /Plan title\|Friday dinner/);
});

test("lifecycle writes explicitly recover from ambiguous responses", () => {
  const expectations = {
    "lifecycle-create.yml": "Retry creating plan",
    "lifecycle-guest-join.yml": "Retry joining plan",
    "lifecycle-organizer-vote.yml": "Retry ranked vote",
    "lifecycle-guest-vote.yml": "Retry ranked vote",
    "lifecycle-organizer-finalize.yml": "Retry finalizing plan",
    "lifecycle-rotated-link.yml": "Retry joining plan",
    "lifecycle-stale-run.yml": "Retry saving constraints",
  };
  for (const [name, label] of Object.entries(expectations)) {
    const source = flow(name);
    assert.match(source, new RegExp(label));
    assert.match(source, /runFlow:[\s\S]*when:[\s\S]*visible:/);
  }
  assert.match(flow("lifecycle-organizer-finalize.yml"), /Retry reopening voting/);
});

test("lifecycle vote flows scroll to saved or retry status after submission", () => {
  for (const name of ["lifecycle-organizer-vote.yml", "lifecycle-guest-vote.yml"]) {
    const source = flow(name);
    assert.match(
      source,
      /text: "Submit ranked vote"[\s\S]*scrollUntilVisible:\n\s+element: "\.\*\(Ranked vote saved\.\|Retry ranked vote\)\.\*"/,
    );
  }
});

test("lifecycle runner preflights the exact simulator or emulator artifact", () => {
  assert.match(runner, /mobile-device-preflight\.mjs/);
  assert.match(runner, /"--boot", platform === "ios" \? "true" : "false"/);
});
