import { blockRuns, parseBlocks, tableAlignments, tableRows, type Block } from '../website/src/vendor/aa/parse.js';

export interface DocBlock { kind: 'atom' | 'text'; source: string; html: string }
export interface DocPage { path: string; file: string; mdx: boolean; title: string; description: string; head: string; source: string; blocks: DocBlock[] }
export interface DocListing { path: string; title: string; description: string; file: string }
export interface DocEdit { path: string; title: string; description: string; source: string; base: string; revision: number; savedAt: number }
export interface DocAtomView { id: number; label: string; html: string }
export interface DocHeading { level: number; id: string; text: string }

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const ATOM = /:doc\[(\d+)\]/g;

function blockEnd(body: string, from: number): number {
  let at = from, fence = '';
  while (at < body.length) {
    const next = body.indexOf('\n', at), end = next < 0 ? body.length : next, line = body.slice(at, end);
    const mark = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) { if (mark?.startsWith(fence)) fence = ''; }
    else if (mark) fence = mark;
    else if (at > from && !line.trim()) return at - 1;
    at = end + 1;
  }
  return body.length;
}

interface Segment { source: string; block?: DocBlock }
export function segments(page: DocPage, body: string): Segment[] {
  const known = [...page.blocks].sort((a, b) => b.source.length - a.source.length), found: Segment[] = [];
  let at = 0;
  while (at < body.length) {
    if (body[at] === '\n' || body[at] === '\r') { at++; continue; }
    const block = known.find(each => {
      if (!body.startsWith(each.source, at)) return false;
      const end = at + each.source.length;
      return end === body.length || body[end] === '\n' && (each.kind === 'atom' || body[end + 1] === '\n' || body[end + 1] === '\r' || known.some(other => body.startsWith(other.source, end + 1)));
    });
    const end = block ? at + block.source.length : blockEnd(body, at);
    found.push({ source: body.slice(at, end), block });
    at = end;
  }
  return found;
}
const bodyOf = (page: DocPage, source: string) => (page.head && source.startsWith(page.head) ? source.slice(page.head.length) : source).trim();

export function toEditable(page: DocPage, source: string): { text: string; atoms: DocAtomView[] } {
  const atoms = new Map<number, DocAtomView>();
  const text = segments(page, bodyOf(page, source)).map(({ source: words, block }) => {
    if (block?.kind !== 'atom') return words;
    const id = page.blocks.indexOf(block);
    atoms.set(id, { id, label: atomLabel(block.source), html: atomPreview(block.html) });
    return `:doc[${id}]`;
  }).join('\n\n');
  return { text, atoms: [...atoms.values()] };
}

export function fromEditable(page: DocPage, text: string): string {
  const body = text.replace(/\n*:doc\[(\d+)\]\n*/g, (whole, id: string) => {
    const block = page.blocks[Number(id)];
    return block?.kind === 'atom' ? `\n\n${block.source}\n\n` : whole;
  }).trim();
  return page.head ? `${page.head}\n\n${body}` : body;
}

