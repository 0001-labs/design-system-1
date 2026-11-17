export interface SiteSummary { code: string; name: string; url: string; address?: string; domain?: string; badge?: boolean; canDelete?: boolean; deleting?: boolean; docs?: boolean }
export interface SitePage { path: string; lang: string; title: string; fields: number; edited: number }
export interface SiteField { key: string; tag: string; kind: 'text' | 'meta' | 'image'; label: string; markdown: string; built?: string; edited?: boolean }
export interface PageDetail { path: string; lang: string; title: string; fields: SiteField[] }

const base = (site: string) => `/api/consistency/sites/${encodeURIComponent(site)}`;
export const siteAddress = {
  pages: (site: string) => `${base(site)}/pages`,
  page: (site: string, path: string) => `${base(site)}/page?path=${encodeURIComponent(path)}`,
  document: (site: string, path: string) => `${base(site)}/document?path=${encodeURIComponent(path)}`,
  edit: (site: string) => `${base(site)}/edit`,
  composition: (site: string, path: string) => `${base(site)}/api/composition?path=${encodeURIComponent(path)}`,
  nativePage: (site: string, path: string) => `${base(site)}/api/native-page?path=${encodeURIComponent(path)}`,
};

export const isWordsField = (field: Pick<SiteField, 'kind'>) => field.kind === 'text';

export const isPlainField = (field: Pick<SiteField, 'kind' | 'tag' | 'label'>) =>
  field.kind === 'meta' || /^h[1-6]$/i.test(field.tag) || field.tag.toLowerCase() === 'button' || field.label.toLowerCase() === 'button';

const NAMES: Record<string, string> = {
  h1: 'Main heading', h2: 'Heading', h3: 'Heading', h4: 'Heading', h5: 'Heading', h6: 'Heading',
  p: 'Paragraph', li: 'List item', dt: 'Term', dd: 'Meaning', summary: 'Question', figcaption: 'Caption',
  caption: 'Caption', td: 'Table cell', th: 'Table heading', blockquote: 'Quote', span: 'Words', a: 'Link', button: 'Button',
};
export function fieldName(field: Pick<SiteField, 'tag' | 'label'>): string {
  const label = field.label?.trim();
  if (label && !NAMES[label.toLowerCase()]) return label.charAt(0).toUpperCase() + label.slice(1);
  return NAMES[(label || field.tag).toLowerCase()] ?? NAMES[field.tag.toLowerCase()] ?? 'Words';
}

export function pageGroups(pages: SitePage[]): { lang: string; pages: SitePage[] }[] {
  const groups = new Map<string, SitePage[]>();
  for (const page of pages) groups.set(page.lang, [...(groups.get(page.lang) ?? []), page]);
  return [...groups].map(([lang, list]) => {
    const front = list.reduce((best, page) => (page.path.length < best.path.length ? page : best));
    return { lang, pages: [front, ...list.filter(page => page !== front)] };
  });
}

export const firstPage = (pages: SitePage[]) => pages.find(page => page.path === '/')?.path ?? pages[0]?.path ?? null;

export function siteOrigins(site: Pick<SiteSummary, 'url' | 'address' | 'domain'>): string[] {
  const origins: string[] = [];
  for (const each of [site.url, site.address, site.domain]) {
    if (!each) continue;
    let origin: string;
    try { origin = new URL(/^[a-z][a-z0-9+.-]*:/i.test(each) ? each : `https://${each}`).origin; } catch { continue; }
    if (origin !== 'null' && !origins.includes(origin)) origins.push(origin);
  }
  return origins;
}

export function sitePagePath(href: string, origins: string | Iterable<string>, paths: Iterable<string>): string | null {
  const addresses = typeof origins === 'string' ? [origins] : [...origins];
  let url: URL;
  try { url = new URL(href, addresses[0]); } catch { return null; }
  if (!addresses.includes(url.origin)) return null;
  const known = new Set(paths);
  let decoded = url.pathname;
  try { decoded = decodeURIComponent(url.pathname); } catch {}
  for (const path of new Set([url.pathname, decoded])) {
    const bare = path.replace(/index\.html$/, '');
    for (const each of [path, bare, bare.endsWith('/') ? bare.slice(0, -1) : `${bare}/`]) if (each && known.has(each)) return each;
  }
  return null;
}

export interface Press {
  inEditing: boolean;
  field: boolean;
  link: { href: string } | null;
  mod: boolean;
}
export type PressAction = { do: 'caret' } | { do: 'edit' } | { do: 'go'; path: string } | { do: 'stop' };

export function pressAction(press: Press, site: { origins: string | Iterable<string>; paths: Iterable<string> }): PressAction {
  const page = press.link ? sitePagePath(press.link.href, site.origins, site.paths) : null;
  if (press.link && press.mod) return page ? { do: 'go', path: page } : { do: 'stop' };
  if (press.inEditing) return { do: 'caret' };
  if (press.field) return { do: 'edit' };
  if (page) return { do: 'go', path: page };
  return { do: 'stop' };
}

export function editKey(event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'isComposing'>, plain: boolean): 'cancel' | 'save' | null {
  if (event.isComposing) return null;
  if (event.key === 'Escape') return 'cancel';
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) return 'save';
  if (event.key === 'Enter' && plain && !event.shiftKey) return 'save';
  return null;
}

export function failureWords(status: number, error?: string): string {
  if (status === 401 || status === 403) return 'Your session ended. Sign in again in another tab, then try again.';
  if (error === 'not-editable') return 'This site keeps its words in its own editor.';
  if (error === 'bad-markup') return 'This page is not saved yet. Put < and { inside code, or take them out.';
  if (error === 'unknown-block' || error === 'stale-build') return 'The site was published again. Open the page again to edit it.';
  if (error === 'unknown-field' || error === 'unknown-page') return 'The site was published again. Open the page again to edit it.';
  if (error === 'unknown-email-variable' || error === 'bad-email-variable') return 'Use a form field from the list, with both pairs of braces.';
  if (error === 'bad-email-template') return 'Enter a subject on one line and a message.';
  if (error === 'stale-email-template') return 'This email changed elsewhere. Your draft is kept. Use the saved version to replace it.';
  if (status === 409) return 'This page changed elsewhere. Your edits are still here. Discard these changes to open its latest version.';
  if (error === 'bad-link') return 'Enter a page path or a complete web, email or phone address.';
  if (error === 'composition-too-large') return 'This page has too much added content. Remove an addition and try again.';
  if (error === 'bad-image') return 'Choose one of the site’s own pictures.';
  if (status === 413 || error === 'too-long') return 'Too many words for one field.';
  return 'The site could not be reached. Try again.';
}
