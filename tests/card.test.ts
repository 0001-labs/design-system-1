// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vite-plus/test";

vi.stubGlobal("fetch", vi.fn(async () => new Response("{}")));
await import("../DS1/2-core/ds-card");
type Card = HTMLElementTagNameMap["ds-card"];

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

const sheet = (name: string) => readFileSync(join(import.meta.dirname, `../DS1/${name}`), "utf8");
const settle = async (element: { updateComplete: Promise<unknown> }) => { await element.updateComplete; await new Promise(resolve => setTimeout(resolve)); await element.updateComplete; };

test("a card with href is one link carrying its tone, sized in squares", async () => {
  document.body.innerHTML = `<ds-card href="/lists" tone="sharp-blue" width="14" height="22" media="center"><span slot="label">Lists</span><span slot="title">On one grid</span><img slot="media" alt="" /></ds-card>`;
  const card = document.querySelector("ds-card") as Card;
  await settle(card);
  const link = card.shadowRoot!.querySelector("a.ds-card")!;
  expect(link.getAttribute("href")).toBe("/lists");
  expect(link.getAttribute("data-tone")).toBe("sharp-blue");
  expect(card.shadowRoot!.querySelectorAll("a")).toHaveLength(1);
  expect(card.style.getPropertyValue("--ds-card-width")).toBe("calc(var(--ds-unit) * 14)");
  expect(card.style.getPropertyValue("--ds-card-height")).toBe("calc(var(--ds-unit) * 22)");
  expect(card.shadowRoot!.querySelector(".ds-card__media")!.classList.contains("ds-card__media--center")).toBe(true);
  expect(card.shadowRoot!.querySelector<HTMLElement>(".ds-card__label")!.hidden).toBe(false);
});

test("an interactive card is one button that fires ds-card-press on a click, Enter and Space", async () => {
  document.body.innerHTML = `<ds-card interactive><span slot="title">Plans</span></ds-card>`;
  const card = document.querySelector("ds-card") as Card;
  await settle(card);
  const pressed = vi.fn();
  card.addEventListener("ds-card-press", pressed);
  const face = card.shadowRoot!.querySelector<HTMLElement>("[role=button]")!;
  face.click();
  face.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  face.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
  face.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
  expect(pressed).toHaveBeenCalledTimes(3);
});

test("a card's empty slots take no room", async () => {
  document.body.innerHTML = `<ds-card><ds-text literal>Only writing</ds-text></ds-card>`;
  const card = document.querySelector("ds-card") as Card;
  await settle(card);
  for (const part of ["label", "title", "media"]) expect(card.shadowRoot!.querySelector<HTMLElement>(`.ds-card__${part}`)!.hidden).toBe(true);
});

test("the sheet pads the card a square and puts no shadow on a filled card", () => {
  const card = sheet("1-root/card.css");
  expect(card).toContain("--ds-card-padding: var(--ds-card-padding-override, var(--ds-unit))");
  expect(card).toContain("--ds-card-side-padding: var(--ds-card-side-padding-override, var(--ds-card-padding))");
  expect(card).toContain("border-radius: var(--ds-radius-card)");
  expect(card).not.toMatch(/box-shadow:\s*0 \d/);
});

test("a picture stands on the card's foot, so pictures side by side stand on one level", () => {
  const card = sheet("1-root/card.css");
  const padding = /\n\.ds-card \{[^}]*\n  padding:([^;]*);/.exec(card)![1]!;
  expect(padding).toMatch(/\)\s+var\(--ds-bento-inset-bottom, 0px\)\s+calc\(/);
  const media = /\.ds-card__media \{([^}]*)\}/.exec(card)![1]!;
  expect(media).toContain("margin-top: auto");
  expect(media).toContain("padding-top: var(--ds-unit)");
  const fixed = /\.ds-card__media--fixed \{([^}]*)\}/.exec(card)![1]!;
  expect(fixed).toContain("height: calc(var(--ds-card-media-height) + var(--ds-unit))");
  expect(fixed).toContain("justify-content: flex-start");
});

test("media-height gives the picture a fixed room in squares", async () => {
  document.body.innerHTML = `<ds-card media="bleed" media-height="7"><span slot="title">Book</span><div slot="media"></div></ds-card>`;
  const card = document.querySelector("ds-card") as HTMLElement & { updateComplete: Promise<unknown> };
  await card.updateComplete;
  expect(card.style.getPropertyValue("--ds-card-media-height")).toBe("calc(var(--ds-unit) * 7)");
  expect(card.shadowRoot!.querySelector(".ds-card__media")!.classList.contains("ds-card__media--fixed")).toBe(true);
});

test("words without a picture end a padding above the foot, and a product may fill a card with its own colour", () => {
  const card = sheet("1-root/card.css");
  const bare = /\.ds-card:not\(:has\(> \.ds-card__media:not\(\[hidden\]\)\)\) \{([^}]*)\}/.exec(card)![1]!;
  expect(bare).toContain("padding-block-end: calc(var(--ds-card-text-padding) + var(--ds-bento-inset-bottom, 0px))");
  expect(card).toContain("--ds-card-fill: var(--ds-card-fill-override, var(--ds-fill))");
  expect(card).toContain("--ds-card-ink: var(--ds-card-ink-override, var(--ds-text-color))");
  expect(card).toContain("--ds-card-muted: var(--ds-card-muted-override, var(--ds-text-color-muted))");
});

test("a picture is square where it meets the card's edge", () => {
  const card = sheet("1-root/card.css");
  const foot = /\.ds-card \.ds-card__media > :is\(img, picture, video, canvas, svg\) \{([^}]*)\}/.exec(card)![1]!;
  expect(foot).toContain("border-end-start-radius: 0");
  expect(foot).toContain("border-end-end-radius: 0");
  expect(sheet("2-core/styles/ds-card.css")).toMatch(/::slotted\(:is\(img, picture, video, canvas, svg\)\[slot="media"\]\) \{\s*border-end-start-radius: 0;\s*border-end-end-radius: 0;/);
});
