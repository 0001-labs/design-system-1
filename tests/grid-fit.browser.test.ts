import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { chromium, webkit, type Browser, type Page } from 'playwright';

let bundle: string;
beforeAll(async () => {
  bundle = (await build({ stdin: { contents: "export { initGridFit } from './DS1/0-face/grid-fit';", resolveDir: fileURLToPath(new URL('..', import.meta.url)), loader: 'ts' }, bundle: true, format: 'iife', globalName: 'GridFit', write: false })).outputFiles[0]!.text;
});
const settle = (page: Page) => page.evaluate(async () => {
  await document.fonts.ready;
  for (let i = 0; i < 8; i++) await new Promise(requestAnimationFrame);
});
async function start(page: Page, html: string, unit = '20px') {
  await page.setContent(`<style>:root{--ds-grid-unit:${unit}}*{box-sizing:border-box}body{margin:0}</style>${html}`);
  await page.addScriptTag({ content: bundle });
  await page.evaluate(() => {
    (window as any).fits = 0;
    window.addEventListener('design-system-layout-sized', () => (window as any).fits++);
    (window as any).GridFit.initGridFit();
  });
  await settle(page);
}
for (const [engine, launcher] of [['chromium', chromium], ['webkit', webkit]] as const) describe(engine, () => {
  let browser: Browser;
  beforeAll(async () => { browser = await launcher.launch({ headless: true }); });
  afterAll(async () => { await browser.close(); });
  test('nested areas, nested scopes and siblings retain child-before-parent geometry', async () => {
    const page = await browser.newPage();
    try {
      await start(page, '<main data-ds-grid-fit><section id="parent" data-ds-area style="padding:3px"><div data-ds-grid-fit><div id="short" data-ds-area style="height:21px"></div><div id="tall" data-ds-area style="height:41px"></div></div></section><div id="empty" data-ds-area></div><div id="hidden" data-ds-area style="display:none;height:81px"></div></main>');
      const geometry = () => page.locator('[data-ds-area]').evaluateAll(es => es.map(e => ({ id: e.id, height: e.getBoundingClientRect().height })));
      expect(await geometry()).toEqual([{ id: 'parent', height: 120 }, { id: 'short', height: 40 }, { id: 'tall', height: 60 }, { id: 'empty', height: 0 }, { id: 'hidden', height: 0 }]);
      const before = await geometry();
      await page.evaluate(() => { window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('language-changed')); });
      await settle(page);
      expect(await geometry()).toEqual(before);
      const fits = await page.evaluate(() => (window as any).fits);
      await page.evaluate(() => (window as any).GridFit.initGridFit());
      await settle(page);
      expect(await page.evaluate(() => (window as any).fits)).toBe(fits);
    } finally { await page.close(); }
  });
  test('fractional squares retain browser 64th-pixel rounding and the tolerance', async () => {
    const page = await browser.newPage();
    try {
      await start(page, '<main data-ds-grid-fit><div id="near" data-ds-area style="height:58.82px"></div><div id="over" data-ds-area style="height:58.86px"></div></main>', '29.42px');
      expect(await page.locator('#near').evaluate(e => (e as HTMLElement).style.minHeight)).toBe('58.8125px');
      expect(await page.locator('#over').evaluate(e => e.getBoundingClientRect().height)).toBe(88.21875);
    } finally { await page.close(); }
  });
  test('content and scale changes grow and shrink, then detached scopes restore original minima', async () => {
    const page = await browser.newPage();
    try {
      await start(page, '<main data-ds-grid-fit><div id="area" data-ds-area style="min-height:7px"><div id="content" style="height:21px"></div></div></main>');
      const height = () => page.locator('#area').evaluate(e => e.getBoundingClientRect().height);
      expect(await height()).toBe(40);
      await page.locator('#content').evaluate(e => (e as HTMLElement).style.height = '81px');
      await settle(page); expect(await height()).toBe(100);
      await page.locator('#content').evaluate(e => (e as HTMLElement).style.height = '21px');
      await settle(page); expect(await height()).toBe(40);
      await page.evaluate(() => { document.documentElement.style.setProperty('--ds-grid-unit', '30px'); window.dispatchEvent(new Event('scaling-changed')); });
      await settle(page); expect(await height()).toBe(30);
      await page.evaluate(() => { const added = document.createElement('div'); added.id = 'added'; added.setAttribute('data-ds-area', ''); added.style.height = '31px'; document.querySelector('main')!.append(added); });
      await settle(page);
      expect(await page.locator('#added').evaluate(e => e.getBoundingClientRect().height)).toBe(60);
      await page.evaluate(() => { (window as any).removed = document.querySelector('#area'); document.querySelector('main')!.remove(); window.dispatchEvent(new Event('resize')); });
      await settle(page);
      expect(await page.evaluate(() => (window as any).removed.style.minHeight)).toBe('7px');
      const fits = await page.evaluate(() => (window as any).fits);
      await settle(page); expect(await page.evaluate(() => (window as any).fits)).toBe(fits);
    } finally { await page.close(); }
  });
});

test('sibling count does not multiply actual browser layouts', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const counts: number[] = [];
    for (const count of [1, 40]) {
      const page = await browser.newPage();
      try {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Performance.enable');
        const metric = async () => (await cdp.send('Performance.getMetrics')).metrics.find(m => m.name === 'LayoutCount')!.value;
        const before = await metric();
        await start(page, `<main data-ds-grid-fit>${'<div data-ds-area style="height:21px"></div>'.repeat(count)}</main>`);
        counts.push(await metric() - before);
        expect(await page.locator('[data-ds-area]').evaluateAll(es => [...new Set(es.map(e => e.getBoundingClientRect().height))])).toEqual([40]);
      } finally { await page.close(); }
    }
    expect(counts[1]).toBeLessThanOrEqual(counts[0]! + 4);
  } finally { await browser.close(); }
});
