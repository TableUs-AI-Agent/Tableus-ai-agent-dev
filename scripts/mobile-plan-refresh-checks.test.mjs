import assert from "node:assert/strict";
import test from "node:test";
import { assertPlanRefreshPhase, planRefreshSource } from "./mobile-plan-refresh-checks.mjs";

test("optional native refresh verification requires an explicit source identity", () => {
  assert.equal(planRefreshSource({}), null);
  const sha = "a".repeat(40);
  assert.equal(planRefreshSource({ "verify-plan-refresh": "true", "refresh-sha": sha }), sha);
  for (const args of [{ "verify-plan-refresh": "true" }, { "refresh-sha": sha }, { "verify-plan-refresh": "false", "refresh-sha": sha }, { "verify-plan-refresh": "true", "refresh-sha": "short" }]) {
    assert.throws(() => planRefreshSource(args), /exact --refresh-sha/);
  }
});

test("refresh evidence rejects accidental writes and extra reads in every phase", () => {
  const phases = {
    initial: { request_count: 1, upstream_request_count: 1 },
    scrolling: { request_count: 0, upstream_request_count: 0 },
    slow_refresh: { request_count: 1, upstream_request_count: 1, delayed_response_count: 1 },
    failed_refresh: { request_count: 3, upstream_request_count: 0, synthetic_error_count: 3 },
    recovered_refresh: { request_count: 1, upstream_request_count: 1 },
  };
  for (const [phase, counts] of Object.entries(phases)) {
    const observed = { ...counts, write_request_count: 0 };
    assert.equal(assertPlanRefreshPhase(phase, observed).passed, true);
    assert.throws(() => assertPlanRefreshPhase(phase, { ...observed, request_count: counts.request_count + 1 }), /request_count/);
    assert.throws(() => assertPlanRefreshPhase(phase, { ...observed, write_request_count: 1 }), /write_request_count/);
  }
  assert.throws(() => assertPlanRefreshPhase("scrolling", {}), /write_request_count/);
  assert.throws(() => assertPlanRefreshPhase("unobserved", {}), /Unknown/);
});

test("slow/error evidence requires the intended fault to have actually occurred", () => {
  assert.throws(() => assertPlanRefreshPhase("slow_refresh", { request_count: 1, upstream_request_count: 1, write_request_count: 0, delayed_response_count: 0 }), /delayed_response_count/);
  assert.throws(() => assertPlanRefreshPhase("failed_refresh", { request_count: 3, upstream_request_count: 0, write_request_count: 0, synthetic_error_count: 1 }), /synthetic_error_count/);
});
