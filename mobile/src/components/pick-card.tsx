import type { Candidate, PlaceDetails } from "@tableus/api-client";
import { Image } from "expo-image";
import type { SFSymbol } from "expo-symbols";
import { useState } from "react";
import { Linking, Text, View } from "react-native";

import { distance, mapsUrl, photoUrl, price } from "@/lib/format";
import { elevation, fonts, radius, space, textScale, tiles, usePalette } from "@/theme";

import { AvatarStack, Icon, Pill, PressScale } from "./ui";

const ORDINAL = ["1st", "2nd", "3rd"];
const PLACEHOLDER = require("../../assets/art/spot-distance.webp");
const GOOGLE_MAPS = require("../../assets/google-maps-attribution.svg");

/** Where the plan is centered, so cards can say how far each pick is. */
export type Spot = { latitude: number | null; longitude: number | null };

/**
 * One restaurant pick: photo, name, the facts people scan for, and the reason
 * it fits the group. While voting, a tap ranks it and a butter badge shows where.
 */
export function PickCard({ candidate, from, rank, winner = false, group, onToggle }: {
  candidate: Candidate;
  from?: Spot;
  rank?: number;
  winner?: boolean;
  /** The chosen place reads as a ticket stub for the whole table, so it shows who's going. */
  group?: string[];
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
            <Text maxFontSizeMultiplier={textScale.fixed} style={{ fontSize: 14, fontWeight: "800", color: palette.butter, fontVariant: ["tabular-nums"] }}>{rank + 1}</Text>
          </View>
          <Text maxFontSizeMultiplier={textScale.label} style={{ fontSize: 14, fontWeight: "700", color: palette.onButter }}>Your {ORDINAL[rank]}</Text>
        </View>
      ) : null}
      {candidate.rank === 1 && !ranked && !winner ? (
        <View style={{ position: "absolute", top: space.sm + space.xs, left: space.sm + space.xs }}>
          <Pill tone="onArt" icon="rosette" iconColor={tiles.radicchio} label="Top match" />
        </View>
      ) : null}
      {onToggle ? <SelectMark rank={rank} /> : null}
      {photo ? <Attribution place={place} /> : null}
    </View>
  );

  const content = (
    <View style={{ gap: space.sm + space.xs, padding: space.md, paddingTop: winner ? space.xs : space.md }}>
      <View style={{ gap: 6 }}>
        <Text maxFontSizeMultiplier={textScale.display} style={{ fontFamily: fonts.display, fontSize: winner ? 38 : 30, lineHeight: winner ? 36 : 30, color: palette.text }}>{place.name}</Text>
        <Facts place={place} from={from} />
      </View>
      {!winner ? <Features place={place} /> : null}
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
      {winner && group?.length ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, paddingTop: space.xs }}>
          <AvatarStack names={group} size={30} max={6} />
          <Text maxFontSizeMultiplier={textScale.label} style={{ flex: 1, fontSize: 14, fontWeight: "600", color: palette.secondary }}>
            {group.length === 1 ? "Table for one" : `Table for ${group.length}`}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const frame = {
    borderRadius: radius.card,
    borderCurve: "continuous" as const,
    overflow: "hidden" as const,
    backgroundColor: palette.surface,
    // The winner is a ticket: no outline, so its notches read as cut out of the card.
    borderWidth: winner ? 0 : 2,
    borderColor: ranked ? palette.text : "transparent",
    boxShadow: ranked ? `4px 4px 0 ${palette.text}` : elevation.card,
  };
  if (!onToggle) return <View style={frame}>{header}{winner ? <Perforation /> : null}{content}</View>;
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

