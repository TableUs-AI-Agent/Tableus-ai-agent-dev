const expoPreset = require("jest-expo/jest-preset");

module.exports = {
  testEnvironment: "<rootDir>/jest.rn-environment.cjs",
  setupFiles: [expoPreset.setupFiles[0]],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: expoPreset.transform,
  // The router's compatibility adapter calls the patched ESM decoder.
  transformIgnorePatterns: expoPreset.transformIgnorePatterns.map((pattern) =>
    pattern.replace("(?!(.pnpm|", "(?!(decode-uri-component-upstream|.pnpm|"),
  ),
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/**/*.component.test.tsx"],
  clearMocks: true,
};
