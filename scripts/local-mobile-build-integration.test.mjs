import assert from "node:assert/strict";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { artifactChecksum } from "./evidence-utils.mjs";

// Run the real orchestrator against a separate Git fixture. Only npm/EAS and
// inspectors are stubbed; no dependency install, compiler or device can execute.
for (const [platform, outcome] of [["android", "success"], ["android", "build-failure"], ["android", "inspection-failure"], ["ios", "success"]]) {
  test(`full CLI ${platform} ${outcome} preserves exact-source diagnostics and gates exports`, (t) => {
    const parent = new URL("../.artifacts/retention-tests/", import.meta.url).pathname;
    mkdirSync(parent, { recursive: true, mode: 0o700 });
    const root = mkdtempSync(join(parent, "fixture-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const repo = join(root, "operator"); mkdirSync(repo);
    cpSync(new URL(".", import.meta.url), join(repo, "scripts"), { recursive: true });
    mkdirSync(join(repo, "mobile"));
    writeFileSync(join(repo, "mobile", "fixture.txt"), "no native source");
    writeFileSync(join(repo, ".gitignore"), "node_modules/\n");
    writeFileSync(join(repo, "package-lock.json"), "fixture lock");
    const emitter = `import {writeFileSync} from 'node:fs';
      const args = Object.fromEntries(process.argv.slice(2).reduce((a,v,i,all)=>i%2?a:[...a,[v.slice(2),all[i+1]]],[]));
      console.log('fixture inspector/receipt');
      if(process.env.FIXTURE_OUTCOME==='inspection-failure') process.exit(19);
      writeFileSync(args.output, JSON.stringify({candidate_sha:args.sha, build_id:args['build-id']}));`;
    for (const file of ["inspect-mobile-local-e2e-artifact.mjs", "local-mobile-build-receipt.mjs"]) writeFileSync(join(repo, "scripts", file), emitter);
    writeFileSync(join(repo, "scripts", "ios-scene-build-preflight.mjs"), "console.log('fixture iOS preflight');");
    const git = (...args) => {
      const result = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
    };
    git("init", "-q"); git("config", "user.email", "fixture@test.invalid"); git("config", "user.name", "Fixture");
    git("add", "."); git("commit", "-qm", "application fixture");
    const application = git("rev-parse", "HEAD");
    writeFileSync(join(repo, "operator-only.txt"), "separate operator revision");
    git("add", "."); git("commit", "-qm", "operator fixture");
    const operator = git("rev-parse", "HEAD");
    const bin = join(root, "bin"); mkdirSync(bin);
    writeFileSync(join(bin, "npm"), `#!/usr/bin/env node
      const fs = require('node:fs'); const path = require('node:path');
      console.log('fixture npm'); fs.mkdirSync('node_modules/.bin', {recursive:true});
      fs.symlinkSync(path.join(process.env.FIXTURE_BIN,'eas'), 'node_modules/.bin/eas');`);
    writeFileSync(join(bin, "eas"), `#!/usr/bin/env node
      const fs = require('node:fs'); const path = require('node:path');
      if(process.env.EAS_LOCAL_BUILD_SKIP_CLEANUP!=='1') process.exit(77);
      const dir=process.env.EAS_LOCAL_BUILD_WORKINGDIR; fs.mkdirSync(dir,{recursive:true});
      fs.writeFileSync(path.join(dir,'libapp.so'),'fixture symbols');
      fs.writeFileSync(process.env.SOURCEMAP_FILE,'fixture map');
      const args=process.argv.slice(2); const out=args[args.indexOf('--output')+1];
      if(args[args.indexOf('--platform')+1]==='ios') {
        const app=path.join(dir,'Fixture.app'); fs.mkdirSync(app); fs.writeFileSync(path.join(app,'Fixture'),'fixture app');
        require('node:child_process').execFileSync('tar',['-czf',out,'-C',dir,'Fixture.app']);
      } else fs.writeFileSync(out, 'fixture APK '+process.env.EXPO_PUBLIC_SOURCE_SHA);
      console.error('fixture build log');
      if(process.env.FIXTURE_OUTCOME==='build-failure') process.exit(17);`);
    chmodSync(join(bin, "npm"), 0o700); chmodSync(join(bin, "eas"), 0o700);
    const sdk = join(root, "sdk");
    mkdirSync(join(sdk, "platforms"), { recursive: true }); mkdirSync(join(sdk, "build-tools"));
    const artifact = join(root, platform === "ios" ? "output.app" : "output.apk");
    const result = spawnSync(process.execPath, [join(repo, "scripts", "local-mobile-build.mjs"),
      "--platform", platform, "--profile", `test-${platform}`, "--sha", application,
      "--build-id", `local-${platform}-fixture`, "--android-fingerprint", "ab".repeat(32),
      "--artifact", artifact, "--inspection-report", join(root, "inspection.json"), "--receipt", join(root, "receipt.json"),
    ], { encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, FIXTURE_BIN: bin, FIXTURE_OUTCOME: outcome, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk } });
    assert.equal(result.status, outcome === "success" ? 0 : 1, result.stderr);
    const retained = `${artifact}.diagnostics`;
    const inventory = JSON.parse(readFileSync(join(retained, "inventory.json"), "utf8"));
    assert.equal(inventory.application_sha, application);
    assert.equal(inventory.operator_tooling_sha, operator);
    assert.notEqual(application, operator);
    assert.equal(inventory.build_id, `local-${platform}-fixture`);
    assert.equal(inventory.status, outcome === "success" ? "succeeded" : "failed");
    assert.deepEqual(inventory.diagnostics.missing, []);
    assert.match(readFileSync(join(retained, "build.log"), "utf8"), /fixture build log/);
    const rawName = platform === "ios" ? "build.tar.gz" : "build.apk";
    const raw = inventory.outputs.find((file) => file.path === rawName);
    assert.equal(raw.sha256, artifactChecksum(join(retained, rawName)));
    if (outcome === "success") {
      assert.equal(inventory.artifact_sha256, artifactChecksum(artifact));
      assert.equal(inventory.receipt_sha256, artifactChecksum(join(root, "receipt.json")));
      assert.equal(inventory.inspection_report_sha256, artifactChecksum(join(root, "inspection.json")));
    } else {
      assert.throws(() => readFileSync(artifact), /ENOENT/);
      assert.throws(() => readFileSync(join(root, "receipt.json")), /ENOENT/);
    }
  });
}
