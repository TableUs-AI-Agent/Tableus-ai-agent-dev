import type { Plan } from "@tableus/api-client";
import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { useMe } from "@/lib/session";
import { usePalette } from "@/theme";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "http://localhost:3000";

/**
 * The plan's 3D table, shared with the web app: the web page at /embed/table
 * renders the scene and this view feeds it the plan (names and picks only).
 * If it can't load, the screen simply goes without it.
 */
export function TableScene({ plan, onPick }: { plan: Plan; onPick?: (candidateId: string) => void }) {
  const palette = usePalette();
  const me = useMe();
  const searching = useIsMutating({ mutationKey: ["suggest", plan.id] }) > 0;
  const view = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const message = useMemo(() => JSON.stringify({
    type: "table-state",
    state: {
      people: plan.participants.map((person) => ({ id: person.profile_id, name: person.display_name })),
      meId: me.data?.id ?? null,
      picks: plan.candidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.place.name,
        cuisine: candidate.place.cuisine,
        price_level: candidate.place.price_level,
        reasoning: candidate.reasoning,
      })),
      chosenId: plan.finalized_candidate_id,
      selectedId: plan.finalized_candidate_id ?? plan.my_vote?.[0] ?? null,
      searching,
    },
  }), [plan, me.data?.id, searching]);

  useEffect(() => {
    if (ready) view.current?.postMessage(message);
  }, [ready, message]);

  function receive(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "ready") setReady(true);
      if (data.type === "pick" && typeof data.id === "string") onPick?.(data.id);
    } catch {
      // Not a table message.
    }
  }

  if (failed) return null;
  return (
    <View style={{ height: 320, marginHorizontal: -16 }} accessibilityLabel="Your group around the table">
      <WebView
        ref={view}
        source={{ uri: `${WEB_URL}/embed/table` }}
        onMessage={receive}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        style={{ backgroundColor: "transparent" }}
        containerStyle={{ backgroundColor: "transparent" }}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        originWhitelist={[WEB_URL]}
        setSupportMultipleWindows={false}
        webviewDebuggingEnabled={__DEV__}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 72,
          experimental_backgroundImage: `linear-gradient(to bottom, transparent, ${palette.background})`,
        }}
      />
    </View>
  );
}
