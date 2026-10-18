import { useColorScheme } from "react-native";

/**
 * Brand tokens, shared in spirit with the web app (frontend/DESIGN.md).
 * Radicchio is the one accent. Butter marks the chosen place and your ranks.
 * Greys are all from the green-tinted Bottle family; no neutral greys.
 */
const light = {
  background: "#F2F6EE",
  surface: "#FFFFFF",
  /** Secondary fills: quiet buttons, pressed rows, empty photo wells. */
  fill: "#E4ECE0",
  text: "#17301F",
  secondary: "#4C6652",
  tertiary: "#8BA090",
  placeholder: "#8BA090",
  border: "#D3E0D0",
  hairline: "#E1E9DE",
  ink: "#17301F",
  onInk: "#F2F6EE",
  accent: "#B3245C",
  accentTint: "#F8E4EC",
  onAccent: "#FFFFFF",
  butter: "#F4CF4A",
  onButter: "#17301F",
  butterTint: "#FFF5D1",
  /** Butter dark enough to read as text or a small icon on white. */
  butterInk: "#B88A00",
  success: "#2E8B57",
  successTint: "#DDF0E3",
  danger: "#B3245C",
  dangerFill: "#F8E4EC",
  /** The 3D table's sky, used behind Pip art so it sits in the same world. */
  sky: "#B4E9FD",
};

const dark: typeof light = {
  background: "#0D1A11",
  surface: "#16271C",
  fill: "#203528",
  text: "#EAF1E6",
  secondary: "#9DB3A2",
  tertiary: "#6E8574",
  placeholder: "#6E8574",
  border: "#2C4433",
  hairline: "#243A2B",
  ink: "#EAF1E6",
  onInk: "#0D1A11",
  accent: "#E0558D",
  accentTint: "#3A1626",
  onAccent: "#1A0710",
  butter: "#F4CF4A",
  onButter: "#17301F",
  butterTint: "#33301A",
  butterInk: "#F4CF4A",
  success: "#5CC48A",
  successTint: "#173323",
  danger: "#F07AA8",
  dangerFill: "#3A1626",
  sky: "#16384A",
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? dark : light;
}

/** Icon tile colors for list rows, iOS Settings style. Same in both themes. */
export const tiles = {
  radicchio: "#B3245C",
  bottle: "#2F6B45",
  sky: "#1E9BD7",
  butter: "#D9A800",
  slate: "#5F7466",
  coral: "#E0644A",
} as const;

/** Avatar fills picked from the 3D table's palette, stable per name. */
const AVATARS = [
  { fill: "#31C9FF", ink: "#0B2A3A" },
  { fill: "#FFE033", ink: "#3A3000" },
  { fill: "#7FBE35", ink: "#14300A" },
  { fill: "#FF8A65", ink: "#3A140A" },
  { fill: "#C9A7FF", ink: "#24124A" },
  { fill: "#F4CF4A", ink: "#17301F" },
];

export function avatarTint(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATARS[hash % AVATARS.length];
}

/** One elevation for raised surfaces; pick cards add a Bottle outline when ranked. */
export const elevation = {
  card: "0 1px 2px rgba(23, 48, 31, 0.06), 0 4px 14px rgba(23, 48, 31, 0.06)",
} as const;

/** 8pt rhythm. Radius rule: actions and chips are pills, cards and grouped lists 20, inputs 14. */
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { input: 14, card: 20, pill: 999 } as const;

export const fonts = {
  display: "DarkerGrotesque_800ExtraBold",
} as const;
