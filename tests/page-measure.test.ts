// @vitest-environment node
// Real layout: ds-page is drawn in Chromium and its columns are measured against the 20px square.
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import { chromium, type Browser, type Page as BrowserPage } from "playwright";
import { createServer, type ViteDevServer } from "vite";
import type { AddressInfo } from "node:net";

const UNIT = 20;
let server: ViteDevServer;
let browser: Browser;
let page: BrowserPage;

beforeAll(async () => {
  server = await createServer({ configFile: false, root: process.cwd(), logLevel: "error", server: { host: "127.0.0.1", port: 0 } });
  await server.listen();
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(`http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}/tests/fixtures/page-measure.html`);
  await page.waitForFunction(() => customElements.get("ds-page") !== undefined);
}, 60_000);

afterAll(async () => {
  await browser?.close();
  await server?.close();
});

/** Draws the page at a width and reports the main area's box, relative to the page's own left edge. */
async function measure(options: { layout: string; width: number; measure?: number; style?: string }) {
  return page.evaluate(async ({ layout, width, measure, style }) => {
    document.getElementById("frame")!.style.width = `${width}px`;
    const element = document.querySelector("ds-page") as HTMLElement & { measure?: number; updateComplete: Promise<boolean> };
    element.setAttribute("layout", layout);
    element.style.cssText = style ?? "";
    if (measure === undefined) element.removeAttribute("measure");
    else element.setAttribute("measure", String(measure));
    await element.updateComplete;
    const host = element.getBoundingClientRect();
    const main = element.shadowRoot!.querySelector<HTMLElement>('[data-area="main"]')!.getBoundingClientRect();
    return { left: main.left - host.left, width: main.width, right: host.right - main.right };
  }, options);
}

const widths = [680, 681, 699, 700, 733, 760, 800, 839, 861, 900, 1000, 1119, 1200, 1337, 1400];

test("a column stands on a whole square at every width", async () => {
  for (const width of widths) {
    const box = await measure({ layout: "column", width });
    expect(box.width).toBe(32 * UNIT);
    expect(box.left % UNIT, `column offset at ${width}px`).toBe(0);
    // Centred to the nearest square below: the extra room, under two squares, falls on the trailing side.
    expect(box.left).toBe(UNIT + Math.floor((width - 2 * UNIT - 32 * UNIT) / 2 / UNIT) * UNIT);
    expect(box.right).toBeGreaterThanOrEqual(box.left);
    expect(box.right - box.left).toBeLessThan(2 * UNIT);
  }
});

test("a centred column stands on a whole square at every width", async () => {
  for (const width of widths) {
    const box = await measure({ layout: "centered", width });
    expect(box.width).toBe(16 * UNIT);
    expect(box.left % UNIT, `centred offset at ${width}px`).toBe(0);
    expect(box.left).toBe(UNIT + Math.floor((width - 2 * UNIT - 16 * UNIT) / 2 / UNIT) * UNIT);
  }
});

test("measure sets the column in whole squares and keeps it on the grid", async () => {
  for (const [layout, squares] of [["column", 28], ["column", 30], ["column", 25], ["centered", 36], ["centered", 18]] as const) {
    for (const width of [700, 733, 861, 1000, 1337]) {
      const box = await measure({ layout, width, measure: squares });
      expect(box.width, `${layout} ${squares} at ${width}px`).toBe(Math.min(squares * UNIT, width - 2 * UNIT));
      expect(box.left % UNIT).toBe(0);
    }
  }
});

test("measure beats a --ds-page-measure override, and a fraction or nonsense falls back", async () => {
  expect((await measure({ layout: "column", width: 1000, measure: 20, style: "--ds-page-measure: 600px" })).width).toBe(20 * UNIT);
  expect((await measure({ layout: "column", width: 1000, style: "--ds-page-measure: calc(24 * var(--ds-unit))" })).width).toBe(24 * UNIT);
  expect((await measure({ layout: "column", width: 1000, measure: 20.4 })).width).toBe(20 * UNIT);
  expect((await measure({ layout: "column", width: 1000, measure: 0 })).width).toBe(32 * UNIT);
  expect((await measure({ layout: "centered", width: 1000, measure: -3 })).width).toBe(16 * UNIT);
});

test("below the measure the column takes the width it has and stays one square in", async () => {
  const box = await measure({ layout: "column", width: 620 });
  expect(box.left).toBe(UNIT);
  expect(box.width).toBe(620 - 2 * UNIT);
});

test("phone width keeps the column on a whole square and inside the page's margin", async () => {
  for (const [layout, squares] of [["column", undefined], ["centered", undefined], ["centered", 8]] as const) {
    for (const width of [280, 375, 390, 420, 599]) {
      const box = await measure({ layout, width, measure: squares });
      const wanted = (squares ?? (layout === "column" ? 32 : 16)) * UNIT;
      expect(box.left % UNIT, `${layout} ${squares ?? "default"} at ${width}px`).toBe(0);
      expect(box.left).toBeGreaterThanOrEqual(UNIT);
      expect(box.width).toBe(Math.min(wanted, width - 2 * UNIT));
      expect(box.right).toBeGreaterThanOrEqual(UNIT);
    }
  }
});

test('sidebar and inspector edges follow the hand, cancel safely and remain reachable after scrolling', async () => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.evaluate(async () => {
    document.getElementById('frame')!.style.cssText = 'width:1400px;height:700px';
    const element = document.querySelector('ds-page')!;
    element.setAttribute('layout', 'inspector');
    element.setAttribute('resizable', '');
    element.setAttribute('divided', '');
    element.setAttribute('fill', '');
    element.setAttribute('nav-width', '8');
    element.innerHTML = '<div slot="nav" style="height:1600px">Navigation</div><p>Work</p><aside slot="aside" style="height:1600px">Inspector</aside>';
    await (element as any).updateComplete;
  });
  const nav = page.locator('ds-page').locator('[part="nav"]');
  const edge = page.getByRole('separator', { name: 'Resize sidebar' });
  const before = await nav.boundingBox();
  const box = (await edge.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 57, box.y + 100);
  expect((await nav.boundingBox())!.width - before!.width).toBeCloseTo(57, 0);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect((await nav.boundingBox())!.width).toBe(before!.width);
  await nav.evaluate(element => { element.scrollTop = 500; });
  expect((await edge.boundingBox())!.y).toBe(box.y);
  const inspector = page.getByRole('separator', { name: 'Resize inspector' });
  await inspector.focus();
  await page.keyboard.press('ArrowLeft');
  expect(await page.locator('ds-page').getAttribute('aside-width')).toBe('13');
  // Both scroll viewports fit within the page while the separators stay at their boundaries.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
