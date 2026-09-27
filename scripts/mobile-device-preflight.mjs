#!/usr/bin/env node

import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knownAdb = "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) throw new Error("Arguments must be --name value pairs");
    values[key.slice(2)] = value;
  }
  return values;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed during mobile device preflight`);
  return result.stdout.trim();
}

export function findIosSimulator(payload, selector) {
  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  for (const [runtime, devices] of Object.entries(parsed?.devices ?? {})) {
    const device = devices.find((entry) => entry.udid === selector || entry.name === selector);
    if (device) return { ...device, runtime };
  }
  return null;
}

export function validateAndroidDevice({ state, bootCompleted, apiLevel, abi, emulator, requireEmulator = true }) {
  if (state !== "device") throw new Error("Android target is not online");
  if (bootCompleted !== "1") throw new Error("Android target has not completed booting");
  const parsedApi = Number.parseInt(apiLevel, 10);
  if (!Number.isInteger(parsedApi) || parsedApi < 36) throw new Error("Android evidence requires API 36 or newer");
  if (abi !== "arm64-v8a") throw new Error("Android evidence requires an ARM64 target");
  if (requireEmulator && emulator !== "1") throw new Error("Android deterministic evidence requires an emulator");
  return { api_level: parsedApi, architecture: abi };
}

export function validateArtifact(platform, artifact) {
  if (!artifact) return null;
  if (!existsSync(artifact)) throw new Error("Mobile artifact does not exist");
  if (platform === "ios" && (!statSync(artifact).isDirectory() || extname(artifact) !== ".app")) {
    throw new Error("iOS simulator evidence requires an extracted .app directory");
  }
  if (platform === "android" && (!statSync(artifact).isFile() || extname(artifact) !== ".apk")) {
    throw new Error("Android emulator evidence requires an APK");
  }
  return platform === "ios" ? "app" : "apk";
}

function iosRuntimeLabel(runtime) {
  return runtime.split(".").at(-1)?.replace(/^iOS-/, "iOS ").replaceAll("-", ".") ?? "iOS";
}

export function inspectDevice(args, commands = { run }) {
  const platform = args.platform;
  const device = args.device;
  const artifact = args.app ? resolve(args.app) : null;
  if (!new Set(["ios", "android"]).has(platform) || !device) throw new Error("--platform and --device are required");
  const artifactType = validateArtifact(platform, artifact);

  if (platform === "ios") {
    const developerDir = process.env.DEVELOPER_DIR || "/Applications/Xcode.app/Contents/Developer";
    const environment = { DEVELOPER_DIR: developerDir };
    let simulator = findIosSimulator(commands.run("xcrun", ["simctl", "list", "devices", "--json"], { env: environment }), device);
    if (!simulator || simulator.isAvailable === false) throw new Error("The requested iOS simulator is unavailable");
    if (simulator.state !== "Booted" && args.boot === "true") {
      commands.run("xcrun", ["simctl", "boot", simulator.udid], { env: environment });
      commands.run("xcrun", ["simctl", "bootstatus", simulator.udid, "-b"], { env: environment });
      simulator = findIosSimulator(commands.run("xcrun", ["simctl", "list", "devices", "--json"], { env: environment }), simulator.udid);
    }
    if (simulator?.state !== "Booted") throw new Error("The requested iOS simulator is not booted; rerun with --boot true");
    return {
      schema_version: 1,
      platform: "ios",
      target: "simulator",
      ready: true,
      os_version: iosRuntimeLabel(simulator.runtime),
      artifact_type: artifactType,
      hardware_identifier_retained: false,
    };
  }

  const adb = process.env.ADB || (existsSync(knownAdb) ? knownAdb : "adb");
  const info = validateAndroidDevice({
    state: commands.run(adb, ["-s", device, "get-state"]),
    bootCompleted: commands.run(adb, ["-s", device, "shell", "getprop", "sys.boot_completed"]),
    apiLevel: commands.run(adb, ["-s", device, "shell", "getprop", "ro.build.version.sdk"]),
    abi: commands.run(adb, ["-s", device, "shell", "getprop", "ro.product.cpu.abi"]),
    emulator: commands.run(adb, ["-s", device, "shell", "getprop", "ro.kernel.qemu"]),
  });
  return {
    schema_version: 1,
    platform: "android",
    target: "emulator",
    ready: true,
    os_version: `Android API ${info.api_level}`,
    architecture: info.architecture,
    artifact_type: artifactType,
    hardware_identifier_retained: false,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const summary = inspectDevice(args);
  if (args.evidence) {
    const evidenceDir = resolve(args.evidence);
    mkdirSync(evidenceDir, { recursive: true });
    writeFileSync(join(evidenceDir, `${summary.platform}-device-preflight.json`), `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  }
  process.stdout.write(`${summary.platform} ${summary.target} preflight passed (${summary.os_version}${summary.architecture ? `, ${summary.architecture}` : ""}).\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
