import { MaterialSymbols_400Regular } from "@expo-google-fonts/material-symbols/400Regular";
import { MaterialSymbols_700Bold } from "@expo-google-fonts/material-symbols/700Bold";
import type { SFSymbol } from "expo-symbols";
import { Text } from "react-native";

import { usePalette } from "@/theme";

/**
 * Android and web have no SF Symbols, so each one the app uses maps to the
 * closest Material Symbol, drawn from its icon font. Add a line here when a
 * screen uses a new symbol; an unmapped name falls back to its text glyph.
 */
const MATERIAL: Partial<Record<SFSymbol, number>> = {
  "arrow.clockwise": 0xe5d5, // refresh
  "arrow.counterclockwise": 0xf053, // restart_alt
  "arrow.right": 0xe5c8, // arrow_forward
  "arrow.up.right": 0xf8ce, // arrow_outward
  "arrow.uturn.backward": 0xe166, // undo
  "birthday.cake.fill": 0xe7e9, // cake
  calendar: 0xe878, // event
  checkmark: 0xe5ca, // check
  "checkmark.circle.fill": 0xe86c, // check_circle
  "checkmark.seal.fill": 0xef76, // verified
  "chevron.right": 0xe5cc, // chevron_right
  clock: 0xefd6, // schedule
  "crown.fill": 0xecb3, // crown
  "doc.text.fill": 0xe873, // description
  dollarsign: 0xe227, // attach_money
  "ellipsis.circle": 0xe5d3, // more_horiz
  envelope: 0xe158, // mail
  "envelope.badge.fill": 0xf18a, // mark_email_unread
  "envelope.fill": 0xe158, // mail
  "exclamationmark.circle.fill": 0xe000, // error
  "exclamationmark.triangle.fill": 0xe002, // warning
  "figure.and.child.holdinghands": 0xf1a2, // family_restroom
  "fork.knife": 0xe56c, // restaurant
  "hand.raised.fill": 0xe769, // front_hand
  "heart.text.square": 0xe87d, // favorite
  "leaf.fill": 0xea35, // eco
  link: 0xe157, // link
  "list.bullet": 0xe241, // format_list_bulleted
  "location.fill": 0xe569, // near_me
  "lock.fill": 0xe897, // lock
  magnifyingglass: 0xe8b6, // search
  "map.fill": 0xe55b, // map
  "mappin.and.ellipse": 0xe0c8, // location_on
  "mug.fill": 0xf1f3, // sports_bar
  "music.note": 0xe405, // music_note
  number: 0xe9ef, // tag
  "pawprint.fill": 0xe91d, // pets
  person: 0xe7fd, // person
  "person.2.fill": 0xe7ef, // group
  "person.3.fill": 0xf233, // groups
  "person.fill": 0xe7fd, // person
  plus: 0xe145, // add
  "plus.bubble": 0xe266, // add_comment
  "plus.circle.fill": 0xe147, // add_circle
  "rectangle.portrait.and.arrow.right": 0xe9ba, // logout
  rosette: 0xea3f, // military_tech
  "square.and.arrow.up": 0xe80d, // share
  "sun.max.fill": 0xe430, // wb_sunny
  "text.bubble.fill": 0xe0ca, // chat_bubble
  "text.quote": 0xe244, // format_quote
  "trash.fill": 0xe872, // delete
  wineglass: 0xe540, // local_bar
  "wineglass.fill": 0xf1e8, // wine_bar
};

/** The icon font only has outlines; these read wrong unless filled, so they use a text glyph. */
const FILLED: Partial<Record<SFSymbol, string>> = {
  "star.fill": "★",
};

/** Loaded with the app's other fonts before the first screen draws. */
export const iconFonts = { MaterialSymbols_400Regular, MaterialSymbols_700Bold };

export type IconProps = {
  /** An SF Symbol name; other platforms look it up in the Material table above. */
  name: SFSymbol;
  fallback: string;
  size?: number;
  color?: string;
  weight?: "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
};

export function Icon({ name, fallback, size = 22, color, weight }: IconProps) {
  const palette = usePalette();
  const code = MATERIAL[name];
  const glyph = FILLED[name];
  const heavy = weight === "semibold" || weight === "bold" || weight === "heavy" || weight === "black";
  if (glyph) {
    return (
      <Text allowFontScaling={false} accessible={false} style={{ width: size, height: size, fontSize: size, lineHeight: size, textAlign: "center", color: color ?? palette.text }}>
        {glyph}
      </Text>
    );
  }
  if (code === undefined) {
    return fallback ? <Text allowFontScaling={false} style={{ fontSize: size * 0.8, color: color ?? palette.text }}>{fallback}</Text> : null;
  }
  // Icons sit in fixed-size slots, so they keep their size when the system text size grows.
  return (
    <Text
      allowFontScaling={false}
      accessible={false}
      style={{
        width: size, height: size, fontSize: size, lineHeight: size, textAlign: "center",
        fontFamily: heavy ? "MaterialSymbols_700Bold" : "MaterialSymbols_400Regular",
        color: color ?? palette.text,
      }}
    >
      {String.fromCharCode(code)}
    </Text>
  );
}
