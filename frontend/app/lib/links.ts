import { buildAuthUrl, buildJoinUrl, type AuthLinkMode } from "@tableus/domain";

const linkOrigin = process.env.NEXT_PUBLIC_LINK_ORIGIN ?? "https://links.table-us.com";

export function createCanonicalJoinUrl(planId: string, shareToken: string): string {
  const format = process.env.NEXT_PUBLIC_JOIN_LINK_FORMAT === "fragment" ? "fragment" : "query";
  return buildJoinUrl(linkOrigin, planId, shareToken, format);
}

export function createCanonicalAuthUrl(mode: AuthLinkMode): string {
  return buildAuthUrl(linkOrigin, mode);
}
