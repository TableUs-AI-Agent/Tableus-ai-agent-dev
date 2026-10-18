import { Image } from "expo-image";
import { View } from "react-native";

import { radius, usePalette } from "@/theme";

/** The plush spot illustrations, in the same world as Pip and the 3D table. */
const SPOTS = {
  wishes: require("../../assets/art/spot-wishes.webp"),
  vote: require("../../assets/art/spot-vote.webp"),
  lock: require("../../assets/art/spot-lock.webp"),
  distance: require("../../assets/art/spot-distance.webp"),
  invite: require("../../assets/art/pip-invite.webp"),
};

export type Spot = keyof typeof SPOTS;

/** A spot illustration on the table's sky, the dimensional stand-in for an icon tile. */
export function SpotTile({ spot, size = 56 }: { spot: Spot; size?: number }) {
  const palette = usePalette();
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size, height: size, borderRadius: Math.min(radius.card, size * 0.3), borderCurve: "continuous",
        backgroundColor: palette.sky, alignItems: "center", justifyContent: "center",
      }}
    >
      <Image source={SPOTS[spot]} style={{ width: size * 0.8, height: size * 0.8 }} contentFit="contain" accessible={false} />
    </View>
  );
}

/** The bare illustration, for art-led cards that size it themselves. */
export function SpotArt({ spot, size }: { spot: Spot; size: number }) {
  return <Image source={SPOTS[spot]} style={{ width: size, height: size }} contentFit="contain" accessible={false} />;
}
