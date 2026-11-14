import { expect, test, type Page } from "@playwright/test";

const SQUARE = 20;
/** Browsers lay pages out in 1/64px steps; an edge may be one step off. */
const STEP = 1 / 64 + 0.005;

const measure = (page: Page) => page.evaluate(() => {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const rect = (id: string) => { const r = document.getElementById(id)!.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  return {
    width: root.clientWidth,
    height: root.clientHeight,
    factor: Number(style.getPropertyValue("--sf")),
    columns: Number(style.getPropertyValue("--ds-grid-columns")),
    rows: Number(style.getPropertyValue("--ds-grid-rows")),
    top: parseFloat(style.getPropertyValue("--ds-grid-top")),
    aligned: root.hasAttribute("data-desktop-aligned"),
    scroll: root.scrollHeight,
    down: rect("down"), across: rect("across"), last: rect("last"),
  };
});

async function open(page: Page, width: number, height: number, query = "") {
  await page.setViewportSize({ width, height });
  await page.goto(`/e2e/fixtures/desktop-aligned.html${query}`);
  await page.evaluate(() => (window as unknown as { ready: Promise<unknown> }).ready);
}

for (const [width, height] of [[1280, 800], [1366, 768], [1440, 900], [1447, 900], [1453, 910], [1512, 982], [1920, 1013]]) {
  test(`${width} × ${height}: whole squares across, the leftover on top, the bottom on a square`, async ({ page }) => {
    await open(page, width, height);
    const m = await measure(page);
    const square = SQUARE * m.factor;
    expect(m.aligned).toBe(true);
    expect(Math.abs(m.factor - 1)).toBeLessThan(0.01);
    // The last square across ends on the window's right edge.
    expect(m.across.width / square).toBeCloseTo(m.columns, 2);
    expect(Math.abs(m.across.right - m.width)).toBeLessThanOrEqual(STEP);
    expect(Math.abs(m.last.right - m.width)).toBeLessThanOrEqual(STEP);
    // The leftover is under one square and stands above the first row.
    expect(m.top).toBeGreaterThanOrEqual(0);
    expect(m.top).toBeLessThan(square);
    expect(Math.abs(m.down.top - m.top)).toBeLessThanOrEqual(STEP);
    // The last row ends on the window's bottom edge, and nothing scrolls.
    expect(Math.abs(m.down.bottom - m.height)).toBeLessThanOrEqual(STEP);
    expect(Math.abs(m.last.bottom - m.height)).toBeLessThanOrEqual(STEP);
    expect(m.scroll).toBeLessThanOrEqual(m.height);
  });
}

test("resizing the window aligns it again, and turning the mode off returns to a 20px square", async ({ page }) => {
  await open(page, 1447, 900);
  expect((await measure(page)).columns).toBe(72);
  await page.setViewportSize({ width: 1453, height: 910 });
  await expect.poll(async () => (await measure(page)).columns).toBe(73);
  const resized = await measure(page);
  expect(Math.abs(resized.across.right - 1453)).toBeLessThanOrEqual(STEP);
  expect(Math.abs(resized.down.bottom - 910)).toBeLessThanOrEqual(STEP);
  await page.evaluate(() => (window as unknown as { align: (on: boolean) => void }).align(false));
  const off = await measure(page);
  expect(off.aligned).toBe(false);
  expect(off.factor).toBe(1);
  expect(off.down.top).toBe(0);
  expect(Number.isNaN(off.top)).toBe(true);
});

test("the grid overlay grows and shrinks with the square, and leaves out the rule at the leftover's edge", async ({ page }) => {
  // 1440 × 910: a 20px square, 45 rows and 10px left over on top.
  await open(page, 1440, 910, "?grid=1");
  const drawn = () => page.evaluate(() => {
    const grid = document.querySelector("[data-ds-grid-overlay]")!.shadowRoot!.querySelector(".grid")!;
    const own = getComputedStyle(grid), after = getComputedStyle(grid, "::after");
    return { lines: own.backgroundImage, tile: own.backgroundSize, rules: after.backgroundImage, ruleTile: after.backgroundSize, mask: after.maskImage || after.webkitMaskImage };
  });
  const on = await drawn();
  expect((await measure(page)).top).toBe(10);
  // One repeating gradient across the overlay, never a tile a square wide: browsers round tiles to
  // whole pixels, so a 20.14px square drawn as tiles drifts off the page's squares.
  for (const image of [on.lines, on.rules]) expect(image).toContain("repeating-linear-gradient");
  for (const tile of [on.tile, on.ruleTile]) expect(tile).toBe("auto");
  // Rules start at the leftover, and everything down to 1px past it is masked out.
  expect(on.rules).toContain("10px");
  expect(on.mask).toContain("11px");
  // At another width the lines follow the scaled square.
  await page.setViewportSize({ width: 1453, height: 910 });
  await expect.poll(async () => (await measure(page)).columns).toBe(73);
  expect((await drawn()).lines).toMatch(/19\.9\d*px/);
  await page.evaluate(() => (window as unknown as { align: (on: boolean) => void }).align(false));
  const off = await drawn();
  expect(off.rules).not.toContain("10px");
  expect(off.mask).toMatch(/-\d{5,}/);
});
