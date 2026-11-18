import { open } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const MAX_AUTH_BYTES = 1024 * 1024;
const validToken = value => typeof value === 'string' && !!value.trim() && !/[\r\n]/.test(value) && !value.trim().startsWith('sk-');
const validAccount = value => typeof value === 'string' && !!value.trim() && !/[\r\n]/.test(value);

export async function resolveAuth(options = {}) {
  if (options.accessToken) {
    if (!validToken(options.accessToken)) throw new Error('請使用 Codex／ChatGPT OAuth 存取權杖，不是 OpenAI API key。');
    if (options.accountId && !validAccount(options.accountId)) throw new Error('Codex 帳號識別碼格式不正確。');
    return { accessToken: options.accessToken.trim(), ...(options.accountId ? { accountId: options.accountId.trim() } : {}), source: 'settings' };
  }
  const home = path.resolve(options.codexHome || process.env.CODEX_HOME || path.join(homedir(), '.codex'));
  let file, document;
  try {
    file = await open(path.join(home, 'auth.json'), 'r');
    const stat = await file.stat();
    if (!stat.isFile() || !stat.size || stat.size > MAX_AUTH_BYTES) throw new Error('invalid auth');
    const data = Buffer.alloc(stat.size);
    let offset = 0;
    while (offset < data.length) {
      const { bytesRead } = await file.read(data, offset, data.length - offset, offset);
      if (!bytesRead) throw new Error('auth changed');
      offset += bytesRead;
    }
    document = JSON.parse(data.toString('utf8'));
  } catch {
    throw new Error('無法載入 Codex 登入資訊，請先執行 codex login，或在插件設定填入 OAuth 存取權杖。');
  } finally { await file?.close(); }
  if (document?.auth_mode && document.auth_mode !== 'chatgpt') throw new Error('本插件需要 Codex 的 ChatGPT 登入模式，不接受 API key 登入。');
  if (!validToken(document?.tokens?.access_token)) throw new Error('Codex 沒有可用的 ChatGPT 存取權杖，請重新執行 codex login。');
  const accountId = document.tokens.account_id;
  if (accountId != null && !validAccount(accountId)) throw new Error('Codex 登入資訊的帳號識別碼格式不正確。');
  return { accessToken: document.tokens.access_token.trim(), ...(accountId ? { accountId: accountId.trim() } : {}), source: 'codex-login' };
}

export async function status(options = {}) {
  const auth = await resolveAuth(options);
  return { signedIn: true, source: auth.source, endpoint: 'https://chatgpt.com/backend-api/transcribe' };
}
