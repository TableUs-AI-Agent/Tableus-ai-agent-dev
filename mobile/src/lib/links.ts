import { buildAuthUrl, buildJoinUrl, parseJoinToken, requireCanonicalUuid, type AuthLinkMode } from "@tableus/domain";

import { pendingJoinStore } from "./pending-join.ts";

const linkOrigin = `https://${process.env.EXPO_PUBLIC_LINK_HOST ?? "links.table-us.com"}`;

export function createCanonicalJoinUrl(planId: string, shareToken: string): string {
  // Fragment sharing is enabled only after compatible installed clients are verified.
  const format = process.env.EXPO_PUBLIC_JOIN_LINK_FORMAT === "fragment" ? "fragment" : "query";
  return buildJoinUrl(linkOrigin, planId, shareToken, format);
}

export function createCanonicalAuthUrl(mode: AuthLinkMode): string {
  return buildAuthUrl(linkOrigin, mode);
}

export function parseAuthLinkMode(value: string | string[] | undefined): AuthLinkMode {
  return value === "sign-in" ? "sign-in" : "join";
}

export function rewriteCanonicalSystemPath(path: string): string {
  try {
    const url = new URL(path, `${linkOrigin}/`);
    const appJoin = url.protocol === "tableus:" && (
      url.hostname === "join" || (!url.host && (url.pathname === "/join" || url.pathname.startsWith("/join/")))
    );
    if (url.origin !== linkOrigin && !appJoin) return path;
    const pathname = appJoin && url.hostname === "join" ? `/join${url.pathname}` : url.pathname;
    if (pathname === "/join" || pathname.startsWith("/join/")) {
      try {
        if (url.username || url.password || (appJoin && url.port) || !/^\/join\/[^/]+$/.test(pathname)) {
          pendingJoinStore.clear();
          return "/join/invalid";
        }
        const planId = requireCanonicalUuid(decodeURIComponent(pathname.slice("/join/".length)), "Plan ID");
        const token = parseJoinToken(path);
        if (token) {
          const { handle } = pendingJoinStore.capture(planId, token);
          return `/join/${planId}?pending=${encodeURIComponent(handle)}`;
        }
        // Expo can pass an already-sanitized path through this hook again.
        const handles = url.searchParams.getAll("pending");
        if (handles.length === 1) {
          const pending = pendingJoinStore.getSnapshot();
          if (pending?.planId === planId && pending.handle === handles[0]) return `/join/${planId}?pending=${encodeURIComponent(pending.handle)}`;
        }
        return `/join/${planId}`;
      } catch {
        pendingJoinStore.clear();
        return "/join/invalid";
      }
    }
    if (url.pathname === "/auth") {
      return `/auth?mode=${parseAuthLinkMode(url.searchParams.get("mode") ?? undefined)}`;
    }
    return path;
  } catch {
    pendingJoinStore.clear();
    return "/auth?mode=join";
  }
}
