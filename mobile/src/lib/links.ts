import { buildAuthUrl, buildJoinUrl, requireCanonicalUuid, type AuthLinkMode } from "@tableus/domain";

const linkOrigin = `https://${process.env.EXPO_PUBLIC_LINK_HOST ?? "links.table-us.com"}`;

export function createCanonicalJoinUrl(planId: string, shareToken: string): string {
  return buildJoinUrl(linkOrigin, planId, shareToken);
}

export function createCanonicalAuthUrl(mode: AuthLinkMode): string {
  return buildAuthUrl(linkOrigin, mode);
}

export function parseAuthLinkMode(value: string | string[] | undefined): AuthLinkMode {
  return value === "sign-in" ? "sign-in" : "join";
}

function readJoinToken(path: string): string | undefined {
  // URLSearchParams replaces malformed UTF-8. Validate the original query so
  // an invalid capability never acquires a different meaning during decoding.
  const beforeFragment = path.split("#", 1)[0];
  const queryStart = beforeFragment.indexOf("?");
  if (queryStart < 0) return undefined;
  let token: string | undefined;
  for (const field of beforeFragment.slice(queryStart + 1).split("&")) {
    const separator = field.indexOf("=");
    const key = separator < 0 ? field : field.slice(0, separator);
    if (decodeURIComponent(key.replace(/\+/g, " ")) !== "token") continue;
    if (token !== undefined) throw new Error("Duplicate private-link token");
    token = decodeURIComponent((separator < 0 ? "" : field.slice(separator + 1)).replace(/\+/g, " "));
    // Reject unpaired literal surrogates too, before the URL parser repairs them.
    encodeURIComponent(token);
  }
  return token;
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
          return "/join/invalid";
        }
        const planId = requireCanonicalUuid(decodeURIComponent(pathname.slice("/join/".length)), "Plan ID");
        const token = readJoinToken(path);
        // Returning an internal path bypasses Expo's custom-scheme extractor,
        // which rebuilds decoded queries and changes encoded pluses to spaces.
        return token ? `/join/${planId}?token=${encodeURIComponent(token)}` : `/join/${planId}`;
      } catch {
        return "/join/invalid";
      }
    }
    if (url.pathname === "/auth") {
      return `/auth?mode=${parseAuthLinkMode(url.searchParams.get("mode") ?? undefined)}`;
    }
    return path;
  } catch {
    return "/auth?mode=join";
  }
}
