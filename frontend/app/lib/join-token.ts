import { parseJoinToken } from "@tableus/domain";

/**
 * A plan's join token survives the sign-in detour in session storage, then is
 * scrubbed from the address bar so it doesn't leak through history or referrers.
 */
const key = (planId: string) => `tableus.join.${planId}`;

export function captureJoinToken(planId: string): string | null {
  let token: string | null = null;
  try {
    token = parseJoinToken(window.location.href);
  } catch {
    token = null;
  }
  if (window.location.search || window.location.hash) {
    window.history.replaceState(window.history.state, "", window.location.pathname);
  }
  try {
    if (token) window.sessionStorage.setItem(key(planId), token);
    return token ?? window.sessionStorage.getItem(key(planId));
  } catch {
    return token;
  }
}

export function forgetJoinToken(planId: string): void {
  try {
    window.sessionStorage.removeItem(key(planId));
  } catch {
    // Nothing stored.
  }
}
