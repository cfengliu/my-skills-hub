import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchWeb, status } from '../backend.mjs';
import { apply } from '../host.mjs';

const command = fileURLToPath(new URL('./fake-codex.mjs', import.meta.url));
await chmod(command, 0o755);
async function fixture(t, mode = 'ok') {
  const cwd = await mkdtemp(path.join(tmpdir(), 'codex-search-test-'));
  t.after(async () => {
    assert.ok(cwd.startsWith(path.join(tmpdir(), 'codex-search-test-')));
    await rm(cwd, { recursive: true, force: true });
  });
  await writeFile(path.join(cwd, 'scenario.json'), JSON.stringify({ mode }));
  return { command, cwd, timeoutMs: 3000 };
}

test('native search succeeds, deduplicates items, isolates thread configuration and preserves query', async t => {
  const options = await fixture(t, 'duplicate');
  const query = '  docs "hello" $(whoami) `shell`\n';
  const result = await searchWeb({ query, mode: 'cached' }, options);
  assert.equal(result.searches.length, 1);
  assert.equal(result.mode, 'cached');
  assert.match(result.answer, /https:\/\/example.com/);
  const messages = (await readFile(path.join(options.cwd, 'requests.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  const thread = messages.find(m => m.method === 'thread/start').params;
  assert.equal(thread.ephemeral, true);
  assert.equal(thread.sandbox, 'read-only');
  assert.equal(thread.approvalPolicy, 'never');
  assert.deepEqual(thread.environments, []);
  assert.deepEqual(thread.config.mcp_servers, { 'test.server': { enabled: false } });
  assert.equal(thread.config.web_search, 'cached');
  assert.equal(messages.find(m => m.method === 'turn/start').params.input[0].text, query);
});

for (const [mode, pattern] of [
  ['text-only', /no completed native/], ['mcp', /no completed native/],
  ['wrong-thread', /no completed native/], ['wrong-turn', /no completed native/],
  ['no-answer', /no search answer/], ['failed', /did not complete/],
  ['signed-out', /signed-in/], ['api', /signed-in/], ['rpc-error', /RPC failed/],
  ['reverse', /reverse request rejected/], ['exit', /closed/], ['close-turn', /closed/],
]) test(`rejects ${mode}`, async t => {
  await assert.rejects(searchWeb({ query: 'docs' }, await fixture(t, mode)), pattern);
});

for (const mode of ['raw-results', 'empty-results', 'ok']) test(`preserves opaque results: ${mode}`, async t => {
  const result = await searchWeb({ query: 'docs' }, await fixture(t, mode));
  assert.deepEqual(result.searches[0].results, mode === 'raw-results' ? [{ type: 'text_result', url: 'https://example.com', unknown: true }] : mode === 'empty-results' ? [] : null);
});

test('status checks account without creating a thread', async t => {
  const options = await fixture(t);
  assert.deepEqual(await status(options), { signedIn: true, accountType: 'chatgpt' });
  assert.doesNotMatch(await readFile(path.join(options.cwd, 'requests.jsonl'), 'utf8'), /thread\/start/);
});

test('timeout and cancellation terminate child', async t => {
  const options = await fixture(t, 'timeout');
  await assert.rejects(searchWeb({ query: 'docs' }, { ...options, timeoutMs: 100 }), /timeout/);
  const controller = new AbortController();
  const pending = searchWeb({ query: 'docs' }, options, { signal: controller.signal });
  controller.abort(new Error('stop search'));
  await assert.rejects(pending, /stop search/);
});

test('validates query and search mode before starting Codex', async () => {
  for (const query of ['', ' ', null, 'x'.repeat(16001)]) await assert.rejects(searchWeb({ query }), /query must/);
  await assert.rejects(searchWeb({ query: 'x', mode: 'invalid' }), /mode must/);
});

test('command and tool register, preserve literal query and respect cancellation', () => {
  let command, tool, followup;
  apply({ commands: { register(c) { command = c; } }, tools: { register(t) { tool = t; } } });
  assert.equal(tool.name, 'codex_web_search');
  const query = ' docs "hi" $(pwd)\n';
  assert.equal(command.handler({ rawInput: query, signal: new AbortController().signal, agent: { followup(m) { followup = m; } } }).kind, 'success');
  assert.equal(followup.role, 'user');
  const text = followup.content[0].text;
  assert.equal(JSON.parse(text.slice(text.indexOf('\n') + 1)), query);
  assert.equal(command.handler({ rawInput: ' ' }).kind, 'error');
  const controller = new AbortController(); controller.abort(new Error('cancelled'));
  assert.throws(() => command.handler({ rawInput: query, signal: controller.signal }), /cancelled/);
});
