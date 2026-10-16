import type { Candidate } from "@tableus/api-client";
import { Linking, Text, View } from "react-native";

import { mapsUrl, price } from "@/lib/format";
import { fonts, radius, space, usePalette } from "@/theme";

import { PressScale } from "./ui";

const ORDINAL = ["1st", "2nd", "3rd"];

export function PickCard({ candidate, rank, winner = false, onToggle }: {
  candidate: Candidate;
  rank?: number;
  winner?: boolean;
  onToggle?: () => void;
}) {
  const palette = usePalette();
  const { place } = candidate;
  const ranked = rank !== undefined;
  const ink = winner ? palette.onButter : palette.text;
  const content = (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: space.sm }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 30, color: ink }}>{place.name}</Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: winner ? ink : palette.secondary }}>
            {place.cuisine}, {price(place.price_level)}{place.rating ? `, ${place.rating.toFixed(1)} stars` : ""}
          </Text>
        </View>
        {ranked ? (
          <View style={{ backgroundColor: palette.butter, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ fontWeight: "700", color: palette.onButter }}>Your {ORDINAL[rank]}</Text>
          </View>
        ) : null}
      </View>
      <Text style={{ fontSize: 16, lineHeight: 23, color: ink }}>{candidate.reasoning}</Text>
      {winner ? (
        <Text style={{ fontSize: 15, color: ink }} selectable>
          {place.address}.{" "}
          <Text accessibilityRole="link" style={{ fontWeight: "700", textDecorationLine: "underline" }} onPress={() => Linking.openURL(mapsUrl(place))}>
            Open in Google Maps
          </Text>
        </Text>
      ) : null}
    </View>
  );
  const frame = {
    borderRadius: radius.card,
    borderCurve: "continuous" as const,
    borderWidth: 2,
    padding: space.md,
    borderColor: winner || ranked ? palette.text : palette.border,
    backgroundColor: winner ? palette.butter : palette.surface,
    boxShadow: ranked ? `4px 4px 0 ${palette.text}` : undefined,
  };
  if (!onToggle) return <View style={frame}>{content}</View>;
  return (
    <PressScale
      onPress={onToggle}
      style={frame}
      accessibilityLabel={`${place.name}${ranked ? `, your ${ORDINAL[rank]} choice` : ""}`}
      accessibilityState={{ selected: ranked }}
    >
      {content}
    </PressScale>
  );
}
