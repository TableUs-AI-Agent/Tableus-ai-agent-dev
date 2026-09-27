import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import type { Plan } from "@tableus/domain";
import { ApiError } from "@tableus/api-client";
import { focusManager, onlineManager, type QueryClient, useQueryClient } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { type PropsWithChildren, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import PlanScreen from "../../app/plans/[id]";
import * as ui from "@/components/ui";
import { AppProviders } from "@/providers/app-providers";
import { AuthProvider, useAuth } from "@/providers/auth-provider";

let mockFocused = true;
let mockOnline = true;
let mockPlan: Plan;
const mockGet = jest.fn<(path: string) => Promise<unknown>>();
const mockPut = jest.fn<() => Promise<Plan>>();
const mockPost = jest.fn<(path: string, body: unknown) => Promise<unknown>>();
const mockPatch = jest.fn<(path: string, body: unknown) => Promise<unknown>>();
jest.mock("@/lib/api", () => ({ api: {
  get: (path: string) => mockGet(path), put: () => mockPut(), post: (path: string, body: unknown) => mockPost(path, body), patch: (path: string, body: unknown) => mockPatch(path, body),
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

function captureRefreshHandler() {
  let handler: () => void = () => { throw new Error("Refresh control has not rendered"); };
  const Button = ui.Button;
  jest.spyOn(ui, "Button").mockImplementation((props) => {
    if (props.label === "Refresh plan") handler = props.onPress;
    return <Button {...props} />;
  });
  return () => handler;
}

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
  mockPost.mockReset();
  mockPatch.mockReset();
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

test("offline cached plans remain visible, explicit refresh sends nothing until online", async () => {
  const screen = await render(<Tree />);
  await flush();
  mockOnline = false;
  await act(async () => { onlineManager.setOnline(false); });
  await screen.rerender(<Tree />);
  await appState("background");
  await appState("active");
  await fireEvent.press(screen.getByRole("button", { name: "Refresh plan" }));
  await flush();
  expect(detailReads()).toBe(1);
  expect(screen.getByText("Fixture dinner")).toBeTruthy();
  expect(screen.getByText("Offline. Showing the most recently loaded data.")).toBeTruthy();
  mockOnline = true;
  await act(async () => { onlineManager.setOnline(true); });
  await screen.rerender(<Tree />);
  await flush();
  expect(detailReads()).toBe(2);
  await fireEvent.press(screen.getByRole("button", { name: "Refresh plan" }));
  await flush();
  expect(detailReads()).toBe(3);
  expect(screen.queryByText("Offline. Showing the most recently loaded data.")).toBeNull();
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
  await fireEvent.press(screen.getByText("Remove Restaurant 1 from rank 1"));
  expect(screen.queryByText("Ranked vote saved.")).toBeNull();
  expect(screen.getByText("Ranking changes are not submitted.")).toBeTruthy();
  expect(mockPut).toHaveBeenCalledTimes(1);
});

test("organizer repairs removed metadata before generating fresh options", async () => {
  mockPlan = { ...mockPlan, viewer_is_organizer: true, organizer_id: "fixture-user", status: "collecting", metadata_needs_replacement: true, title: "Plan details needed", location_label: "Location needed", candidates: [], my_vote: null };
  mockPost.mockImplementation(async (path) => {
    if (path === "/api/v1/locations/resolve") return { place_id: "replacement-place", label: "Chicago", data_provider: "fixture" };
    throw new Error(`Unexpected post: ${path}`);
  });
  mockPatch.mockImplementation(async (path, body) => {
    expect(path).toBe("/api/v1/plans/fixture-plan/metadata");
    expect(body).toEqual({ title: "Fresh dinner", location_label: "Chicago", location_place_id: "replacement-place" });
    return { ...mockPlan, title: "Fresh dinner", location_label: "Chicago", metadata_needs_replacement: false, updated_at: "2026-09-15T00:00:00Z" };
  });
  const screen = await render(<Tree />);
  await flush();
  expect(screen.getByText("Plan details changed")).toBeTruthy();
  expect(screen.queryByText("Find four options")).toBeNull();
  await fireEvent.changeText(screen.getByLabelText("Replacement plan title"), "Fresh dinner");
  await fireEvent.changeText(screen.getByLabelText("Replacement city, neighborhood, or ZIP code"), "Chicago");
  expect(screen.getByRole("button", { name: "Find replacement location" })).toBeEnabled();
  await fireEvent.press(screen.getByText("Find replacement location"));
  await flush();
  expect(mockPost).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Chicago")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Save new plan details" })).toBeEnabled();
  await fireEvent.press(screen.getByText("Save new plan details"));
  await flush();
  expect(mockPatch).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Plan details changed")).toBeNull();
  expect(screen.getByText("Find four options")).toBeTruthy();
  expect(mockPost).toHaveBeenCalledTimes(1);
});

test("stale metadata replay requires a refresh and never retries the old body", async () => {
  mockPlan = { ...mockPlan, viewer_is_organizer: true, organizer_id: "fixture-user", status: "collecting", metadata_needs_replacement: true, candidates: [] };
  mockPost.mockImplementation(async () => ({ place_id: "replacement-place", label: "Chicago", data_provider: "fixture" }));
  mockPatch.mockImplementation(async () => { throw new ApiError("Plan content changed", 409, "idempotency_content_changed"); });
  const screen = await render(<Tree />);
  await flush();
  await fireEvent.changeText(screen.getByLabelText("Replacement plan title"), "Fresh dinner");
  await fireEvent.changeText(screen.getByLabelText("Replacement city, neighborhood, or ZIP code"), "Chicago");
  await fireEvent.press(screen.getByText("Find replacement location"));
  await flush();
  await fireEvent.press(screen.getByText("Save new plan details"));
  await flush();
  expect(mockPatch).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Plan details changed. Refresh the plan before making another change.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Save new plan details" })).toBeDisabled();
  expect(screen.queryByText("Retry saving plan details")).toBeNull();
  mockPlan = { ...mockPlan, title: "Fresh dinner", location_label: "Chicago", metadata_needs_replacement: false, updated_at: "2026-09-15T00:00:00Z" };
  await fireEvent.press(screen.getByText("Refresh plan"));
  await flush();
  expect(screen.queryByText("Plan details changed. Refresh the plan before making another change.")).toBeNull();
  expect(screen.getByText("Find four options")).toBeTruthy();
  expect(mockPatch).toHaveBeenCalledTimes(1);
});

test("overlapping manual refreshes share one slow detail request", async () => {
  const getRefresh = captureRefreshHandler();
  const screen = await render(<Tree />);
  await flush();
  let complete!: (value: Plan) => void;
  const pending = new Promise<Plan>((resolve) => { complete = resolve; });
  mockGet.mockImplementation(() => pending);
  // Deliver two callbacks before the disabled state can reach the native control.
  const refresh = getRefresh();
  try {
    await act(async () => { refresh(); refresh(); });
    expect(detailReads()).toBe(2);
  } finally {
    await act(async () => { complete({ ...mockPlan, title: "Refreshed once" }); });
    await flush();
  }
  expect(screen.getByText("Refreshed once")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Refresh plan" })).toBeEnabled();
});

test("an existing vote is not presented as a new submission", async () => {
  mockPlan = { ...mockPlan, my_vote: ["candidate-1", "candidate-2", "candidate-3"] };
  const screen = await render(<Tree />);
  await flush();
  expect(mockPut).not.toHaveBeenCalled();
  expect(screen.queryByText("Ranked vote saved.")).toBeNull();
  expect(screen.getByText("Your previous ranked vote is saved.")).toBeTruthy();
});

test("a queued manual refresh shares a foreground read without a persistent loading indicator", async () => {
  const getRefresh = captureRefreshHandler();
  const screen = await render(<Tree />);
  await flush();
  const refresh = getRefresh();
  let complete!: (value: Plan) => void;
  const pending = new Promise<Plan>((resolve) => { complete = resolve; });
  mockGet.mockImplementation(() => pending);
  await appState("background");
  await appState("active");
  try {
    expect(detailReads()).toBe(2);
    expect(screen.getByText("Refresh plan")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Refresh plan" })).toBeDisabled();
    await act(async () => { refresh(); });
    expect(detailReads()).toBe(2);
    expect(screen.queryByText("Refresh plan")).toBeNull();
  } finally {
    await act(async () => { complete({ ...mockPlan, title: "Fresh foreground result" }); });
    await flush();
  }
  expect(screen.getByText("Fresh foreground result")).toBeTruthy();
  expect(screen.getByText("Refresh plan")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Refresh plan" })).toBeEnabled();
});

test("refresh remains usable after an initial load and a manual retry both fail", async () => {
  const get = mockGet.getMockImplementation()!;
  mockGet.mockImplementation((path) => path === "/api/v1/me" ? get(path) : Promise.reject(new Error("Plan unavailable")));
  const screen = await render(<Tree />);
  await act(async () => { await jest.advanceTimersByTimeAsync(5_000); });
  expect(detailReads()).toBe(3);
  expect(screen.getByText("Plan unavailable")).toBeTruthy();
  expect(screen.queryByText("Fixture dinner")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Refresh plan" }));
  await act(async () => { await jest.advanceTimersByTimeAsync(5_000); });
  expect(detailReads()).toBe(6);
  expect(screen.getByText("Refresh plan")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Refresh plan" })).toBeEnabled();
  mockGet.mockImplementation(get);
  await fireEvent.press(screen.getByRole("button", { name: "Refresh plan" }));
  await flush();
  expect(detailReads()).toBe(7);
  expect(screen.getByText("Fixture dinner")).toBeTruthy();
  expect(screen.queryByText("Plan unavailable")).toBeNull();
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
  expect(screen.getByText("Your previous ranked vote is saved.")).toBeTruthy();
});
