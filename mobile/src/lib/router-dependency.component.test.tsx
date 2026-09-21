// Exercise the actual router parser through the React Native Jest transform.
// This catches CommonJS/ESM mismatches that a Node-only decoder test misses.
import { expect, test } from "@jest/globals";
import { getStateFromPath } from "expo-router/build/react-navigation/core/getStateFromPath";

test("router decodes auth/share query values with the patched upstream decoder", () => {
  const state = getStateFromPath("/join?token=a%2Bb%2Fc%3D&name=Jos%C3%A9", {
    screens: { join: "join" },
  });
  expect(state?.routes[0].params).toEqual({ token: "a+b/c=", name: "José" });
});

test("router preserves malformed bytes while decoding valid sequences", () => {
  const state = getStateFromPath("/join?token=%FF%41%FF%41", { screens: { join: "join" } });
  expect(state?.routes[0].params).toEqual({ token: "%FFA%FFA" });
});
