import type { Candidate, PlaceDetails } from "@tableus/api-client";
import { Image } from "expo-image";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { mapsUrl, photoUrl, price } from "@/lib/format";
import { elevation, fonts, radius, space, textScale, usePalette } from "@/theme";

import { Icon, PressScale } from "./ui";

const ORDINAL = ["1st", "2nd", "3rd"];
const PLACEHOLDER = require("../../assets/art/spot-distance.webp");
const GOOGLE_MAPS = require("../../assets/google-maps-attribution.svg");

/**
 * One restaurant pick: photo, name, the facts people scan for, and the reason
 * it fits the group. While voting, a tap ranks it and a butter badge shows where.
 */
export function PickCard({ candidate, rank, winner = false, onToggle }: {
  candidate: Candidate;
  rank?: number;
  winner?: boolean;
  onToggle?: () => void;
}) {
  const palette = usePalette();
  const { place } = candidate;
  const ranked = rank !== undefined;
  const [broken, setBroken] = useState(false);
  const photo = broken ? null : photoUrl(place);

  const header = (
    <View>
      {photo ? (
        <Image
          source={photo}
          recyclingKey={place.place_id}
          contentFit="cover"
          transition={180}
          onError={() => setBroken(true)}
          accessibilityIgnoresInvertColors
          style={{ width: "100%", aspectRatio: winner ? 4 / 3 : 16 / 9, backgroundColor: palette.fill }}
        />
      ) : (
        <View style={{ width: "100%", aspectRatio: winner ? 2 : 2.6, backgroundColor: palette.sky, alignItems: "center", justifyContent: "center" }}>
          <Image source={PLACEHOLDER} style={{ width: 64, height: 64 }} contentFit="contain" accessible={false} />
        </View>
      )}
      {ranked ? (
        <View style={{
          position: "absolute", top: space.sm + space.xs, left: space.sm + space.xs, flexDirection: "row", alignItems: "center", gap: 6,
          backgroundColor: palette.butter, borderRadius: radius.pill, paddingLeft: 4, paddingRight: 12, paddingVertical: 4,
          boxShadow: "0 2px 8px rgba(23, 48, 31, 0.25)",
        }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: palette.onButter, alignItems: "center", justifyContent: "center" }}>
            <Text maxFontSizeMultiplier={textScale.badge} style={{ fontSize: 14, fontWeight: "800", color: palette.butter, fontVariant: ["tabular-nums"] }}>{rank + 1}</Text>
          </View>
          <Text maxFontSizeMultiplier={textScale.label} style={{ fontSize: 14, fontWeight: "700", color: palette.onButter }}>Your {ORDINAL[rank]}</Text>
        </View>
      ) : null}
      {onToggle && !ranked ? (
        <View style={{
          position: "absolute", top: space.sm + space.xs, right: space.sm + space.xs, width: 30, height: 30, borderRadius: 15,
          borderWidth: 2, borderColor: "#FFFFFF", backgroundColor: "rgba(23, 48, 31, 0.35)",
        }} />
      ) : null}
      {photo ? <Attribution place={place} /> : null}
    </View>
  );

  const content = (
    <View style={{ gap: space.sm + space.xs, padding: space.md }}>
      <View style={{ gap: 6 }}>
        <Text maxFontSizeMultiplier={textScale.display} style={{ fontFamily: fonts.display, fontSize: winner ? 38 : 30, lineHeight: winner ? 36 : 30, color: palette.text }}>{place.name}</Text>
        <Facts place={place} />
      </View>
      <View style={{ flexDirection: "row", gap: space.sm + 2, backgroundColor: winner ? palette.butterTint : palette.background, borderRadius: 14, borderCurve: "continuous", padding: space.sm + space.xs }}>
        <Icon name="person.3.fill" fallback="" size={14} color={palette.accent} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: palette.accent }}>Why it works for the group</Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: palette.text }}>{candidate.reasoning}</Text>
        </View>
      </View>
      {winner ? (
        <View style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
          <Icon name="mappin.and.ellipse" fallback="" size={15} color={palette.secondary} />
          <Text selectable style={{ flex: 1, fontSize: 15, lineHeight: 20, color: palette.secondary }}>{place.address}</Text>
        </View>
      ) : null}
    </View>
  );

  const frame = {
    borderRadius: radius.card,
    borderCurve: "continuous" as const,
    overflow: "hidden" as const,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: winner ? palette.butter : ranked ? palette.text : "transparent",
    boxShadow: ranked ? `4px 4px 0 ${palette.text}` : elevation.card,
  };
  if (!onToggle) return <View style={frame}>{header}{content}</View>;
  return (
    <PressScale
      onPress={onToggle}
      style={frame}
      accessibilityLabel={`${place.name}${ranked ? `, your ${ORDINAL[rank]} choice` : ""}`}
      accessibilityHint={ranked ? "Removes it from your top three" : "Adds it to your top three"}
      accessibilityState={{ selected: ranked }}
    >
      {header}
      {content}
    </PressScale>
  );
}

/** Rating, price and cuisine with icons, the facts people scan for first. */
export function Facts({ place }: { place: PlaceDetails }) {
  const palette = usePalette();
  const item = { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 };
  const text = { fontSize: 14, fontWeight: "600" as const, color: palette.secondary, fontVariant: ["tabular-nums" as const] };
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: space.md, rowGap: 4 }}>
      {place.rating ? (
        <View style={item}>
          <Icon name="star.fill" fallback="★" size={13} color={palette.butterInk} />
          <Text style={text}>{place.rating.toFixed(1)}{place.rating_count ? <Text style={{ fontWeight: "400" }}> ({compact(place.rating_count)})</Text> : null}</Text>
        </View>
      ) : null}
      <View style={item}>
        <Icon name="fork.knife" fallback="" size={13} color={palette.secondary} />
        <Text style={text}>{place.cuisine}</Text>
      </View>
      <Text style={text}>{price(place.price_level)}</Text>
    </View>
  );
}

const compact = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k` : String(value));

/** Google requires its logo and the photo's authors next to its photos, links kept where given. */
function Attribution({ place }: { place: PlaceDetails }) {
  const palette = usePalette();
  const credits = place.photo_credits ?? [];
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm,
      paddingHorizontal: space.sm + space.xs, paddingVertical: 6, backgroundColor: "#FFFFFF",
      borderBottomWidth: 1, borderColor: palette.hairline,
    }}>
      <Image source={GOOGLE_MAPS} style={{ width: 82, height: 15 }} contentFit="contain" accessibilityLabel="Google Maps" />
      {credits.length ? (
        <Text numberOfLines={1} maxFontSizeMultiplier={textScale.label} style={{ flexShrink: 1, fontSize: 11, color: "#5F6368" }}>
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
      ) : null}
    </View>
  );
}

export function openInMaps(place: PlaceDetails) {
  Linking.openURL(mapsUrl(place));
}
