import * as Haptics from "expo-haptics";
import { SymbolView, type SFSymbol } from "expo-symbols";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { fonts, radius, space, usePalette } from "@/theme";

const PRESS = { duration: 120, easing: Easing.bezier(0.23, 1, 0.32, 1) };

/** Root scroller for every screen: content can scroll under the large title. */
export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const palette = usePalette();
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ padding: space.md, paddingBottom: space.xxl * 2, gap: space.lg }}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

export function Title({ children, size = 44 }: { children: ReactNode; size?: number }) {
  const palette = usePalette();
  return (
    <Text style={{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 0.95, color: palette.text }}>
      {children}
    </Text>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return <Text style={{ fontSize: 20, fontWeight: "700", color: palette.text }}>{children}</Text>;
}

export function Body({ children, muted = false, style }: { children: ReactNode; muted?: boolean; style?: object }) {
  const palette = usePalette();
  return <Text style={[{ fontSize: 16, lineHeight: 23, color: muted ? palette.secondary : palette.text }, style]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return <Text accessibilityRole="alert" style={{ fontSize: 15, color: palette.danger }}>{children}</Text>;
}

/** Scales slightly on press-in, like native buttons and cards. */
export function PressScale({ children, onPress, disabled, style, accessibilityLabel, accessibilityState, haptic = true }: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  haptic?: boolean;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      onPressIn={() => scale.set(withTiming(0.97, PRESS))}
      onPressOut={() => scale.set(withTiming(1, PRESS))}
      onPress={() => {
        if (haptic) Haptics.selectionAsync();
        onPress?.();
      }}
    >
      <Animated.View style={[style, animated, disabled ? { opacity: 0.5 } : null]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Button({ label, onPress, busy, disabled, kind = "primary" }: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  kind?: "primary" | "quiet" | "danger";
}) {
  const palette = usePalette();
  const primary = kind === "primary";
  const color = primary ? palette.onAccent : kind === "danger" ? palette.danger : palette.text;
  return (
    <PressScale
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityLabel={label}
      style={{
        minHeight: 52,
        borderRadius: radius.pill,
        borderCurve: "continuous",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: space.sm,
        paddingHorizontal: space.lg,
        backgroundColor: primary ? palette.accent : "transparent",
        borderWidth: primary ? 0 : 2,
        borderColor: kind === "danger" ? palette.danger : palette.text,
      }}
    >
      {busy ? <ActivityIndicator color={color} /> : null}
      <Text style={{ fontSize: 17, fontWeight: "600", color }}>{label}</Text>
    </PressScale>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  const palette = usePalette();
  return (
    <View style={{ gap: space.xs }}>
      <Text style={{ fontSize: 15, fontWeight: "600", color: palette.text }}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.secondary}
        {...props}
        style={[{
          minHeight: props.multiline ? 96 : 48,
          borderRadius: radius.input,
          borderCurve: "continuous",
          borderWidth: 2,
          borderColor: palette.border,
          backgroundColor: palette.surface,
          color: palette.text,
          fontSize: 17,
          paddingHorizontal: 12,
          paddingVertical: 10,
          textAlignVertical: props.multiline ? "top" : "center",
        }, props.style]}
      />
      {hint ? <Text style={{ fontSize: 13, color: palette.secondary }}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const palette = usePalette();
  return (
    <PressScale
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{
        borderRadius: radius.pill,
        borderWidth: 2,
        borderColor: selected ? palette.text : palette.border,
        backgroundColor: selected ? palette.text : palette.surface,
        paddingHorizontal: 14,
        paddingVertical: 7,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "500", color: selected ? palette.background : palette.text }}>{label}</Text>
    </PressScale>
  );
}

export function Avatar({ name, highlight = false }: { name: string; highlight?: boolean }) {
  const palette = usePalette();
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
  return (
    <View style={{
      width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: palette.text,
      backgroundColor: highlight ? palette.butter : palette.surface, alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: highlight ? palette.onButter : palette.text }}>{letters}</Text>
    </View>
  );
}

export function Icon({ name, fallback, size = 22, color }: { name: SFSymbol; fallback: string; size?: number; color?: string }) {
  const palette = usePalette();
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color ?? palette.text}
      fallback={<Text style={{ fontSize: size * 0.8, color: color ?? palette.text }}>{fallback}</Text>}
    />
  );
}

export function Card({ children, emphasis = "plain" }: { children: ReactNode; emphasis?: "plain" | "outlined" | "dark" }) {
  const palette = usePalette();
  return (
    <View style={{
      borderRadius: radius.card,
      borderCurve: "continuous",
      padding: space.md,
      gap: space.sm,
      backgroundColor: emphasis === "dark" ? palette.text : palette.surface,
      borderWidth: 2,
      borderColor: emphasis === "plain" ? palette.border : palette.text,
    }}>
      {children}
    </View>
  );
}

export function Centered({ children }: { children: ReactNode }) {
  const palette = usePalette();
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: space.lg, gap: space.md, backgroundColor: palette.background }}>{children}</View>;
}
