import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_TYPES, MAX_AUDIO_BYTES, transcribeAudio } from '../backend.mjs';

const TOKEN = 'test-private-codex-token';
const SECRET_BODY = `upstream private detail ${TOKEN}`;
const RESPONSE_LIMIT = 2 * 1024 * 1024;
const audio = { data: new Uint8Array([0, 1, 127, 255]), filename: 'recording.webm' };
const credentials = { accessToken: TOKEN };
const jsonResponse = (value) => new Response(JSON.stringify(value));
const unexpectedFetch = () => { throw new Error('Unexpected fetch in validation test'); };
const transcribe = (input = audio, auth = credentials, options = {}) =>
  transcribeAudio(input, auth, { fetchImpl: unexpectedFetch, ...options });

async function expectFailure(promise, message) {
  await assert.rejects(promise, (error) => {
    assert.equal(error.constructor, Error);
    assert.equal(error.message, message);
    assert.equal(error.cause, undefined);
    assert.ok(!String(error).includes(TOKEN));
    assert.ok(!String(error).includes(SECRET_BODY));
    assert.ok(!JSON.stringify(error).includes(TOKEN));
    return true;
  });
}

function streamingResponse(chunks, { headers, fail, hang = false } = {}) {
  const state = { cancelled: false };
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      if (fail) controller.error(fail);
      else if (!hang) controller.close();
    },
    cancel() { state.cancelled = true; },
  });
  return { response: new Response(body, { headers }), state };
}

// AbortSignal.timeout uses an unref'ed timer; keep Node alive until the assertion settles.
async function withActiveEventLoop(callback) {
  const keepAlive = setTimeout(() => {}, 2_000);
  try { await callback(); }
  finally { clearTimeout(keepAlive); }
}

test('native request uses the fixed endpoint, exact headers and redirect error', async () => {
  const requests = [];
  const result = await transcribe(audio, { accessToken: ` ${TOKEN} `, accountId: 'account-123' }, {
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return jsonResponse({ text: '台灣中文' });
    },
  });
  assert.equal(requests.length, 1);
  const { url, init } = requests[0];
  assert.equal(url, 'https://chatgpt.com/backend-api/transcribe');
  assert.equal(init.method, 'POST');
  assert.equal(init.redirect, 'error');
  assert.deepEqual(init.headers, {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/json',
    originator: 'dsh-codex-transcribe',
    'ChatGPT-Account-Id': 'account-123',
  });
  assert.ok(init.signal instanceof AbortSignal);
  assert.equal(init.signal.aborted, false);
  assert.ok(init.body instanceof FormData);
  assert.deepEqual([...init.body.keys()], ['file']);
  assert.equal(init.body.has('model'), false);
  assert.deepEqual(result, { text: '台灣中文', provider: 'codex-native' });
});

test('omitting account ID omits the header and does not add an API model', async () => {
  let request;
  await transcribe(audio, credentials, { fetchImpl: async (_url, init) => {
    request = init;
    return jsonResponse({ text: 'ok' });
  } });
  assert.deepEqual(request.headers, {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/json',
    originator: 'dsh-codex-transcribe',
  });
  assert.deepEqual([...request.body.keys()], ['file']);
});

test('supported audio types match the native upload contract', () => {
  assert.equal(MAX_AUDIO_BYTES, 25_000_000);
  assert.deepEqual(AUDIO_TYPES, {
    mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav', webm: 'audio/webm',
  });
});

for (const [extension, type] of Object.entries(AUDIO_TYPES)) {
  test(`multipart ${extension}: exact bytes, basename, MIME type and language`, async () => {
    const filename = `C:\\private\\folder/聲音.${extension.toUpperCase()}`;
    await transcribe({ ...audio, filename, language: 'zh-TW' }, credentials, {
      fetchImpl: async (_url, init) => {
        assert.deepEqual([...init.body.keys()], ['file', 'language']);
        const file = init.body.get('file');
        assert.ok(file instanceof File);
        assert.equal(file.name, `聲音.${extension.toUpperCase()}`);
        assert.equal(file.type, type);
        assert.equal(file.size, audio.data.byteLength);
        assert.deepEqual(new Uint8Array(await file.arrayBuffer()), audio.data);
        assert.equal(init.body.get('language'), 'zh-TW');
        assert.equal(init.body.has('model'), false);
        return jsonResponse({ text: 'ok' });
      },
    });
  });
}