/** Rating, cuisine, price and distance with icons, the facts people scan for first. */
export function Facts({ place, from }: { place: PlaceDetails; from?: Spot }) {
  const palette = usePalette();
  const item = { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 };
  const away = from ? distance(from, place) : null;
  const text = { fontSize: 14, fontWeight: "600" as const, color: palette.secondary, fontVariant: ["tabular-nums" as const] };
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: space.md, rowGap: 4 }}>
      {place.rating ? (
        <View style={item}>
          <Icon name="star.fill" fallback="★" size={13} color={palette.butterInk} />
          <Text maxFontSizeMultiplier={textScale.control} style={text}>{place.rating.toFixed(1)}{place.rating_count ? <Text style={{ fontWeight: "400" }}> ({compact(place.rating_count)})</Text> : null}</Text>
        </View>
      ) : null}
      <View style={item}>
        <Icon name="fork.knife" fallback="" size={13} color={palette.secondary} />
        <Text maxFontSizeMultiplier={textScale.control} style={text}>{place.cuisine}</Text>
      </View>
      <Text maxFontSizeMultiplier={textScale.control} style={text}>{price(place.price_level)}</Text>
      {away ? (
        <View style={item}>
          <Icon name="location.fill" fallback="" size={12} color={palette.secondary} />
          <Text maxFontSizeMultiplier={textScale.control} style={text}>{away}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** The torn-ticket edge between the photo and the details: two notches and a dashed rule. */
function Perforation() {
  const palette = usePalette();
  const notch = { position: "absolute" as const, top: 1, width: 22, height: 22, borderRadius: 11, backgroundColor: palette.background };
  return (
    <View style={{ height: 24, justifyContent: "center" }} accessible={false}>
      <View style={{ ...notch, left: -11 }} />
      <View style={{ ...notch, right: -11 }} />
      {/* iOS draws a one-sided dashed border solid, so the dashes are drawn one by one. */}
      <View style={{ flexDirection: "row", gap: 6, marginHorizontal: space.lg, overflow: "hidden" }}>
        {Array.from({ length: 40 }, (_, index) => (
          <View key={index} style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: palette.butter }} />
        ))}
      </View>
    </View>
  );
}

/** Google's place features people pick on, as small symbol chips. The first few that matter to a group. */
const FEATURES: Record<string, { icon: SFSymbol; label: string }> = {
  "serves vegetarian food": { icon: "leaf.fill", label: "Vegetarian" },
  "good for groups": { icon: "person.3.fill", label: "Good for groups" },
  "takes reservations": { icon: "calendar", label: "Reservations" },
  "outdoor seating": { icon: "sun.max.fill", label: "Outdoor seating" },
  "good for children": { icon: "figure.and.child.holdinghands", label: "Kid friendly" },
  "serves cocktails": { icon: "wineglass", label: "Cocktails" },
  "serves wine": { icon: "wineglass.fill", label: "Wine" },
  "serves beer": { icon: "mug.fill", label: "Beer" },
  "serves dessert": { icon: "birthday.cake.fill", label: "Dessert" },
  "live music": { icon: "music.note", label: "Live music" },
  "allows dogs": { icon: "pawprint.fill", label: "Dogs welcome" },
};

function Features({ place }: { place: PlaceDetails }) {
  const shown = Object.keys(FEATURES).filter((key) => place.features?.includes(key)).slice(0, 3);
  if (!shown.length) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {shown.map((key) => <Pill key={key} icon={FEATURES[key].icon} label={FEATURES[key].label} />)}
    </View>
  );
}

/** The select control on the photo: an empty ring with a plus, then a butter check once ranked. */
function SelectMark({ rank }: { rank?: number }) {
  const palette = usePalette();
  const ranked = rank !== undefined;
  return (
    <View style={{
      position: "absolute", top: space.sm + space.xs, right: space.sm + space.xs, width: 32, height: 32, borderRadius: 16,
      alignItems: "center", justifyContent: "center", borderWidth: ranked ? 0 : 2, borderColor: "#FFFFFF",
      backgroundColor: ranked ? palette.butter : "rgba(23, 48, 31, 0.4)", boxShadow: "0 1px 6px rgba(23, 48, 31, 0.25)",
    }}>
      <Icon name={ranked ? "checkmark" : "plus"} fallback={ranked ? "✓" : "+"} size={14} color={ranked ? palette.onButter : "#FFFFFF"} weight="bold" />
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
