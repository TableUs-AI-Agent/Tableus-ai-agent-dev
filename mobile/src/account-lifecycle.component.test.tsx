import { ApiError } from "@tableus/api-client";
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";

import AccountScreen from "../app/account";

const mockGet = jest.fn<(path: string) => Promise<unknown>>();
const mockPost = jest.fn<(path: string, body: unknown, options: unknown) => Promise<unknown>>();
const mockDelete = jest.fn<(path: string, body: unknown, options: unknown) => Promise<unknown>>();
let mockOnline = true;
const mockAuth = {
  approved: true,
  phase: "approved",
  subject: "account-actor",
  deletionStatus: null as null | { status: "pending" | "completed"; needs_attention: boolean; next_retry_at: string | null },
  error: "",
  busy: false,
  signOut: jest.fn<() => Promise<void>>(),
  beginDeletion: jest.fn<(subject: string) => void>(),
  setDeletionOutcome: jest.fn<(subject: string, status: unknown) => void>(),
  refreshDeletionStatus: jest.fn<() => Promise<void>>(),
};

jest.mock("@/lib/api", () => ({ api: {
  get: (path: string) => mockGet(path),
  post: (path: string, body: unknown, options: unknown) => mockPost(path, body, options),
  delete: (path: string, body: unknown, options: unknown) => mockDelete(path, body, options),
} }));
jest.mock("@/providers/auth-provider", () => ({ useAuth: () => mockAuth }));
jest.mock("react-native/Libraries/Components/RefreshControl/RefreshControl", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Pressable, Text } = jest.requireActual<typeof import("react-native")>("react-native");
  return { __esModule: true, default: ({ onRefresh }: { onRefresh: () => void }) => React.createElement(
    Pressable, { onPress: onRefresh, accessibilityLabel: "Pull to refresh account" },
    React.createElement(Text, null, "Pull to refresh account"),
  ) };
});
jest.mock("@/providers/connectivity-provider", () => ({ useConnectivity: () => ({ isOnline: mockOnline }) }));
jest.mock("@/lib/account-export-file", () => ({ shareAccountExport: jest.fn() }));
jest.mock("@/lib/recoverable-mutation", () => ({ useRecoverableMutation: () => ({
  submit: jest.fn(), retry: jest.fn(), reset: jest.fn(), isPending: false, canRetry: false, failure: null,
}) }));

const shared = {
  id: "shared-plan", title: "Shared dinner", organizer_id: "account-actor",
  viewer_is_organizer: true, updated_at: "2026-09-24T00:00:00Z",
  participants: [
    { profile_id: "account-actor", display_name: "Me", is_organizer: true },
    { profile_id: "recipient", display_name: "Friend", is_organizer: false },
  ],
};
const solo = {
  ...shared, id: "solo-plan", title: "Solo dinner",
  participants: [shared.participants[0]],
};
let client: QueryClient;
let view: Awaited<ReturnType<typeof render>>;
let deletionRead: { status: "pending" | "completed"; needs_attention: boolean; requested_at: string; completed_at: string | null; next_retry_at: string | null; last_error_code: string | null } | null;

function setReads(available: boolean, plans = [shared, solo]) {
  mockGet.mockImplementation(async (path) => {
    if (path.endsWith("/me/deletion")) {
      if (deletionRead) return deletionRead;
      throw new ApiError("No deletion request", 404);
    }
    if (path.endsWith("/organized-plans")) return plans;
    if (path.endsWith("/account-control")) return {
      can_delete: plans.length === 0, blockers: plans.length ? ["organized_plans"] : [],
      organized_plan_count: plans.length, deletion_scope: "application_profile",
      supabase_auth_removal: "operator_required", full_deletion_available: available,
    };
    if (path.endsWith("/me")) return { id: "account-actor", display_name: "Me", share_taste: false };
    throw new Error(`Unexpected read ${path}`);
  });
}

