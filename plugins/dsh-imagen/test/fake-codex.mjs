#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { readFileSync, appendFileSync } from 'node:fs';
const scenario = JSON.parse(readFileSync('scenario.json', 'utf8'));
const send = value => process.stdout.write(JSON.stringify(value) + '\n');
const reply = (message, result) => send({ id: message.id, result });
const event = (method, params) => send({ method, params });
const threadId = 'thread-1', turnId = 'turn-1';
const lines = createInterface({ input: process.stdin });
lines.on('line', line => {
  const m = JSON.parse(line);
  appendFileSync('requests.jsonl', JSON.stringify(m) + '\n');
  if (scenario.mode === 'timeout') return;
  if (scenario.mode === 'exit') return process.exit(7);
  if (!m.method) return;
  if (m.method === 'initialize') return reply(m, { codexHome: scenario.home });
  if (m.method === 'account/read') return reply(m, { account: scenario.mode === 'signed-out' ? null : { type: scenario.mode === 'api' ? 'apiKey' : 'chatgpt' } });
  if (m.method === 'modelProvider/capabilities/read') return reply(m, { imageGeneration: scenario.mode !== 'incapable', webSearch: false });
  if (m.method === 'config/read') return reply(m, { config: { mcp_servers: { 'example.server': { enabled: true } } } });
  if (m.method === 'thread/start') return reply(m, { thread: { id: threadId } });
  if (m.method === 'turn/start') {
    if (scenario.mode === 'rpc-error') return send({ id: m.id, error: { code: -1, message: 'fixture RPC failure' } });
    reply(m, { turn: { id: turnId, status: 'inProgress' } });
    if (scenario.mode === 'reverse') return send({ id: 'reverse-1', method: 'item/tool/call', params: {} });
    if (scenario.mode === 'close-turn') return process.exit(8);
    if (scenario.mode === 'text') {
      event('item/completed', { threadId, turnId, item: { id: 'text', type: 'agentMessage', text: scenario.png } });
    } else if (scenario.mode === 'tool') {
      event('item/completed', { threadId, turnId, item: { id: 'tool', type: 'mcpToolCall', status: 'completed', result: scenario.png } });
    } else {
      const item = { id: 'image-1', type: 'imageGeneration', status: 'completed', revisedPrompt: 'revised', ...scenario.item };
      if (!('savedPath' in item) && !('fileId' in item) && !('result' in item)) item.result = scenario.png;
      event('item/completed', { threadId: scenario.mode === 'wrong-thread' ? 'other' : threadId, turnId: scenario.mode === 'wrong-turn' ? 'other' : turnId, item });
      if (scenario.mode === 'duplicate') event('item/completed', { threadId, turnId, item });
    }
    if (scenario.mode === 'image-exit') return process.exit(9);
    event('turn/completed', { threadId, turn: { id: turnId, status: scenario.mode === 'turn-failed' ? 'failed' : 'completed' } });
  }
});
