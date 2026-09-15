const expectedPhases = {
  initial: { request_count: 1, upstream_request_count: 1 },
  scrolling: { request_count: 0, upstream_request_count: 0 },
  slow_refresh: { request_count: 1, upstream_request_count: 1, delayed_response_count: 1 },
  failed_refresh: { request_count: 3, upstream_request_count: 0, synthetic_error_count: 3 },
  recovered_refresh: { request_count: 1, upstream_request_count: 1 },
};

export function planRefreshSource(args) {
  if (args["verify-plan-refresh"] === undefined && args["refresh-sha"] === undefined) return null;
  if (args["verify-plan-refresh"] !== "true" || !/^[0-9a-f]{40}$/.test(args["refresh-sha"] ?? "")) {
    throw new Error("Plan refresh verification requires --verify-plan-refresh true and an exact --refresh-sha");
  }
  return args["refresh-sha"];
}

export function assertPlanRefreshPhase(phase, observed) {
  const expected = expectedPhases[phase];
  if (!expected) throw new Error("Unknown plan-refresh verification phase");
  for (const [key, count] of Object.entries({ write_request_count: 0, ...expected })) {
    if (observed[key] !== count) throw new Error(`Plan refresh ${phase}: ${key} must be ${count}; observed ${observed[key]}`);
  }
  return { phase, ...Object.fromEntries(Object.keys({ write_request_count: 0, ...expected }).map((key) => [key, observed[key]])), passed: true };
}
