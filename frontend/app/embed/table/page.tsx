"use client";

import { useEffect, useState } from "react";

import { TableScene, type TableState } from "../../components/table-view";

type NativeBridge = { postMessage: (message: string) => void };

/**
 * The 3D table on its own, for the mobile app's web view. It shows only what the
 * app posts to it (names and picks) and makes no requests of its own.
 */
export default function EmbeddedTable() {
  const [state, setState] = useState<TableState | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "table-state") setState(data.state as TableState);
      } catch {
        // Ignore messages that aren't ours.
      }
    };
    window.addEventListener("message", receive);
    document.addEventListener("message", receive as EventListener);
    (window as unknown as { ReactNativeWebView?: NativeBridge }).ReactNativeWebView?.postMessage(JSON.stringify({ type: "ready" }));
    return () => {
      window.removeEventListener("message", receive);
      document.removeEventListener("message", receive as EventListener);
    };
  }, []);

  return (
    // Fade the bottom edge here so it blends into the app's background in either theme.
    <div className="fixed inset-0 bg-transparent [-webkit-mask-image:linear-gradient(to_bottom,black_72%,transparent)] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
      {/* Loads the display face so the cards drawn on canvas use it. */}
      <span aria-hidden="true" className="display pointer-events-none absolute opacity-0">TableUs</span>
      {state ? (
        <TableScene
          fade={false}
          state={state}
          onPick={(id) => (window as unknown as { ReactNativeWebView?: NativeBridge }).ReactNativeWebView?.postMessage(JSON.stringify({ type: "pick", id }))}
        />
      ) : null}
    </div>
  );
}
