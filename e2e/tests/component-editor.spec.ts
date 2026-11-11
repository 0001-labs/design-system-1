import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The base system's component editor in a browser, its base API answered in the page
 * (e2e/fixtures/component-editor.html): the components down the side, the chosen one's states on
 * the grid, the properties in whole squares, the draft shown on the canvas at once and saved
 * after a pause, the selected face's handles under a real pointer, and nothing wider than its window.
 */

const SQUARE = 20;
const open = async (page: Page, query = "") => {
  await page.goto(`/e2e/fixtures/component-editor.html${query}`);
  await page.evaluate(() => (window as unknown as { ready: Promise<unknown> }).ready);
  await expect(page.getByTestId("component-canvas")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
};
const size = (page: Page) => page.getByTestId("component-size").textContent();
const canvasToken = (page: Page, name: string) => page.getByTestId("component-canvas").evaluate((canvas, name) => (canvas as HTMLElement).style.getPropertyValue(name), name);
const saves = (page: Page) => page.evaluate(() => (window as unknown as { saves: { css: string; baseRev: number }[] }).saves);
/** Longer than the draft's pause before it saves (lib/autosave.ts). */
const PAUSE = 1600;
const centre = async (page: Page, testId: string) => {
  const box = (await page.getByTestId(testId).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};
/** Presses a handle, moves the pointer by (dx, dy) in small steps and leaves it held. */
const press = async (page: Page, testId: string, dx: number, dy: number) => {
  const { x, y } = await centre(page, testId);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 6 });
};
/** Moves the pointer over a face: the states' bodies are inert, so the pointer is over the state itself. */
const hover = async (page: Page, locator: Locator) => {
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};
const readouts = (page: Page) => page.locator(".component-editor-readout").allTextContents();
const face = (page: Page, selector = ".component-editor-specimen[aria-selected='true'] .component-editor-specimen-body > *") =>
  page.locator(selector).first().evaluate(element => { const r = element.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); });

test("lists the components, then History and All tokens, as the documentation's sidebar", async ({ page }) => {
  await open(page);
  const sidebar = page.locator(".component-editor-navigation ds-sidebar");
  await expect(sidebar).toHaveAttribute("disclosure-position", "start");
  const rows = await sidebar.evaluate(element => (element as HTMLElement & { items: { label: string }[] }).items.map(item => item.label));
  expect(rows).toEqual(["Components", "Button", "Input", "Checkbox", "Switch", "Tag", "History", "All tokens"]);
});

test("the states stand on the grid, the selected one outlined with its size in plain numbers", async ({ page }) => {
  await open(page);
  await expect.poll(() => size(page)).toBe("100 × 16");
  const offsets = await page.locator(".component-editor-specimen").evaluateAll(specimens => {
    const canvas = document.querySelector(".component-editor-canvas")!.getBoundingClientRect();
    return specimens.map(specimen => { const r = specimen.getBoundingClientRect(); return [r.left - canvas.left, r.top - canvas.top]; });
  });
  expect(offsets).toHaveLength(5);
  for (const [left, top] of offsets) { expect(left % SQUARE).toBe(0); expect(top % SQUARE).toBe(0); }
  // A crisp 1px outline exactly on the face as drawn.
  const handles = page.getByTestId("canvas-handles");
  expect(await handles.evaluate(element => getComputedStyle(element).boxShadow)).toBe("rgb(89, 77, 255) 0px 0px 0px 1px");
  await expect.poll(async () => handles.evaluate(element => { const r = element.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); })).toEqual(await face(page));
  // Another state under the pointer takes a fainter outline; a click selects it.
  const second = page.locator(".component-editor-specimen").nth(1);
  const secondFace = second.locator(".component-editor-specimen-body > *");
  await hover(page, secondFace);
  expect(await secondFace.evaluate(element => getComputedStyle(element).outlineStyle)).toBe("solid");
  await second.click();
  await expect.poll(() => size(page)).toBe("60 × 16");
  // The arrows still move the selection.
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".component-editor-specimen").nth(2)).toHaveAttribute("aria-selected", "true");
});

