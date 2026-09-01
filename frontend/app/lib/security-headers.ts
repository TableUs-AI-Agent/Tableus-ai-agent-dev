export const FRAME_PROTECTION_SOURCE = "/:path*";

export const FRAME_PROTECTION_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
] as const;
