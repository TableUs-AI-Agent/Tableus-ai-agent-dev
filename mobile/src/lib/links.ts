import { buildJoinUrl, parseJoinToken } from "@tableus/domain";

const linkHost = process.env.EXPO_PUBLIC_LINK_HOST ?? "links.table-us.com";

export function joinUrl(planId: string, shareToken: string): string {
  return buildJoinUrl(`https://${linkHost}`, planId, shareToken);
}

/** A join link opened before sign-in waits here until the person is set up. */
let pending: { planId: string; token: string } | null = null;
export const pendingJoin = {
  set: (planId: string, token: string) => { pending = { planId, token }; },
  take: () => { const value = pending; pending = null; return value; },
  peek: () => pending,
};

/** Map https://links.table-us.com/join/<id>?token=… to the in-app join screen. */
export function rewriteIncomingLink(path: string): string {
  try {
    const url = new URL(path, `https://${linkHost}/`);
    const match = /^\/join\/([0-9a-f-]{36})\/?$/i.exec(url.pathname);
    const appJoin = url.protocol === "tableus:" && url.hostname === "join";
    const planId = match?.[1] ?? (appJoin ? url.pathname.replace(/^\//, "") : null);
    if (!planId) return path;
    const token = parseJoinToken(path);
    if (token) pendingJoin.set(planId, token);
    return `/join/${planId}`;
  } catch {
    return path;
  }
}
