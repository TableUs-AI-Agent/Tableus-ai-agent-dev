import { useColorScheme } from "react-native";

/**
 * Brand tokens, shared in spirit with the web app (frontend/DESIGN.md).
 * Radicchio is the one accent. Butter marks the chosen place and your ranks only.
 */
const light = {
  background: "#F2F6EE",
  surface: "#FFFFFF",
  text: "#17301F",
  secondary: "#4C6652",
  border: "#C9D9C6",
  accent: "#B3245C",
  onAccent: "#FFFFFF",
  butter: "#F4CF4A",
  onButter: "#17301F",
  danger: "#B3245C",
};

const dark: typeof light = {
  background: "#0D1A11",
  surface: "#16271C",
  text: "#EAF1E6",
  secondary: "#9DB3A2",
  border: "#2C4433",
  accent: "#E0558D",
  onAccent: "#1A0710",
  butter: "#F4CF4A",
  onButter: "#17301F",
  danger: "#F07AA8",
};

export type Palette = typeof light;

export function usePalette(): Palette {
  return useColorScheme() === "dark" ? dark : light;
}

/** 8pt rhythm. Radius rule: actions and chips are pills, cards 20, inputs 10. */
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { input: 10, card: 20, pill: 999 } as const;

export const fonts = {
  display: "DarkerGrotesque_800ExtraBold",
} as const;
