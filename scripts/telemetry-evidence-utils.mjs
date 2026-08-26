import fs from "node:fs";
import path from "node:path";

const PROHIBITED = /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|bearer\s+|share[_-]?token|access[_-]?token|refresh[_-]?token|authorization|prompt|review_text|latitude|longitude)/i;

export function assertSafeEvidence(value) {
  const serialized = JSON.stringify(value);
  if (PROHIBITED.test(serialized)) throw new Error("Evidence contains a prohibited field or value");
  return value;
}

export function writeSafeEvidence(directory, summary) {
  fs.mkdirSync(directory, { recursive: true });
  const safe = assertSafeEvidence(summary);
  const target = path.join(directory, "telemetry-staging-summary.json");
  fs.writeFileSync(target, `${JSON.stringify(safe, null, 2)}\n`, { mode: 0o600 });
  return target;
}

export function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error("Arguments must be --name value pairs");
    values[key.slice(2)] = value;
  }
  return values;
}
