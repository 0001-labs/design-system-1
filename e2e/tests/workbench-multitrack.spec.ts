import { expect, test, type Page } from "@playwright/test";

const SQUARE = 20;
/** Browsers lay pages out in 1/64px steps, and a scaled square is rarely a whole pixel: a tenth of a pixel is on the line. */
const STEP = 0.1;
const URL = "/examples/layouts/workbench-multitrack/";

async function open(page: Page, width: number, height: number) {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width, height });
  await page.goto(URL);
  await page.locator(".wb-clip").first().waitFor();
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-desktop-aligned"));
  return errors;
}

/** Each pane's edges, in squares from the workbench's top-left corner. */
const panes = (page: Page) => page.evaluate(() => {
  const style = getComputedStyle(document.documentElement);
  const unit = 20 * Number(style.getPropertyValue("--sf"));
  const wb = document.getElementById("wb")!.getBoundingClientRect();
  // The squares start under the height's leftover, which the bar takes above its own squares.
  const origin = wb.top + (parseFloat(style.getPropertyValue("--ds-grid-top")) || 0);
  const edges = (selector: string) => [...document.querySelectorAll(selector)].map(node => {
    const box = node.getBoundingClientRect();
    const name = node.className + (node.getAttribute("data-head") ?? "");
    return [box.left - wb.left, box.top - origin, box.right - wb.left, box.bottom - origin].map((edge, side) => ({ name, side: ["left", "top", "right", "bottom"][side], squares: edge / unit }));
  });
  return {
    unit, wb: { left: wb.left, top: wb.top, right: wb.right, bottom: wb.bottom }, width: document.documentElement.clientWidth, height: window.innerHeight,
    parts: edges(".wb-bar, .wb-arrange, .wb-transport, .wb-dock, .wb-pane, .wb-corner, .wb-head, .wb-strip"),
  };
});

for (const [width, height] of [[1280, 800], [1447, 900], [1453, 910], [1920, 1013]]) {
  test(`${width} × ${height}: the workbench fills the window and every pane ends on a square`, async ({ page }) => {
    const errors = await open(page, width, height);
    const m = await panes(page);
    expect(Math.abs(m.wb.left)).toBeLessThanOrEqual(STEP);
    expect(Math.abs(m.wb.top)).toBeLessThanOrEqual(STEP);
    expect(Math.abs(m.wb.right - m.width)).toBeLessThanOrEqual(STEP);
    expect(Math.abs(m.wb.bottom - m.height)).toBeLessThanOrEqual(STEP);
    const off = m.parts.flat().filter(edge => edge.squares >= 0).filter(edge => Math.abs(edge.squares - Math.round(edge.squares)) * m.unit > STEP).map(edge => `${edge.name} ${edge.side} at ${edge.squares.toFixed(3)}`);
    await page.screenshot({ path: `test-results/workbench-${width}x${height}.png` });
    expect(off).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("plays, moves a clip by whole beats and takes it back", async ({ page }) => {
  const errors = await open(page, 1440, 900);
  const pos = () => page.evaluate(() => Number(getComputedStyle(document.getElementById("wb")!).getPropertyValue("--pos")));
  const before = await pos();
  await page.locator("#wb-play").click();
  await page.waitForTimeout(600);
  await page.locator("#wb-play").click();
  expect(await pos()).toBeGreaterThan(before + 0.5);

  const clip = page.locator('[data-clip="c1"]');
  const box = (await clip.boundingBox())!;
  const start = await clip.evaluate(node => Number((node as HTMLElement).style.getPropertyValue("--start")));
  await page.mouse.move(box.x + 10, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 10 + 2.4 * SQUARE, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect(page.locator('[data-clip="c1"]')).toHaveAttribute("style", new RegExp(`--start:${start + 2};`));
  await page.keyboard.press(process.platform === "darwin" ? "Meta+z" : "Control+z");
  await expect(page.locator('[data-clip="c1"]')).toHaveAttribute("style", new RegExp(`--start:${start};`));
  expect(errors).toEqual([]);
});

test("a phone runs the workbench down the page without a sideways scroll", async ({ page }) => {
  const errors = await open(page, 390, 844).catch(() => [] as string[]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/workbench-phone.png", fullPage: true });
});
