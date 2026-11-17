#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { readFileSync, appendFileSync } from 'node:fs';
const { mode = 'ok' } = JSON.parse(readFileSync('scenario.json', 'utf8'));
const send = message => process.stdout.write(JSON.stringify(message) + '\n');
const threadId = 'thread-1', turnId = 'turn-1';
createInterface({ input: process.stdin }).on('line', line => {
  const m = JSON.parse(line);
  appendFileSync('requests.jsonl', line + '\n');
  if (!m.method || mode === 'timeout') return;
  if (mode === 'exit') return process.exit(7);
  const reply = result => send({ id: m.id, result });
  const event = (method, params) => send({ method, params });
  if (m.method === 'initialize') return reply({});
  if (m.method === 'account/read') return reply({ account: mode === 'signed-out' ? null : { type: mode === 'api' ? 'apiKey' : 'chatgpt' } });
  if (m.method === 'config/read') return reply({ config: { mcp_servers: { 'test.server': {} } } });
  if (m.method === 'thread/start') return reply({ thread: { id: threadId } });
  if (m.method !== 'turn/start') return;
  if (mode === 'rpc-error') return send({ id: m.id, error: { message: 'RPC failed' } });
  reply({ turn: { id: turnId } });
  if (mode === 'reverse') return send({ id: 'reverse', method: 'item/tool/call', params: {} });
  if (mode === 'close-turn') return process.exit(8);
  const ids = { threadId: mode === 'wrong-thread' ? 'other' : threadId, turnId: mode === 'wrong-turn' ? 'other' : turnId };
  const search = { id: 'search', type: mode === 'mcp' ? 'mcpToolCall' : 'webSearch', query: 'docs', action: { type: 'search', query: 'docs' }, ...(mode === 'raw-results' ? { results: [{ type: 'text_result', url: 'https://example.com', unknown: true }] } : mode === 'empty-results' ? { results: [] } : {}) };
  if (mode !== 'text-only') event('item/completed', { ...ids, item: search });
  if (mode === 'duplicate') event('item/completed', { ...ids, item: search });
  if (mode !== 'no-answer') event('item/completed', { ...ids, item: { id: 'answer', type: 'agentMessage', text: '[Docs](https://example.com)' } });
  event('turn/completed', { threadId, turn: { id: turnId, status: mode === 'failed' ? 'failed' : 'completed' } });
});
