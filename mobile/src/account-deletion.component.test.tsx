import { afterEach, expect, jest, test } from "@jest/globals";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";

import AccountDeletionScreen from "../app/account-deletion";
import PrivacyScreen from "../app/privacy";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ router: { push: (path: string) => mockPush(path) } }));

afterEach(async () => { await cleanup(); mockPush.mockReset(); jest.restoreAllMocks(); });

test("signed-out deletion help renders a selectable address and opens bare privacy mailto", async () => {
  const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  const view = await render(<AccountDeletionScreen />);
  expect(view.getByText("Request account deletion")).toBeTruthy();
  expect(view.getByText(/If an email app does not open, copy this address: privacy@table-us.com/)).toBeTruthy();
  expect(view.getByText(/We aim to acknowledge your email within two business days/)).toBeTruthy();
  expect(view.getByText(/An email acknowledgment does not mean deletion is complete/)).toBeTruthy();
  await act(async () => { fireEvent.press(view.getByText("Email privacy@table-us.com")); });
  expect(openURL).toHaveBeenCalledWith("mailto:privacy@table-us.com");
  await act(async () => { fireEvent.press(view.getByText("Open Account and data")); });
  expect(mockPush).toHaveBeenCalledWith("/account");
});

test("privacy notice links back to public deletion help", async () => {
  const view = await render(<PrivacyScreen />);
  await act(async () => { fireEvent.press(view.getByText("How to request account deletion without signing in")); });
  expect(mockPush).toHaveBeenCalledWith("/account-deletion");
});

test("missing email app keeps a copyable address and explains the failure", async () => {
  jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("No email app"));
  const view = await render(<AccountDeletionScreen />);
  await act(async () => { fireEvent.press(view.getByText("Email privacy@table-us.com")); });
  await waitFor(() => expect(view.getByText("Could not open an email app. Copy the address above to contact us.")).toBeTruthy());
  expect(view.getByText(/If an email app does not open, copy this address: privacy@table-us.com/).props.selectable).toBe(true);
});
