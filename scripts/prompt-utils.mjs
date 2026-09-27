import { createInterface } from "node:readline/promises";

export async function promptVisible(label, { input = process.stdin, output = process.stdout } = {}) {
  const terminal = createInterface({ input, output });
  try {
    return await terminal.question(label);
  } finally {
    terminal.close();
  }
}

export function promptSecret(label, { input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY || typeof input.setRawMode !== "function") {
    throw new Error("Sensitive evidence input requires an interactive TTY with echo control.");
  }
  output.write(label);
  const wasRaw = Boolean(input.isRaw);
  input.setRawMode(true);
  input.resume();

  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      input.off("data", onData);
      if (!wasRaw) input.setRawMode(false);
      output.write("\n");
    };
    const finish = () => {
      cleanup();
      resolve(value);
    };
    const fail = (error) => {
      cleanup();
      reject(error);
    };
    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u0003") {
          fail(new Error("Sensitive input cancelled."));
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };
    input.on("data", onData);
  });
}
