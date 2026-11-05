// @vitest-environment happy-dom
import { afterEach, expect, test } from "vite-plus/test";
import type { Page } from "../DS1/4-page/ds-page";
const { PAGE_LAYOUTS, measureStyle } = await import("../DS1/4-page/ds-page");

afterEach(() => document.body.replaceChildren());
async function setup(markup: string) {
  document.body.innerHTML = markup;
  const page = document.querySelector("ds-page") as Page;
  await page.updateComplete;
  return page;
}
const area = (page: Page, name: string) => page.shadowRoot!.querySelector<HTMLElement>(`[data-area="${name}"]`)!;

test("each area is a named slot and the main area takes unslotted content", async () => {
  const page = await setup(`<ds-page layout="sidebar">
    <nav slot="nav">Places</nav>
    <h1 slot="header">Title</h1>
    <p>Work</p>
  </ds-page>`);
  expect(page.layout).toBe("sidebar");
  const assigned = (name: string) => area(page, name).querySelector("slot")!.assignedElements().map(element => element.localName);
  expect(assigned("nav")).toEqual(["nav"]);
  expect(assigned("header")).toEqual(["h1"]);
  expect(assigned("main")).toEqual(["p"]);
});

test("an area with nothing in it is marked empty and takes no room", async () => {
  const page = await setup(`<ds-page layout="column"><p>Only the work</p></ds-page>`);
  expect(area(page, "main").hasAttribute("data-empty")).toBe(false);
  for (const name of ["nav", "header", "aside", "footer"]) expect(area(page, name).hasAttribute("data-empty")).toBe(true);
  const footer = document.createElement("p");
  footer.slot = "footer";
  page.append(footer);
  await new Promise(resolve => setTimeout(resolve));
  expect(area(page, "footer").hasAttribute("data-empty")).toBe(false);
});

test("a split's divider stands beside its column, so a scrolling column cannot cut it off", async () => {
  const page = await setup(`<ds-page layout="split" resizable fill><nav slot="nav">List</nav><p>Detail</p></ds-page>`);
  const handle = page.shadowRoot!.querySelector<HTMLElement>('[role="separator"]')!;
  expect(handle.parentElement).toBe(page.shadowRoot!.querySelector(".page"));
  expect(area(page, "nav").querySelector('[role="separator"]')).toBeNull();
  page.layout = "sidebar";
  await page.updateComplete;
  expect(handle.parentElement).toBe(page.shadowRoot!.querySelector(".page"));
});

test("layout, divided, fill and view reflect for styling", async () => {
  const page = await setup(`<ds-page></ds-page>`);
  expect(page.getAttribute("layout")).toBe("sidebar");
  for (const layout of PAGE_LAYOUTS) {
    page.layout = layout;
    await page.updateComplete;
    expect(page.getAttribute("layout")).toBe(layout);
  }
  Object.assign(page, { divided: true, fill: true, view: true });
  await page.updateComplete;
  expect(["divided", "fill", "view"].every(name => page.hasAttribute(name))).toBe(true);
});

test("measure sets the column width in whole squares on the page and reflects", async () => {
  const page = await setup(`<ds-page layout="column" measure="28"></ds-page>`);
  expect(page.measure).toBe(28);
  const surface = page.shadowRoot!.querySelector<HTMLElement>(".page")!;
  expect(surface.getAttribute("style")).toBe("--ds-page-measure: calc(28 * var(--ds-unit))");
  page.measure = 30;
  await page.updateComplete;
  expect(page.getAttribute("measure")).toBe("30");
  expect(surface.getAttribute("style")).toBe("--ds-page-measure: calc(30 * var(--ds-unit))");
  page.measure = undefined;
  await page.updateComplete;
  expect(surface.hasAttribute("style")).toBe(false);
});

test("a measure is rounded to a whole square and anything else is ignored", () => {
  expect(measureStyle(28)).toBe("--ds-page-measure: calc(28 * var(--ds-unit))");
  expect(measureStyle(27.6)).toBe("--ds-page-measure: calc(28 * var(--ds-unit))");
  expect(measureStyle(0.4)).toBeUndefined();
  for (const value of [0, -4, Number.NaN, Infinity, null, undefined]) expect(measureStyle(value)).toBeUndefined();
});

test("the main area is the main landmark unless the page has one already", async () => {
  expect(area(await setup(`<ds-page layout="column"><p>Work</p></ds-page>`), "main").getAttribute("role")).toBe("main");
  expect(area(await setup(`<main><ds-page layout="column"><p>Work</p></ds-page></main>`), "main").hasAttribute("role")).toBe(false);
  expect(area(await setup(`<ds-page layout="column"><main>Work</main></ds-page>`), "main").hasAttribute("role")).toBe(false);
  const nested = await setup(`<ds-page layout="column"><ds-page layout="column"><p>Work</p></ds-page></ds-page>`);
  const inner = nested.querySelector("ds-page") as Page;
  await inner.updateComplete;
  expect(area(nested, "main").getAttribute("role")).toBe("main");
  expect(area(inner, "main").hasAttribute("role")).toBe(false);
});