test("a height steps in whole squares, shows on the canvas at once and saves after a pause", async ({ page }) => {
  await open(page);
  const height = page.locator('ds-number[data-token="--ds-button-size"]');
  await expect(height).toHaveJSProperty("value", 16);
  await height.locator("input").focus();
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("36px");
  await expect.poll(() => size(page)).toBe("100 × 36");
  await expect(page.getByTestId("component-css")).toContainText("--ds-button-size: 36px;");
  // Every state still starts on a whole square, the taller faces included.
  const tops = await page.locator(".component-editor-specimen").evaluateAll(specimens => {
    const canvas = document.querySelector(".component-editor-canvas")!.getBoundingClientRect().top;
    return specimens.map(specimen => specimen.getBoundingClientRect().top - canvas);
  });
  for (const top of tops) expect(top % SQUARE).toBe(0);
  await expect.poll(() => saves(page), { timeout: 5000 }).toHaveLength(1);
  const [save] = await saves(page);
  expect(save!.baseRev).toBe(0);
  expect(save!.css).toContain("--ds-button-size: 36px;");
  // Reset takes the token out again.
  await page.getByTestId("reset--ds-button-size").click();
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("");
  await expect.poll(() => size(page)).toBe("100 × 16");
});

test("width hugs, fills or stands fixed in whole squares", async ({ page }) => {
  await open(page);
  const modes = page.locator('ds-tabs[data-token="--ds-button-inline-size"] ds-button');
  await modes.filter({ hasText: "Fill" }).click();
  await expect.poll(() => canvasToken(page, "--ds-button-inline-size")).toBe("100%");
  await expect.poll(() => size(page)).toBe(`${16 * SQUARE} × 16`);
  await modes.filter({ hasText: "Fixed" }).click();
  await expect.poll(() => canvasToken(page, "--ds-button-inline-size")).toBe("calc(4 * var(--ds-unit, 20px))");
  await expect.poll(() => size(page)).toBe("100 × 16");
  const width = page.locator('ds-number[data-token="--ds-button-inline-size"]');
  await width.locator("input").focus();
  await page.keyboard.press("Shift+ArrowUp");
  await expect.poll(() => size(page)).toBe("160 × 16");
  await modes.filter({ hasText: "Hug" }).click();
  await expect.poll(() => canvasToken(page, "--ds-button-inline-size")).toBe("");
});

test("each component opens from the sidebar with its own properties; a colour comes from the palette", async ({ page }) => {
  await open(page, "?saved=%20%20--ds-tag-size%3A%2036px%3B");
  await page.locator(".component-editor-navigation ds-sidebar").getByText("Tag", { exact: true }).click();
  await expect(page.locator(".component-editor-inspector h2")).toHaveText("Tag");
  await expect.poll(() => canvasToken(page, "--ds-tag-size")).toBe("36px");
  await expect.poll(() => size(page)).toMatch(/ × 36$/);
  await page.locator('select[data-token="--ds-tag-accent"]').selectOption({ label: "Pink" });
  await expect.poll(() => canvasToken(page, "--ds-tag-accent")).toBe("var(--one-pink)");
});

