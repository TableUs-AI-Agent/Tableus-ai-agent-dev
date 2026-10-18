import * as Haptics from "expo-haptics";
import type { SFSymbol } from "expo-symbols";
import { Children, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { initials } from "@/lib/format";
import { avatarTint, elevation, fonts, LARGE_TEXT, radius, space, textScale, usePalette, type Palette } from "@/theme";

import { Icon } from "./icon";

export { Icon };

const PRESS = { duration: 120, easing: Easing.bezier(0.23, 1, 0.32, 1) };

/** True when the system text size is big enough that side-by-side layouts no longer fit. */
export function useLargeText() {
  return useWindowDimensions().fontScale > LARGE_TEXT;
}

/**
 * Root scroller for every screen: content can scroll under the large title.
 * At large text sizes the footer scrolls with the content instead of covering it.
 */
export function Screen({ children, footer, padded = true }: { children: ReactNode; footer?: ReactNode; padded?: boolean }) {
  const palette = usePalette();
  const large = useLargeText();
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: padded ? space.md : 0, paddingBottom: space.xxl * 2, gap: space.lg }}
      >
        {children}
        {large ? <View style={{ paddingHorizontal: padded ? 0 : space.lg }}>{footer}</View> : null}
      </ScrollView>
      {large ? null : footer}
    </View>
  );
}

/** A bottom bar for the one primary action, so it stays in thumb reach above the home indicator. */
export function Footer({ children }: { children: ReactNode }) {
  const palette = usePalette();
  if (useLargeText()) return <View style={{ gap: space.sm }}>{children}</View>;
  return (
    <View style={{
      paddingHorizontal: space.md, paddingTop: space.sm + space.xs, paddingBottom: space.xl,
      gap: space.sm, backgroundColor: palette.background, borderTopWidth: 1, borderColor: palette.hairline,
    }}>
      {children}
    </View>
  );
}

export function Title({ children, size = 44 }: { children: ReactNode; size?: number }) {
  const palette = usePalette();
  return (
    <Text accessibilityRole="header" maxFontSizeMultiplier={textScale.display} style={{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 0.95, color: palette.text }}>
      {children}
    </Text>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: "700", color: palette.text }}>{children}</Text>;
}

export function Body({ children, muted = false, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  const palette = usePalette();
  return <Text style={[{ fontSize: 16, lineHeight: 23, color: muted ? palette.secondary : palette.text }, style]}>{children}</Text>;
}

export function Footnote({ children, style }: { children: ReactNode; style?: object }) {
  const palette = usePalette();
  return <Text style={[{ fontSize: 13, lineHeight: 18, color: palette.secondary }, style]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return (
    <View accessibilityRole="alert" style={{ flexDirection: "row", gap: space.sm, alignItems: "flex-start" }}>
      <Icon name="exclamationmark.circle.fill" fallback="!" size={18} color={palette.danger} />
      <Text style={{ flex: 1, fontSize: 15, lineHeight: 20, color: palette.danger }}>{children}</Text>
    </View>
  );
}

/** Scales slightly on press-in, like native buttons and cards. */
export function PressScale({ children, onPress, disabled, style, accessibilityLabel, accessibilityHint, accessibilityState, haptic = true }: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  haptic?: boolean;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      onPressIn={() => scale.set(withTiming(0.97, PRESS))}
      onPressOut={() => scale.set(withTiming(1, PRESS))}
      onPress={() => {
        if (haptic) Haptics.selectionAsync();
        onPress?.();
      }}
    >
      <Animated.View style={[style, animated, disabled ? { opacity: 0.45 } : null]}>{children}</Animated.View>
    </Pressable>
  );
}

type ButtonKind = "primary" | "secondary" | "quiet" | "danger";

function buttonColors(kind: ButtonKind, palette: Palette) {
  switch (kind) {
    case "primary": return { fill: palette.accent, ink: palette.onAccent };
    case "secondary": return { fill: palette.fill, ink: palette.text };
    case "danger": return { fill: palette.dangerFill, ink: palette.danger };
    default: return { fill: "transparent", ink: palette.accent };
  }
}

/** Actions are pills. Primary is the one radicchio action on a screen; secondary is a tinted fill. */
export function Button({ label, onPress, busy, disabled, kind = "primary", icon, size = "large" }: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  kind?: ButtonKind;
  icon?: SFSymbol;
  size?: "large" | "small";
}) {
  const palette = usePalette();
  const { fill, ink } = buttonColors(kind, palette);
  const large = size === "large";
  return (
    <PressScale
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityLabel={label}
      style={{
        minHeight: large ? 54 : 40,
        borderRadius: radius.pill,
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: space.sm,
        paddingHorizontal: large ? space.lg : space.md,
        backgroundColor: fill,
        alignSelf: large ? "stretch" : "flex-start",
      }}
    >
      {busy ? <ActivityIndicator color={ink} /> : icon ? <Icon name={icon} fallback="" size={large ? 18 : 15} color={ink} weight="semibold" /> : null}
      <Text maxFontSizeMultiplier={textScale.control} style={{ flexShrink: 1, textAlign: "center", fontSize: large ? 17 : 15, fontWeight: "600", color: ink }}>{label}</Text>
    </PressScale>
  );
}

