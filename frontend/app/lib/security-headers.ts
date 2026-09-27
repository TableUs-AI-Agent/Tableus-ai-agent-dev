export const FRAME_PROTECTION_SOURCE = "/:path*";

export const FRAME_PROTECTION_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
] as const;

export const PRIVATE_JOIN_SOURCE = "/join/:path*";
export const PRIVATE_JOIN_HEADERS = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
] as const;
