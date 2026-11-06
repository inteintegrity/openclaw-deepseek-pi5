import { randomBytes } from 'node:crypto';
import { isIP } from 'node:net';

export function buildConfig(env, previous = {}) {
  const key = env.DEEPSEEK_API_KEY?.trim();
  const model = env.DEEPSEEK_MODEL?.trim();
  if (!key || key === 'replace-with-your-api-key') throw new Error('Set DEEPSEEK_API_KEY in .env.');
  if (!model || model === 'replace-with-your-model-id') throw new Error('Set DEEPSEEK_MODEL to an available model ID.');
  let endpoint;
  try { endpoint = new URL(env.DEEPSEEK_BASE_URL); }
  catch { throw new Error('DEEPSEEK_BASE_URL must be an absolute http(s) API base URL.'); }
  if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error('Use an http(s) API base URL without credentials, query, or fragment.');
  }
  if (endpoint.hostname.toLowerCase() === 'your_gateway') throw new Error('Replace the example API base URL.');
  const host = endpoint.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (/^(169\.254\.|fe80:)/.test(host) || host === '100.100.100.200') throw new Error('Metadata/link-local endpoints are not supported.');
  const approvedLan = env.ALLOW_PRIVATE_NETWORK === 'true';
  const privateLiteral = (isIP(host) && /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|fc|fd|::1$)/.test(host)) || host === 'localhost';
  if (privateLiteral && !approvedLan) throw new Error('Set ALLOW_PRIVATE_NETWORK=true only after approving this LAN model endpoint.');
  let origin;
  try { origin = new URL(env.PUBLIC_ORIGIN || 'http://localhost:18889'); }
  catch { throw new Error('PUBLIC_ORIGIN must be the browser origin.'); }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('PUBLIC_ORIGIN must contain only scheme, host, and port.');
  }
  const requestedToken = env.OPENCLAW_GATEWAY_TOKEN?.trim();
  if (requestedToken && requestedToken.length < 32) throw new Error('An explicitly configured gateway token must contain at least 32 characters.');
  const oldToken = previous.gateway?.auth?.token;
  const token = requestedToken || (typeof oldToken === 'string' && oldToken.length >= 32 ? oldToken : randomBytes(32).toString('hex'));
  const config = structuredClone(previous);
  config.models ??= {};
  config.models.providers ??= {};
  config.models.providers.deepseek = {
    baseUrl: endpoint.href.replace(/\/+$/, ''),
    api: 'openai-completions',
    apiKey: '${DEEPSEEK_API_KEY}',
    models: [{id: model, name: model, contextWindow: 128000, maxTokens: 8192, input: ['text']}],
    request: {allowPrivateNetwork: approvedLan},
  };
  config.agents ??= {};
  config.agents.defaults ??= {};
  config.agents.defaults.model = `deepseek/${model}`;
  config.agents.defaults.workspace = '/home/node/.openclaw/workspace';
  config.tools = {...config.tools, profile: 'coding'};
  config.gateway ??= {};
  config.gateway.mode = 'local';
  config.gateway.bind = 'lan';
  config.gateway.auth = {mode: 'token', token};
  config.gateway.controlUi = {...config.gateway.controlUi, allowedOrigins: [origin.origin]};
  delete config.gateway.controlUi.dangerouslyDisableDeviceAuth;
  delete config.gateway.controlUi.allowInsecureAuth;
  // Device pairing remains enabled; no insecure authentication flags are added.
  return config;
}
