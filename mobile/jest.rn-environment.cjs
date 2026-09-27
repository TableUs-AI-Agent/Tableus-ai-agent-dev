const NodeEnvironment = require("jest-environment-node").TestEnvironment;

module.exports = class ReactNativeEnvironment extends NodeEnvironment {
  customExportConditions = ["require", "react-native"];
};
