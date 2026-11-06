import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConfig } from '../docker/config.mjs';
const env = {DEEPSEEK_API_KEY: 'test-only-not-a-real-key', DEEPSEEK_MODEL: 'test-model', DEEPSEEK_BASE_URL: 'https://example.com/v1', PUBLIC_ORIGIN: 'http://localhost:18889'};
test('persists authentication across recreation without writing the model key into config', () => {
  const first = buildConfig(env);
  const next = buildConfig(env, first);
  assert.equal(next.gateway.auth.token, first.gateway.auth.token);
  assert.equal(next.gateway.auth.token.length, 64);
  assert(!JSON.stringify(next).includes(env.DEEPSEEK_API_KEY));
  assert.equal(next.models.providers.deepseek.apiKey, '${DEEPSEEK_API_KEY}');
  assert.equal(next.gateway.controlUi.dangerouslyDisableDeviceAuth, undefined);
});
test('LAN endpoint requires explicit approval and does not change the default', () => {
  const lan = {...env, DEEPSEEK_BASE_URL: 'http://192.168.50.10/v1'};
  assert.throws(() => buildConfig(lan), /approving this LAN/);
  assert.equal(buildConfig({...lan, ALLOW_PRIVATE_NETWORK: 'true'}).models.providers.deepseek.request.allowPrivateNetwork, true);
  assert.equal(buildConfig(env).models.providers.deepseek.request.allowPrivateNetwork, false);
});
test('metadata endpoints remain rejected with LAN approval', () => {
  for (const host of ['169.254.169.254', '100.100.100.200', '[fe80::1]']) assert.throws(() => buildConfig({...env, ALLOW_PRIVATE_NETWORK: 'true', DEEPSEEK_BASE_URL: `http://${host}/v1`}), /Metadata/);
});
test('invalid settings cannot silently replace a working configuration', () => {
  const config = buildConfig(env);
  const before = JSON.stringify(config);
  assert.throws(() => buildConfig({...env, DEEPSEEK_API_KEY: ''}, config), /DEEPSEEK_API_KEY/);
  assert.equal(JSON.stringify(config), before);
});
test('rejects credentials in URLs and non-origin browser URLs', () => {
  assert.throws(() => buildConfig({...env, DEEPSEEK_BASE_URL: 'https://user:secret@example.com/v1'}), /without credentials/);
  assert.throws(() => buildConfig({...env, PUBLIC_ORIGIN: 'http://localhost:18889/chat'}), /only scheme/);
});
test('changes model selection while preserving unrelated state settings', () => {
  const first = buildConfig(env);
  first.channels = {example: {enabled: false}};
  const next = buildConfig({...env, DEEPSEEK_MODEL: 'replacement-model'}, first);
  assert.equal(next.agents.defaults.model, 'deepseek/replacement-model');
  assert.deepEqual(next.channels, first.channels);
  assert.equal(first.agents.defaults.model, 'deepseek/test-model');
});
test('does not carry disabled device authentication into generated configuration', () => {
  const previous = buildConfig(env);
  previous.gateway.controlUi.dangerouslyDisableDeviceAuth = true;
  previous.gateway.controlUi.allowInsecureAuth = true;
  const next = buildConfig(env, previous);
  assert.equal(next.gateway.controlUi.dangerouslyDisableDeviceAuth, undefined);
  assert.equal(next.gateway.controlUi.allowInsecureAuth, undefined);
  assert.equal(previous.gateway.controlUi.dangerouslyDisableDeviceAuth, true);
});
