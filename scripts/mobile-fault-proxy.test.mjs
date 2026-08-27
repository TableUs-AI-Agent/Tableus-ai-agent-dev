import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";
import test from "node:test";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proxyUrl = "http://127.0.0.1:18980";
const controlUrl = "http://127.0.0.1:18979";

async function waitForControl() {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${controlUrl}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 25));
  }
  throw new Error("Fault proxy did not start");
}

async function post(path, body) {
  const response = await fetch(`${controlUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  assert.equal(response.ok, true);
}

test("fault proxy drops safely and reports only replay booleans and counts", async () => {
  let commits = 0;
  const keys = new Set();
  const upstream = createServer((request, response) => {
    const key = String(request.headers["idempotency-key"] ?? "");
    const replay = keys.has(key);
    keys.add(key);
    if (!replay) commits += 1;
    response.writeHead(200, {
      "Content-Type": "application/json",
      ...(replay ? { "X-Idempotent-Replay": "true" } : {}),
    });
    response.end(JSON.stringify({ data: { committed: true }, meta: {} }));
  });
  upstream.listen(18981, "127.0.0.1");
  await once(upstream, "listening");

  const proxy = spawn(process.execPath, [join(repoRoot, "scripts", "mobile-fault-proxy.mjs")], {
    cwd: repoRoot,
    env: {
      ...process.env,
      TABLEUS_FAULT_PROXY_PORT: "18980",
      TABLEUS_FAULT_CONTROL_PORT: "18979",
      TABLEUS_FAULT_UPSTREAM_PORT: "18981",
    },
    stdio: "ignore",
  });

  try {
    await waitForControl();
    await post("/configure", { mode: "forward-then-drop-response", method: "POST", path: "/api/v1/write" });
    const secretKey = "must-never-be-emitted";
    const interrupted = await fetch(`${proxyUrl}/api/v1/write`, { method: "POST", headers: { "Idempotency-Key": secretKey }, body: "{}" });
    assert.equal(interrupted.status, 200);
    await assert.rejects(interrupted.json());
    assert.equal(commits, 1);

    const replay = await fetch(`${proxyUrl}/api/v1/write`, { method: "POST", headers: { "Idempotency-Key": secretKey }, body: "{}" });
    assert.equal(replay.ok, true);
    assert.equal(replay.headers.get("X-Idempotent-Replay"), "true");
    const statsResponse = await fetch(`${controlUrl}/stats?method=POST&path=${encodeURIComponent("/api/v1/write")}`);
    const rawStats = await statsResponse.text();
    assert.equal(rawStats.includes(secretKey), false);
    const stats = JSON.parse(rawStats);
    assert.deepEqual({
      request_count: stats.request_count,
      upstream_request_count: stats.upstream_request_count,
      same_idempotency_key: stats.same_idempotency_key,
      dropped_after_commit_count: stats.dropped_after_commit_count,
      idempotent_replay_count: stats.idempotent_replay_count,
    }, {
      request_count: 2,
      upstream_request_count: 2,
      same_idempotency_key: true,
      dropped_after_commit_count: 1,
      idempotent_replay_count: 1,
    });

    await post("/reset", {});
    await post("/configure", { mode: "fail-before-send", method: "POST", path: "/api/v1/write" });
    await assert.rejects(fetch(`${proxyUrl}/api/v1/write`, { method: "POST", headers: { "Idempotency-Key": "second-key" }, body: "{}" }));
    const beforeStats = await (await fetch(`${controlUrl}/stats?method=POST&path=${encodeURIComponent("/api/v1/write")}`)).json();
    assert.equal(beforeStats.request_count, 1);
    assert.equal(beforeStats.upstream_request_count, 0);
    assert.equal(beforeStats.dropped_before_send_count, 1);
  } finally {
    proxy.kill("SIGTERM");
    upstream.close();
    await once(upstream, "close");
  }
});
