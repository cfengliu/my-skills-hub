window.__ModuleLoader__.load({
  id: 'dsh-codex-imagen',
  factory(require) {
    const React = require('react');
    function View(p) {
      const content = Array.isArray(p.block.content) ? p.block.content : [];
      const images = content.filter(block => block.type === 'image');
      const texts = content.filter(block => block.type === 'text').map(block => block.text);
      return React.createElement('div', { role: p.block.isError ? 'alert' : undefined },
        React.createElement('div', null, 'Codex 圖片生成'),
        images.length ? p.renderSlot('tool.call.images', { images, loadImage: p.loadImage, align: 'start' }) : null,
        ...texts.map((text, index) => React.createElement('p', { key: index, style: { whiteSpace: 'pre-wrap' } }, text)),
        !images.length && !texts.length ? React.createElement('p', null, p.block.isError ? '圖片生成失敗。' : '正在等待 Codex 圖片。') : null,
      );
    }
    return {
      name: 'codex-imagen', inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
          name: 'tool.call.toolview', key: 'imagen_generate',
          children: { 'tool.call.images': { kind: 'single', scope: 'session' } },
        }, View));
      },
    };
  },
});
