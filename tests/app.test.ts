// @vitest-environment happy-dom
import { afterEach, expect, test } from "vite-plus/test";
import type { App } from "../DS1/4-page/ds-app";
import { startAppScale } from "../DS1/4-page/app-scale";
await import("../DS1/4-page/ds-app");

const root = document.documentElement;
let stop: (() => void) | undefined;
afterEach(() => {
  document.body.replaceChildren();
  stop?.();
  stop = undefined;
  root.style.removeProperty("--ds-sf");
});

async function setup(markup: string) {
  document.body.innerHTML = markup;
  const app = document.querySelector("ds-app") as App;
  await app.updateComplete;
  await app.page!.updateComplete;
  await new Promise(resolve => setTimeout(resolve));
  return app;
}
const area = (app: App, name: string) => app.page!.shadowRoot!.querySelector<HTMLElement>(`[data-area="${name}"]`)!;
const reached = (app: App, name: string) => area(app, name).querySelector("slot")!.assignedElements({ flatten: true }).map(element => element.id);

test("each area of the frame reaches its place on the page", async () => {
  const app = await setup(`<ds-app name="Notes" fixed-scale>
    <nav slot="nav" id="places"></nav>
    <div slot="header" id="title"></div>
    <section id="work"></section>
    <aside slot="aside" id="properties"></aside>
    <div slot="footer" id="closing"></div>
  </ds-app>`);
  expect(reached(app, "nav")).toEqual(["places"]);
  expect(reached(app, "header")).toEqual(["title"]);
  expect(reached(app, "main")).toEqual(["work"]);
  expect(reached(app, "aside")).toEqual(["properties"]);
  expect(reached(app, "footer")).toEqual(["closing"]);
  for (const name of ["nav", "header", "main", "aside", "footer"]) expect(area(app, name).hasAttribute("data-empty"), name).toBe(false);
});

test("an app without navigation or inspector gives the work the page, and has no menu button", async () => {
  const app = await setup(`<ds-app name="Notes" fixed-scale><p>Only the work</p></ds-app>`);
  for (const name of ["nav", "header", "aside", "footer"]) expect(area(app, name).hasAttribute("data-empty"), name).toBe(true);
  expect(area(app, "main").hasAttribute("data-empty")).toBe(false);
  expect(app.shadowRoot!.querySelector<HTMLButtonElement>('[part="menu"]')!.hidden).toBe(true);
});

test("the page under the bar fills the window, resizes, is divided, folds its navigation away and remembers widths per app", async () => {
  const app = await setup(`<ds-app name="Notes" fixed-scale nav-width="10" aside-width="14"><nav slot="nav"></nav><p>Work</p></ds-app>`);
  const page = app.page!;
  expect(["fill", "resizable", "divided", "drawer"].every(name => page.hasAttribute(name))).toBe(true);
  expect(page.layout).toBe("inspector");
  expect([page.navWidth, page.asideWidth]).toEqual([10, 14]);
  expect(page.resizeKey).toBe("ds-app:Notes");
  app.resizeKey = "notes";
  await app.updateComplete;
  expect(page.resizeKey).toBe("notes");
});

test("the menu button in the bar is the page's drawer toggle, shown only when there is navigation", async () => {
  const app = await setup(`<ds-app name="Notes" fixed-scale><nav slot="nav"><a href="#a">A</a></nav><p>Work</p></ds-app>`);
  const menu = app.shadowRoot!.querySelector<HTMLButtonElement>('[part="menu"]')!;
  expect(menu.closest(".bar")).not.toBeNull();
  expect(menu.hidden).toBe(false);
  expect(menu.getAttribute("aria-label")).toBe("Menu");
  expect(app.page!.drawerToggle).toBe(menu);
  expect(menu.getAttribute("aria-expanded")).toBe("false");
  expect(menu.hasAttribute("aria-controls")).toBe(false);
  // The page draws no menu row of its own.
  expect(app.page!.shadowRoot!.querySelector<HTMLElement>('[part="bar"]')!.hidden).toBe(true);
  expect(app.page!.shadowRoot!.querySelector('[part="page"]')!.hasAttribute("data-toggle-outside")).toBe(true);
});

test("the name leads home, and a brand replaces it", async () => {
  const app = await setup(`<ds-app name="Notes" home="/notes/" fixed-scale><p>Work</p></ds-app>`);
  const brand = app.shadowRoot!.querySelector<HTMLAnchorElement>('[part="brand"]')!;
  expect([brand.textContent, brand.getAttribute("href")]).toEqual(["Notes", "/notes/"]);
  const own = await setup(`<ds-app name="Notes" fixed-scale><a slot="brand" id="mark" href="/">N</a><p>Work</p></ds-app>`);
  const slot = own.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="brand"]')!;
  expect(slot.assignedElements().map(element => element.id)).toEqual(["mark"]);
});

test("the app scale manages the page's scale once, with the components following it", () => {
  stop = startAppScale();
  expect(startAppScale()).toBe(stop);
  expect(root.hasAttribute("data-ds-scaling-managed")).toBe(true);
  expect(root.style.getPropertyValue("--ds-sf")).toBe("var(--sf, 1)");
  expect(root.style.getPropertyValue("--sf")).not.toBe("");
  stop();
  stop = undefined;
  expect(root.hasAttribute("data-ds-scaling-managed")).toBe(false);
  // Stopped, it can start again.
  stop = startAppScale();
  expect(root.hasAttribute("data-ds-scaling-managed")).toBe(true);
});

test("a fixed scale leaves the page's scale to the app", async () => {
  await setup(`<ds-app name="Notes" fixed-scale><p>Work</p></ds-app>`);
  expect(root.hasAttribute("data-ds-scaling-managed")).toBe(false);
});

test("updateComplete waits for the page under the bar, so what is slotted already stands in its place", async () => {
  document.body.innerHTML = `<ds-app name="Notes" fixed-scale><nav slot="nav" id="places"></nav><p id="work">Work</p></ds-app>`;
  const app = document.querySelector("ds-app") as App;
  await app.updateComplete;
  expect(app.page!.hasUpdated).toBe(true);
  expect(app.page!.shadowRoot!.querySelector('[data-area="nav"] slot')).not.toBeNull();
});

test("a flowing frame is the document: its page takes no height of its own, and the window scrolls back to the start", async () => {
  const app = await setup(`<ds-app name="Site" fixed-scale flow><section id="work"></section></ds-app>`);
  expect(app.hasAttribute("flow")).toBe(true);
  expect(app.page!.hasAttribute("fill")).toBe(false);
  expect(reached(app, "main")).toEqual(["work"]);
  const calls: unknown[] = [];
  const scroll = window.scrollTo;
  window.scrollTo = ((options: unknown) => { calls.push(options); }) as typeof window.scrollTo;
  try { app.scrollToStart(); } finally { window.scrollTo = scroll; }
  expect(calls).toEqual([{ top: 0, left: 0 }]);
});
