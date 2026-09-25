import type { ReactNode } from "react";

// A private-link landing response must not be statically cached at build time.
export const dynamic = "force-dynamic";

export default function JoinLayout({ children }: { children: ReactNode }) {
  return children;
}
