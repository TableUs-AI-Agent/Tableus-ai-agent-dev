const NodeEnvironment = require("./node_modules/jest-environment-node").TestEnvironment;

module.exports = class ReactNativeEnvironment extends NodeEnvironment {
  customExportConditions = ["require", "react-native"];
};
