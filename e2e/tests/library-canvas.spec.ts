import { expect, test, type Page } from "@playwright/test";

/**
 * A library's workbench leading with the base editor's canvas and property groups, over the
 * library's own stylesheet (e2e/fixtures/library-canvas.html, which records every
 * `workbench-dirty`, each one a save): handles under a real pointer and a finger, the stylesheet
 * drawn on the specimens and nowhere else, the box model's pins, and nothing wider than the window.
 */

const SQUARE = 20;
const open = async (page: Page, query = "") => {
  await page.goto(`/e2e/fixtures/library-canvas.html${query.startsWith("?") ? query : `?component=/2-core/button/${query}`}`);
  await page.evaluate(() => (window as unknown as { ready: Promise<unknown> }).ready);
  await page.evaluate(() => document.fonts.ready);
};
const dirty = (page: Page) => page.evaluate(() => (window as unknown as { dirty: string[] }).dirty);
const size = (page: Page) => page.getByTestId("component-size").textContent();
const readouts = (page: Page) => page.locator(".component-editor-readout").allTextContents();
const tokenField = (page: Page, token: string) => page.locator(`.system-workbench-tokens ds-input[aria-label="${token}"]`);
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
  return { x, y };
};
/** The selected specimen's component and a computed style of it (or of its `part`). */
const specimenStyle = (page: Page, property: string, part = "control") => page.locator(".component-editor-specimen[aria-selected='true'] ds1-specimen").evaluate((body, [property, part]) => {
  const element = body.shadowRoot!.firstElementChild as HTMLElement;
  const target = element.shadowRoot?.querySelector<HTMLElement>(`[part~="${part}"]`) ?? element;
  return getComputedStyle(target).getPropertyValue(property!);
}, [property, part]);

test("a covered component leads with the canvas, then its examples; the aside with its property groups, then the box model and the tokens", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("handle-height")).toBeVisible();
  const main = await page.locator(".system-workbench-preview").evaluate(element => [...element.querySelectorAll(":scope > *, :scope > ds1-component-canvas > *")].map(child => child.className || child.localName));
  expect(main.slice(0, 5)).toEqual(["app-panel-heading", "ds1-component-canvas", "component-editor-canvas", "app-panel-label system-workbench-examples", "section"]);
  const aside = await page.locator(".system-workbench-tokens > *").evaluateAll(children => children.map(child => child.getAttribute("aria-label") ?? child.className));
  expect(aside.slice(0, 7)).toEqual(["Layout", "Shape", "Text", "Colour", "library-button-mode", "Button properties", "app-panel-label"]);
  await expect(page.getByTestId("canvas-pinned")).toHaveCount(0);
  await expect(page.locator(".system-workbench-preview iframe").first()).toHaveAttribute("src", "/examples/button/");
});

test("dragging the height previews on the specimen and in the inspector, and saves once on release into the stylesheet and the token list", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Show stylesheet" }).click();
  await press(page, "handle-height", 0, SQUARE + 2);
  await expect.poll(() => size(page)).toBe("100 × 36");
  await expect(page.locator('ds-number[data-token="--ds-button-size"]')).toHaveJSProperty("value", 36);
  expect(await readouts(page)).toEqual(["H 36"]);
  expect(await dirty(page)).toHaveLength(0);
  await expect(tokenField(page, "--ds-button-size")).toHaveJSProperty("value", "");
  await page.mouse.up();
  await expect.poll(() => dirty(page)).toHaveLength(1);
  expect((await dirty(page))[0]).toContain("--ds-button-size: 36px;");
  await expect(tokenField(page, "--ds-button-size")).toHaveJSProperty("value", "36px");
  await expect(page.getByTestId("live-css-source")).toContainText("--ds-button-size: 36px;");
  await expect.poll(() => size(page)).toBe("100 × 36");
  await page.waitForTimeout(300);
  expect(await dirty(page)).toHaveLength(1);
});