for (const [name, data] of [
  ['Blob', new Blob([audio.data], { type: 'application/octet-stream' })],
  ['ArrayBuffer', audio.data.slice().buffer],
  ['Uint8Array slice', new Uint8Array([99, 0, 1, 127, 255, 88]).subarray(1, 5)],
  ['Buffer slice', Buffer.from([99, 0, 1, 127, 255, 88]).subarray(1, 5)],
  ['DataView slice', new DataView(new Uint8Array([99, 0, 1, 127, 255, 88]).buffer, 1, 4)],
]) {
  test(`audio input ${name} uploads only the selected bytes`, async () => {
    await transcribe({ ...audio, data }, credentials, { fetchImpl: async (_url, init) => {
      assert.deepEqual(new Uint8Array(await init.body.get('file').arrayBuffer()), audio.data);
      assert.equal(init.body.get('file').type, 'audio/webm');
      return jsonResponse({ text: 'ok' });
    } });
  });
}

for (const [name, response, text] of [
  ['top-level text', { text: '你好' }, '你好'],
  ['nested body.text', { body: { text: 'nested text' } }, 'nested text'],
  ['empty top-level text', { text: '', body: { text: 'must not override empty text' } }, ''],
  ['empty nested text', { body: { text: '' } }, ''],
  ['top-level text precedence', { text: 'first', body: { text: 'second' } }, 'first'],
  ['null top-level fallback', { text: null, body: { text: 'fallback' } }, 'fallback'],
]) {
  test(`successful response accepts ${name}`, async () => {
    assert.deepEqual(await transcribe(audio, credentials, { fetchImpl: async () => jsonResponse(response) }), {
      text, provider: 'codex-native',
    });
  });
}

const validationCases = [
  ...[undefined, null, '', '   ', 123, 'bad\rtoken', 'bad\ntoken'].map((accessToken) => [
    `invalid token ${JSON.stringify(accessToken)}`, audio, { accessToken }, '請提供有效的 Codex 存取權杖。',
  ]),
  ...['bad\raccount', 'bad\naccount', '', ' ', 123, null].map((accountId) => [
    `invalid account ID ${JSON.stringify(accountId)}`, audio, { ...credentials, accountId }, 'Codex 帳號識別碼格式不正確。',
  ]),
  ...['recording.flac', 'recording', '.', '..', 'folder/', 'toString', 'recording.constructor'].map((filename) => [
    `unsupported filename ${JSON.stringify(filename)}`, { ...audio, filename }, credentials,
    '請提供支援的音訊副檔名：mp3、m4a、ogg、wav 或 webm。',
  ]),
  ...[undefined, null, 123, 'bad\rname.wav', 'bad\nname.wav', 'bad\u0000name.wav', 'bad\u007fname.wav'].map((filename) => [
    `invalid filename ${JSON.stringify(filename)}`, { ...audio, filename }, credentials, '音訊檔名格式不正確。',
  ]),
  ...[undefined, null, 'audio', [1, 2], {}].map((data) => [
    `invalid audio data ${JSON.stringify(data)}`, { ...audio, data }, credentials, '音訊資料格式不正確。',
  ]),
  ...[new Uint8Array(), new ArrayBuffer(0), new Blob([])].map((data, index) => [
    `empty audio representation ${index}`, { ...audio, data }, credentials, '音訊檔案不可為空。',
  ]),
  ['audio larger than 25 MB', { ...audio, data: new Uint8Array(MAX_AUDIO_BYTES + 1) }, credentials, '音訊檔案不可超過 25 MB。'],
  ...['', 'z', 'zh_TW', 'zh\r\nX: injected', 'zh TW', 'zh-', '123', 'a'.repeat(33), null, 123].map((language) => [
    `invalid language ${JSON.stringify(language)}`, { ...audio, language }, credentials, '請提供有效的語言代碼，最長 32 字元。',
  ]),
  ...[0, -1, 1.5, NaN, Infinity, '100', 4_294_967_296].map((timeoutMs) => [
    `invalid timeout ${String(timeoutMs)}`, audio, { ...credentials, timeoutMs }, '逾時時間必須是 1 至 4294967295 毫秒的整數。',
  ]),
];

