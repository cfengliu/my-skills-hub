#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const exts = new Set(['.css', '.scss', '.sass', '.less', '.tsx', '.jsx', '.ts', '.js', '.vue', '.svelte']);
const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.turbo', 'examples']);
const allowFiles = new Set(['SKILL.md']);
const colorRe = /(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\([^\)]*\)|hsla?\([^\)]*\)|oklch\([^\)]*\)|\b(?:black|white|transparent)\b)/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (exts.has(path.extname(entry.name)) && !allowFiles.has(entry.name)) out.push(full);
  }
  return out;
}

const hits = [];
for (const file of walk(path.resolve(root))) {
  const rel = path.relative(process.cwd(), file);
  if (rel.includes('.agents/skills/css-theme-migration')) continue;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    const code = line.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '');
    // Token definitions are the desired destination for theme values.
    if (/^\s*--[\w-]+\s*:/.test(code)) return;
    const matches = code.match(colorRe);
    if (matches) hits.push({ file: rel, line: idx + 1, colors: [...new Set(matches)], text: line.trim().slice(0, 180) });
  });
}

if (!hits.length) {
  console.log('No obvious hardcoded colors found outside tokenized declarations.');
  process.exit(0);
}

console.log(`# Hardcoded colors still present\n`);
for (const hit of hits) {
  console.log(`- ${hit.file}:${hit.line} ${hit.colors.map(c => '`' + c + '`').join(', ')} — ${hit.text}`);
}
process.exit(1);
