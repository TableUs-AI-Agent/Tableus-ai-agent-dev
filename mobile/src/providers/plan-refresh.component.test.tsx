import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import type { Plan } from "@tableus/domain";
import { focusManager, onlineManager, type QueryClient, useQueryClient } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { type PropsWithChildren, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import PlanScreen from "../../app/plans/[id]";
import { AppProviders } from "@/providers/app-providers";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

let mockFocused = true;
let mockOnline = true;
let mockPlan: Plan;
const mockGet = jest.fn<(path: string) => Promise<unknown>>();
const mockPut = jest.fn<() => Promise<Plan>>();
jest.mock("@/lib/api", () => ({ api: {
  get: (path: string) => mockGet(path), put: () => mockPut(), post: jest.fn(), patch: jest.fn(),
} }));
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ id: "fixture-plan" }), useIsFocused: () => mockFocused,
}));
jest.mock("@/components/google-maps-attribution", () => ({ GoogleMapsAttribution: () => null }));
jest.mock("expo-linking", () => ({ openURL: jest.fn() }));
jest.mock("@/providers/connectivity-provider", () => ({
  ConnectivityProvider: ({ children }: PropsWithChildren) => children,
  useConnectivity: () => ({ isOnline: mockOnline }),
}));
jest.mock("posthog-react-native", () => ({ PostHogProvider: ({ children }: PropsWithChildren) => children, usePostHog: jest.fn() }));
jest.mock("@/lib/telemetry", () => ({ captureTelemetry: jest.fn() }));
jest.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  secureAuthStorage: { getItem: async () => null, removeItem: async () => {} },
  supabase: { auth: {
    getSession: async () => ({ data: { session: { user: { id: "fixture-user" } } }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: jest.fn() } } }),
    startAutoRefresh: jest.fn(), stopAutoRefresh: jest.fn(),
  } },
}));

let client: QueryClient;
const listeners = new Set<(state: AppStateStatus) => void>();
function Harness() {
  const queryClient = useQueryClient();
  useEffect(() => { client = queryClient; }, [queryClient]);
  const auth = useAuth();
  return auth.approved ? <PlanScreen /> : null;
}
function Tree() { return <AppProviders><AuthProvider><Harness /></AuthProvider></AppProviders>; }
async function flush() { await act(async () => { await jest.advanceTimersByTimeAsync(50); }); }
async function appState(state: AppStateStatus) {
  await act(async () => { for (const listener of listeners) listener(state); });
  await flush();
}
function detailReads() { return mockGet.mock.calls.filter(([path]) => path === "/api/v1/plans/fixture-plan").length; }

beforeEach(() => {
  jest.useFakeTimers();
  mockFocused = true;
  mockOnline = true;
  focusManager.setFocused(true);
  onlineManager.setOnline(true);
  jest.spyOn(AppState, "addEventListener").mockImplementation((_event, listener) => {
    listeners.add(listener);
    return { remove: () => { listeners.delete(listener); } };
  });
  mockPlan = {
    id: "fixture-plan", title: "Fixture dinner", organizer_id: "someone-else", viewer_is_organizer: false,
    status: "voting", location_label: "Fixture city", latitude: null, longitude: null,
    participants: [{ profile_id: "fixture-user", display_name: "Diner", constraints: {}, is_organizer: false }],
    candidates: [1, 2, 3, 4].map((n) => ({ id: `candidate-${n}`, rank: n, vote_score: 0, reasoning: "Fixture", match_score: 1,
      place: { place_id: `place-${n}`, name: `Restaurant ${n}`, cuisine: "Fixture", address: "Fixture", rating: 4, price_level: 2, latitude: 0, longitude: 0, data_provider: "fixture" } })),
    my_vote: null, finalized_candidate_id: null, created_at: "2026-09-14T00:00:00Z", updated_at: "2026-09-14T00:00:00Z",
  };
  mockGet.mockReset().mockImplementation(async (path) => path === "/api/v1/me"
    ? { id: "fixture-user", display_name: "Diner", share_taste: false } : mockPlan);
  mockPut.mockReset().mockImplementation(async () => ({ ...mockPlan, my_vote: ["candidate-1", "candidate-2", "candidate-3"] }));
});
afterEach(async () => {
  await cleanup();
  client?.clear();
  listeners.clear();
  jest.restoreAllMocks();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
  jest.useRealTimers();
});

