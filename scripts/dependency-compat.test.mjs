import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const require = createRequire(import.meta.url);
const mobileRequire = createRequire(new URL("../mobile/package.json", import.meta.url));
const routerRequire = createRequire(mobileRequire.resolve("expo-router/package.json"));
const easRequire = createRequire(require.resolve("eas-cli/package.json"));
const queryPath = routerRequire.resolve("query-string");
const query = routerRequire("query-string");

test("router's installed decoder preserves auth and share query semantics", () => {
  assert.equal(createRequire(queryPath)("decode-uri-component"), require("decode-uri-component-upstream").default);
  assert.deepEqual({ ...query.parse("token=a%2Bb%2Fc%3D&name=Jos%C3%A9+Lee&empty=&flag&tag=a&tag=b") }, {
    token: "a+b/c=", name: "José Lee", empty: "", flag: null, tag: ["a", "b"],
  });
  const values = { token: "a+b/c=", name: "東京 / café", next: "/join/abc?x=1" };
  assert.deepEqual({ ...query.parse(query.stringify(values)) }, values);
  assert.equal(query.parse("value=%FE%FF").value, "\uFFFD\uFFFD");
  assert.equal(query.parse("value=%FF%41").value, "%FFA");
});

test("malformed percent-encoded input finishes in an isolated process", () => {
  // Run separately so a regression cannot hang the whole test suite. This is
  // a completion bound, not a performance benchmark or native-device evidence.
  const result = spawnSync(process.execPath, ["-e", `
    const assert = require('node:assert/strict');
    const query = require(${JSON.stringify(queryPath)});
    const malformed = '%FF%41'.repeat(10_000);
    assert.equal(query.parse('token=' + malformed).token, '%FFA'.repeat(10_000));
  `], { timeout: 5_000, encoding: "utf8" });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
});

test("patched EAS schemas resolve repository profiles and reject invalid configuration", async () => {
  const { EasJsonAccessor, EasJsonUtils } = easRequire("@expo/eas-json");
  const accessor = EasJsonAccessor.fromProjectPath(path.resolve("mobile"));
  const profiles = await EasJsonUtils.getBuildProfileNamesAsync(accessor);
  for (const profile of profiles) {
    for (const platform of ["ios", "android"]) {
      const resolved = await EasJsonUtils.getBuildProfileAsync(accessor, platform, profile);
      assert.ok(resolved);
    }
  }
  const invalid = EasJsonAccessor.fromRawString(JSON.stringify({ build: { preview: { distribution: "public" } } }));
  await assert.rejects(() => EasJsonUtils.getBuildProfileAsync(invalid, "ios", "preview"));
});

test("EAS metadata validator retains format validation after the AJV patch", () => {
  const { createValidator } = easRequire("./build/metadata/utils/ajv.js");
  const validate = createValidator().compile({ type: "object", properties: { url: { type: "string", format: "uri" } }, required: ["url"] });
  assert.equal(validate({ url: "https://example.test/privacy" }), true);
  assert.equal(validate({ url: "not a URI" }), false);
});

test("EAS YAML, file patterns and generated IDs retain their APIs", () => {
  const yaml = easRequire("yaml");
  const minimatch = easRequire("minimatch");
  const { customAlphabet } = easRequire("nanoid");
  const workflow = { jobs: { build: { type: "build", params: { platform: "ios", profile: "test-ios" } } } };
  assert.deepEqual(yaml.parse(yaml.stringify(workflow)), workflow);
  assert.equal(minimatch("mobile/assets/icon.png", "mobile/**/*.png"), true);
  assert.equal(minimatch("mobile/assets/icon.jpg", "mobile/**/*.png"), false);
  assert.match(customAlphabet("abcdef0123456789", 24)(), /^[a-f0-9]{24}$/);
});

test("patched EAS tar preserves nested files through a local archive roundtrip", async (t) => {
  const tar = easRequire("tar");
  const temporary = await mkdtemp(path.join(tmpdir(), "tableus-dependency-test-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  await mkdir(path.join(temporary, "source", "nested"), { recursive: true });
  await mkdir(path.join(temporary, "output"));
  await writeFile(path.join(temporary, "source", "nested", "config.json"), '{"test":true}\n');
  const file = path.join(temporary, "fixture.tgz");
  await tar.c({ file, cwd: path.join(temporary, "source"), gzip: true }, ["nested"]);
  await tar.x({ file, cwd: path.join(temporary, "output") });
  assert.equal(await readFile(path.join(temporary, "output", "nested", "config.json"), "utf8"), '{"test":true}\n');
});
