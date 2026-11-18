import { resolveAuth } from './auth.mjs';
import { MAX_AUDIO_BYTES, transcribeAudio } from './backend.mjs';

export const RECORDING_PATH = '/api/codex-dictation/recording';
const recordings = new Map([
  ['audio/webm', 'dictation.webm'],
  ['audio/ogg', 'dictation.ogg'],
  ['audio/mp4', 'dictation.m4a'],
]);
const tooLarge = '錄音已超過 25 MB，請分段錄製。';

export function createRecordingHandler(config = {}, {
  authenticate = resolveAuth, transcribe = transcribeAudio, lifetime, maxBytes = MAX_AUDIO_BYTES,
} = {}) {
  return async (request) => {
    const signal = lifetime ? AbortSignal.any([request.signal, lifetime]) : request.signal;
    const type = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    const filename = recordings.get(type);
    if (!filename) return Response.json({ error: '錄音格式須為 WebM、OGG 或 M4A。' }, { status: 415 });
    if (Number(request.headers.get('content-length')) > maxBytes) {
      return Response.json({ error: tooLarge }, { status: 413 });
    }
    const chunks = [];
    let size = 0;
    try {
      signal.throwIfAborted();
      if (request.body) {
        const reader = request.body.getReader();
        const cancelRead = () => { void reader.cancel().catch(() => {}); };
        signal.addEventListener('abort', cancelRead, { once: true });
        try {
          while (true) {
            const { value, done } = await reader.read();
            signal.throwIfAborted();
            if (done) break;
            size += value.byteLength;
            if (size > maxBytes) return Response.json({ error: tooLarge }, { status: 413 });
            chunks.push(value);
          }
        } finally {
          signal.removeEventListener('abort', cancelRead);
          // Connection closes an unread request after sending the response.
          reader.releaseLock();
        }
      }
      if (size === 0) return Response.json({ error: '錄音沒有音訊資料。' }, { status: 400 });
      const auth = await authenticate(config);
      signal.throwIfAborted();
      const audio = new Blob(chunks, { type });
      const { text } = await transcribe({ data: audio, filename, language: config.language || undefined },
        { ...auth, timeoutMs: config.timeoutMs }, { signal });
      signal.throwIfAborted();
      return Response.json({ text });
    } catch (error) {
      if (signal.aborted) return Response.json({ error: '轉錄已取消。' }, { status: 499 });
      return Response.json({ error: error.message }, { status: 502 });
    }
  };
}

export function registerVoiceInput(ctx, config) {
  ctx.inject(['connection'], (scope) => {
    const lifetime = new AbortController();
    scope.effect(() => () => lifetime.abort());
    scope.connection.fetch.register({
      path: RECORDING_PATH,
      methods: ['POST'],
      requestBody: 'streaming',
      fetch: createRecordingHandler(config, { lifetime: lifetime.signal }),
    });
  });
}
