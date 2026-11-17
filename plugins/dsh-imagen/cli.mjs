#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { writeFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { generateImage, status } from './backend.mjs';

try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    prompt: { type: 'string' }, out: { type: 'string' }, command: { type: 'string', default: 'codex' },
    model: { type: 'string' }, timeout: { type: 'string', default: '180000' },
  } });
  const operation = positionals[0];
  if (positionals.length !== 1 || !['status', 'generate'].includes(operation)) throw new Error('Usage: node cli.mjs status | generate --prompt <text> --out <workspace.png> [--command codex] [--model name] [--timeout 180000]');
  const timeoutMs = Number(values.timeout);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new Error('timeout must be a positive integer');
  const options = { command: values.command, model: values.model, timeoutMs };
  const controller = new AbortController();
  const abort = () => controller.abort(new Error('Cancelled by signal'));
  process.once('SIGINT', abort);
  process.once('SIGTERM', abort);
  try {
    if (operation === 'status') {
      const result = await status(options, { signal: controller.signal });
      console.log(JSON.stringify({ signedIn: result.signedIn, accountType: result.accountType, imageGeneration: result.imageGeneration }));
    } else {
      if (!values.prompt || !values.out || path.extname(values.out).toLowerCase() !== '.png') throw new Error('generate requires --prompt and --out ending in .png');
      const out = path.resolve(values.out);
      const relative = path.relative(process.cwd(), out);
      if (!relative || relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) throw new Error('out must be inside the current workspace');
      const workspace = await realpath(process.cwd());
      const destinationParent = await realpath(path.dirname(out));
      const realRelative = path.relative(workspace, destinationParent);
      if (realRelative === '..' || realRelative.startsWith(`..${path.sep}`) || path.isAbsolute(realRelative)) throw new Error('out parent must remain inside the real workspace');
      const image = await generateImage({ prompt: values.prompt }, options, { signal: controller.signal });
      controller.signal.throwIfAborted();
      await writeFile(out, image.data, { flag: 'wx' });
      console.log(JSON.stringify({ out, mediaType: image.mediaType, bytes: image.data.length, threadId: image.threadId, revisedPrompt: image.revisedPrompt }));
    }
  } finally {
    process.removeListener('SIGINT', abort);
    process.removeListener('SIGTERM', abort);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
