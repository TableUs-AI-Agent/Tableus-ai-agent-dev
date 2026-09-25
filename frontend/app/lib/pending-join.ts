import { createIdempotencyKey } from "@tableus/api-client";
import { PendingJoinStore, parseJoinToken, requireCanonicalUuid } from "@tableus/domain";

/** Module memory only: never put the capability in a route, query cache or storage. */
export const pendingJoin = new PendingJoinStore({ createHandle: createIdempotencyKey });

export const subscribePendingJoin = (listener: () => void) => pendingJoin.subscribe(listener);
export const pendingJoinSnapshot = () => pendingJoin.getSnapshot();
let uncertainHandle: string | null = null;

export function markJoinUncertain(handle: string): void {
  if (pendingJoin.getSnapshot()?.handle === handle) uncertainHandle = handle;
}

export function needsJoinReconciliation(handle: string): boolean {
  return uncertainHandle === handle && pendingJoin.getSnapshot()?.handle === handle;
}

export function clearJoinUncertainty(handle?: string): void {
  if (handle === undefined || uncertainHandle === handle) uncertainHandle = null;
}

type BrowserLocation = { href: string; pathname: string; search: string; hash: string };
type BrowserHistory = { state: unknown; replaceState: (state: unknown, unused: string, url: string) => void };

export type JoinCaptureResult = "captured" | "restored" | "missing" | "invalid";

/** Capture and scrub before React keeps any token-bearing state. */
export function captureJoinLocation(
  planId: string | null,
  location: BrowserLocation,
  history: BrowserHistory,
): JoinCaptureResult {
  const hasUrlData = Boolean(location.search || location.hash);
  try {
    if (!planId) {
      pendingJoin.clear();
      return "invalid";
    }
    requireCanonicalUuid(planId, "Plan ID");
    const token = parseJoinToken(location.href);
    if (token !== null) {
      clearJoinUncertainty();
      pendingJoin.capture(planId, token);
      return "captured";
    }
    return pendingJoin.getSnapshot()?.planId === planId ? "restored" : "missing";
  } catch {
    clearJoinUncertainty();
    pendingJoin.clear();
    return "invalid";
  } finally {
    if (hasUrlData) history.replaceState(history.state, "", location.pathname);
  }
}