export function Field({ label, hint, icon, ...props }: TextInputProps & { label: string; hint?: string; icon?: SFSymbol }) {
  const palette = usePalette();
  return (
    <View style={{ gap: space.sm }}>
      <Text style={{ fontSize: 15, fontWeight: "600", color: palette.text }}>{label}</Text>
      <View style={{
        flexDirection: "row",
        alignItems: props.multiline ? "flex-start" : "center",
        gap: space.sm,
        minHeight: props.multiline ? 104 : 52,
        borderRadius: radius.input,
        borderCurve: "continuous",
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        paddingHorizontal: 14,
        paddingVertical: props.multiline ? 12 : 0,
      }}>
        {icon ? <Icon name={icon} fallback="" size={18} color={palette.secondary} /> : null}
        <TextInput
          placeholderTextColor={palette.placeholder}
          accessibilityLabel={label}
          {...props}
          style={[{
            flex: 1,
            alignSelf: "stretch",
            color: palette.text,
            fontSize: 17,
            textAlignVertical: props.multiline ? "top" : "center",
          }, props.style]}
        />
      </View>
      {hint ? <Footnote>{hint}</Footnote> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: SFSymbol }) {
  const palette = usePalette();
  const ink = selected ? palette.onAccent : palette.text;
  return (
    <PressScale
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 40,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? palette.accent : palette.border,
        backgroundColor: selected ? palette.accent : palette.surface,
        paddingHorizontal: 14,
      }}
    >
      {selected ? <Icon name="checkmark" fallback="✓" size={13} color={ink} weight="bold" /> : icon ? <Icon name={icon} fallback="" size={14} color={palette.secondary} /> : null}
      <Text maxFontSizeMultiplier={textScale.control} style={{ flexShrink: 1, fontSize: 15, fontWeight: "500", color: ink }}>{label}</Text>
    </PressScale>
  );
}

