import * as SecureStore from "expo-secure-store";

/** Keychain/Keystore on devices; localStorage for the web preview. */
const web = process.env.EXPO_OS === "web";

export const storage = {
  getItem: async (key: string): Promise<string | null> =>
    web ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string): Promise<void> =>
    web ? globalThis.localStorage?.setItem(key, value) : SecureStore.setItemAsync(key, value),
  removeItem: async (key: string): Promise<void> =>
    web ? globalThis.localStorage?.removeItem(key) : SecureStore.deleteItemAsync(key),
};
