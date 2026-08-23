import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, Text, type TextInputProps, TextInput, View } from "react-native";

import { colors } from "@/theme";

export function Card({ children }: PropsWithChildren) {
  return (
    <View style={{ gap: 10, padding: 16, borderRadius: 20, borderCurve: "continuous", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
      {children}
    </View>
  );
}

export function Button({ label, onPress, disabled = false, loading = false }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({ padding: 14, borderRadius: 16, borderCurve: "continuous", alignItems: "center", backgroundColor: disabled ? colors.line : colors.accent, opacity: pressed ? 0.75 : 1 })}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text selectable style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{label}</Text>}
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[{ padding: 14, minHeight: 48, borderRadius: 14, borderCurve: "continuous", borderWidth: 1, borderColor: colors.line, color: colors.ink, backgroundColor: "#fff" }, props.style]} />;
}

export function ErrorText({ message }: { message: string }) {
  return <Text selectable accessibilityRole="alert" style={{ color: colors.danger }}>{message}</Text>;
}
