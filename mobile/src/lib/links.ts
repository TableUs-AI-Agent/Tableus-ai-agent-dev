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

export function rewriteCanonicalSystemPath(path: string): string {
  try {
    const url = new URL(path, `${linkOrigin}/`);
    if (url.origin !== linkOrigin) return path;
    if (url.pathname === "/auth") {
      return `/auth?mode=${parseAuthLinkMode(url.searchParams.get("mode") ?? undefined)}`;
    }
    if (/^\/join\/[^/]+$/.test(url.pathname)) {
      let planId: string;
      try {
        planId = requireCanonicalUuid(decodeURIComponent(url.pathname.slice("/join/".length)), "Plan ID");
      } catch {
        return "/join/invalid";
      }
      const token = url.searchParams.get("token");
      return token ? `/join/${planId}?token=${encodeURIComponent(token)}` : `/join/${planId}`;
    }
    return path;
  } catch {
    return "/auth?mode=join";
  }
}