for (const [name, input, auth, message] of validationCases) {
  test(`validation rejects ${name} before fetch`, async () => {
    let called = false;
    await expectFailure(transcribe(input, auth, { fetchImpl: () => { called = true; throw new Error('must not fetch'); } }), message);
    assert.equal(called, false);
  });
}

test('missing credentials are rejected without fetch', async () => {
  await expectFailure(transcribeAudio(audio, undefined, { fetchImpl: unexpectedFetch }), '請提供有效的 Codex 存取權杖。');
});

test('invalid signal and fetch implementations are rejected', async () => {
  await expectFailure(transcribe(audio, credentials, { signal: {} }), '取消訊號格式不正確。');
  await expectFailure(transcribe(audio, credentials, { fetchImpl: null }), '轉錄連線設定不正確。');
});

test('exactly 25 MB is accepted', async () => {
  await transcribe({ ...audio, data: new Blob([new Uint8Array(MAX_AUDIO_BYTES)]) }, credentials, {
    fetchImpl: async (_url, init) => {
      assert.equal(init.body.get('file').size, 25_000_000);
      return jsonResponse({ text: 'ok' });
    },
  });
});

for (const [status, message] of [
  [401, 'Codex 登入已失效，請重新執行 codex login 或更新設定中的存取權杖。'],
  [403, 'Codex 原生轉錄端點拒絕存取（403）；可能是帳號權限或端點限制，不會改用其他 API。'],
  [429, '轉錄服務額度不足或請求過於頻繁，請稍後再試。'],
  [413, '轉錄服務拒絕音訊檔案：檔案過大。'],
  [500, '轉錄服務暫時無法使用，請稍後再試。'],
  [400, '轉錄服務拒絕請求，請檢查音訊與設定。'],
]) {
  test(`HTTP ${status} is sanitized, cancels its body and never retries`, async () => {
    let cancelled = false;
    let calls = 0;
    const response = new Response(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode(SECRET_BODY)); },
      cancel() { cancelled = true; },
    }), { status });
    // Fail if error handling tries to inspect the upstream body.
    response.text = response.json = () => { throw new Error(SECRET_BODY); };
    await expectFailure(transcribe(audio, credentials, { fetchImpl: async () => { calls++; return response; } }), message);
    assert.equal(calls, 1);
    assert.equal(cancelled, true);
  });
}

for (const [name, fetchImpl] of [
  ['synchronous fetch failure', () => { throw new Error(SECRET_BODY); }],
  ['rejected fetch', async () => { throw new Error(SECRET_BODY); }],
  ['redirect rejection', async () => { throw new TypeError(`redirect rejected: ${SECRET_BODY}`); }],
]) {
  test(`${name} never leaks upstream error details`, async () => {
    await expectFailure(transcribe(audio, credentials, { fetchImpl }), '無法連線至轉錄服務，請檢查網路後再試。');
  });
}

for (const [name, response] of [
  ['malformed JSON', () => new Response(`{${SECRET_BODY}`)],
  ['invalid UTF-8', () => new Response(new Uint8Array([0xff, 0xfe]))],
  ['empty body', () => new Response('')],
  ['absent body', () => new Response(null)],
]) {
  test(`${name} gives a sanitized JSON error`, async () => {
    await expectFailure(transcribe(audio, credentials, { fetchImpl: async () => response() }), '轉錄服務回應不是有效的 JSON。');
  });
}

