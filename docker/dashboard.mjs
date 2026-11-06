import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['/app/openclaw.mjs', 'dashboard', '--no-open'], {encoding: 'utf8'});
const origin = process.env.PUBLIC_ORIGIN || 'http://localhost:18889';
const output = (result.stdout || '').replaceAll('http://127.0.0.1:18789', origin).replaceAll('http://localhost:18789', origin);
process.stdout.write(output);
if (result.stderr) process.stderr.write(result.stderr);
process.exitCode = result.status ?? 1;
