import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const id = randomUUID();
const relative = `demo/verification-${id}.md`;
const prompt = `Use exec to run node --version and uname -m in this container. Write the actual version and architecture, plus verification ID ${id}, to ${relative} in your workspace. Read it back. Do not access credentials, other files, or network services. Reply with SYSTEM_REPORT_OK only after completing the tool calls. Do not add onboarding questions.`;
const run = spawnSync(process.execPath, ['/app/openclaw.mjs', 'agent', '--agent', 'main', '--session-id', `verify-${id}`, '--message', prompt, '--json', '--timeout', '120'], {encoding: 'utf8', timeout: 150000, maxBuffer: 8 * 1024 * 1024});
try {
  if (run.status !== 0) throw new Error('Agent CLI failed. Inspect logs before retrying this session.');
  const result = JSON.parse(run.stdout);
  if (result.status !== 'ok') throw new Error('Agent did not report success.');
  const text = (result.result?.payloads || []).map(p => p.text || '').join('\n');
  if (!text.includes('SYSTEM_REPORT_OK')) throw new Error('Completion marker missing.');
  const report = readFileSync(`/home/node/.openclaw/workspace/${relative}`, 'utf8');
  const expectedArch = process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x86_64' : process.arch;
  if (![id, process.version, expectedArch].every(value => report.includes(value))) throw new Error('Saved report does not match this container and verification ID.');
  console.log(`PASS: ${process.version}, ${expectedArch}; DeepSeek agent created a matching report.`);
  console.log(`Report: ${relative}`);
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  console.error(`Session: verify-${id}`);
  process.exitCode = 1;
}
