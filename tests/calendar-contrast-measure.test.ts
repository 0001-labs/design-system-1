// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, webkit, devices, type Browser } from 'playwright';

let server: ViteDevServer;
beforeAll(async () => {
  server = await createServer({ configFile: false, root: process.cwd(), logLevel: 'error', server: { host: '127.0.0.1', port: 0 } });
  await server.listen();
});
afterAll(async () => { await server.close(); });

for (const engine of ['chromium', 'webkit'] as const) describe(engine, () => {
  let browser: Browser;
  beforeAll(async () => { browser = await ({ chromium, webkit }[engine]).launch({ headless: true }); });
  afterAll(async () => { await browser.close(); });
  test('calendar labels remain readable as the painted paper changes', async () => {
    const page = await browser.newPage(engine === 'webkit' ? devices['iPhone 14'] : {});
    try {
      await page.route('**/calendar-contrast', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/DS1/1-root/one.css"><style>body{margin:20px}ds-calendar{--ds-sf:1}</style><ds-calendar month="2026-11" today="2026-11-06" value="2026-11-15" selectable day-width="2" fixed></ds-calendar><script type="module">import "/DS1/3-unit/ds-calendar.ts";</script>' }));
      await page.goto(server.resolvedUrls!.local[0] + 'calendar-contrast');
      await page.evaluate(async () => {
        await customElements.whenDefined('ds-calendar');
        await (document.querySelector('ds-calendar') as any).updateComplete;
        await document.fonts.ready;
      });
      let geometry: number[] | undefined;
      for (const [scheme, paper] of [['light', '#ffffff'], ['light', '#e9e9e9'], ['light', '#f4f1ed'], ['light', '#f1f0ee'], ['dark', '#2c2c2c'], ['light', '#2c2c2c'], ['light', '#594dff'], ['light', '#ffffff']] as const) {
        const result = await page.evaluate(async ({ scheme, paper }) => {
          document.documentElement.style.colorScheme = scheme;
          document.body.style.background = paper;
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          const { colorReader, contrastRatio, composite } = await new Function('return import("/DS1/0-face/text-contrast.ts")')();
          const read = colorReader(document);
          const background = read(getComputedStyle(document.body).backgroundColor);
          const calendar = document.querySelector('ds-calendar')!;
          const box = calendar.getBoundingClientRect();
          const samples = [...calendar.shadowRoot!.querySelectorAll<HTMLElement>('.today-button,.weekday-name,#title')].map(element => {
            const style = getComputedStyle(element);
            return { selector: element.id || element.className, today: element.hasAttribute('data-today'), color: style.color, opacity: style.opacity, ratio: contrastRatio(composite(read(style.color), background), background) };
          });
          const marks = ['today', 'selected'].map(state => {
            const element = calendar.shadowRoot!.querySelector<HTMLElement>(`.day[data-${state}] .date`)!;
            const style = getComputedStyle(element);
            return { state, background: style.backgroundColor, ratio: contrastRatio(read(style.color), read(style.backgroundColor)) };
          });
          return { samples, marks, geometry: [box.x, box.y, box.width, box.height], value: (calendar as any).value, coarse: matchMedia('(pointer:coarse)').matches };
        }, { scheme, paper });
        expect(result.coarse).toBe(engine === 'webkit');
        expect(result.samples.length).toBeGreaterThan(7);
        for (const sample of result.samples) {
          expect(sample.opacity).toBe('1');
          expect(sample.ratio, `${paper}: ${sample.selector}`).toBeGreaterThanOrEqual(4.5);
        }
        if (paper === '#ffffff') {
          expect(result.samples.find(sample => sample.today)?.color).toBe('rgb(222, 3, 49)');
          expect(result.samples.find(sample => sample.selector === 'today-button')?.color).toBe('rgb(110, 110, 110)');
        }
        for (const mark of result.marks) expect(mark.ratio, mark.state).toBeGreaterThanOrEqual(4.5);
        expect(result.value).toBe('2026-11-15');
        if (geometry) expect(result.geometry).toEqual(geometry);
        geometry = result.geometry;
      }
      await page.evaluate(async () => {
        document.body.style.background = '#2c2c2c';
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
      });
      await page.locator('ds-calendar .today-button').hover();
      const hoverContrast = await page.evaluate(async () => {
        const { colorReader, contrastRatio } = await new Function('return import("/DS1/0-face/text-contrast.ts")')();
        const read = colorReader(document);
        return contrastRatio(read(getComputedStyle(document.querySelector('ds-calendar')!.shadowRoot!.querySelector('.today-button')!).color), read(getComputedStyle(document.body).backgroundColor));
      });
      expect(hoverContrast).toBeGreaterThanOrEqual(4.5);
      await page.locator('ds-calendar .day[data-day="2026-11-06"]').click();
      await page.waitForFunction(() => document.querySelector('ds-calendar')!.shadowRoot!.querySelector('.day[data-today][data-selected]'));
      await page.locator('ds-calendar .today-button').click();
      expect(await page.evaluate(() => (document.querySelector('ds-calendar') as any).value)).toBe('2026-11-06');
    } finally { await page.close(); }
  });
});
