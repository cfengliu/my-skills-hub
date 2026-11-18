window.__ModuleLoader__.load({
  id: 'dsh-codex-transcribe',
  factory(require) {
    const { createElement: h, useEffect, useRef, useState } = require('react');
    const maxBytes = 25_000_000;
    const formats = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'];
    const tooLarge = '錄音已超過 25 MB，請分段錄製。';

    const glyphs = {
      mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-6-4v1a6 6 0 0 0 12 0v-1m-6 7v3m-3 0h6',
      cancel: 'm6 6 12 12M18 6 6 18',
      send: 'M12 20V4m-6 6 6-6 6 6',
      wait: 'M12 3a9 9 0 1 1-9 9',
      insert: 'M5 4v9a3 3 0 0 0 3 3h11m-5-5 5 5-5 5',
      warning: 'M12 3 2.5 20h19L12 3Zm0 6v4m0 3v.1',
    };
    const visuallyHidden = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' };

    function icon(name) {
      return h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', 'aria-hidden': true,
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
        name === 'stop' ? h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2, fill: 'currentColor', stroke: 'none' })
          : h('path', { d: glyphs[name] }));
    }

    function captureDictationInsertion(inputActions) {
      const span = inputActions.captureInsertion();
      return { ...span, start: span.end };
    }

    function VoiceInput({ sessionId, inputActions, locked }) {
      const current = useRef(null);
      const [phase, setPhase] = useState('idle');
      const [message, setMessage] = useState('');
      const [pending, setPending] = useState('');

      function release(run) {
        if (!run || current.current !== run) return;
        current.current = null;
        run.abort.abort();
        if (run.recorder && run.recorder.state !== 'inactive') run.recorder.stop();
        run.stream?.getTracks().forEach((track) => track.stop());
      }

      function dismiss() {
        release(current.current);
        setMessage('');
        setPending('');
        setPhase('idle');
      }

      useEffect(() => {
        dismiss();
        function onEscape(event) {
          if (event.key !== 'Escape' || !current.current) return;
          event.preventDefault();
          dismiss();
        }
        window.addEventListener('keydown', onEscape);
        return () => {
          window.removeEventListener('keydown', onEscape);
          release(current.current);
        };
      }, [sessionId]);

      function fail(run, text) {
        if (current.current !== run) return;
        release(run);
        setMessage(text);
        setPhase('feedback');
      }

      async function upload(run, chunks, mimeType) {
        run.stream.getTracks().forEach((track) => track.stop());
        if (current.current !== run) return;
        if (!run.delivery) return fail(run, '麥克風錄音已中斷。');
        if (chunks.length === 0) return fail(run, '錄音沒有音訊資料。');
        try {
          const response = await fetch('/api/codex-dictation/recording', {
            method: 'POST', credentials: 'same-origin', redirect: 'error',
            body: new Blob(chunks, { type: mimeType }), signal: run.abort.signal,
          });
          const result = await response.json().catch(() => null);
          if (current.current !== run) return;
          if (!response.ok) return fail(run, result?.error || `無法轉錄錄音（HTTP ${response.status}）。`);
          if (typeof result?.text !== 'string' || !result.text.trim()) return fail(run, '沒有辨識到語音。');
          if (!inputActions.insertText(result.text, run.insertion)) {
            setPending(result.text);
            return fail(run, '草稿已變更。可將逐字稿插入目前游標位置。');
          }
          if (run.delivery === 'send') inputActions.submit();
          dismiss();
        } catch {
          fail(run, '無法連線至 DSH 轉錄服務。');
        }
      }

      async function start() {
        if (locked || current.current) return;
        const run = { abort: new AbortController(), insertion: captureDictationInsertion(inputActions) };
        current.current = run;
        setPhase('requesting');
        try {
          const mimeType = formats.find((type) => window.MediaRecorder?.isTypeSupported(type));
          if (!mimeType || !navigator.mediaDevices?.getUserMedia) {
            return fail(run, '此瀏覽器或網址無法錄製壓縮音訊。請使用 localhost 或 HTTPS 開啟 DSH。');
          }
          const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
          if (current.current !== run) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          run.stream = stream;
          const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 48_000 });
          run.recorder = recorder;
          const chunks = [];
          let size = 0;
          recorder.ondataavailable = ({ data }) => {
            if (current.current !== run || !data.size) return;
            size += data.size;
            if (size > maxBytes) return fail(run, tooLarge);
            chunks.push(data);
          };
          recorder.onerror = () => fail(run, '錄音失敗，請檢查麥克風後重試。');
          recorder.onstop = () => void upload(run, chunks, recorder.mimeType || mimeType);
          const tracks = stream.getAudioTracks();
          function showRecordingWhenReady() {
            if (current.current !== run || !run.started || run.delivery) return;
            if (tracks.some((track) => track.readyState === 'live' && !track.muted)) setPhase('recording');
          }
          for (const track of tracks) {
            track.addEventListener('unmute', showRecordingWhenReady, { signal: run.abort.signal });
          }
          recorder.onstart = () => {
            run.started = true;
            showRecordingWhenReady();
          };
          recorder.start(1000);
        } catch (error) {
          fail(run, error?.name === 'NotAllowedError' ? '請允許 DSH 使用麥克風。' : '無法開啟麥克風。');
        }
      }

      function stop(delivery) {
        const run = current.current;
        if (run?.recorder?.state !== 'recording' || run.delivery) return;
        run.delivery = delivery;
        setPhase('transcribing');
        run.recorder.stop();
      }

      const button = (glyph, label, onClick, disabled = false) => h('button', {
        type: 'button', 'aria-label': label, 'data-dictation-action': glyph, onClick, disabled,
        onMouseDown: (event) => event.preventDefault(),
        style: {
          display: 'inline-grid', placeItems: 'center', width: 28, height: 30, flex: '0 0 auto',
          padding: 0, border: 0, borderRadius: 'var(--dsw-radius-md, 6px)',
          cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
          background: glyph === 'send' ? 'var(--dsw-alias-interactive-bg-hover, transparent)' : 'transparent',
          color: glyph === 'stop' ? 'var(--dsw-alias-state-danger, #e75665)' : 'inherit',
        },
      }, icon(glyph));
      if (phase === 'idle') return button('mic', '開始錄音', start, locked);
      const status = { requesting: '正在啟動麥克風', recording: '錄音中', transcribing: '轉錄中' }[phase];
      return h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, marginInlineStart: 'auto' } },
        h('span', { role: phase === 'feedback' ? 'alert' : 'status', style: visuallyHidden }, status || message),
        (phase === 'requesting' || phase === 'transcribing') && h('span', { style: { display: 'inline-grid', placeItems: 'center', width: 24, opacity: 0.65 } }, icon('wait')),
        phase === 'feedback' && h('span', { title: message, style: { display: 'inline-grid', placeItems: 'center', width: 24 } }, icon('warning')),
        button('cancel', phase === 'feedback' ? '關閉' : '取消錄音或轉錄', dismiss),
        pending && button('insert', '插入逐字稿', () => {
          if (inputActions.insertText(pending, captureDictationInsertion(inputActions))) dismiss();
        }, locked),
        phase === 'recording' && button('stop', '停止並轉錄至草稿', () => stop('draft')),
        phase === 'recording' && button('send', '停止、轉錄並送出聊天草稿', () => stop('send'), locked));
    }

    function apply(ctx) {
      ctx.slots.inject('conversation.input.activity', () => ctx.slots.register({ name: 'conversation.input.activity' }, VoiceInput));
    }

    return { apply, inject: ['slots'] };
  },
});