async function open() {
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  view = await render(<QueryClientProvider client={client}><AccountScreen /></QueryClientProvider>);
  await view.findByText("Shared dinner");
}

beforeEach(() => {
  mockOnline = true;
  mockAuth.approved = true;
  mockAuth.phase = "approved";
  mockAuth.subject = "account-actor";
  mockAuth.deletionStatus = null;
  mockAuth.error = "";
  mockAuth.busy = false;
  mockAuth.signOut.mockReset().mockResolvedValue(undefined);
  mockAuth.beginDeletion.mockReset();
  mockAuth.setDeletionOutcome.mockReset();
  mockAuth.refreshDeletionStatus.mockReset().mockResolvedValue(undefined);
  mockGet.mockReset();
  mockPost.mockReset().mockResolvedValue(shared);
  mockDelete.mockReset().mockResolvedValue({ deleted: true });
  deletionRead = null;
  setReads(false);
});

afterEach(async () => {
  await cleanup();
  client?.clear();
});

test("unavailable full deletion stays disabled while export and sign-out remain", async () => {
  await open();
  expect(view.getByText("Full account deletion is unavailable. Contact support.")).toBeTruthy();
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type DELETE to confirm full account deletion"), "DELETE"); });
  expect(view.getByLabelText("Delete my account").props.accessibilityState.disabled).toBe(true);
  expect(view.getByLabelText("Export my data")).toBeTruthy();
  expect(view.getByLabelText("Sign out")).toBeTruthy();
  expect(mockPost).not.toHaveBeenCalled();
});

test("transfer selects a participant and preserves an exact confirmation and key", async () => {
  await open();
  await act(async () => { fireEvent.press(view.getByLabelText("Select Friend")); });
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type TRANSFER to confirm Shared dinner"), "TRANSFER"); });
  await act(async () => { fireEvent.press(view.getByLabelText("Transfer Shared dinner")); });
  await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1));
  expect(mockPost.mock.calls[0][0]).toBe("/api/v1/plans/shared-plan/transfer-ownership");
  expect(mockPost.mock.calls[0][1]).toEqual({ recipient_profile_id: "recipient" });
  expect(mockPost.mock.calls[0][2]).toEqual({ idempotencyKey: expect.any(String), expectedSubject: "account-actor" });
});

test("sole plan needs DELETE and only that plan is sent", async () => {
  await open();
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type DELETE to confirm Solo dinner"), "DELETE"); });
  await act(async () => { fireEvent.press(view.getByLabelText("Delete Solo dinner")); });
  await waitFor(() => expect(mockDelete).toHaveBeenCalledTimes(1));
  expect(mockDelete.mock.calls[0][0]).toBe("/api/v1/plans/solo-plan");
  expect(mockDelete.mock.calls[0][1]).toEqual({ confirmation: "DELETE" });
});

test("offline confirmation cannot send or queue ownership and deletion writes", async () => {
  mockOnline = false;
  await open();
  await act(async () => { fireEvent.press(view.getByLabelText("Select Friend")); });
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type TRANSFER to confirm Shared dinner"), "TRANSFER"); });
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type DELETE to confirm Solo dinner"), "DELETE"); });
  expect(view.getByLabelText("Transfer Shared dinner").props.accessibilityState.disabled).toBe(true);
  expect(view.getByLabelText("Delete Solo dinner").props.accessibilityState.disabled).toBe(true);
  await act(async () => { fireEvent.press(view.getByLabelText("Transfer Shared dinner")); fireEvent.press(view.getByLabelText("Delete Solo dinner")); });
  expect(mockPost).not.toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
});