test("a mounted hidden plan does no detail reads on foreground, invalidation or reconnect", async () => {
  const screen = await render(<Tree />);
  await flush();
  expect(detailReads()).toBe(1);
  mockFocused = false;
  await screen.rerender(<Tree />);
  await appState("background");
  await act(async () => { jest.advanceTimersByTime(31_000); });
  await appState("active");
  await act(async () => { await client.invalidateQueries(); });
  await act(async () => { onlineManager.setOnline(false); });
  await act(async () => { onlineManager.setOnline(true); });
  await flush();
  expect(detailReads()).toBe(1);

  mockPlan = { ...mockPlan, title: "Updated by another diner", status: "finalized", finalized_candidate_id: "candidate-1" };
  mockFocused = true;
  await screen.rerender(<Tree />);
  await flush();
  expect(detailReads()).toBe(2);
  expect(screen.getByText("Updated by another diner")).toBeTruthy();
  expect(screen.queryByText("Submit ranked vote")).toBeNull();
});

test("visible foreground refresh happens once, including a quick return", async () => {
  const screen = await render(<Tree />);
  await flush();
  expect(detailReads()).toBe(1);
  await appState("background");
  mockPlan = { ...mockPlan, title: "Fresh plan" };
  await appState("active");
  expect(detailReads()).toBe(2);
  expect(screen.getByText("Fresh plan")).toBeTruthy();
  // Duplicate native active notifications must not start another request.
  await appState("active");
  expect(detailReads()).toBe(2);
});

test("offline cached plans remain visible, pull-to-refresh sends nothing until online", async () => {
  const screen = await render(<Tree />);
  await flush();
  mockOnline = false;
  await act(async () => { onlineManager.setOnline(false); });
  await screen.rerender(<Tree />);
  await appState("background");
  await appState("active");
  await act(async () => { await screen.getByTestId("plan-screen").props.refreshControl.props.onRefresh(); });
  await flush();
  expect(detailReads()).toBe(1);
  expect(screen.getByText("Fixture dinner")).toBeTruthy();
  mockOnline = true;
  await act(async () => { onlineManager.setOnline(true); });
  await screen.rerender(<Tree />);
  await flush();
  expect(detailReads()).toBe(2);
  await act(async () => { await screen.getByTestId("plan-screen").props.refreshControl.props.onRefresh(); });
  await flush();
  expect(detailReads()).toBe(3);
});

test("saving a vote consumes the mutation response without an extra detail fetch", async () => {
  const screen = await render(<Tree />);
  await flush();
  for (const n of [1, 2, 3]) await fireEvent.press(screen.getByText(`Rank Restaurant ${n}`));
  await fireEvent.press(screen.getByText("Submit ranked vote"));
  await flush();
  expect(mockPut).toHaveBeenCalledTimes(1);
  expect(detailReads()).toBe(1);
  expect(screen.getByText("Ranked vote saved.")).toBeTruthy();
});

test("a hidden route never fetches on mount, and a quick navigation return refreshes current votes", async () => {
  mockFocused = false;
  const screen = await render(<Tree />);
  await flush();
  expect(detailReads()).toBe(0);
  mockFocused = true;
  await screen.rerender(<Tree />);
  await flush();
  expect(detailReads()).toBe(1);
  mockFocused = false;
  await screen.rerender(<Tree />);
  mockPlan = { ...mockPlan, my_vote: ["candidate-1", "candidate-2", "candidate-3"] };
  mockFocused = true;
  await screen.rerender(<Tree />);
  await flush();
  expect(detailReads()).toBe(2);
  expect(screen.getByText("Ranked vote saved.")).toBeTruthy();
});
