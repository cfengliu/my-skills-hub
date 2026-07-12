#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const exts = new Set(['.css', '.scss', '.sass', '.less', '.tsx', '.jsx', '.ts', '.js', '.vue', '.svelte']);
const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.turbo', 'examples']);

const colorRe = /(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|rgba?\([^\)]*\)|hsla?\([^\)]*\)|oklch\([^\)]*\)|\b(?:black|white|transparent|currentColor)\b)/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = walk(path.resolve(root));
const found = new Map();

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const matches = line.match(colorRe);
    if (!matches) return;
    for (const color of matches) {
      if (!found.has(color)) found.set(color, []);
      found.get(color).push({ file: path.relative(process.cwd(), file), line: idx + 1, text: line.trim().slice(0, 180) });
    }
  });
}

const rows = [...found.entries()].sort((a, b) => b[1].length - a[1].length);

console.log(`# Color inventory\n`);
console.log(`Scanned ${files.length} files. Found ${rows.length} unique color values.\n`);
console.log(`| Color | Count | First occurrences |`);
console.log(`|---|---:|---|`);
for (const [color, refs] of rows) {
  const first = refs.slice(0, 3).map(r => `${r.file}:${r.line}`).join('<br>');
  console.log(`| \`${color.replace(/\|/g, '\\|')}\` | ${refs.length} | ${first} |`);
}
