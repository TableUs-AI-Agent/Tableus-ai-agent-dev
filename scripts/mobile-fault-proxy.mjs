#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createServer, request as httpRequest } from "node:http";

const proxyPort = Number(process.env.TABLEUS_FAULT_PROXY_PORT ?? "8000");
const controlPort = Number(process.env.TABLEUS_FAULT_CONTROL_PORT ?? "7999");
const upstreamPort = Number(process.env.TABLEUS_FAULT_UPSTREAM_PORT ?? "8001");

let fault = null;
let stats = freshStats();

function freshStats() {
  return {
    requests: new Map(),
    upstreamRequests: new Map(),
    keyFingerprints: new Map(),
    droppedBeforeSend: 0,
    droppedAfterCommit: 0,
    idempotentReplays: 0,
  };
}

function routeKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function recordKey(key, rawValue) {
  if (!rawValue) return;
  const values = stats.keyFingerprints.get(key) ?? new Set();
  values.add(createHash("sha256").update(String(rawValue)).digest("hex"));
  stats.keyFingerprints.set(key, values);
}

function consumeFault(method, path) {
  if (!fault || fault.remaining < 1 || fault.method !== method || fault.path !== path) return "pass";
  fault.remaining -= 1;
  return fault.mode;
}

function json(response, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, { "Content-Type": "application/json", "Content-Length": body.length });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

const proxy = createServer(async (clientRequest, clientResponse) => {
  const method = (clientRequest.method ?? "GET").toUpperCase();
  const url = new URL(clientRequest.url ?? "/", "http://127.0.0.1");
  const key = routeKey(method, url.pathname);
  const body = await readBody(clientRequest);
  increment(stats.requests, key);
  recordKey(key, clientRequest.headers["idempotency-key"]);
  const mode = consumeFault(method, url.pathname);

  if (mode === "fail-before-send") {
    stats.droppedBeforeSend += 1;
    clientRequest.socket.destroy();
    return;
  }

  increment(stats.upstreamRequests, key);
  const upstream = httpRequest({
    hostname: "127.0.0.1",
    port: upstreamPort,
    path: `${url.pathname}${url.search}`,
    method,
    headers: { ...clientRequest.headers, host: `127.0.0.1:${upstreamPort}` },
  }, (upstreamResponse) => {
    const chunks = [];
    upstreamResponse.on("data", (chunk) => chunks.push(chunk));
    upstreamResponse.on("end", () => {
      if (upstreamResponse.headers["x-idempotent-replay"] === "true") stats.idempotentReplays += 1;
      if (mode === "forward-then-drop-response") {
        stats.droppedAfterCommit += 1;
        const responseBody = Buffer.concat(chunks);
        clientResponse.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
        clientResponse.flushHeaders();
        if (responseBody.length > 0) clientResponse.write(responseBody.subarray(0, 1));
        clientResponse.destroy();
        return;
      }
      const responseBody = Buffer.concat(chunks);
      clientResponse.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      clientResponse.end(responseBody);
    });
  });
  upstream.on("error", () => clientRequest.socket.destroy());
  upstream.end(body);
});

const control = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { ready: true });
  if (request.method === "POST" && url.pathname === "/reset") {
    stats = freshStats();
    fault = null;
    return json(response, 200, { reset: true });
  }
  if (request.method === "POST" && url.pathname === "/configure") {
    const body = JSON.parse(String(await readBody(request)) || "{}");
    const modes = new Set(["pass", "fail-before-send", "forward-then-drop-response"]);
    if (!modes.has(body.mode) || !["POST", "PUT", "PATCH", "DELETE"].includes(body.method) || typeof body.path !== "string" || !body.path.startsWith("/api/v1/")) {
      return json(response, 400, { configured: false });
    }
    fault = { mode: body.mode, method: body.method, path: body.path, remaining: 1 };
    return json(response, 200, { configured: true });
  }
  if (request.method === "GET" && url.pathname === "/stats") {
    const method = (url.searchParams.get("method") ?? "GET").toUpperCase();
    const path = url.searchParams.get("path") ?? "/";
    const key = routeKey(method, path);
    const fingerprints = stats.keyFingerprints.get(key) ?? new Set();
    return json(response, 200, {
      request_count: stats.requests.get(key) ?? 0,
      upstream_request_count: stats.upstreamRequests.get(key) ?? 0,
      same_idempotency_key: fingerprints.size === 1 && (stats.requests.get(key) ?? 0) > 1,
      dropped_before_send_count: stats.droppedBeforeSend,
      dropped_after_commit_count: stats.droppedAfterCommit,
      idempotent_replay_count: stats.idempotentReplays,
    });
  }
  return json(response, 404, { error: "not_found" });
});

proxy.listen(proxyPort, "127.0.0.1");
control.listen(controlPort, "127.0.0.1");

function stop() {
  proxy.close();
  control.close();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
