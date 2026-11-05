import { afterAll, beforeAll, expect, test } from 'vite-plus/test';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright';
import { join } from 'node:path';

let browser: Browser;
let bundle: string;
beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
  bundle = (await build({ entryPoints: [join(import.meta.dirname, '../DS1/0-face/contrast-watch.ts')], bundle: true, format: 'iife', globalName: 'DSContrastWatch', write: false, logLevel: 'silent' })).outputFiles[0]!.text;
});
afterAll(async () => browser?.close());

type Report = { code: string; message: string };
const reports = (page: Page): Promise<Report[]> => page.evaluate(() => (window as any).reports);
const settle = (page: Page) => page.waitForTimeout(400);

// Served from a path, so the watch reads one; the query and fragment never reach a report.
async function fixture(html: string, url = 'https://watch.test/lists?secret=1#part') {
  const page = await browser.newPage();
  await page.route('https://watch.test/**', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html class="light-theme" data-theme="light"><head>
    <style>html { background:white; color:black; font:14px Arial } body { margin:20px }
    .dark-theme { background:#2a2a2a; color:white }</style></head><body>${html}</body></html>` }));
  await page.goto(url);
  await page.addScriptTag({ content: `${bundle}; window.reports = [];` });
  return page;
}
/** Starts the watch with fast timings unless the test says otherwise. */
const start = (page: Page, options: Record<string, unknown> = {}) => page.evaluate(options => {
  (window as any).stop = (window as any).DSContrastWatch.startContrastWatch({ interval: 0, quiet: 50, report: (f: any) => (window as any).reports.push(f), ...options });
}, options);
const toDark = (page: Page) => page.evaluate(() => {
  const root = document.documentElement;
  root.classList.replace('light-theme', 'dark-theme');
  root.dataset.theme = 'dark';
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'dark', mode: 'dark' } }));
});
const withBadge = (page: Page) => page.evaluate(() => {
  customElements.define('ds-badge', class extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<span class="initials" style="color:#bfc2c8;background:#8589eb">Secret initials</span>'; }
  });
});

test('reports failing text once per theme, with the component and without its words', async () => {
  const page = await fixture(`<ds-badge></ds-badge><p id="night">Private night words</p>
    <style>.dark-theme #night { color:#555 }</style>`);
  try {
    await withBadge(page);
    await start(page);
    await page.waitForFunction(() => (window as any).reports.length >= 1);
    await settle(page);
    let found = await reports(page);
    expect(found).toEqual([{ code: 'contrast.light.ds-badge', message: 'rgb(191, 194, 200) on rgb(133, 137, 235), 1.7:1 (ds-badge · span.initials) on /lists' }]);

    await toDark(page);
    await page.waitForFunction(() => (window as any).reports.length >= 2);
    await settle(page);
    found = await reports(page);
    // The badge draws its own surface, so it fails in dark as well; the paragraph only in dark.
    expect(found.slice(1).map(f => f.code).sort()).toEqual(['contrast.dark.ds-badge', 'contrast.dark.p']);
    expect(found.find(f => f.code === 'contrast.dark.p')!.message).toMatch(/^rgb\(85, 85, 85\) on rgb\(42, 42, 42\), \d\.\d:1 \(p · p#night\) on \/lists$/);
    const count = found.length;

    // The same findings, after a mutation and a return to light, are not reported again.
    await page.evaluate(() => { document.body.append(document.createElement('div')); });
    await page.evaluate(() => {
      document.documentElement.classList.replace('dark-theme', 'light-theme');
      document.documentElement.dataset.theme = 'light';
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: 'light', mode: 'light' } }));
    });
    await settle(page);
    found = await reports(page);
    expect(found).toHaveLength(count);
    expect(JSON.stringify(found)).not.toMatch(/Secret|Private|secret=|#part/);
  } finally { await page.close(); }
});

test('a readable page reports nothing', async () => {
  const page = await fixture('<p>Readable</p><p class="muted">Muted but readable</p><style>.muted { color:#5f5f5f } .dark-theme .muted { color:#cacaca }</style>');
  try {
    await start(page);
    await settle(page);
    await toDark(page);
    await settle(page);
    expect(await reports(page)).toEqual([]);
  } finally { await page.close(); }
});

test('waits for startup appearance to settle before recording contrast', async () => {
  const page = await fixture('<p style="color:white">Startup preview</p>');
  try {
    await page.evaluate(() => {
      const browserIdle = window.requestIdleCallback;
      window.requestIdleCallback = callback => browserIdle(() => {
        callback({ didTimeout: false, timeRemaining: () => 20 });
      });
      (window as any).DSContrastWatch.startContrastWatch({
        quiet: 400,
        report: (finding: Report) => (window as any).reports.push(finding),
      });
      setTimeout(() => { document.querySelector('p')!.style.color = 'black'; }, 200);
    });
    await page.waitForTimeout(800);
    expect(await reports(page)).toEqual([]);
  } finally { await page.close(); }
});

