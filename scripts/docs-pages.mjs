#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = process.argv[2] ? resolve(process.argv[2]) : join(root, 'website/dist');
const content = join(root, 'website/src/content/docs');
const out = join(dist, 'docs-pages');
const decode = text => Buffer.from(text, 'base64url').toString('utf8');
const walk = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? (path === out ? [] : walk(path)) : [path];
});
const MARK = /<template data-doc-block="(atom|text|esm)\.([\w-]+)"><\/template>|<template data-doc-block-end="([\w-]+)"><\/template>/g;

export function splitFile(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  return match ? { frontmatter: match[1], body: text.slice(match[0].length) } : { frontmatter: '', body: text };
}
const field = (frontmatter, name) => {
  const line = new RegExp(`^${name}:\\s*(.*)$`, 'm').exec(frontmatter)?.[1]?.trim() ?? '';
  return line.replace(/^(["'])(.*)\1$/, '$2');
};
function extract(html) {
  const marks = [...html.matchAll(MARK)];
  if (!marks.length) return null;
  const end = marks.at(-1);
  if (!end[3]) throw new Error('A page has block markers but no end marker.');
  const blocks = marks.slice(0, -1).map((mark, index) => ({
    kind: mark[1],
    source: decode(mark[2]),
    html: html.slice(mark.index + mark[0].length, marks[index + 1].index).trim(),
  }));
  return { file: decode(end[3]), blocks, html: html.replace(MARK, '') };
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  if (existsSync(out)) rmSync(out, { recursive: true });
  const pages = [];
  for (const path of walk(dist).filter(file => file.endsWith('.html'))) {
    const html = readFileSync(path, 'utf8');
    if (!html.includes('data-doc-block')) continue;
    const page = extract(html);
    if (!page) continue;
    writeFileSync(path, page.html);
    const address = `/${relative(dist, dirname(path)).split(sep).join('/')}/`.replace(/^\/\.?\/$/, '/').replace(/^\/\//, '/');
    const { frontmatter, body } = splitFile(readFileSync(join(content, page.file), 'utf8'));
    const imports = page.blocks.filter(block => block.kind === 'esm').map(block => block.source);
    const words = imports.reduce((text, line) => text.replace(line, ''), body).trim();
    const head = imports.join('\n');
    const record = {
      path: address, file: page.file, mdx: page.file.endsWith('.mdx'),
      title: field(frontmatter, 'title'), description: field(frontmatter, 'description'),
      head, blocks: page.blocks.filter(block => block.kind !== 'esm'),
      source: head ? `${head}\n\n${words}` : words,
    };
    const name = address === '/' ? 'index-page' : address.slice(1, -1);
    mkdirSync(dirname(join(out, `${name}.json`)), { recursive: true });
    writeFileSync(join(out, `${name}.json`), JSON.stringify(record));
    pages.push({ path: address, title: record.title, description: record.description, file: page.file });
  }
  pages.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'pages.json'), JSON.stringify(pages));
  console.log(`docs-pages: ${pages.length} pages ready to edit`);
}
