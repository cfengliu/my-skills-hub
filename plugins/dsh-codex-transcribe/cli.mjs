#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { open } from 'node:fs/promises';
import path from 'node:path';
import { resolveAuth, status } from './auth.mjs';
import { transcribeAudio, MAX_AUDIO_BYTES } from './backend.mjs';

try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    file: { type: 'string' }, language: { type: 'string' }, 'codex-home': { type: 'string' }, timeout: { type: 'string', default: '180000' },
  } });
  if (positionals.length !== 1 || !['status', 'transcribe'].includes(positionals[0])) throw new Error('Usage: node cli.mjs status | transcribe --file <audio.webm> [--language zh] [--codex-home <directory>] [--timeout 180000]');
  const timeoutMs = Number(values.timeout);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 600000) throw new Error('逾時時間須為 1–600000 毫秒的整數。');
  const options = { codexHome: values['codex-home'], timeoutMs };
  const controller = new AbortController();
  const cancel = () => controller.abort();
  process.once('SIGINT', cancel);
  process.once('SIGTERM', cancel);
  try {
    if (positionals[0] === 'status') console.log(JSON.stringify(await status(options), null, 2));
    else {
      if (!values.file) throw new Error('請以 --file 指定音訊檔。');
      const auth = await resolveAuth(options);
      const file = await open(values.file, 'r');
      let data;
      try {
        const stat = await file.stat();
        if (!stat.isFile() || !stat.size || stat.size > MAX_AUDIO_BYTES) throw new Error('音訊必須是 1–25000000 bytes 的一般檔案。');
        data = Buffer.alloc(stat.size);
        let offset = 0;
        while (offset < data.length) {
          const { bytesRead } = await file.read(data, offset, data.length - offset, offset);
          if (!bytesRead) throw new Error('讀取時音訊檔案已改變。');
          offset += bytesRead;
        }
      } finally { await file.close(); }
      console.log(JSON.stringify(await transcribeAudio({ data, filename: path.basename(values.file), ...(values.language ? { language: values.language } : {}) }, { ...auth, timeoutMs }, { signal: controller.signal }), null, 2));
    }
  } finally {
    process.removeListener('SIGINT', cancel);
    process.removeListener('SIGTERM', cancel);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
