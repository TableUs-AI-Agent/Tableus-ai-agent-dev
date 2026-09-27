import { afterEach, expect, jest, test } from "@jest/globals";
import { cleanup, render } from "@testing-library/react-native";

import Index from "../app/index";
import TabsLayout from "../app/(tabs)/_layout";
import People from "../app/(tabs)/people";
import Profile from "../app/(tabs)/profile";
import Review from "../app/(tabs)/review";
import AccountTab from "../app/(tabs)/settings";
import AccountScreen from "../app/account";

let mockAuth = { phase: "approved", approved: true };
jest.mock("@/providers/auth-provider", () => ({ useAuth: () => mockAuth }));
jest.mock("expo-router", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Text, View } = jest.requireActual<typeof import("react-native")>("react-native");
  const Tabs = ({ children, initialRouteName }: { children: React.ReactNode; initialRouteName: string }) => React.createElement(View, { testID: "tabs", accessibilityLabel: initialRouteName }, children);
  Tabs.Screen = function TabScreen({ name, options }: { name: string; options: { href?: null; title?: string } }) { return options.href === null ? null : React.createElement(Text, { testID: name }, options.title); };
  return { Tabs, Redirect: ({ href }: { href: string }) => React.createElement(Text, { testID: "redirect" }, href), router: {} };
});
jest.mock("@/providers/connectivity-provider", () => ({ useConnectivity: () => ({ isOnline: true }) }));
jest.mock("@/lib/api", () => ({ api: {} }));
jest.mock("@/lib/account-export-file", () => ({ shareAccountExport: jest.fn() }));
afterEach(async () => { await cleanup(); });

test("pilot tabs expose Plans and Account and open on Plans", async () => {
  const view = await render(<TabsLayout />);
  expect(view.getByTestId("tabs").props.accessibilityLabel).toBe("plans");
  expect(view.getByText("Plans")).toBeTruthy();
  expect(view.getByText("Account")).toBeTruthy();
  expect(view.queryByText("People")).toBeNull();
  expect(view.queryByText("Review")).toBeNull();
  expect(view.queryByText("Profile")).toBeNull();
  expect(AccountTab).toBe(AccountScreen);
});

test.each([People, Profile, Review])("deferred direct entry redirects without mounting its feature", async (Screen) => {
  const view = await render(<Screen />);
  expect(view.getByTestId("redirect").props.children).toBe("/(tabs)/plans");
});

test.each<[typeof mockAuth, string]>([
  [{ phase: "approved", approved: true }, "/(tabs)/plans"],
  [{ phase: "signed_out", approved: false }, "/auth"],
  [{ phase: "error", approved: false }, "/auth"],
  [{ phase: "deletion", approved: false }, "/account"],
])("landing preserves approval and recovery: %s", async (auth, destination) => {
  mockAuth = auth;
  const view = await render(<Index />);
  expect(view.getByTestId("redirect").props.children).toBe(destination);
});

test("restoring session does not redirect prematurely", async () => {
  mockAuth = { phase: "loading", approved: false };
  const view = await render(<Index />);
  expect(view.getByText("Restoring your session…")).toBeTruthy();
  expect(view.queryByTestId("redirect")).toBeNull();
});
