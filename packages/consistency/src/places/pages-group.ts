export interface Language {
  code: string;
  name: string;
  prefix: string;
}

export interface LastEdit { editor: string; at: number }

export interface PageSummary { path: string; lang: string; title: string; fields: number; edited: number; lastEdit?: LastEdit | null }

export type FieldKind = 'text' | 'meta' | 'image';
export interface PageField { key: string; tag: string; kind: FieldKind; label: string; markdown: string; built?: string; edited?: boolean; lastEdit?: LastEdit | null }
export interface PageFields { path: string; lang: string; title: string; fields: PageField[] }
export interface DetachedEdit { id?: number; path: string; key: string; markdown: string; editor: string; at: number }

export function languageName(code: string): string {
  if (!code) return 'Every language';
  let name = code;
  try { name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code; } catch {}
  return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
}

const firstSegment = (path: string) => /^\/[^/]+/.exec(path)?.[0] ?? '';

export function languagesOf(pages: readonly Pick<PageSummary, 'path' | 'lang'>[]): Language[] {
  const byLang = new Map<string, string[]>();
  for (const page of pages) byLang.set(page.lang || '', [...(byLang.get(page.lang || '') ?? []), page.path]);
  const front = pages.find(page => page.path === '/')?.lang ?? pages[0]?.lang ?? '';
  const codes = [...byLang.keys()].sort((a, b) => (a === front ? -1 : b === front ? 1 : 0));
  return codes.map(code => {
    const paths = byLang.get(code)!;
    const segment = firstSegment(paths[0] ?? '');
    const shared = !paths.includes('/') && segment && paths.every(path => path === segment || path.startsWith(`${segment}/`));
    return { code, name: languageName(code), prefix: shared ? segment : '' };
  });
}

export interface PageGroup {
  base: string;
  title: string;
  pages: { language: Language; page: PageSummary }[];
  edited: number;
  lastEdit: LastEdit | null;
}

const under = (path: string, prefix: string) => prefix !== '' && (path === prefix || path === `${prefix}/` || path.startsWith(`${prefix}/`));

export function splitPath(path: string, languages: Language[], lang?: string): { language: Language | null; base: string } {
  const named = lang ? languages.find(language => language.code === lang) : undefined;
  const byPrefix = [...languages].sort((a, b) => b.prefix.length - a.prefix.length).find(language => under(path, language.prefix));
  const language = named ?? byPrefix ?? languages.find(language => language.prefix === '') ?? null;
  const base = language && under(path, language.prefix) ? path.slice(language.prefix.length) || '/' : path;
  return { language, base: base.startsWith('/') ? base : `/${base}` };
}

export const pathIn = (base: string, language: Language) => `${language.prefix}${base}`;

export function shortTitle(title: string): string {
  const first = title.split(/ \| | - /)[0]!.trim();
  return first || title.trim();
}

const later = (a: LastEdit | null, b: LastEdit | null) => (!a ? b : !b ? a : b.at > a.at ? b : a);

export function groupPages(pages: PageSummary[], languages: Language[]): PageGroup[] {
  const groups = new Map<string, PageGroup>();
  for (const page of pages) {
    const { language, base } = splitPath(page.path, languages, page.lang);
    const group = groups.get(base) ?? { base, title: '', pages: [], edited: 0, lastEdit: null };
    groups.set(base, group);
    group.pages.push({ language: language ?? { code: page.lang || '', name: page.lang || page.path, prefix: '' }, page });
    group.edited += page.edited || 0;
    group.lastEdit = later(group.lastEdit, page.lastEdit ?? null);
  }
  const order = (language: Language) => { const index = languages.findIndex(each => each.code === language.code); return index < 0 ? languages.length : index; };
  for (const group of groups.values()) {
    group.pages.sort((a, b) => order(a.language) - order(b.language));
    group.title = group.pages.find(each => each.page.title)?.page.title || group.base;
  }
  return [...groups.values()].sort((a, b) => (a.base === '/' ? -1 : b.base === '/' ? 1 : a.base.localeCompare(b.base)));
}

export interface PageRow {
  base: string;
  name: string;
  title: string;
  path: string;
  language: Language;
  edited: string;
  lastEdit: LastEdit | null;
}

export function pageRows(groups: PageGroup[], language: Language | null): PageRow[] {
  return groups.map(group => {
    const there = group.pages.find(each => each.language.code === language?.code) ?? group.pages[0]!;
    return {
      base: group.base,
      name: shortTitle(there.page.title || group.title),
      title: there.page.title || group.title,
      path: there.page.path,
      language: there.language,
      edited: group.edited > 0 ? group.edited.toLocaleString('en-GB') : '',
      lastEdit: group.lastEdit,
    };
  });
}

export const chosenRow = (rows: PageRow[], base: string | null) => rows.find(row => row.base === base) ?? rows[0] ?? null;

export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 155;

export function lengthNote(words: string, limit: number): { count: number; limit: number; over: boolean; words: string } {
  const count = Array.from(words.trim()).length;
  return { count, limit, over: count > limit, words: `${count.toLocaleString('en-GB')} of ${limit.toLocaleString('en-GB')}` };
}

export function clip(words: string, limit: number): string {
  const all = Array.from(words.trim().replace(/\s+/g, ' '));
  if (all.length <= limit) return all.join('');
  const cut = all.slice(0, limit).join('');
  const space = cut.lastIndexOf(' ');
  return (space > limit / 2 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, '');
}

export function shareFields<F extends Pick<PageField, 'kind' | 'tag' | 'label'>>(fields: F[]): { title?: F; description?: F; image?: F } {
  return {
    title: fields.find(field => field.kind === 'meta' && field.tag === 'title'),
    description: fields.find(field => field.kind === 'meta' && field.tag !== 'title'),
    image: fields.find(field => field.kind === 'image'),
  };
}

export function shareCard(title: string, description: string, origin: string): { host: string; title: string; description: string } {
  let host = '';
  try { host = new URL(origin).host.replace(/^www\./, ''); } catch { host = ''; }
  return { host, title: clip(title, TITLE_LIMIT) || 'Untitled', description: clip(description, DESCRIPTION_LIMIT) };
}

const SITE_PATH = /^\/(?![/\\])[A-Za-z0-9._~!$&'()*+,;=:@%/-]*$/;

export function pickerImages(images: readonly unknown[] | undefined, current?: string): string[] {
  const out: string[] = [];
  for (const image of [...(images ?? []), current]) if (typeof image === 'string' && SITE_PATH.test(image) && !out.includes(image)) out.push(image);
  return out;
}

export const siteFile = (code: string, path: string) => `/api/consistency/sites/${encodeURIComponent(code)}/files${path.split('/').map(encodeURIComponent).join('/')}`;

export const when = (at: number) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(at);
