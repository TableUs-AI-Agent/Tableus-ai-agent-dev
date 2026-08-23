import { buildAuthUrl, buildJoinUrl, type AuthLinkMode } from "@tableus/domain";

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
