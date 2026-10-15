import { View } from "react-native";

import { space } from "@/theme";

import { Chip, Field } from "./ui";

const SUGGESTIONS = ["Vegetarian", "No shellfish", "Loves spicy food", "Not a fan of loud places"];

/** Standing tastes used in every plan. Only the owner sees them. */
export function TasteField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const add = (item: string) =>
    onChange(value.trim() ? `${value.trim().replace(/[.,]$/, "")}, ${item.toLowerCase()}` : item);
  return (
    <View style={{ gap: space.sm }}>
      <Field
        label="What you always want (optional)"
        multiline
        maxLength={600}
        placeholder="Allergies, foods you love or avoid, the places you like"
        value={value}
        onChangeText={onChange}
        hint="Used for every plan you join. Only you can see this."
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {SUGGESTIONS.filter((item) => !value.toLowerCase().includes(item.toLowerCase())).map((item) => (
          <Chip key={item} label={`+ ${item}`} selected={false} onPress={() => add(item)} />
        ))}
      </View>
    </View>
  );
}
