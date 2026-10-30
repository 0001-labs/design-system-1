// @vitest-environment node
// Real layout: button labels remain visible and round up to the grid.
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import { chromium, type Browser } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import type { AddressInfo } from "node:net";

let server: ViteDevServer;
let browser: Browser;
let url = "";

beforeAll(async () => {
  server = await createServer({ configFile: false, root: process.cwd(), logLevel: "error", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  browser = await chromium.launch({ headless: true });
  url = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}/tests/fixtures/cut-fade-measure.html`;
}, 60_000);
afterAll(async () => { await browser?.close(); await server?.close(); });

test("tags keep complete labels in narrow containers and report clipping or fading overrides", async () => {
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await page.evaluate(`import('/DS1/0-face/constraints.ts').then(module => window.tagInspect = module.inspectConstraints)`);
  for (const dir of ['ltr', 'rtl']) {
    const result = await page.evaluate(async dir => {
      document.documentElement.dir = dir;
      const stage = document.getElementById('stage')!;
      stage.innerHTML = '<div style="display:flex;width:60px"><ds-tag>Til gennemgang</ds-tag></div>';
      const tag = stage.querySelector('ds-tag')!;
      await (tag as any).updateComplete;
      await document.fonts.ready;
      const words = tag.shadowRoot!.querySelector<HTMLElement>('.words')!;
      const frame = tag.shadowRoot!.querySelector<HTMLElement>('.frame')!;
      const inspectConstraints = (window as any).tagInspect;
      const inspect = () => inspectConstraints(document).filter((f: any) => f.constraint.code === 'tag.visible-label').length;
      const clean = inspect();
      const fits = words.scrollWidth <= words.clientWidth + 1 && frame.getBoundingClientRect().width > 60;
      words.style.maskImage = 'linear-gradient(black, transparent)';
      const masked = inspect();
      words.style.maskImage = '';
      frame.style.cssText = 'width:60px;overflow:hidden';
      const clipped = inspect();
      frame.style.cssText = '';
      tag.parentElement!.style.overflow = 'hidden';
      const ancestor = inspect();
      tag.parentElement!.style.overflow = '';
      tag.textContent = 'A longer translated status label';
      return { fits, clean, masked, clipped, ancestor, changed: inspect() };
    }, dir);
    expect(result.fits).toBe(true);
    expect(result.clean).toBe(0);
    expect(result.changed).toBe(0);
    expect(result.masked).toBeGreaterThan(0);
    expect(result.clipped).toBeGreaterThan(0);
    expect(result.ancestor).toBeGreaterThan(0);
  }
  await page.close();
});
