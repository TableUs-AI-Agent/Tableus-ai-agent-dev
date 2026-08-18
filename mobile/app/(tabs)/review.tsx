import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { Button, Card, ErrorText, Field } from "@/components/ui";
import { api } from "@/lib/api";
import { colors } from "@/theme";

export default function ReviewScreen() {
  const [restaurant, setRestaurant] = useState("");
  const [review, setReview] = useState("");
  const save = useMutation({ mutationFn: () => api.post("/api/v1/reviews", { restaurant_name: restaurant, review_text: review, rating: 5 }) });
  const analyze = useMutation({
    mutationFn: async () => {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (result.canceled) return null;
      const asset = result.assets[0];
      const form = new FormData();
      form.append("image", { uri: asset.uri, name: asset.fileName ?? "dish.jpg", type: asset.mimeType ?? "image/jpeg" } as unknown as Blob);
      return api.post<{ dish: string; cuisine: string }>("/api/v1/food/analyze", form);
    },
  });
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 20, fontWeight: "800" }}>Remember what worked</Text>
        <Field value={restaurant} onChangeText={setRestaurant} placeholder="Restaurant" />
        <Field value={review} onChangeText={setReview} placeholder="What did you like?" multiline style={{ minHeight: 100, textAlignVertical: "top" }} />
        {save.error ? <ErrorText message={save.error.message} /> : null}
        <Button label="Save review" onPress={() => save.mutate()} loading={save.isPending} disabled={!restaurant || !review} />
      </Card>
      <Card>
        <Text selectable style={{ color: colors.muted }}>Photo analysis is ephemeral. The image bytes are validated, analyzed, and never persisted.</Text>
        {analyze.data ? <Text selectable style={{ color: colors.ink }}>{analyze.data.dish} · {analyze.data.cuisine}</Text> : null}
        {analyze.error ? <ErrorText message={analyze.error.message} /> : null}
        <Button label="Analyze a dish photo" onPress={() => analyze.mutate()} loading={analyze.isPending} />
      </Card>
    </ScrollView>
  );
}
