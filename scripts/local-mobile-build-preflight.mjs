import { existsSync, realpathSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// Run before worktree creation, dependency installation, or native compilation.
// Receipt validation remains authoritative after the build.
export function assertLocalBuildPreflight(args, env = process.env) {
  if (!new RegExp(`^local-${args.platform}-[a-z0-9._-]+$`).test(args["build-id"] ?? "")
    || args["build-id"].length > 200) {
    throw new Error(`--build-id must start with local-${args.platform}- and contain only lowercase letters, numbers, dots, underscores, or hyphens (maximum 200 characters)`);
  }

  const targets = [args.artifact, args["inspection-report"], args.receipt].map((path) => resolve(path));
  for (let left = 0; left < targets.length; left += 1) {
    for (let right = 0; right < targets.length; right += 1) {
      if (left === right) continue;
      const child = relative(targets[left], targets[right]);
      if (!child || (child !== ".." && !child.startsWith(`..${sep}`) && !child.startsWith(sep))) {
        throw new Error("Artifact, inspection report, and receipt must use separate, non-overlapping output paths");
      }
    }
  }

  if (args["apple-team-id"] && !/^[A-Z0-9]{10}$/.test(args["apple-team-id"])) {
    throw new Error("--apple-team-id must be a ten-character Apple team identifier");
  }
  if (args.platform !== "android") return;
  if (!/^(?:[0-9a-f]{64}|(?:[0-9a-f]{2}:){31}[0-9a-f]{2})$/i.test(args["android-fingerprint"] ?? "")) {
    throw new Error("--android-fingerprint must be a SHA-256 signing certificate fingerprint");
  }
  const roots = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT].filter((value) => value?.trim());
  if (!roots.length) {
    throw new Error("Set ANDROID_HOME or ANDROID_SDK_ROOT to the installed Android SDK before starting a local build");
  }
  for (const root of roots) {
    if (!existsSync(root) || !statSync(root).isDirectory()
      || !existsSync(join(root, "platforms")) || !statSync(join(root, "platforms")).isDirectory()
      || !existsSync(join(root, "build-tools")) || !statSync(join(root, "build-tools")).isDirectory()) {
      throw new Error("The configured Android SDK must contain platforms and build-tools directories");
    }
  }
  if (roots.length === 2 && realpathSync(roots[0]) !== realpathSync(roots[1])) {
    throw new Error("ANDROID_HOME and ANDROID_SDK_ROOT must refer to the same installed SDK");
  }
}
