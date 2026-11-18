import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../client.mjs', import.meta.url), 'utf8');

for (const { action, acceptsDraft, sends } of [
  { action: 'stop', acceptsDraft: true, sends: false },
  { action: 'send', acceptsDraft: true, sends: true },
  { action: 'send', acceptsDraft: false, sends: false },
]) test(`after 121 simulated seconds, ${action} submits only on request and successful insertion (${acceptsDraft})`, async () => {
  let component, recorder, upload, uploadFinished, trackStops = 0, inserted, submissions = 0;
  const microphoneStream = Promise.withResolvers();
  const audioTrack = Object.assign(new EventTarget(), {
    readyState: 'live', muted: true, stop() { trackStops++; },
  });
  let hook = 0;
  const state = [];
  const effects = new Set();
  const insertion = { start: 0, end: 2, draftRev: 7 };
  let draft = '前文後文';
  let draftRev = 7;
  const react = {
    createElement: (tag, props, ...children) => ({ tag, props, children }),
    useRef(value) { const i = hook++; return state[i] ??= { current: value }; },
    useState(value) { const i = hook++; state[i] ??= value; return [state[i], (next) => { state[i] = next; }]; },
    useEffect(effect) { const i = hook++; if (!effects.has(i)) { effects.add(i); effect(); } },
  };
  class MediaRecorder {
    static isTypeSupported(type) { return type === 'audio/webm;codecs=opus'; }
    constructor(_stream, { mimeType }) { this.mimeType = mimeType; recorder = this; }
    start(timeslice) { assert.equal(timeslice, 1000); this.state = 'recording'; }
    stop() { this.state = 'inactive'; this.onstop(); }
  }
  runInNewContext(source, {
    MediaRecorder, Blob, AbortController,
    window: { MediaRecorder, addEventListener() {}, __ModuleLoader__: { load({ factory }) {
      factory(() => react).apply({ slots: {
        inject(name, register) { assert.equal(name, 'conversation.input.activity'); register(); },
        register(_options, value) { component = value; },
      } });
    } } },
    navigator: { mediaDevices: { getUserMedia: () => microphoneStream.promise } },
    fetch: async (url, options) => {
      upload = { url, options };
      return { ok: true, json: async () => ({ text: '逐字稿' }) };
    },
  });
  const render = () => {
    hook = 0;
    return component({ sessionId: 'test', inputActions: {
      captureInsertion: () => insertion,
      insertText(text, target) {
        assert.equal(target.start, insertion.end);
        assert.equal(target.end, insertion.end);
        assert.equal(target.draftRev, insertion.draftRev);
        inserted = text;
        const applied = target.draftRev === draftRev;
        if (applied) draft = draft.slice(0, target.start) + text + draft.slice(target.end);
        uploadFinished();
        return applied;
      },
      submit() { assert.equal(inserted, '逐字稿'); submissions++; },
    } });
  };
  const microphone = render();
  assert.equal(microphone.children[0].tag, 'svg');
  const starting = microphone.props.onClick();
  const actionNames = () => render().children.filter((item) => item?.tag === 'button')
    .map((item) => item.props['data-dictation-action']);
  assert.deepEqual(actionNames(), ['cancel']);
  microphoneStream.resolve({ getTracks: () => [audioTrack], getAudioTracks: () => [audioTrack] });
  await starting;
  assert.deepEqual(actionNames(), ['cancel']);
  recorder.onstart();
  assert.deepEqual(actionNames(), ['cancel']);
  audioTrack.muted = false;
  audioTrack.dispatchEvent(new Event('unmute'));
  assert.deepEqual(actionNames(), ['cancel', 'stop', 'send']);
  for (let i = 0; i < 121; i++) recorder.ondataavailable({ data: new Blob(['a']) });
  assert.equal(recorder.state, 'recording');
  assert.equal(upload, undefined);
  const done = new Promise((resolve) => { uploadFinished = resolve; });
  const controls = render();
  assert.equal(controls.props.style.justifyContent, 'flex-end');
  const buttons = controls.children.filter((item) => item?.tag === 'button');
  assert.deepEqual(buttons.map((item) => item.props['data-dictation-action']), ['cancel', 'stop', 'send']);
  assert.ok(buttons.every((item) => item.children.length === 1 && item.children[0].tag === 'svg'));
  if (!acceptsDraft) {
    draft += '新字';
    draftRev++;
  }
  buttons.find((item) => item.props['data-dictation-action'] === action).props.onClick();
  await done;
  assert.equal(submissions, Number(sends));
  assert.equal(draft, acceptsDraft ? '前文逐字稿後文' : '前文後文新字');
  if (!acceptsDraft) {
    assert.ok(actionNames().includes('insert'));
    Object.assign(insertion, { start: 0, end: 6, draftRev });
    render().children.find((item) => item?.props?.['data-dictation-action'] === 'insert').props.onClick();
    assert.equal(draft, '前文後文新字逐字稿');
    assert.equal(submissions, 0);
  }
  assert.equal(upload.url, '/api/codex-dictation/recording');
  assert.equal(upload.options.body.type, 'audio/webm;codecs=opus');
  assert.equal(upload.options.body.size, 121);
  assert.equal(inserted, '逐字稿');
  assert.ok(trackStops > 0);
});