test("a lost transfer response checks the management list and never replays automatically", async () => {
  await open();
  mockPost.mockRejectedValueOnce(new ApiError("Network unavailable", 0));
  await act(async () => { fireEvent.press(view.getByLabelText("Select Friend")); });
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type TRANSFER to confirm Shared dinner"), "TRANSFER"); });
  await act(async () => { fireEvent.press(view.getByLabelText("Transfer Shared dinner")); });
  await waitFor(() => expect(view.getByLabelText("Retry same plan request")).toBeTruthy());
  expect(mockPost).toHaveBeenCalledTimes(1);
  await act(async () => { fireEvent.press(view.getByLabelText("Retry same plan request")); });
  await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(2));
  expect(mockPost.mock.calls[1][1]).toEqual(mockPost.mock.calls[0][1]);
  expect(mockPost.mock.calls[1][2]).toEqual(mockPost.mock.calls[0][2]);
});

test("full deletion uses exact confirmation and retains pending outcome without sign-out", async () => {
  setReads(true, []);
  mockPost.mockResolvedValueOnce({ status: "pending", needs_attention: false, requested_at: "2026-09-24T00:00:00Z", completed_at: null, next_retry_at: "2026-09-24T00:01:00Z", last_error_code: "retryable" });
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  view = await render(<QueryClientProvider client={client}><AccountScreen /></QueryClientProvider>);
  await view.findByText("Full account deletion is available.");
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type DELETE to confirm full account deletion"), "DELETE"); });
  await act(async () => { fireEvent.press(view.getByLabelText("Delete my account")); });
  expect(mockPost.mock.calls[0][0]).toBe("/api/v1/me/deletion");
  expect(mockPost.mock.calls[0][1]).toEqual({ confirmation: "DELETE" });
  expect(mockAuth.beginDeletion).toHaveBeenCalledWith("account-actor");
  expect(mockAuth.setDeletionOutcome).toHaveBeenCalledWith("account-actor", expect.objectContaining({ status: "pending" }));
  expect(mockAuth.signOut).not.toHaveBeenCalled();
});

test("a lost deletion response reads durable status without automatically replaying the write", async () => {
  setReads(true, []);
  deletionRead = { status: "completed", needs_attention: false, requested_at: "2026-09-24T00:00:00Z", completed_at: "2026-09-24T00:01:00Z", next_retry_at: null, last_error_code: null };
  mockPost.mockRejectedValueOnce(new ApiError("Network unavailable", 0));
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  view = await render(<QueryClientProvider client={client}><AccountScreen /></QueryClientProvider>);
  await view.findByText("Full account deletion is available.");
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type DELETE to confirm full account deletion"), "DELETE"); });
  await act(async () => { fireEvent.press(view.getByLabelText("Delete my account")); });
  expect(mockPost).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledWith("/api/v1/me/deletion");
  expect(mockAuth.setDeletionOutcome).toHaveBeenCalledWith("account-actor", expect.objectContaining({ status: "completed" }));
});

test("pull-to-refresh cannot reopen account settings while deletion is still committing", async () => {
  setReads(true, []);
  let complete!: (value: unknown) => void;
  mockPost.mockImplementationOnce(() => new Promise((resolve) => { complete = resolve; }));
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  view = await render(<QueryClientProvider client={client}><AccountScreen /></QueryClientProvider>);
  await view.findByText("Full account deletion is available.");
  await act(async () => { fireEvent.changeText(view.getByLabelText("Type DELETE to confirm full account deletion"), "DELETE"); });
  await act(async () => { fireEvent.press(view.getByLabelText("Delete my account")); });
  const readsBeforeRefresh = mockGet.mock.calls.length;
  await act(async () => { fireEvent.press(view.getByLabelText("Pull to refresh account")); });
  expect(mockGet).toHaveBeenCalledTimes(readsBeforeRefresh);
  expect(mockAuth.refreshDeletionStatus).not.toHaveBeenCalled();
  expect(mockPost).toHaveBeenCalledTimes(1);
  await act(async () => { complete({ status: "pending", needs_attention: false }); });
  expect(mockAuth.setDeletionOutcome).toHaveBeenCalledWith("account-actor", expect.objectContaining({ status: "pending" }));
});
