import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { resolveAuth, status } from '../auth.mjs';
import { apply, Config } from '../host.mjs';

async function home(t, document) {
  const dir = await mkdtemp(path.join(tmpdir(), 'codex-dictation-test-'));
  t.after(async () => {
    assert.ok(dir.startsWith(path.join(tmpdir(), 'codex-dictation-test-')));
    await rm(dir, { recursive: true, force: true });
  });
  if (document !== undefined) await writeFile(path.join(dir, 'auth.json'), typeof document === 'string' ? document : JSON.stringify(document));
  return dir;
}

test('loads Codex ChatGPT auth and status never exposes tokens or account id', async t => {
  const codexHome = await home(t, { auth_mode: 'chatgpt', tokens: { access_token: 'secret-token', account_id: 'private-account' } });
  assert.deepEqual(await resolveAuth({ codexHome }), { accessToken: 'secret-token', accountId: 'private-account', source: 'codex-login' });
  const state = await status({ codexHome });
  assert.equal(state.signedIn, true);
  assert.doesNotMatch(JSON.stringify(state), /secret-token|private-account/);
});

test('explicit masked setting wins over Codex file without reading it', async () => {
  assert.deepEqual(await resolveAuth({ accessToken: ' override-token ', accountId: ' account ', codexHome: '/not-present' }), { accessToken: 'override-token', accountId: 'account', source: 'settings' });
});

for (const value of [
  undefined, 'not-json secret-token', null, {}, { auth_mode: 'apikey', OPENAI_API_KEY: 'sk-secret' },
  { tokens: { access_token: 'sk-secret' } }, { tokens: { access_token: 'line\nbreak' } },
  { tokens: { access_token: 'secret-token', account_id: 'line\nbreak' } },
]) test(`invalid auth is rejected without echo: ${JSON.stringify(value)?.slice(0, 35)}`, async t => {
  const codexHome = await home(t, value);
  await assert.rejects(resolveAuth({ codexHome }), error => {
    assert.doesNotMatch(error.message, /secret-token|sk-secret/);
    return true;
  });
});

test('manual API keys and multiline values are rejected', async () => {
  for (const accessToken of ['sk-test', 'line\nbreak']) await assert.rejects(resolveAuth({ accessToken }));
});

function host(config = {}, overrides = {}) {
  const commands = new Map();
  let tool;
  const ctx = {
    inject() {},
    commands: { register(c) { commands.set(c.name, c); } },
    tools: { register(t) { tool = t; } },
    workingDirectory: { ensure: async () => '/workspace' },
    fs: {
      resolve: async (raw, options) => { assert.equal(options.cwd, '/workspace'); return { displayPath: raw }; },
      stat: async () => ({ type: 'file', size: 4 }),
      readBytes: async () => Buffer.from('test'),
    },
    attachments: { saveFile: async ({ data, name }) => { assert.equal(data.toString(), '原生逐字稿'); assert.equal(name, 'transcript.txt'); return { attachmentId: 'txt' }; } },
    ...overrides,
  };
  apply(ctx, { accessToken: 'test-oauth', ...config });
  return { commands, tool };
}

test('command preserves literal file path and cancellation', () => {
  const { commands, tool } = host();
  const command = commands.get('codex-transcribe');
  let message;
  const file = 'recordings/my recording $(whoami).webm';
  assert.equal(command.handler({ rawInput: file, signal: new AbortController().signal, agent: { followup(m) { message = m; } } }).kind, 'success');
  const text = message.content[0].text;
  assert.equal(JSON.parse(text.slice(text.indexOf('\n') + 1)), file);
  assert.equal(tool.name, 'codex_transcribe');
  assert.equal(command.handler({ rawInput: '  ' }).kind, 'error');
  const controller = new AbortController(); controller.abort();
  assert.throws(() => command.handler({ rawInput: file, signal: controller.signal }));
});

test('settings schema marks accessToken as a secret with an empty default', () => {
  const schema = Config.toJSON();
  assert.match(JSON.stringify(schema), /secret/);
  assert.equal(Config({}).accessToken, '');
});

test('host uses session filesystem and returns downloadable transcript', async t => {
  const savedFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = savedFetch; });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://chatgpt.com/backend-api/transcribe');
    assert.equal(options.headers.Authorization, 'Bearer test-oauth');
    assert.equal(options.body.get('language'), 'zh');
    assert.equal(options.body.get('file').name, 'meeting.webm');
    return Response.json({ text: '原生逐字稿' });
  };
  const { tool } = host({ language: 'zh' });
  const result = await tool.execute({ file_path: 'recordings/meeting.webm' }, { agent: {}, signal: new AbortController().signal });
  assert.deepEqual(result, { text: '原生逐字稿', provider: 'codex-native', attachment: { attachmentId: 'txt' } });
  assert.equal(tool.output.render({}, result).at(-1).type, 'file');
});

test('filesystem policy denials propagate without network requests', async t => {
  const savedFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = savedFetch; });
  let fetched = false;
  globalThis.fetch = async () => { fetched = true; };
  const { tool } = host({}, { fs: { resolve: async () => { throw new Error('sandbox denied'); } } });
  await assert.rejects(tool.execute({ file_path: 'secret.wav' }, { agent: {}, signal: new AbortController().signal }), /sandbox denied/);
  assert.equal(fetched, false);
});

test('status command does not make a network request or reveal token', async () => {
  const { commands } = host();
  const result = await commands.get('codex-transcribe-status').handler({ signal: new AbortController().signal });
  assert.equal(result.kind, 'success');
  assert.doesNotMatch(result.text, /test-oauth/);
  assert.match(result.text, /沒有連線驗證/);
});
