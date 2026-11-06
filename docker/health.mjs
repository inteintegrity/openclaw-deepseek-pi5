try {
  const response = await fetch('http://127.0.0.1:18789/healthz', {signal: AbortSignal.timeout(3500)});
  process.exitCode = response.ok ? 0 : 1;
} catch { process.exitCode = 1; }
