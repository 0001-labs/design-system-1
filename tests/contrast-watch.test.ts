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
    expect(found).toEqual([{ code: 'contrast.light.element.ds1.badge.label', message: 'rgb(191, 194, 200) on rgb(133, 137, 235), 1.7:1 (ds-badge) on /lists' }]);

    await toDark(page);
    await page.waitForFunction(() => (window as any).reports.length >= 2);
    await settle(page);
    found = await reports(page);
    // The badge draws its own surface, so it fails in dark as well; the paragraph only in dark.
    expect(found.slice(1).map(f => f.code).sort()).toEqual(['contrast.dark.element.ds1.badge.label', 'contrast.dark.unregistered.p']);
    expect(found.find(f => f.code === 'contrast.dark.unregistered.p')!.message).toMatch(/^rgb\(85, 85, 85\) on rgb\(42, 42, 42\), \d\.\d:1 \(p\) on \/lists$/);
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

test('text under a fade in flight is not measured until the fade has ended', async () => {
  // Black on white once the fades end; halfway through, grey on a pale fill, far under the minimum.
  const page = await fixture(`<style>@keyframes arrive { from { opacity:.1 } to { opacity:1 } }
    #enter { animation: arrive 1200ms linear both } #turn { opacity:.1; transition: opacity 1200ms linear } #turn.on { opacity:1 }
    #stays { opacity:.2 } #late { animation: arrive 1200ms linear both }</style>
    <div id="enter"><p>Arriving words</p></div><div id="turn"><p>Turning words</p></div>
    <div id="late"><p style="color:#ddd">Pale once arrived</p></div><div id="stays"><span>Faded for good</span></div>`);
  try {
    await page.evaluate(() => document.querySelector('#turn')!.classList.add('on'));
    // The watch measures a fading page three more times, an interval apart: those must outlast the fades.
    await start(page, { interval: 450 });
    await page.waitForFunction(() => (window as any).reports.length >= 1);
    // A group that stays faded is a state of the page and is reported at once; nothing in flight is.
    expect((await reports(page)).map(f => f.code)).toEqual(['contrast.light.unregistered.span']);
    // What still fails once its fade has ended is reported then, without another change to the page.
    await page.waitForFunction(() => (window as any).reports.length >= 2);
    await settle(page);
    const found = await reports(page);
    expect(found.map(f => f.code)).toEqual(['contrast.light.unregistered.span', 'contrast.light.unregistered.p']);
    expect(found[1]!.message).toMatch(/^rgb\(221, 221, 221\) on rgb\(255, 255, 255\), 1\.3:1 \(p\) on \/lists$/);
  } finally { await page.close(); }
});

test('a tight idle budget yields before measuring text late in the document', async () => {
  const page = await fixture(`<section>${'<p>Readable</p>'.repeat(800)}</section><p style="color:white">Faint</p>`);
  try {
    await page.evaluate(() => {
      const browserIdle = window.requestIdleCallback;
      let callbacks = 0;
      window.requestIdleCallback = callback => browserIdle(deadline => {
        callbacks++;
        document.body.dataset.idleSlices = String(callbacks);
        callback({ didTimeout: deadline.didTimeout, timeRemaining: () => 0 });
      });
    });
    await start(page);
    await page.waitForFunction(() => (window as any).reports.length === 1);
    expect(await page.evaluate(() => Number(document.body.dataset.idleSlices))).toBeGreaterThan(2);
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
    expect((await reports(page))[0]!.code).toBe('contrast.dark.unregistered.p');
  } finally { await page.close(); }
});

test('one run reports at most maxPerRun findings', async () => {
  const page = await fixture(['#ddd', '#ccc', '#eee', '#d0d0d0', '#e0e0e0'].map((c, i) => `<p class="sample-${i}" style="color:${c}">Faint</p>`).join(''));
  try {
    await start(page, { maxPerRun: 2, selectors: [0, 1, 2, 3, 4].map(i => ({ key: `sample-${i}`, selector: `.sample-${i}` })) });
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
    expect((await reports(page))[0]!.code).toBe('contrast.light.unregistered.p');
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
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem('ds1:contrast-watch')!))).toEqual(['contrast.light.unregistered.p']);
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

