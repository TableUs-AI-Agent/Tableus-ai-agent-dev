const expoPreset = require("jest-expo/jest-preset");

module.exports = {
  testEnvironment: "<rootDir>/jest.rn-environment.cjs",
  setupFiles: [expoPreset.setupFiles[0]],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: expoPreset.transform,
  transformIgnorePatterns: expoPreset.transformIgnorePatterns,
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/**/*.component.test.tsx"],
  clearMocks: true,
};