export function Avatar({ name, size = 36, badge }: { name: string; size?: number; badge?: "done" | "organizer" }) {
  const palette = usePalette();
  const tint = avatarTint(name);
  return (
    <View style={{ width: size, height: size }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2, backgroundColor: tint.fill,
        alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: palette.surface,
      }}>
        <Text maxFontSizeMultiplier={textScale.fixed} style={{ fontSize: size * 0.38, fontWeight: "700", color: tint.ink }}>{initials(name)}</Text>
      </View>
      {badge ? (
        <View style={{
          position: "absolute", right: -3, bottom: -3, width: 18, height: 18, borderRadius: 9,
          backgroundColor: badge === "done" ? palette.success : palette.butter, borderWidth: 2, borderColor: palette.surface,
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={badge === "done" ? "checkmark" : "star.fill"} fallback="" size={8} color={badge === "done" ? "#FFFFFF" : palette.onButter} weight="black" />
        </View>
      ) : null}
    </View>
  );
}

/** Overlapping avatars, the way calendar and event apps show who's coming. */
export function AvatarStack({ names, size = 28, max = 4 }: { names: string[]; size?: number; max?: number }) {
  const palette = usePalette();
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <View style={{ flexDirection: "row" }} accessibilityLabel={`${names.length} ${names.length === 1 ? "person" : "people"}`}>
      {shown.map((name, index) => (
        <View key={`${name}-${index}`} style={{ marginLeft: index ? -size / 3 : 0 }}>
          <Avatar name={name} size={size} />
        </View>
      ))}
      {extra > 0 ? (
        <View style={{
          marginLeft: -size / 3, width: size, height: size, borderRadius: size / 2, backgroundColor: palette.fill,
          borderWidth: 2, borderColor: palette.surface, alignItems: "center", justifyContent: "center",
        }}>
          <Text maxFontSizeMultiplier={textScale.fixed} style={{ fontSize: size * 0.36, fontWeight: "700", color: palette.secondary }}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** A rounded tile behind an SF Symbol, like the icons in iOS Settings rows. */
export function IconTile({ name, color, size = 30 }: { name: SFSymbol; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.27, borderCurve: "continuous", backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} fallback="" size={size * 0.55} color="#FFFFFF" weight="semibold" />
    </View>
  );
}

export function Card({ children, tone = "plain", style }: { children: ReactNode; tone?: "plain" | "dark" | "tinted"; style?: ViewStyle }) {
  const palette = usePalette();
  return (
    <View style={[{
      borderRadius: radius.card,
      borderCurve: "continuous",
      padding: space.md,
      gap: space.sm + space.xs,
      backgroundColor: tone === "dark" ? palette.ink : tone === "tinted" ? palette.accentTint : palette.surface,
      boxShadow: tone === "plain" ? elevation.card : undefined,
    }, style]}>
      {children}
    </View>
  );
}

/** Inset grouped list, the iOS Settings pattern. Rows get hairline separators. */
export function ListSection({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const palette = usePalette();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View style={{ gap: space.sm }}>
      {title ? <Text style={{ fontSize: 13, fontWeight: "600", color: palette.secondary, paddingHorizontal: space.md }}>{title}</Text> : null}
      <View style={{ borderRadius: radius.card, borderCurve: "continuous", backgroundColor: palette.surface, overflow: "hidden", boxShadow: elevation.card }}>
        {rows.map((row, index) => (
          <View key={index}>
            {index ? <View style={{ height: 1, backgroundColor: palette.hairline, marginLeft: 58 }} /> : null}
            {row}
          </View>
        ))}
      </View>
      {footer ? <Footnote style={{ paddingHorizontal: space.md }}>{footer}</Footnote> : null}
    </View>
  );
}

export function ListRow({ icon, tint, title, detail, value, onPress, destructive, accessory = onPress ? "chevron" : "none", busy }: {
  icon: SFSymbol;
  tint: string;
  title: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  accessory?: "chevron" | "external" | "none";
  busy?: boolean;
}) {
  const palette = usePalette();
  const content = (pressed: boolean) => (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: space.md, minHeight: 52,
      paddingHorizontal: space.md, paddingVertical: 10, backgroundColor: pressed ? palette.fill : "transparent",
    }}>
      <IconTile name={icon} color={tint} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 17, color: destructive ? palette.danger : palette.text }}>{title}</Text>
        {detail ? <Text numberOfLines={2} style={{ fontSize: 14, color: palette.secondary }}>{detail}</Text> : null}
      </View>
      {value ? <Text style={{ fontSize: 16, color: palette.secondary }}>{value}</Text> : null}
      {busy ? <ActivityIndicator color={palette.secondary} /> : null}
      {!busy && accessory === "chevron" ? <Icon name="chevron.right" fallback="›" size={13} color={palette.tertiary} weight="semibold" /> : null}
      {!busy && accessory === "external" ? <Icon name="arrow.up.right" fallback="↗" size={13} color={palette.tertiary} weight="semibold" /> : null}
    </View>
  );
  if (!onPress) return content(false);
  // List rows highlight instead of scaling, like native table cells.
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} disabled={busy}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

/** A small rounded label with an icon, for plan status and similar states. */
export function Pill({ icon, label, tone = "neutral" }: { icon?: SFSymbol; label: string; tone?: "neutral" | "accent" | "butter" | "success" }) {
  const palette = usePalette();
  const colors = {
    neutral: { fill: palette.fill, ink: palette.secondary },
    accent: { fill: palette.accentTint, ink: palette.accent },
    butter: { fill: palette.butter, ink: palette.onButter },
    success: { fill: palette.successTint, ink: palette.success },
  }[tone];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      {icon ? <Icon name={icon} fallback="" size={12} color={colors.ink} weight="semibold" /> : null}
      <Text maxFontSizeMultiplier={textScale.control} style={{ flexShrink: 1, fontSize: 13, fontWeight: "600", color: colors.ink }}>{label}</Text>
    </View>
  );
}

export function Centered({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: space.lg, gap: space.md, backgroundColor: palette.background }}>{children}</View>;
}

/** The Cancel button every modal gets in its top-left corner. */
export function CancelButton({ onPress }: { onPress: () => void }) {
  const palette = usePalette();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={12}>
      {({ pressed }) => <Text maxFontSizeMultiplier={textScale.fixed} style={{ fontSize: 17, color: palette.accent, opacity: pressed ? 0.5 : 1 }}>Cancel</Text>}
    </Pressable>
  );
}