test("never wider than its window, embedded in the documentation or alone", async ({ page }) => {
  for (const [width, query] of [[1440, ""], [1280, ""], [900, "?embed=docs"], [390, ""]] as const) {
    await page.setViewportSize({ width, height: 800 });
    await open(page, query);
    // The handles and every measure showing, a width filling the canvas.
    await page.locator('ds-tabs[data-token="--ds-button-inline-size"] ds-button').filter({ hasText: "Fill" }).evaluate(element => (element as HTMLElement).click());
    await hover(page, page.locator(".component-editor-specimen[aria-selected='true'] .component-editor-specimen-body > *"));
    await page.keyboard.down("Alt");
    await expect(page.getByTestId("canvas-handles")).toHaveAttribute("data-measuring", "");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${width}px`).toBeLessThanOrEqual(0);
    const stage = await page.locator(".component-editor-stage").evaluate(element => element.scrollWidth - element.clientWidth);
    expect(stage, `${width}px stage`).toBeLessThanOrEqual(0);
    await page.keyboard.up("Alt");
  }
});

test("dragging the bottom edge previews a height in whole squares and saves it once on release", async ({ page }) => {
  await open(page);
  await press(page, "handle-height", 0, SQUARE + 2);
  // The preview is on the canvas and in the inspector, not in the draft.
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("36px");
  await expect(page.locator('ds-number[data-token="--ds-button-size"]')).toHaveJSProperty("value", 36);
  expect(await readouts(page)).toEqual(["H 36"]);
  await expect.poll(() => size(page)).toBe("100 × 36");
  await page.waitForTimeout(PAUSE);
  expect(await saves(page)).toHaveLength(0);
  // The handles follow the face as it grows.
  await expect.poll(async () => (await page.getByTestId("canvas-handles").boundingBox())!.height).toBe(36);
  await page.mouse.up();
  await expect.poll(() => saves(page), { timeout: 5000 }).toHaveLength(1);
  expect((await saves(page))[0]!.css).toContain("--ds-button-size: 36px;");
  await page.waitForTimeout(PAUSE);
  expect(await saves(page)).toHaveLength(1);
  await expect(page.getByTestId("handle-height")).toHaveAttribute("aria-valuenow", "36");
});

test("a padding band drags on its step, Shift on its big step, both bands following one token", async ({ page }) => {
  await open(page);
  await press(page, "handle-padding-start", 5, 0);
  await expect.poll(() => canvasToken(page, "--ds-button-padding-size")).toBe("8px");
  expect(await readouts(page)).toEqual(["P 8"]);
  const bands = page.locator(".component-editor-band");
  await expect.poll(() => bands.evaluateAll(elements => elements.map(element => Math.round(element.getBoundingClientRect().width)))).toEqual([8, 8]);
  await page.mouse.up();
  await expect(page.locator('ds-number[data-token="--ds-button-padding-size"]')).toHaveJSProperty("value", 8);
  // The end band grows as it is pulled inward; Shift snaps on a square.
  const end = await centre(page, "handle-padding-end");
  await page.mouse.move(end.x, end.y);
  await page.mouse.down();
  await page.keyboard.down("Shift");
  await page.mouse.move(end.x - 10, end.y, { steps: 6 });
  await expect.poll(() => canvasToken(page, "--ds-button-padding-size")).toBe("20px");
  await page.mouse.up();
  await page.keyboard.up("Shift");
  await expect.poll(() => saves(page), { timeout: 5000 }).toHaveLength(1);
  expect((await saves(page))[0]!.css).toContain("--ds-button-padding-size: 20px;");
});

test("dragging the right edge fixes the width in whole squares; a double-click hugs again", async ({ page }) => {
  await open(page);
  await press(page, "handle-width", SQUARE + 2, 0);
  await expect.poll(() => canvasToken(page, "--ds-button-inline-size")).toBe("calc(6 * var(--ds-unit, 20px))");
  expect(await readouts(page)).toEqual(["W 6 sq"]);
  await page.mouse.up();
  await expect.poll(() => size(page)).toBe("120 × 16");
  await expect(page.locator('ds-tabs[data-token="--ds-button-inline-size"] ds-button[aria-pressed="true"]')).toHaveText("Fixed");
  await page.getByTestId("handle-width").dblclick();
  await expect.poll(() => canvasToken(page, "--ds-button-inline-size")).toBe("");
  await expect.poll(() => size(page)).toBe("100 × 16");
});

test("the corner handle rounds more as it is drawn inward", async ({ page }) => {
  await open(page);
  await press(page, "handle-corner", 6, 6);
  await expect.poll(() => canvasToken(page, "--ds-button-corner-size")).toBe("10px");
  expect(await readouts(page)).toEqual(["R 10"]);
  await page.mouse.up();
  await expect.poll(() => saves(page), { timeout: 5000 }).toHaveLength(1);
  expect((await saves(page))[0]!.css).toContain("--ds-button-corner-size: 10px;");
});

test("Escape during a drag restores the value and saves nothing; a press without a move changes nothing", async ({ page }) => {
  await open(page);
  await press(page, "handle-height", 0, 2 * SQUARE + 2);
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("56px");
  await page.keyboard.press("Escape");
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("");
  await page.mouse.up();
  const { x, y } = await centre(page, "handle-padding-start");
  await page.mouse.click(x, y);
  await page.waitForTimeout(PAUSE);
  expect(await saves(page)).toHaveLength(0);
  await expect(page.getByTestId("component-css")).toBeAttached();
  expect(await page.getByTestId("component-css").textContent()).toBe("No changes yet.");
  await expect.poll(() => size(page)).toBe("100 × 16");
});

test("a double-click on a handle takes its token out, back to the default", async ({ page }) => {
  await open(page, "?saved=%20%20--ds-button-size%3A%2036px%3B");
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("36px");
  await page.getByTestId("handle-height").dblclick();
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("");
  await expect.poll(() => saves(page), { timeout: 5000 }).toHaveLength(1);
  expect((await saves(page))[0]!.css).not.toContain("--ds-button-size");
});

test("each handle is a slider: arrows step it, Shift by its big step, Home and End to its ends", async ({ page }) => {
  await open(page);
  const height = page.getByTestId("handle-height");
  await expect(height).toHaveAttribute("role", "slider");
  await expect(height).toHaveAttribute("aria-orientation", "vertical");
  await expect(height).toHaveAttribute("aria-valuemin", "16");
  await expect(height).toHaveAttribute("aria-valuemax", "56");
  await height.focus();
  await page.keyboard.press("ArrowUp");
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("36px");
  await expect(height).toHaveAttribute("aria-valuenow", "36");
  await page.keyboard.press("End");
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("56px");
  await page.keyboard.press("Home");
  await expect.poll(() => canvasToken(page, "--ds-button-size")).toBe("");
  const padding = page.getByTestId("handle-padding-start");
  await padding.focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect.poll(() => canvasToken(page, "--ds-button-padding-size")).toBe("24px");
  // Keys stay with the handle, not the states' list.
  await expect(page.locator(".component-editor-specimen").first()).toHaveAttribute("aria-selected", "true");
});

test("holding Alt over the selected face shows every measure at once", async ({ page }) => {
  await open(page);
  await hover(page, page.locator(".component-editor-specimen[aria-selected='true'] .component-editor-specimen-body > *"));
  expect(await readouts(page)).toEqual([]);
  await page.keyboard.down("Alt");
  await expect(page.getByTestId("canvas-handles")).toHaveAttribute("data-measuring", "");
  expect(await readouts(page)).toEqual(["H 16", "R 4", "P 4", "W 5 sq"]);
  await expect(page.locator(".component-editor-band").first()).toHaveCSS("opacity", "1");
  await page.keyboard.up("Alt");
  await expect.poll(() => readouts(page)).toEqual([]);
});

test("the checkbox's box takes its corner and its size from the far corner", async ({ page }) => {
  await open(page);
  await page.locator(".component-editor-navigation ds-sidebar").getByText("Checkbox", { exact: true }).click();
  await expect(page.getByTestId("handle-size")).toBeVisible();
  await expect(page.getByTestId("handle-height")).toHaveCount(0);
  await expect.poll(async () => { const r = (await page.getByTestId("canvas-handles").boundingBox())!; return [r.width, r.height]; }).toEqual([16, 16]);
  await expect.poll(async () => page.getByTestId("canvas-handles").evaluate(element => { const r = element.getBoundingClientRect(); return [r.left, r.top].map(Math.round); }))
    .toEqual((await face(page, ".component-editor-specimen[aria-selected='true'] ds-checkbox > input")).slice(0, 2));
  await press(page, "handle-size", 4, 4);
  await expect.poll(() => canvasToken(page, "--ds-checkbox-size")).toBe("20px");
  await page.mouse.up();
  await expect.poll(async () => (await page.getByTestId("canvas-handles").boundingBox())!.width).toBe(20);
});