test('authored selectors separate identical colours and deduplicate across routes, content and build classes', async () => {
  const page = await fixture('<p class="question build-a" id="private-one" style="color:#aaa">Private words</p><p class="caption build-b" style="color:#aaa">Other words</p>');
  const selectors = [{ key: 'project.question', selector: '.question' }, { key: 'landing.caption', selector: '.caption' }];
  try {
    await start(page, { selectors });
    await page.waitForFunction(() => (window as any).reports.length === 2);
    expect((await reports(page)).map(f => f.code)).toEqual(['contrast.light.element.project.question', 'contrast.light.element.landing.caption']);
    await page.evaluate(() => {
      history.pushState({}, '', '/different-record');
      const text = document.querySelector('p')!;
      text.id = 'another-private-id'; text.className = 'generated-98362 question'; text.textContent = 'Changed user words';
      (text as HTMLElement).style.color = '#bbb';
      (window as any).stop();
    });
    await start(page, { selectors });
    await settle(page);
    expect(await reports(page)).toHaveLength(2);
    expect(JSON.stringify(await reports(page))).not.toMatch(/Private|Changed|private-one|another-private|build-a|98362/);
  } finally { await page.close(); }
});

test('unregistered dynamic classes, IDs and custom tags cannot increase identity cardinality', async () => {
  const page = await fixture('<p>Text</p>');
  try {
    const keys = await page.evaluate(() => {
      const { contrastIdentity, contrastSelectorRegistry } = (window as any).DSContrastWatch;
      const registry = contrastSelectorRegistry(document);
      const keys = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const element = document.createElement(i % 2 ? 'p' : `customer-${i}`);
        element.id = `secret-record-${i}`;
        element.className = `ds-private-${i} person-name-${i} generated-${i}`;
        keys.add(contrastIdentity(element, registry).key);
      }
      return [...keys].sort();
    });
    expect(keys).toEqual(['unregistered.custom', 'unregistered.p']);
  } finally { await page.close(); }
});

test('registry bounds, stable key syntax and shadow-scoped semantic parts are enforced', async () => {
  const page = await fixture('<ds-input id="host"></ds-input>');
  try {
    const result = await page.evaluate(() => {
      const { contrastIdentity, contrastSelectorRegistry } = (window as any).DSContrastWatch;
      const authored = Array.from({ length: 200 }, (_, i) => ({ key: `label-${i}`, selector: `.label-${i}` }));
      const registry = contrastSelectorRegistry(document, [
        { key: 'private user words', selector: 'p' }, { key: 'x'.repeat(41), selector: 'p' },
        { key: 'bad-selector', selector: '[' }, ...authored,
      ]);
      const shadow = document.querySelector('#host')!.attachShadow({ mode: 'open' });
      shadow.innerHTML = '<input part="input"><span class="error-message">Private error</span>';
      const defaults = contrastSelectorRegistry(document);
      return {
        length: registry.length, keys: registry.map((entry: any) => entry.key),
        value: contrastIdentity(shadow.querySelector('input'), defaults).key,
        error: contrastIdentity(shadow.querySelector('span'), defaults).key,
      };
    });
    expect(result.length).toBe(128);
    expect(result.keys).toEqual(Array.from({ length: 128 }, (_, i) => `label-${i}`));
    expect(result.value).toBe('element.ds1.input.value');
    expect(result.error).toBe('element.ds1.input.error');
    expect(`contrast.light.element.${'a'.repeat(40)}`).toMatch(/^[a-z][a-z0-9_.-]{0,79}$/);
  } finally { await page.close(); }
});
