import { closeSync, existsSync, lstatSync, mkdirSync, openSync, readdirSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { artifactChecksum } from "./evidence-utils.mjs";

const inside = (parent, child) => child === parent || child.startsWith(`${parent}${sep}`);

// Resolve existing ancestors too: a symlink must not disguise temporary storage.
export function canonicalOutput(path) {
  const absolute = resolve(path);
  if (existsSync(absolute)) return realpathSync(absolute);
  return join(canonicalOutput(dirname(absolute)), absolute.slice(dirname(absolute).length + 1));
}

export function assertDurableOutputs(paths) {
  const canonical = paths.map(canonicalOutput);
  const temporary = [tmpdir(), "/tmp", "/var/tmp", "/private/tmp", "/private/var/tmp"]
    .filter(existsSync).map((path) => realpathSync(path));
  for (const path of canonical) {
    if (temporary.some((root) => inside(root, path))) throw new Error("Build outputs and diagnostics must be outside OS temporary storage");
    if (existsSync(path)) throw new Error(`Refusing to overwrite existing output: ${path}`);
  }
  for (let i = 0; i < canonical.length; i += 1) {
    for (let j = i + 1; j < canonical.length; j += 1) {
      if (inside(canonical[i], canonical[j]) || inside(canonical[j], canonical[i])) {
        throw new Error("Build outputs and diagnostics must be separate, non-overlapping paths");
      }
    }
  }
}

export function writeInventory(root, inventory) {
  const temporary = join(root, "inventory.next.json");
  writeFileSync(temporary, `${JSON.stringify(inventory, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, join(root, "inventory.json"));
}

export function scanDiagnostics(root) {
  const files = [];
  const errors = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (["node_modules", ".git", "Pods"].includes(entry.name)) continue;
      const path = join(directory, entry.name);
      const name = relative(root, path).split(sep).join("/");
      // Do not follow links out of this build attempt or claim dependency maps.
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) { visit(path); continue; }
      let kind;
      if (name.endsWith(".log") || name.includes(".xcresult/")) kind = "log";
      else if (name.includes(".dSYM/") || /\.(so|sym|debug)$/.test(name) || /(^|\/)(mapping\.txt|native-debug-symbols\.zip)$/.test(name)) kind = "native-symbol";
      else if (/\.(map|hbc\.map)$/.test(name)) kind = "javascript-source-map";
      if (kind && entry.isFile()) {
        try { files.push({ path: name, kind, bytes: lstatSync(path).size, sha256: artifactChecksum(path) }); }
        catch (error) { errors.push({ path: name, error: error.code ?? "checksum-failed" }); }
      }
    }
  }
  try { visit(root); } catch (error) { errors.push({ error: error.code ?? "scan-failed" }); }
  return {
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    missing: ["log", "native-symbol", "javascript-source-map"].filter((kind) => !files.some((file) => file.kind === kind && file.bytes > 0)),
    errors,
    usability: "retained-only; UUID/build-ID matching and app-frame resolution require separate validation",
  };
}

// One child process group at a time; wait for termination before inventorying.
// SIGKILL/power loss cannot be trapped: the running inventory and files survive.
export async function withDiagnosticAttempt({ root, identity }, operation) {
  mkdirSync(root, { mode: 0o700 });
  const logFd = openSync(join(root, "build.log"), "wx", 0o600);
  const inventory = { schema_version: 1, ...identity, status: "running", started_at: new Date().toISOString(), commands: [] };
  writeInventory(root, inventory);
  let child;
  let interrupted;
  let killTimer;
  const onSignal = (signal) => {
    interrupted ??= signal;
    if (child?.pid) {
      try { process.kill(-child.pid, signal); } catch { /* already exited */ }
      killTimer ??= setTimeout(() => {
        try { process.kill(-child.pid, "SIGKILL"); } catch { /* already exited */ }
      }, 5000);
      killTimer.unref();
    }
  };
  const handlers = new Map(["SIGINT", "SIGTERM", "SIGHUP"].map((signal) => [signal, () => onSignal(signal)]));
  for (const [signal, handler] of handlers) process.on(signal, handler);
  const run = async (command, args, { cwd, env = {} } = {}) => {
    if (interrupted) throw new Error(`Interrupted by ${interrupted}`);
    const step = { command, task: command === process.execPath ? basename(args[0]) : basename(command), status: "running" };
    inventory.commands.push(step);
    writeInventory(root, inventory);
    await new Promise((resolveRun, reject) => {
      child = spawn(command, args, { cwd, env: { ...process.env, ...env }, detached: true, stdio: ["ignore", logFd, logFd] });
      let spawnError;
      child.once("error", (error) => { spawnError = error; });
      child.once("close", (code, signal) => {
        if (interrupted && child?.pid) {
          try { process.kill(-child.pid, "SIGKILL"); } catch { /* group already exited */ }
        }
        clearTimeout(killTimer); killTimer = undefined; child = undefined;
        Object.assign(step, { status: code === 0 && !interrupted ? "passed" : "failed", exit_code: code, signal });
        writeInventory(root, inventory);
        if (spawnError || code !== 0 || interrupted) reject(spawnError ?? new Error(`Command failed (${code ?? signal ?? interrupted}); diagnostics retained at ${root}`));
        else resolveRun();
      });
    });
  };
  try {
    await operation({ run, inventory });
    if (interrupted) throw new Error(`Interrupted by ${interrupted}`);
    inventory.status = "succeeded";
  } catch (error) {
    inventory.status = interrupted ? "interrupted" : "failed";
    inventory.failure = { signal: interrupted ?? null, message: "Attempt did not complete; see private build.log and command statuses" };
    throw error;
  } finally {
    closeSync(logFd);
    for (const [signal, handler] of handlers) process.removeListener(signal, handler);
    inventory.finished_at = new Date().toISOString();
    inventory.outputs = ["build.apk", "build.ipa", "build.tar.gz", "inspection.json", "receipt.json"].map((name) => {
      const path = join(root, name);
      if (!existsSync(path)) return { path: name, status: "missing" };
      try { return { path: name, status: "retained", sha256: artifactChecksum(path) }; }
      catch (error) { return { path: name, status: "hash-failed", error: error.code ?? "checksum-failed" }; }
    });
    inventory.diagnostics = scanDiagnostics(root);
    writeInventory(root, inventory);
  }
  return inventory;
}
