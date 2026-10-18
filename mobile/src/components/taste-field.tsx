import { View } from "react-native";

import { space } from "@/theme";

import { Chip, Field } from "./ui";

const SUGGESTIONS = ["Vegetarian", "No shellfish", "Loves spicy food", "Not a fan of loud places"];

/** Standing tastes used in every plan. Only the owner sees them. */
export function TasteField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const add = (item: string) =>
    onChange(value.trim() ? `${value.trim().replace(/[.,]$/, "")}, ${item.toLowerCase()}` : item);
  const left = SUGGESTIONS.filter((item) => !value.toLowerCase().includes(item.toLowerCase()));
  return (
    <View style={{ gap: space.sm + space.xs }}>
      <Field
        label="What you always want (optional)"
        icon="heart.text.square"
        multiline
        maxLength={600}
        placeholder="Allergies, foods you love or avoid, the places you like"
        value={value}
        onChangeText={onChange}
        hint="Used for every plan you join. Only you can see this."
      />
      {left.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          {left.map((item) => (
            <Chip key={item} label={item} icon="plus" selected={false} onPress={() => add(item)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
