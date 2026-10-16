import { Image } from "expo-image";
import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const POSES = {
  wave: require("../../assets/art/pip-wave.webp"),
  think: require("../../assets/art/pip-think.webp"),
  cheer: require("../../assets/art/pip-cheer.webp"),
  empty: require("../../assets/art/pip-empty.webp"),
  sleepy: require("../../assets/art/pip-sleepy.webp"),
  invite: require("../../assets/art/pip-invite.webp"),
};

export type PipPose = keyof typeof POSES;

/**
 * Pip, the TableUs mascot: a plush moon that orbits the group's planet and carries the picks.
 * Decorative, so screen readers skip it; the words next to it carry the meaning.
 */
export function Pip({ pose, size = 120, float = false }: { pose: PipPose; size?: number; float?: boolean }) {
  const reduceMotion = useReducedMotion();
  const bob = useSharedValue(0);

  useEffect(() => {
    if (float && !reduceMotion) {
      bob.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true));
    } else {
      cancelAnimation(bob);
      bob.set(withTiming(0, { duration: 200 }));
    }
  }, [float, reduceMotion, bob]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 * bob.get() }, { rotate: `${-3 + 6 * bob.get()}deg` }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessible={false} importantForAccessibility="no-hide-descendants">
      <Image source={POSES[pose]} style={{ width: size, height: size }} contentFit="contain" accessible={false} />
    </Animated.View>
  );
}
