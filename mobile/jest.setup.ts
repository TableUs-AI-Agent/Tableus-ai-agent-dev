import { jest } from "@jest/globals";

jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  __esModule: true,
  default: {
    OS: "ios",
    Version: "test",
    isPad: false,
    isTV: false,
    select: (values: Record<string, unknown>) => values.ios ?? values.native ?? values.default,
  },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
