import { constraints, measureConstraints, type Constraint } from './constraints';
import { calculateScalingFactor, defaultScalingConfig } from './scaling';

export const PHONE_WIDTHS = [320, 375, 393, 430];
export const VIEWPORT_WIDTHS = [...PHONE_WIDTHS, 768, 1024, 1440];
export const PAGES_AT_ONCE = 3;

export type SiteFinding = { code: string; rule: string; message: string; element: string; review?: boolean };
export type PageCheck = { findings: SiteFinding[]; measured: Record<string, number> };
export type PageResult = PageCheck & { url: string; width: number; error?: string };

export function describeElement(element: Element): string {
  const name = element.localName + (element.id ? `#${element.id}` : '') + Array.from(element.classList, c => `.${c}`).join('');
  const words = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return words ? `${name} "${words}"` : name;
}

export function sitemapPages(xml: string, origin: string): string[] {
  const pages = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].flatMap(([, loc]) => {
    try {
      const url = new URL(loc!.replace(/&amp;/g, '&'), origin);
      return url.origin === origin ? [url.href] : [];
    } catch {
      return [];
    }
  });
  return [...new Set(pages)];
}

export async function findSitePages(page: Document = document): Promise<string[]> {
  const { origin } = page.location ?? window.location;
  try {
    const answer = await fetch(new URL('/sitemap.xml', origin));
    if (answer.ok) {
      const pages = sitemapPages(await answer.text(), origin);
      if (pages.length) return pages;
    }
  } catch {}
  const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href]'), link => new URL(link.href, origin))
    .filter(url => url.origin === origin && !/\.\w+$/.test(url.pathname))
    .map(url => `${url.origin}${url.pathname}`);
  return [...new Set([`${origin}${(page.location ?? window.location).pathname}`, ...links])];
}

const wait = (ms: number) => new Promise(done => setTimeout(done, ms));

export async function inspectInFrame(host: Element | ShadowRoot, url: string, widths: number[] = VIEWPORT_WIDTHS, height = 844): Promise<PageCheck[]> {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  frame.style.cssText = `position:absolute;top:0;left:-1000px;width:${widths[0]}px;height:${height}px;border:0;visibility:hidden;pointer-events:none`;
  const address = new URL(url);
  address.searchParams.set('ph', 'out');
  try {
    const loaded = new Promise<void>((done, fail) => {
      frame.addEventListener('load', () => done(), { once: true });
      setTimeout(() => fail(new Error('did not load in 30 seconds')), 30_000);
    });
    frame.src = address.href;
    host.appendChild(frame);
    await loaded;
    const page = frame.contentDocument;
    if (!page?.documentElement) throw new Error('could not be read');
    await page.fonts?.ready;
    const root = page.documentElement;
    const checks: PageCheck[] = [];
    for (const width of widths) {
      frame.style.width = `${width}px`;
      root.style.setProperty('--sf', String(calculateScalingFactor(width, { ...defaultScalingConfig, snap: 'layout' })));
      root.setAttribute('data-mobile', '');
      void root.scrollWidth;
      await wait(80);
      checks.push(checkPage(page));
    }
    return checks;
  } finally {
    frame.remove();
  }
}

export function checkPage(page: ParentNode): PageCheck {
  const measured: Record<string, number> = {};
  const findings: SiteFinding[] = [];
  for (const { constraint, measured: count, findings: found } of measureConstraints(page)) {
    measured[constraint.code] = count;
    for (const { message, element, review } of found) findings.push({ code: constraint.code, rule: constraint.rule, message, element: describeElement(element), ...(review ? { review } : {}) });
  }
  return { findings, measured };
}

export async function checkSite({ pages, widths = VIEWPORT_WIDTHS, inspect, onResult, signal, atOnce = PAGES_AT_ONCE }: {
  pages: string[];
  widths?: number[];
  inspect: (url: string, widths: number[]) => Promise<PageCheck[]>;
  onResult: (result: PageResult, done: number, total: number) => void;
  signal?: AbortSignal;
  atOnce?: number;
}): Promise<PageResult[]> {
  const kept = storedNow();
  const results: PageResult[] = [];
  const total = pages.length * widths.length;
  const queue = [...pages];
  const next = async (): Promise<void> => {
    for (let url = queue.shift(); url && !signal?.aborted; url = queue.shift()) {
      const checks = await inspect(url, widths).catch((error: Error) => error);
      for (const [index, width] of widths.entries()) {
        const result: PageResult = checks instanceof Error
          ? { url, width, findings: [], measured: {}, error: checks.message }
          : { url, width, ...(checks[index] ?? { findings: [], measured: {} }) };
        results.push(result);
        if (!signal?.aborted) onResult(result, results.length, total);
      }
    }
  };
  try {
    await Promise.all(Array.from({ length: Math.max(1, atOnce) }, next));
  } finally {
    putBack(kept);
  }
  return results;
}

function storedNow(): Map<string, string> | null {
  try {
    return new Map(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)!]));
  } catch {
    return null;
  }
}

function putBack(kept: Map<string, string> | null): void {
  if (!kept) return;
  try {
    for (const key of Object.keys(localStorage)) if (!kept.has(key)) localStorage.removeItem(key);
    for (const [key, value] of kept) if (localStorage.getItem(key) !== value) localStorage.setItem(key, value);
  } catch {}
}

export type RuleSummary = { constraint: Constraint; measured: number; views: number; broken: number };

export function summarizeRules(results: PageCheck[]): RuleSummary[] {
  return constraints.map(constraint => {
    const counts = results.map(result => result.measured[constraint.code] ?? 0);
    return {
      constraint,
      measured: counts.reduce((sum, count) => sum + count, 0),
      views: counts.filter(count => count > 0).length,
      broken: results.reduce((sum, result) => sum + result.findings.filter(finding => finding.code === constraint.code && !finding.review).length, 0),
    };
  });
}

const count = (n: number, [one, many]: [string, string]) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

export function ruleLine({ constraint, measured, views, broken }: RuleSummary, total: number): string {
  if (!measured) return `Nothing to measure: no ${constraint.measures[1]} ${total === 1 ? 'on this page' : 'on these pages'}.`;
  const where = total === 1 ? 'on this page' : `on ${views.toLocaleString('en')} of ${total.toLocaleString('en')} page views`;
  return broken
    ? `Broken ${broken === 1 ? 'once' : `${broken.toLocaleString('en')} times`}, among ${count(measured, constraint.measures)} measured ${where}.`
    : `Kept by ${count(measured, constraint.measures)} measured ${where}.`;
}

export function summarizePages(results: PageResult[]): { url: string; widths: { width: number; broken: number; error?: string }[] }[] {
  const pages = new Map<string, { width: number; broken: number; error?: string }[]>();
  for (const { url, width, findings, error } of results) {
    pages.set(url, [...(pages.get(url) ?? []), { width, broken: findings.filter(finding => !finding.review).length, error }].sort((a, b) => a.width - b.width));
  }
  return [...pages].map(([url, widths]) => ({ url, widths }));
}
