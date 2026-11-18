import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecordingHandler, registerVoiceInput, RECORDING_PATH } from '../voice.mjs';

function fixture(overrides = {}) {
  const calls = [];
  const handler = createRecordingHandler({ language: 'zh', timeoutMs: 30_000 }, {
    authenticate: async () => { calls.push('auth'); return { accessToken: 'test-oauth' }; },
    transcribe: async (input, options, context) => { calls.push({ input, options, context }); return { text: '這是聽寫草稿。' }; },
    ...overrides,
  });
  return { handler, calls };
}

function request(type, body = new Uint8Array([1, 2, 3]), init = {}) {
  return new Request(`http://localhost${RECORDING_PATH}`, {
    method: 'POST', headers: { 'content-type': type }, body, duplex: 'half', ...init,
  });
}

for (const [type, extension] of [['audio/webm;codecs=opus', 'webm'], ['audio/ogg;codecs=opus', 'ogg'], ['audio/mp4', 'm4a']]) {
  test(`${type} passes the original bytes to the native endpoint`, async () => {
    const { handler, calls } = fixture();
    const req = request(type);
    const response = await handler(req);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: '這是聽寫草稿。' });
    const { input, options, context } = calls[1];
    assert.equal(input.filename, `dictation.${extension}`);
    assert.deepEqual(await input.data.bytes(), new Uint8Array([1, 2, 3]));
    assert.equal(input.language, 'zh');
    assert.equal(options.timeoutMs, 30_000);
    assert.equal(context.signal, req.signal);
  });
}

test('unsupported types, oversized streams or declared sizes, and empty audio never reach credentials', async () => {
  const { handler, calls } = fixture({ maxBytes: 3 });
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(2));
    controller.enqueue(new Uint8Array(2));
    controller.close();
  } });
  for (const [req, status] of [
    [request('audio/wav'), 415],
    [request('audio/webm', stream), 413],
    [request('audio/webm', new Uint8Array(1), { headers: { 'content-type': 'audio/webm', 'content-length': '4' } }), 413],
    [request('audio/webm', new Uint8Array()), 400],
  ]) assert.equal((await handler(req)).status, status);
  assert.deepEqual(calls, []);
});

test('cancellation before upload and during authentication prevents transcription', async () => {
  const cancelled = new AbortController();
  cancelled.abort();
  const first = fixture();
  assert.equal((await first.handler(request('audio/webm', undefined, { signal: cancelled.signal }))).status, 499);
  assert.deepEqual(first.calls, []);
  const lifetime = new AbortController();
  const second = fixture({ lifetime: lifetime.signal, authenticate: async () => lifetime.abort() });
  assert.equal((await second.handler(request('audio/webm'))).status, 499);
  assert.deepEqual(second.calls, []);
});

test('native errors are shown to the browser', async () => {
  const { handler } = fixture({ transcribe: async () => { throw new Error('轉錄服務拒絕存取。'); } });
  const response = await handler(request('audio/webm'));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: '轉錄服務拒絕存取。' });
});

test('the host registers an authenticated Connection streaming route and cancels it on unload', async () => {
  let route, dispose;
  registerVoiceInput({ inject(deps, callback) {
    assert.deepEqual(deps, ['connection']);
    callback({ connection: { fetch: { register(value) { route = value; } } }, effect(init) { dispose = init(); } });
  } }, {});
  assert.equal(route.path, RECORDING_PATH);
  assert.equal(route.requestBody, 'streaming');
  assert.deepEqual(route.methods, ['POST']);
  dispose();
  assert.equal((await route.fetch(request('audio/webm'))).status, 499);
});