test("padding, width and corner each drag to one save; Escape and a drag back to its start save nothing", async ({ page }) => {
  await open(page);
  await press(page, "handle-padding-start", 5, 0);
  await expect.poll(() => specimenStyle(page, "padding-left")).toBe("8px");
  expect(await dirty(page)).toHaveLength(0);
  await page.mouse.up();
  await expect.poll(() => dirty(page)).toHaveLength(1);
  expect((await dirty(page))[0]).toContain("--ds-button-padding-size: 8px;");
  await press(page, "handle-width", SQUARE + 2, 0);
  await expect.poll(() => readouts(page)).toEqual(["W 7 sq"]);
  await page.mouse.up();
  await expect.poll(() => dirty(page)).toHaveLength(2);
  expect((await dirty(page))[1]).toContain("--ds-button-inline-size: calc(7 * var(--ds-unit, 20px));");
  await expect.poll(() => size(page)).toBe("140 × 16");
  await press(page, "handle-corner", 6, 6);
  await expect.poll(() => specimenStyle(page, "border-top-left-radius")).toBe("10px");
  await page.mouse.up();
  await expect.poll(() => dirty(page)).toHaveLength(3);
  expect((await dirty(page))[2]).toContain("--ds-button-corner-size: 10px;");
  // Escape restores what the stylesheet says, and nothing is saved.
  await press(page, "handle-height", 0, 2 * SQUARE + 2);
  await expect.poll(() => size(page)).toBe("140 × 56");
  await page.keyboard.press("Escape");
  await expect.poll(() => size(page)).toBe("140 × 16");
  await page.mouse.up();
  // A drag that comes back to where it began.
  const start = await press(page, "handle-height", 0, SQUARE + 2);
  await expect.poll(() => size(page)).toBe("140 × 36");
  await page.mouse.move(start.x, start.y, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  expect(await dirty(page)).toHaveLength(3);
  await expect.poll(() => size(page)).toBe("140 × 16");
});

test("a token edited in the token list shows on the canvas and in the inspector at once, and a reset takes it out", async ({ page }) => {
  await open(page);
  await tokenField(page, "--ds-button-size").locator("input").fill("36px");
  await expect.poll(() => size(page)).toBe("100 × 36");
  await expect(page.getByTestId("handle-height")).toHaveAttribute("aria-valuenow", "36");
  await expect(page.locator('ds-number[data-token="--ds-button-size"]')).toHaveJSProperty("value", 36);
  const saves = (await dirty(page)).length;
  await page.getByTestId("reset--ds-button-size").click();
  await expect.poll(() => size(page)).toBe("100 × 16");
  await expect(tokenField(page, "--ds-button-size")).toHaveJSProperty("value", "");
  expect(await dirty(page)).toHaveLength(saves + 1);
  expect((await dirty(page)).at(-1)).not.toContain("--ds-button-size");
});

test("the library's stylesheet is drawn on the specimens and not on the workbench around them", async ({ page }) => {
  await open(page, "&library=custom");
  await expect.poll(() => specimenStyle(page, "background-color")).toBe("rgb(255, 0, 102)");
  expect(await specimenStyle(page, "border-top-left-radius")).toBe("10px");
  expect(await specimenStyle(page, "letter-spacing")).toBe("3px");
  // The chrome: the names, the numbers, the headings, the inspector's own buttons.
  const pink = "rgb(255, 0, 102)";
  for (const selector of [".component-editor-specimen-name", "[data-testid=component-size]", ".app-panel-heading h1", ".component-editor-group h3", ".component-editor-label"]) {
    expect(await page.locator(selector).first().evaluate(element => getComputedStyle(element).color), selector).not.toBe(pink);
  }
  const chromeButton = page.locator('ds-tabs[data-token="--ds-button-inline-size"] ds-button').first();
  const chrome = await chromeButton.evaluate(element => { const control = element.shadowRoot!.querySelector<HTMLElement>('[part~="control"]') ?? element; const style = getComputedStyle(control); return [style.letterSpacing, style.borderTopLeftRadius]; });
  expect(chrome).not.toContain("3px");
  expect(chrome[1]).not.toBe("10px");
  // A drag's preview wins over the stylesheet's own value.
  await press(page, "handle-corner", -12, -12);
  await expect.poll(() => specimenStyle(page, "border-top-left-radius")).toBe("0px");
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect.poll(() => specimenStyle(page, "border-top-left-radius")).toBe("10px");
  expect(await dirty(page)).toHaveLength(0);
});

test("a stylesheet with the box model's block shows its height, padding and corner as measures, drawn from the block", async ({ page }) => {
  await open(page, "&library=box");
  await expect(page.getByTestId("handle-width")).toBeVisible();
  for (const kind of ["height", "padding-start", "padding-end", "corner"]) await expect(page.getByTestId(`handle-${kind}`)).toHaveCount(0);
  await expect(page.getByTestId("canvas-pinned")).toHaveText("Height, padding and corner are set in the box model.");
  await expect.poll(() => specimenStyle(page, "padding-left")).toBe("12px");
  expect(await specimenStyle(page, "border-top-left-radius")).toBe("8px");
  for (const token of ["--ds-button-size", "--ds-button-padding-size", "--ds-button-corner-size"]) await expect(page.locator(`ds-number[data-token="${token}"]`)).toHaveCount(0);
  expect(await page.locator(".component-editor-pinned").allTextContents()).toEqual(["Auto", "12 px", "8 px"]);
  const face = (await page.getByTestId("canvas-handles").boundingBox())!;
  await page.mouse.move(face.x + face.width / 2, face.y + face.height / 2);
  await page.keyboard.down("Alt");
  await expect(page.getByTestId("canvas-handles")).toHaveAttribute("data-measuring", "");
  expect(await readouts(page)).toEqual([`H ${Math.round(face.height)}`, "R 8", "P 12", "W 6 sq"]);
  await page.keyboard.up("Alt");
  expect(await dirty(page)).toHaveLength(0);
});

test("input, checkbox, switch and tag open on the canvas; a component without a spec keeps today's workbench", async ({ page }) => {
  for (const [component, handle] of [["input", "handle-height"], ["checkbox", "handle-size"], ["switch", "handle-height"], ["tag", "handle-padding-start"]] as const) {
    await open(page, `?component=/2-core/${component}/`);
    await expect(page.getByTestId(handle), component).toBeVisible();
    await expect(page.locator(".component-editor-group").first()).toHaveAttribute("aria-label", "Layout");
  }
  await open(page, "?component=/2-core/card/");
  await expect(page.getByTestId("component-canvas")).toHaveCount(0);
  await expect(page.locator(".component-editor-group")).toHaveCount(0);
  await expect(page.locator(".system-workbench-examples")).toHaveCount(0);
  await expect(page.locator(".system-workbench-tokens > :first-child")).toHaveText("Tokens");
});

test("never wider than its window, alone or in the documentation's frame, with the canvas keeping its own height", async ({ page }) => {
  for (const [width, query] of [[1440, ""], [390, ""], [390, "&embed"], [1440, "&embed"]] as const) {
    await page.setViewportSize({ width, height: 800 });
    await open(page, query);
    await expect(page.getByTestId("handle-height")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${width}${query}`).toBeLessThanOrEqual(0);
    const canvas = (await page.getByTestId("component-canvas").boundingBox())!;
    const pane = (await page.locator(".system-workbench-preview").boundingBox())!;
    expect(canvas.height, `${width}${query}`).toBeGreaterThan(5 * SQUARE);
    expect(canvas.height, `${width}${query}`).toBeLessThan(Math.max(pane.height, 25 * SQUARE));
    expect(canvas.x + canvas.width).toBeLessThanOrEqual(pane.x + pane.width + 1);
  }
});

test.describe("under a finger", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 700 } });
  test("the height drags without scrolling and saves once", async ({ page }) => {
    await open(page);
    await page.getByTestId("handle-height").scrollIntoViewIfNeeded();
    const from = await centre(page, "handle-height");
    const scrolled = () => page.evaluate(() => document.scrollingElement!.scrollTop + document.querySelector(".system-workbench-preview")!.scrollTop);
    const before = await scrolled();
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
    await touch("touchStart", from.x, from.y);
    for (let step = 1; step <= 8; step++) await touch("touchMove", from.x, from.y + (SQUARE + 2) * step / 8);
    await touch("touchEnd", 0, 0);
    await cdp.detach();
    await expect.poll(() => dirty(page)).toHaveLength(1);
    expect((await dirty(page))[0]).toContain("--ds-button-size: 36px;");
    expect(await scrolled()).toBe(before);
  });
});