const plainWords = (source: string) => source.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
export function docRefusal(page: DocPage, source: string): string | null {
  for (const { source: words, block } of segments(page, bodyOf(page, source))) {
    if (block) continue;
    if (ATOM.test(words)) { ATOM.lastIndex = 0; return 'unknown-block'; }
    ATOM.lastIndex = 0;
    if (page.mdx && (/^(?:import|export)\s/.test(words) || /[<{]/.test(plainWords(words).replace(/\\[<{]/g, '')))) return 'bad-markup';
    if (!page.mdx && /^<[A-Za-z]/.test(words)) return 'bad-markup';
  }
  return null;
}

const slugOf = (words: string) => words.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
const safeHref = (value: string) => (/^(?:https?:\/\/|mailto:|\/(?!\/)|#)/i.test(value) || /^[\w./-]+(?:#[\w-]*)?$/.test(value) ? value : null);

function inline(block: Block): string {
  return blockRuns(block, []).map(run => {
    if (run.kind === 'syntax') return '';
    if (run.kind === 'break') return '<br>';
    const raw = block.source.slice(run.from, run.to);
    if (run.kind === 'atom') {
      const picture = /^!\[([^\]\n]*)\]\(([^\s()]+)(?: "w\d+")?\)$/.exec(raw);
      const address = picture && safeHref(picture[2]!);
      return address ? `<img src="${escape(address)}" alt="${escape(picture![1]!)}" loading="lazy">` : `<code>${escape(raw)}</code>`;
    }
    let text = escape(raw);
    if (run.code) text = `<code dir="auto">${text}</code>`;
    if (run.bold) text = `<strong>${text}</strong>`;
    if (run.italic) text = `<em>${text}</em>`;
    if (run.strike) text = `<s>${text}</s>`;
    if (run.highlight) text = `<mark>${text}</mark>`;
    const address = run.href ? safeHref(run.href) : null;
    return address ? `<a href="${escape(address)}">${text}</a>` : text;
  }).join('');
}
const words = (source: string) => inline({ kind: 'paragraph', source, prefix: 0 } as Block);

function list(items: Block[], used: Set<string>): string {
  void used;
  let html = '';
  for (let at = 0; at < items.length;) {
    const depth = items[at]!.depth ?? 0, ordered = items[at]!.number !== undefined, tag = ordered ? 'ol' : 'ul';
    const start = ordered && items[at]!.number !== 1 ? ` start="${items[at]!.number}"` : '';
    let inner = '';
    while (at < items.length && (items[at]!.depth ?? 0) >= depth && (items[at]!.number !== undefined) === ordered) {
      const item = items[at++]!, nested: Block[] = [];
      while (at < items.length && (items[at]!.depth ?? 0) > depth) nested.push(items[at++]!);
      const box = item.checked === undefined ? '' : `<input type="checkbox" disabled${item.checked ? ' checked' : ''}> `;
      inner += `<li>${box}${inline(item)}${nested.length ? list(nested, used) : ''}</li>`;
    }
    html += `<${tag}${start}>${inner}</${tag}>`;
  }
  return html;
}

function renderWords(source: string, used: Set<string>): string {
  const blocks = parseBlocks(source);
  let html = '';
  for (let at = 0; at < blocks.length; at++) {
    const block = blocks[at]!;
    if (block.kind === 'bullet') {
      const items = [block];
      while (blocks[at + 1]?.kind === 'bullet') items.push(blocks[++at]!);
      html += list(items, used);
    } else if (block.kind === 'heading') {
      const base = slugOf(block.source.replace(/^#+\s*/, ''));
      let id = base;
      for (let count = 1; used.has(id); count++) id = `${base}-${count}`;
      used.add(id);
      html += `<h${block.level} id="${escape(id)}">${inline(block)}</h${block.level}>`;
    } else if (block.kind === 'code') {
      html += `<pre data-ds-not-prose="false"><code>${escape(block.source.split('\n').slice(1, -1).join('\n'))}</code></pre>`;
    } else if (block.kind === 'table') {
      const rows = tableRows(block.source), alignments = tableAlignments(block.source);
      const cell = (tag: string, drawn: { text: string }, index: number) => `<${tag}${alignments[index] ? ` style="text-align:${alignments[index]}"` : ''}>${words(drawn.text)}</${tag}>`;
      html += `<table><thead><tr>${(rows[0] ?? []).map((text, index) => cell('th', text, index)).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map((text, index) => cell('td', text, index)).join('')}</tr>`).join('')}</tbody></table>`;
    } else if (block.kind === 'divider') html += '<hr>';
    else if (block.kind === 'quote' || block.kind === 'callout') html += `<blockquote><p>${inline(block)}</p></blockquote>`;
    else if (block.kind !== 'toc') html += `<p>${inline(block)}</p>`;
  }
  return html;
}

const HEADING = /<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
const unescape = (text: string) => text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&');

export function renderDoc(page: DocPage, source: string): { html: string; headings: DocHeading[] } {
  const parts = segments(page, bodyOf(page, source)), used = new Set<string>();
  for (const { block } of parts) if (block?.kind === 'text') for (const match of block.html.matchAll(HEADING)) used.add(match[2]!);
  const headings: DocHeading[] = [];
  const html = parts.map(({ source: text, block }) => {
    const drawn = block ? block.html : renderWords(text, used);
    if (block?.kind !== 'atom') for (const match of drawn.matchAll(HEADING)) headings.push({ level: Number(match[1]), id: match[2]!, text: unescape(match[3]!.replace(/<[^>]*>/g, '')).trim() });
    return drawn;
  }).join('\n');
  return { html, headings };
}

export const docContents = (headings: DocHeading[], overview = 'Overview') => [`<a href="#_top" data-depth="0">${escape(overview)}</a>`, ...headings.map(heading => `<a href="#${encodeURIComponent(heading.id)}" data-depth="${heading.level - 2}">${escape(heading.text)}</a>`)].join('');

export function atomLabel(source: string): string {
  const tag = /^<([A-Za-z][\w.-]*)/.exec(source)?.[1] ?? 'Block';
  const shown = /\b(?:example|name|id|layout|kind|type)="([^"]+)"/.exec(source)?.[1];
  const named = tag.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^ds-/, '').replace(/-/g, ' ');
  const label = named.charAt(0).toUpperCase() + named.slice(1).toLowerCase();
  return shown ? `${label}: ${shown}` : label;
}

export function atomPreview(html: string, origin = 'https://designsystem1.com'): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '')
    .replace(/\b(src|href)="\/(?!\/)/g, `$1="${origin}/`);
}
