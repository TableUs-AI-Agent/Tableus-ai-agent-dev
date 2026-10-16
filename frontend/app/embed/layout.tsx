import type { ReactNode } from "react";

/** Embedded views sit on top of the app's own background, in either theme. */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{"html, body { background: transparent !important; overflow: hidden; }"}</style>
      {children}
    </>
  );
}
