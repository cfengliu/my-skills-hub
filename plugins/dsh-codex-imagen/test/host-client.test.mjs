import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { apply, inject } from '../host.mjs';

function host() {
  let command, tool;
  apply({ commands: { register(value) { command = value; } }, tools: { register(value) { tool = value; } }, attachments: {} });
  return { command, tool };
}

test('command returns CommandResult and forwards literal prompt to a real user followup', () => {
  const { command, tool } = host();
  const prompt = '  圖片\n"hello" $(whoami) `shell`  ';
  let forwarded;
  const result = command.handler({ rawInput: prompt, agent: { followup(message) { forwarded = message; } }, signal: new AbortController().signal });
  assert.equal(command.name, 'codex-imagen');
  assert.equal(result.kind, 'success');
  assert.equal(forwarded.role, 'user');
  assert.deepEqual(forwarded.source, { kind: 'user' });
  const text = forwarded.content[0].text;
  assert.equal(JSON.parse(text.slice(text.indexOf('\n') + 1)), prompt);
  assert.match(text, /imagen_generate exactly once/);
  assert.equal(tool.name, 'imagen_generate');
  assert.deepEqual(inject, ['commands', 'tools', 'attachments']);
  assert.equal(command.handler({ rawInput: '  ' }).kind, 'error');
});

test('command respects cancellation before scheduling a followup', () => {
  const { command } = host();
  const controller = new AbortController(); controller.abort(new Error('stop'));
  let calls = 0;
  assert.throws(() => command.handler({ rawInput: 'forest', agent: { followup() { calls++; } }, signal: controller.signal }), /stop/);
  assert.equal(calls, 0);
});

test('client registers imagen tool renderer with image child slot and text fallback', async () => {
  let row, View, module;
  const React = { createElement: (type, props, ...children) => ({ type, props, children }) };
  const script = await readFile(new URL('../client.js', import.meta.url), 'utf8');
  vm.runInNewContext(script, { window: { __ModuleLoader__: { load(value) { module = value; } } } });
  assert.equal(module.id, 'dsh-codex-imagen');
  const plugin = module.factory(name => { assert.equal(name, 'react'); return React; });
  plugin.apply({ slots: { inject(name, callback) { assert.equal(name, 'tool.call.toolview'); callback(); }, register(value, component) { row = value; View = component; } } });
  assert.equal(row.key, 'imagen_generate');
  assert.equal(row.children['tool.call.images'].scope, 'session');
  let dispatched;
  const image = { type: 'image', attachment: { attachmentId: 'image' } };
  View({ block: { content: [image, { type: 'text', text: 'done' }] }, loadImage: 'loader', renderSlot(name, props) { dispatched = { name, props }; } });
  assert.equal(dispatched.name, 'tool.call.images');
  assert.equal(dispatched.props.images[0], image);
  assert.equal(dispatched.props.loadImage, 'loader');
  const error = View({ block: { isError: true, content: [{ type: 'text', text: 'failed' }] } });
  assert.equal(error.props.role, 'alert');
  assert.match(JSON.stringify(error), /failed/);
  assert.match(JSON.stringify(View({ block: {} })), /等待/);
});
