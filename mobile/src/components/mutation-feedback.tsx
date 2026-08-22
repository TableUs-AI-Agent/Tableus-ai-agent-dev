import { Text, View } from "react-native";

import { Button } from "@/components/ui";
import type { RecoverableFailure } from "@/lib/recoverable-mutation";
import { colors } from "@/theme";

export function MutationFeedback({
  failure,
  canRetry,
  retryLabel,
  onRetry,
  onDismiss,
}: {
  failure: RecoverableFailure | null;
  canRetry: boolean;
  retryLabel: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  if (!failure) return null;
  return (
    <View style={{ gap: 8 }}>
      <Text selectable accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ color: colors.danger }}>
        {failure.message}
      </Text>
      {canRetry ? <Button label={retryLabel} onPress={onRetry} /> : null}
      <Button label="Dismiss message" onPress={onDismiss} />
    </View>
  );
}
