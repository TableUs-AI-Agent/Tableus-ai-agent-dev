import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { promptSecret } from "./prompt-utils.mjs";

test("secret prompts suppress input and restore terminal mode", async () => {
  const input = new EventEmitter();
  input.isTTY = true;
  input.isRaw = false;
  const rawModes = [];
  input.setRawMode = (value) => {
    input.isRaw = value;
    rawModes.push(value);
  };
  input.resume = () => {};
  let rendered = "";
  const pending = promptSecret("Verification code: ", {
    input,
    output: { write: (value) => { rendered += value; } },
  });
  input.emit("data", Buffer.from("private-otp\r"));

  assert.equal(await pending, "private-otp");
  assert.equal(rendered, "Verification code: \n");
  assert.deepEqual(rawModes, [true, false]);
});

test("secret prompts fail closed without terminal echo control", () => {
  assert.throws(
    () => promptSecret("Secret: ", { input: { isTTY: false }, output: { write() {} } }),
    /interactive TTY/,
  );
});
