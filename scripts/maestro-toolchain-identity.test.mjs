import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = spawnSync('/opt/homebrew/opt/python@3.14/bin/python3.14', ['-B','-m','unittest','-q','scripts/maestro_toolchain_identity_test.py'], { cwd: repo, encoding: 'utf8' });
if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);
if (run.status !== 0) process.exit(run.status ?? 1);
