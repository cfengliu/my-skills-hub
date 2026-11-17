import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, mkdir, chmod, symlink, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateImage, status, validatePng } from '../backend.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const fake = path.join(root, 'fake-codex.mjs');
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
await chmod(fake, 0o755);
async function fixture(t, changes = {}) {
  const cwd = await mkdtemp(path.join(root, 'run-'));
  assert.equal(path.dirname(cwd), root);
  t.after(() => rm(cwd, { recursive: true, force: true }));
  const home = path.join(cwd, 'codex-home');
  await mkdir(home);
  const scenario = { png, home, ...changes };
  await writeFile(path.join(cwd, 'scenario.json'), JSON.stringify(scenario));
  return { cwd, home, scenario, options: { command: fake, cwd, timeoutMs: 3000 }, async requests() { return (await readFile(path.join(cwd, 'requests.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse); } };
}

test('native PNG completion succeeds only after successful turn and preserves literal prompt', async t => {
  const f = await fixture(t);
  const prompt = '  森林\n"quote" $(touch forbidden) `shell`  ';
  const result = await generateImage({ prompt }, f.options);
  assert.deepEqual(result.data, Buffer.from(png, 'base64'));
  assert.equal(result.mediaType, 'image/png');
  assert.equal(result.threadId, 'thread-1');
  assert.equal(result.revisedPrompt, 'revised');
  const requests = await f.requests();
  assert.equal(requests.find(m => m.method === 'turn/start').params.input[0].text, prompt);
  const thread = requests.find(m => m.method === 'thread/start').params;
  assert.equal(thread.ephemeral, true);
  assert.equal(thread.sandbox, 'read-only');
  assert.equal(thread.approvalPolicy, 'never');
  assert.deepEqual(thread.environments, []);
  assert.deepEqual(thread.config.mcp_servers, { 'example.server': { enabled: false } });
  assert.equal('model' in thread, false);
  assert.equal(requests[0].params.capabilities.experimentalApi, true);
});

test('status checks account and provider without starting a thread', async t => {
  const f = await fixture(t);
  assert.equal((await status(f.options)).imageGeneration, true);
  assert.equal((await f.requests()).some(m => m.method === 'thread/start'), false);
});

for (const mode of ['text', 'tool', 'wrong-thread', 'wrong-turn', 'turn-failed', 'image-exit', 'signed-out', 'api', 'incapable', 'rpc-error', 'exit', 'close-turn', 'reverse']) {
  test(`rejects ${mode}`, async t => {
    const f = await fixture(t, { mode });
    await assert.rejects(generateImage({ prompt: 'forest' }, f.options));
  });
}

test('timeout rejects pending initialization and kills child', async t => {
  const f = await fixture(t, { mode: 'timeout' });
  await assert.rejects(generateImage({ prompt: 'forest' }, { ...f.options, timeoutMs: 150 }), /timeout/);
});

test('AbortSignal rejects pending request and kills child', async t => {
  const f = await fixture(t, { mode: 'timeout' });
  const controller = new AbortController();
  const operation = generateImage({ prompt: 'forest' }, f.options, { signal: controller.signal });
  setImmediate(() => controller.abort(new Error('cancelled fixture')));
  await assert.rejects(operation, /cancelled fixture/);
});

test('deduplicates the same native completion', async t => {
  const f = await fixture(t, { mode: 'duplicate' });
  assert.equal((await generateImage({ prompt: 'forest' }, f.options)).threadId, 'thread-1');
});

test('accepts savedPath only at real Codex artifact location', async t => {
  const f = await fixture(t);
  const dir = path.join(f.home, 'generated_images', 'thread-1');
  await mkdir(dir, { recursive: true });
  const savedPath = path.join(dir, 'image-1.png');
  await writeFile(savedPath, Buffer.from(png, 'base64'));
  await writeFile(path.join(f.cwd, 'scenario.json'), JSON.stringify({ ...f.scenario, item: { savedPath } }));
  assert.deepEqual((await generateImage({ prompt: 'forest' }, f.options)).data, Buffer.from(png, 'base64'));
});

for (const mode of ['outside', 'sibling', 'symlink']) {
  test(`rejects savedPath ${mode}`, async t => {
    const f = await fixture(t);
    const dir = path.join(f.home, 'generated_images', 'thread-1');
    await mkdir(dir, { recursive: true });
    const outside = path.join(f.cwd, 'other.png');
    await writeFile(outside, Buffer.from(png, 'base64'));
    let savedPath = outside;
    if (mode === 'sibling') { savedPath = path.join(dir, 'other.png'); await writeFile(savedPath, Buffer.from(png, 'base64')); }
    if (mode === 'symlink') { savedPath = path.join(dir, 'image-1.png'); await symlink(outside, savedPath); }
    await writeFile(path.join(f.cwd, 'scenario.json'), JSON.stringify({ ...f.scenario, item: { savedPath } }));
    await assert.rejects(generateImage({ prompt: 'forest' }, f.options), /savedPath|artifact/);
  });
}

for (const item of [{ fileId: 'file-only' }, { result: 'not PNG' }, { status: 'failed' }, { failure: { message: 'failed' } }, { fileId: 'file', result: png }]) {
  test(`rejects unsupported payload ${JSON.stringify(item).slice(0, 50)}`, async t => {
    const f = await fixture(t, { item });
    await assert.rejects(generateImage({ prompt: 'forest' }, f.options));
  });
}

test('validates PNG checksum and refuses truncated PNG', () => {
  assert.deepEqual(validatePng(Buffer.from(png, 'base64')), Buffer.from(png, 'base64'));
  const corrupt = Buffer.from(png, 'base64'); corrupt[45] ^= 1;
  assert.throws(() => validatePng(corrupt));
  assert.throws(() => validatePng(corrupt.subarray(0, 20)));
});