// page.window-width in DS1/0-face/constraints.ts
test("every column of a page can shrink to the window, and below thirty squares every layout stacks", async () => {
  const { readFileSync } = await import("node:fs");
  const css = readFileSync(`${import.meta.dirname}/../DS1/4-page/styles/ds-page.css`, "utf8");
  // A share of the room is never wider than the room: every 1fr is minmax(0, 1fr).
  expect(css.match(/1fr/g)!.length).toBe(css.match(/minmax\(0, 1fr\)/g)!.length);
  expect(css).toMatch(/\.area \{[^}]*min-width: 0;/);
  const narrow = /@container \(max-width: 599px\) \{([^]*?)\n\}/.exec(css)![1]!;
  expect(narrow).toContain("grid-template-columns: minmax(0, 1fr);");
});

test('resizable split pages expose a separator and keyboard changes emit their share', async () => {
  const page = await setup('<ds-page layout="split" resizable><nav slot="nav">List</nav><p>Details</p></ds-page>');
  const separator = page.shadowRoot!.querySelector<HTMLElement>('[role="separator"]')!;
  expect(separator.getAttribute('aria-orientation')).toBe('vertical');
  Object.defineProperty(page.shadowRoot!.querySelector('.page'), 'clientWidth', {value:1000});
  Object.defineProperty(page.shadowRoot!.querySelector('[part=nav]'), 'getBoundingClientRect', {value:()=>({width:500})});
  let share: number | undefined;
  page.addEventListener('ds-page-resize', event => { share = (event as CustomEvent).detail.split; });
  separator.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true}));
  await page.updateComplete;
  expect(page.split).toBeCloseTo(0.52);
  expect(share).toBeCloseTo(0.52);
  expect(separator.getAttribute('aria-valuenow')).toBe('52');
  separator.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
  expect(page.split).toBe(0.5);
});


test('sidebar resizing reports whole-square widths and can reset', async () => {
  const page = await setup('<ds-page layout="sidebar" resizable nav-width="8"><nav slot="nav">Places</nav><p>Work</p></ds-page>');
  Object.defineProperty(page.shadowRoot!.querySelector('.page'), 'clientWidth', {value:1000});
  const handle = page.shadowRoot!.querySelector<HTMLElement>('[role="separator"]')!;
  expect(handle.getAttribute('aria-label')).toBe('Resize sidebar');
  let width: number | undefined;
  page.addEventListener('ds-page-resize', event => {width = (event as CustomEvent).detail.navWidth;});
  handle.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', shiftKey:true, bubbles:true}));
  await page.updateComplete;
  expect(width).toBe(13);
  expect(page.navWidth).toBe(13);
  handle.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
  await page.updateComplete;
  expect(page.navWidth).toBe(8);
  expect(handle.getAttribute('aria-valuenow')).toBe('8');
  handle.dispatchEvent(new KeyboardEvent('keydown', {key:'Home', bubbles:true}));
  await page.updateComplete;
  expect(page.navWidth).toBe(4);
});


test('inspector pages expose independent boundaries, and remember widths across visits', async () => {
  localStorage.removeItem('page-width-test');
  const page = await setup('<ds-page layout="inspector" resizable resize-key="page-width-test"><nav slot="nav">Places</nav><p>Work</p><aside slot="aside">Properties</aside></ds-page>');
  Object.defineProperty(page.shadowRoot!.querySelector('.page'), 'clientWidth', { value: 1400 });
  const handles = page.shadowRoot!.querySelectorAll<HTMLElement>('[role="separator"]');
  expect(handles.length).toBe(2);
  expect(handles[1].getAttribute('aria-label')).toBe('Resize inspector');
  handles[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  await page.updateComplete;
  expect(page.asideWidth).toBe(13);
  expect(page.navWidth).toBe(12);
  const again = await setup('<ds-page layout="inspector" resizable resize-key="page-width-test"></ds-page>');
  expect(again.asideWidth).toBe(13);
  expect(again.navWidth).toBe(12);
  localStorage.removeItem('page-width-test');
});

test('a cancelled drag restores layout and never persists a preview', async () => {
  const page = await setup('<ds-page layout="sidebar" resizable nav-width="8"><nav slot="nav">Places</nav><p>Work</p></ds-page>');
  Object.defineProperty(page.shadowRoot!.querySelector('.page'), 'clientWidth', { value: 1000 });
  const handle = page.shadowRoot!.querySelector<HTMLElement>('[role="separator"]')!;
  handle.setPointerCapture = () => {};
  const pointer = (type: string, x: number) => handle.dispatchEvent(new PointerEvent(type, { pointerId: 1, clientX: x, button: 0, bubbles: true }));
  pointer('pointerdown', 160);
  pointer('pointermove', 217);
  expect(page.shadowRoot!.querySelector<HTMLElement>('.page')!.style.getPropertyValue('--ds-page-resize-width')).toBe('217px');
  handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(page.navWidth).toBe(8);
  expect(handle.hasAttribute('data-dragging')).toBe(false);
  expect(page.shadowRoot!.querySelector<HTMLElement>('.page')!.style.getPropertyValue('--ds-page-resize-width')).toBe('');
  pointer('pointerup', 217);
  expect(page.navWidth).toBe(8);
});
