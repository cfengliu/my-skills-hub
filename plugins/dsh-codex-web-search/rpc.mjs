import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const MAX_LINE = 2 * 1024 * 1024;

export function connect(options, signal) {
  const child = spawn(options.command ?? 'codex', ['app-server', '-c', 'features.shell_tool=false', '-c', 'features.apps=false', '-c', 'features.plugins=false', '-c', 'features.multi_agent=false', '-c', 'features.multi_agent_v2=false', '-c', 'features.code_mode=false', '-c', 'web_search="live"', '--listen', 'stdio://'], { shell: false, stdio: ['pipe', 'pipe', 'pipe'], cwd: options.cwd ?? path.dirname(fileURLToPath(import.meta.url)) });
  const closed = new Promise(resolve => child.once('close', resolve));
  const pending = new Map();
  let nextId = 0, buffer = '', failure, listener = () => {};
  let rejectFailure;
  const failed = new Promise((_, reject) => { rejectFailure = reject; });
  failed.catch(() => {});
  const stop = error => {
    if (failure) return;
    failure = error;
    for (const request of pending.values()) request.reject(error);
    pending.clear();
    rejectFailure(error);
    child.stdin.destroy();
    child.stdout.destroy();
    child.stderr.destroy();
    child.kill('SIGKILL');
  };
  const abort = () => stop(signal.reason instanceof Error ? signal.reason : new Error('Web search cancelled'));
  const timer = setTimeout(() => stop(new Error('Codex app-server timeout')), options.timeoutMs ?? 180000);
  signal?.addEventListener('abort', abort, { once: true });
  child.on('error', error => stop(error));
  child.on('close', (code, sig) => stop(new Error(`Codex app-server closed (${code ?? sig})`)));
  child.stdin.on('error', error => stop(error));
  child.stderr.on('data', () => {});
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    buffer += chunk;
    if (buffer.length > MAX_LINE && !buffer.includes('\n')) return stop(new Error('Codex response exceeds size limit'));
    let end;
    while ((end = buffer.indexOf('\n')) >= 0 && !failure) {
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
      if (line.length > MAX_LINE) return stop(new Error('Codex response exceeds size limit'));
      if (!line.trim()) continue;
      try {
        const message = JSON.parse(line);
        if (message.method && message.id !== undefined) {
          child.stdin.write(JSON.stringify({ id: message.id, error: { code: -32601, message: 'Client rejects tool and approval requests' } }) + '\n');
          stop(new Error(`Codex reverse request rejected: ${message.method}`));
        } else if (message.id !== undefined) {
          const request = pending.get(message.id);
          if (request) {
            pending.delete(message.id);
            message.error ? request.reject(new Error(`Codex RPC failed: ${message.error.message ?? 'unknown error'}`)) : request.resolve(message.result);
          }
        } else listener(message);
      } catch (error) { stop(error); }
    }
  });
  if (signal?.aborted) abort();
  return {
    failed,
    onNotification(fn) { listener = fn; },
    request(method, params = {}) {
      if (failure) return Promise.reject(failure);
      return new Promise((resolve, reject) => {
        const id = ++nextId; pending.set(id, { resolve, reject });
        child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
      });
    },
    notify(method) { child.stdin.write(JSON.stringify({ method }) + '\n'); },
    async close() {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      stop(new Error('Codex client closed'));
      await closed;
    },
  };
}
