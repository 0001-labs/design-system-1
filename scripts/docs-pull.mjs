#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const content = join(root, 'website/src/content/docs');
const bucket = 'ds-one-libraries';
const scratch = mkdtempSync(join(tmpdir(), 'docs-pull-'));
const wrangler = (...args) => execFileSync('npx', ['wrangler@4.153.0', ...args], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
function read(key) {
  const file = join(scratch, 'object.json');
  wrangler('r2', 'object', 'get', `${bucket}/${key}`, '--remote', '--file', file);
  return JSON.parse(readFileSync(file, 'utf8'));
}
const nameOf = path => (path === '/' ? 'index-page' : path.slice(1, -1));
const field = (frontmatter, name, value) => {
  const line = `${name}: ${/[:#"']/.test(value) ? JSON.stringify(value) : value}`;
  const pattern = new RegExp(`^${name}:.*$`, 'm');
  return pattern.test(frontmatter) ? frontmatter.replace(pattern, line) : `${frontmatter}\n${line}`;
};

const clear = process.argv[2] === '--clear' ? process.argv[3] : null;
try {
  const edited = read('docs/pages/edited.json');
  if (clear) {
    wrangler('r2', 'object', 'delete', `${bucket}/docs/pages/${nameOf(clear)}.json`, '--remote');
    const file = join(scratch, 'edited.json');
    writeFileSync(file, JSON.stringify(edited.filter(path => path !== clear)));
    wrangler('r2', 'object', 'put', `${bucket}/docs/pages/edited.json`, '--remote', '--file', file, '--content-type', 'application/json');
    console.log(`Cleared ${clear}`);
  } else {
    for (const path of edited) {
      const edit = read(`docs/pages/${nameOf(path)}.json`);
      const built = JSON.parse(readFileSync(join(root, 'website/dist/docs-pages', `${nameOf(path)}.json`), 'utf8'));
      const base = createHash('sha256').update(`${built.title}\n${built.description}\n${built.source}`).digest('hex').slice(0, 16);
      if (edit.base !== base) { console.log(`Left alone, its source moved on: ${path}`); continue; }
      const file = join(content, built.file), text = readFileSync(file, 'utf8');
      const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
      const frontmatter = field(field(match?.[1] ?? '', 'title', edit.title), 'description', edit.description);
      writeFileSync(file, `---\n${frontmatter}\n---\n\n${edit.source.trim()}\n`);
      console.log(`Wrote ${built.file}`);
    }
    if (!edited.length) console.log('Nothing saved in Consistency.');
  }
} finally { rmSync(scratch, { recursive: true, force: true }); }
