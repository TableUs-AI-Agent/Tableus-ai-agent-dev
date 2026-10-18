import { SymbolView } from "expo-symbols";
import { Text } from "react-native";

import { usePalette } from "@/theme";

import type { IconProps } from "./icon";

/** iOS draws SF Symbols natively, so there is no icon font to load. */
export const iconFonts = {};

export function Icon({ name, fallback, size = 22, color, weight }: IconProps) {
  const palette = usePalette();
  return (
    <SymbolView
      name={name}
      size={size}
      weight={weight}
      tintColor={color ?? palette.text}
      fallback={fallback ? <Text style={{ fontSize: size * 0.8, color: color ?? palette.text }}>{fallback}</Text> : null}
    />
  );
}