for (const value of [{}, { text: 42 }, { text: false }, { text: {} }, { body: { text: null } }, null, [], 'plain text']) {
  test(`invalid response text ${JSON.stringify(value)} is rejected`, async () => {
    await expectFailure(transcribe(audio, credentials, { fetchImpl: async () => jsonResponse(value) }), '轉錄服務回應缺少有效的文字。');
  });
}

test('response read failure is sanitized', async () => {
  const { response } = streamingResponse([], { fail: new Error(SECRET_BODY) });
  await expectFailure(transcribe(audio, credentials, { fetchImpl: async () => response }), '無法讀取轉錄服務回應。');
});

test('declared response larger than 2 MiB is rejected before reading and cancelled', async () => {
  const { response, state } = streamingResponse([], { headers: { 'content-length': String(RESPONSE_LIMIT + 1) }, hang: true });
  await expectFailure(transcribe(audio, credentials, { fetchImpl: async () => response }), '轉錄服務回應過大。');
  assert.equal(state.cancelled, true);
});

for (const headers of [undefined, { 'content-length': '1' }, { 'content-length': 'unknown' }]) {
  test(`stream exceeding 2 MiB is rejected and cancelled with headers ${JSON.stringify(headers)}`, async () => {
    const { response, state } = streamingResponse([
      new Uint8Array(RESPONSE_LIMIT), new Uint8Array([32]),
    ], { headers, hang: true });
    await expectFailure(transcribe(audio, credentials, { fetchImpl: async () => response }), '轉錄服務回應過大。');
    assert.equal(state.cancelled, true);
  });
}

test('valid JSON of exactly 2 MiB is accepted, including split UTF-8 bytes', async () => {
  const text = `台${'a'.repeat(RESPONSE_LIMIT - 14)}`;
  const encoded = new TextEncoder().encode(JSON.stringify({ text }));
  assert.equal(encoded.length, RESPONSE_LIMIT);
  const { response } = streamingResponse([encoded.subarray(0, 10), encoded.subarray(10, 11), encoded.subarray(11)]);
  const result = await transcribe(audio, credentials, { fetchImpl: async () => response });
  assert.equal(result.text, text);
  assert.equal(result.provider, 'codex-native');
});

test('already-cancelled caller signal prevents fetch and sanitizes its reason', async () => {
  const controller = new AbortController();
  controller.abort(new Error(SECRET_BODY));
  await expectFailure(transcribe(audio, credentials, { signal: controller.signal }), '轉錄已取消。');
});

for (const stage of ['fetch', 'response body']) {
  test(`caller cancellation interrupts a pending ${stage} even when the mock ignores abort`, async () => {
    await withActiveEventLoop(async () => {
      const controller = new AbortController();
      const { response, state } = streamingResponse([], { hang: true });
      let requestSignal;
      const pending = transcribe(audio, credentials, {
        signal: controller.signal,
        fetchImpl: async (_url, init) => {
          requestSignal = init.signal;
          if (stage === 'fetch') return new Promise(() => {});
          return response;
        },
      });
      const cancelTimer = setTimeout(() => controller.abort(new Error(SECRET_BODY)), 10);
      try {
        await expectFailure(pending, '轉錄已取消。');
        assert.equal(requestSignal.aborted, true);
        if (stage === 'response body') assert.equal(state.cancelled, true);
      } finally { clearTimeout(cancelTimer); }
    });
  });

  test(`timeout interrupts a pending ${stage} even when the mock ignores abort`, async () => {
    await withActiveEventLoop(async () => {
      const { response, state } = streamingResponse([], { hang: true });
      let requestSignal;
      await expectFailure(transcribe(audio, { ...credentials, timeoutMs: 15 }, {
        fetchImpl: async (_url, init) => {
          requestSignal = init.signal;
          if (stage === 'fetch') return new Promise(() => {});
          return response;
        },
      }), '轉錄逾時，請稍後再試。');
      assert.equal(requestSignal.aborted, true);
      if (stage === 'response body') assert.equal(state.cancelled, true);
    });
  });
}
