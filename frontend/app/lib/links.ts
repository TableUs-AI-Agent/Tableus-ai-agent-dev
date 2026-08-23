import { buildAuthUrl, buildJoinUrl, type AuthLinkMode } from "@tableus/domain";

const linkOrigin = process.env.NEXT_PUBLIC_LINK_ORIGIN ?? "https://links.table-us.com";

export function createCanonicalJoinUrl(planId: string, shareToken: string): string {
  return buildJoinUrl(linkOrigin, planId, shareToken);
}

export function createCanonicalAuthUrl(mode: AuthLinkMode): string {
  return buildAuthUrl(linkOrigin, mode);
}
