import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { buildConfig } from './config.mjs';

const state = '/home/node/.openclaw';
try {
  let previous = {};
  try { previous = JSON.parse(await readFile(`${state}/openclaw.json`, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Existing config could not be read; it was not overwritten.'); }
  const config = buildConfig(process.env, previous);
  await mkdir(`${state}/workspace/demo`, {recursive: true, mode: 0o700});
  await writeFile(`${state}/openclaw.json.tmp`, `${JSON.stringify(config, null, 2)}\n`, {mode: 0o600});
  await rename(`${state}/openclaw.json.tmp`, `${state}/openclaw.json`);
  const child = spawn(process.execPath, ['/app/openclaw.mjs', 'gateway', 'run', '--port', '18789', '--allow-unconfigured'], {stdio: 'inherit'});
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
  child.once('error', () => { console.error('Could not start OpenClaw.'); process.exitCode = 1; });
  child.once('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGTERM' ? 0 : 1); });
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exitCode = 1;
}
