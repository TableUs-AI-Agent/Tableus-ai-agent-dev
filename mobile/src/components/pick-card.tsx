import type { Candidate, PlaceDetails } from "@tableus/api-client";
import { Image } from "expo-image";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { mapsUrl, photoUrl, price } from "@/lib/format";
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
  const [broken, setBroken] = useState(false);
  const photo = broken ? null : photoUrl(place);
  // The frame keeps its shadow, so the header rounds its own top corners.
  const inner = radius.card - 2;
  const header = photo ? (
    <View>
      <Image
        source={photo}
        recyclingKey={place.place_id}
        contentFit="cover"
        // Web only: the Expo web preview never resolves lazy images inside this card.
        loading="eager"
        onError={() => setBroken(true)}
        accessibilityIgnoresInvertColors
        style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: palette.border, borderTopLeftRadius: inner, borderTopRightRadius: inner }}
      />
      <PhotoCredit place={place} />
    </View>
  ) : (
    <Text
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      numberOfLines={1}
      style={{
        fontFamily: fonts.display, fontSize: 44, lineHeight: 48, paddingTop: space.lg, paddingBottom: space.xs, paddingHorizontal: space.md,
        color: palette.text, opacity: 0.3, backgroundColor: palette.border,
        borderTopLeftRadius: inner, borderTopRightRadius: inner, overflow: "hidden",
      }}
    >
      {place.cuisine}
    </Text>
  );
  const content = (
    <View style={{ gap: space.sm, padding: space.md }}>
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
    borderColor: winner || ranked ? palette.text : palette.border,
    backgroundColor: winner ? palette.butter : palette.surface,
    boxShadow: ranked ? `4px 4px 0 ${palette.text}` : undefined,
  };
  if (!onToggle) return <View style={frame}>{header}{content}</View>;
  return (
    <PressScale
      onPress={onToggle}
      style={frame}
      accessibilityLabel={`${place.name}${ranked ? `, your ${ORDINAL[rank]} choice` : ""}`}
      accessibilityState={{ selected: ranked }}
    >
      {header}
      {content}
    </PressScale>
  );
}

/** Google requires each photo's authors to be shown, linked where it gives a link. */
function PhotoCredit({ place }: { place: PlaceDetails }) {
  const credits = place.photo_credits ?? [];
  if (!credits.length) return null;
  return (
    <View style={{ position: "absolute", top: space.sm, right: space.sm, maxWidth: "70%", backgroundColor: "rgba(23,48,31,0.75)", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 }}>
      <Text numberOfLines={1} style={{ fontSize: 12, color: "#FFFFFF" }}>
        Photo:{" "}
        {credits.map((credit, index) => (
          <Text key={`${credit.name}-${index}`}>
            {index ? ", " : ""}
            {credit.uri ? (
              <Text accessibilityRole="link" style={{ textDecorationLine: "underline" }} onPress={() => Linking.openURL(credit.uri ?? "")}>
                {credit.name}
              </Text>
            ) : credit.name}
          </Text>
        ))}
      </Text>
    </View>
  );
}
