export const MAX_AUDIO_BYTES = 25_000_000;
export const AUDIO_TYPES = Object.freeze({
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  webm: 'audio/webm',
});

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const ENDPOINT = 'https://chatgpt.com/backend-api/transcribe';
const LOCALE = /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/i;
const fail = (message) => new Error(message);
const validLocale = (code) => typeof code === 'string' && code.length <= 32 && LOCALE.test(code);

function abortError(signal, timeout) {
  return fail(signal?.aborted ? '轉錄已取消。' : timeout.aborted ? '轉錄逾時，請稍後再試。' : '轉錄已取消。');
}

function withAbort(promise, signal, originalSignal, timeout) {
  return new Promise((resolve, reject) => {
    const aborted = () => reject(abortError(originalSignal, timeout));
    if (signal.aborted) {
      aborted();
      // Observe a pending rejection even when cancellation has already happened.
      Promise.resolve(promise).catch(() => {});
      return;
    }
    signal.addEventListener('abort', aborted, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', aborted);
    });
  });
}

async function readJson(response, combined, signal, timeout) {
  const length = response.headers.get('content-length');
  if (length !== null && /^\d+$/.test(length) && Number(length) > MAX_RESPONSE_BYTES) {
    response.body?.cancel().catch(() => {});
    throw fail('轉錄服務回應過大。');
  }
  if (!response.body) throw fail('轉錄服務回應不是有效的 JSON。');
  const reader = response.body.getReader();
  let total = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await withAbort(reader.read(), combined, signal, timeout);
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) throw fail('轉錄服務回應過大。');
      chunks.push(value);
    }
  } catch (error) {
    reader.cancel().catch(() => {});
    if (combined.aborted) throw abortError(signal, timeout);
    if (error?.message === '轉錄服務回應過大。') throw error;
    throw fail('無法讀取轉錄服務回應。');
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw fail('轉錄服務回應不是有效的 JSON。');
  }
}

function httpError(status) {
  if (status === 401) return fail('Codex 登入已失效，請重新執行 codex login 或更新設定中的存取權杖。');
  if (status === 403) return fail('Codex 原生轉錄端點拒絕存取（403）；可能是帳號權限或端點限制，不會改用其他 API。');
  if (status === 429) return fail('轉錄服務額度不足或請求過於頻繁，請稍後再試。');
  if (status === 413) return fail('轉錄服務拒絕音訊檔案：檔案過大。');
  if (status >= 500) return fail('轉錄服務暫時無法使用，請稍後再試。');
  return fail('轉錄服務拒絕請求，請檢查音訊與設定。');
}

export async function transcribeAudio(
  { data, filename, language } = {},
  { accessToken, accountId, timeoutMs = 180_000 } = {},
  { signal, fetchImpl = globalThis.fetch } = {},
) {
  if (typeof accessToken !== 'string' || !accessToken.trim() || /[\r\n]/.test(accessToken)) {
    throw fail('請提供有效的 Codex 存取權杖。');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 4_294_967_295) {
    throw fail('逾時時間必須是 1 至 4294967295 毫秒的整數。');
  }
  if (signal !== undefined && !(signal instanceof AbortSignal)) throw fail('取消訊號格式不正確。');
  if (typeof fetchImpl !== 'function') throw fail('轉錄連線設定不正確。');
  if (typeof filename !== 'string' || /[\u0000-\u001f\u007f-\u009f]/u.test(filename)) {
    throw fail('音訊檔名格式不正確。');
  }
  const basename = filename.split(/[\\/]/).at(-1);
  const extension = basename.split('.').at(-1).toLowerCase();
  if (!basename || basename === '.' || basename === '..' || !basename.includes('.') || !Object.hasOwn(AUDIO_TYPES, extension)) {
    throw fail('請提供支援的音訊副檔名：mp3、m4a、ogg、wav 或 webm。');
  }
  let size;
  if (data instanceof Blob) size = data.size;
  else if (data instanceof ArrayBuffer) size = data.byteLength;
  else if (ArrayBuffer.isView(data)) size = data.byteLength;
  else throw fail('音訊資料格式不正確。');
  if (!size) throw fail('音訊檔案不可為空。');
  if (size > MAX_AUDIO_BYTES) throw fail('音訊檔案不可超過 25 MB。');
  if (language !== undefined && !validLocale(language)) throw fail('請提供有效的語言代碼，最長 32 字元。');
  if (accountId !== undefined && (typeof accountId !== 'string' || !accountId.trim() || /[\r\n]/.test(accountId))) throw fail('Codex 帳號識別碼格式不正確。');

  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = AbortSignal.any(signal ? [signal, timeout] : [timeout]);
  if (combined.aborted) throw abortError(signal, timeout);
  const form = new FormData();
  // Copy views so slices contain only the caller's selected audio bytes.
  const part = ArrayBuffer.isView(data) ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : data;
  form.append('file', new File([part], basename, { type: AUDIO_TYPES[extension] }));
  if (language) form.append('language', language);

  let response;
  try {
    response = await withAbort(fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken.trim()}`, Accept: 'application/json', originator: 'dsh-codex-transcribe', ...(accountId ? { 'ChatGPT-Account-Id': accountId } : {}) },
      body: form,
      redirect: 'error',
      signal: combined,
    }), combined, signal, timeout);
  } catch {
    if (combined.aborted) throw abortError(signal, timeout);
    throw fail('無法連線至轉錄服務，請檢查網路後再試。');
  }
  if (!response.ok) {
    response.body?.cancel().catch(() => {});
    throw httpError(response.status);
  }
  const result = await readJson(response, combined, signal, timeout);
  const text = result?.text ?? result?.body?.text;
  if (typeof text !== 'string') throw fail('轉錄服務回應缺少有效的文字。');
  return { text, provider: 'codex-native' };
}
