import { DOC_EXAMPLES } from '../shared/doc-examples';
const locations = (xml: string) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(match => match[1]!.replaceAll('&amp;', '&'));
/** Same-origin sitemap discovery, including Astro indexes and the noindex DS1 example catalogue. */
export async function remoteConstraintPages(site: string, send: typeof fetch = fetch): Promise<string[]> {
  const origin = new URL(site).origin, seen = new Set<string>(), pages = new Set<string>();
  const read = async (address: string): Promise<void> => {
    const url = new URL(address, origin);
    if (url.origin !== origin || seen.has(url.href) || seen.size >= 50) return;
    seen.add(url.href);
    const response = await send(url.href, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (!response?.ok) return;
    for (const location of locations(await response.text())) {
      const page = new URL(location, origin);
      if (page.origin !== origin) continue;
      if (/\.xml$/.test(page.pathname)) await read(page.href); else pages.add(page.href);
    }
  };
  for (const path of ['/sitemap-index.xml', '/sitemap.xml', '/sitemap-0.xml']) await read(path);
  if (['designsystem1.com', 'www.designsystem1.com'].includes(new URL(site).hostname)) for (const example of DOC_EXAMPLES) pages.add(new URL(example.href, origin).href);
  return pages.size ? [...pages] : [new URL('/', site).href];
}

/**
 * Visits every item with this many workers. A visit that answers false could not load at all, which says nothing of a
 * rule and much of how busy the machine is, so it waits for the others and is tried once more alone, `last` set: then
 * the machine has room, and a page that still does not load is the page's fault.
 */
export async function visitAll<T>(items: readonly T[], workers: number, visit: (item: T, last: boolean) => Promise<boolean>): Promise<T[]> {
  const queue = [...items], unopened: T[] = [];
  await Promise.all(Array.from({ length: workers }, async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) if (!await visit(next, false)) unopened.push(next);
  }));
  for (const item of unopened) await visit(item, true);
  return unopened;
}