test('the stop function cancels the pending initial scan', async () => {
  const page = await fixture('<p style="color:#ddd">Faint</p>');
  try {
    // Start and cancel in one browser task: a second evaluate permits the scheduled scan to run first.
    await page.evaluate(() => {
      const stop = (window as any).DSContrastWatch.startContrastWatch({ interval: 0, quiet: 50, report: (f: any) => (window as any).reports.push(f) });
      stop();
    });
    await settle(page);
    await toDark(page);
    await settle(page);
    expect(await reports(page)).toEqual([]);
  } finally { await page.close(); }
});

test('stopping after a scan prevents later theme and mutation reports', async () => {
  const page = await fixture('<p>Faint</p><style>p { color:#ddd } .dark-theme p { color:#333 }</style>');
  try {
    await start(page);
    await page.waitForFunction(() => (window as any).reports.length === 1);
    await page.evaluate(() => { (window as any).stop(); (window as any).reports = []; });
    await toDark(page);
    await page.evaluate(() => { document.querySelector('p')!.textContent = 'Changed'; });
    await settle(page);
    expect(await reports(page)).toEqual([]);
    // The changed theme really has a failing target: a new watcher must report it.
    await start(page);
    await page.waitForFunction(() => (window as any).reports.length === 1);
    expect((await reports(page))[0]!.code).toBe('contrast.dark.p');
  } finally { await page.close(); }
});

test('one run reports at most maxPerRun findings', async () => {
  const page = await fixture(['#ddd', '#ccc', '#eee', '#d0d0d0', '#e0e0e0'].map(c => `<p style="color:${c}">Faint</p>`).join(''));
  try {
    await start(page, { maxPerRun: 2 });
    await page.waitForFunction(() => (window as any).reports.length >= 2);
    await settle(page);
    expect(await reports(page)).toHaveLength(2);
  } finally { await page.close(); }
});

test('a hidden page is not measured until it is shown', async () => {
  const page = await fixture('<p style="color:#ddd">Faint</p>');
  try {
    await page.evaluate(() => Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }));
    await start(page);
    await settle(page);
    expect(await reports(page)).toEqual([]);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => (window as any).reports.length >= 1);
    expect((await reports(page))[0]!.code).toBe('contrast.light.p');
  } finally { await page.close(); }
});

test('a finding reported this session is not reported again after a restart', async () => {
  const page = await fixture('<p style="color:#ddd">Faint</p>');
  try {
    await page.evaluate(() => sessionStorage.removeItem('ds1:contrast-watch'));
    await start(page, { storage: undefined });
    await page.waitForFunction(() => (window as any).reports.length >= 1);
    await page.evaluate(() => (window as any).stop());
    await start(page, { storage: undefined });
    await settle(page);
    expect(await reports(page)).toHaveLength(1);
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('ds1:contrast-watch')!))).toEqual(['light|/lists|p|rgb(221, 221, 221)|rgb(255, 255, 255)']);
  } finally { await page.close(); }
});

test('runs are at least the interval apart', async () => {
  const page = await fixture('<p id="night">Night words</p><style>.dark-theme #night { color:#555 }</style>');
  try {
    await start(page, { interval: 10_000, storage: null });
    await settle(page);
    await toDark(page);
    await page.waitForTimeout(800);
    expect(await reports(page)).toEqual([]);
  } finally { await page.close(); }
});

test('a page with very much text is left alone', async () => {
  const page = await fixture(`<div style="color:#ddd">${'<p>Faint</p>'.repeat(4001)}</div>`);
  try {
    await start(page, { storage: null });
    await page.waitForTimeout(800);
    expect(await reports(page)).toEqual([]);
  } finally { await page.close(); }
});

test('the component is the nearest ds- element, else a ds- class, else the tag', async () => {
  const page = await fixture(`<ds-card id="host"><span id="slotted">Slotted</span></ds-card>
    <div class="layout ds-notice--app"><b id="classed">Notice</b></div><em id="plain">Plain</em>`);
  try {
    const names = await page.evaluate(() => {
      const host = document.querySelector('#host')!;
      host.attachShadow({ mode: 'open' }).innerHTML = '<div class="frame"><slot></slot><i id="inner">Inner</i></div>';
      const { contrastComponent } = (window as any).DSContrastWatch;
      return ['#slotted', '#classed', '#plain'].map(s => contrastComponent(document.querySelector(s)))
        .concat(contrastComponent(host.shadowRoot!.querySelector('#inner')));
    });
    expect(names).toEqual(['ds-card', 'notice--app', 'em', 'ds-card']);
  } finally { await page.close(); }
});
