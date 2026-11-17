// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vite-plus/test";
import { constraints } from "../DS1/0-face/constraints";
import { PHONE_WIDTH, windowRatioFloor } from "../DS1/0-face/window-shape";
import { DsWindow } from "../DS1/5-visual-kit/window";

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

const rule = constraints.find(c => c.code === "window.shape")!;
const sized = (element: Element, width: number, height: number) => {
  element.getBoundingClientRect = () => ({ width, height }) as DOMRect;
  return element;
};
const frame = (kind: string, width: number, height: number) => {
  document.body.insertAdjacentHTML("beforeend", `<div class="frame"><ds-app-chrome kind="${kind}"></ds-app-chrome></div>`);
  return sized(document.body.lastElementChild!, width, height);
};
const page = (width: number) => vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(width);

test("a window keeps a window's shape: it draws itself 16:10, 4:5 on a phone, and a taller frame around chrome breaks the rule", () => {
  const styles = DsWindow.styles.toString().replace(/\s+/g, " ");
  expect(styles).toContain("width:100%; min-width:0; height:var(--ds-window-height,auto); aspect-ratio:1.6;");
  expect(styles).toContain(`@media (max-width:${PHONE_WIDTH}px) { :host { aspect-ratio:0.8; } }`);

  page(1440);
  const tall = frame("macos-compact", 610, 916);
  expect(rule.count(document)).toBe(1);
  expect(rule.inspect(document).map(finding => finding.element)).toEqual([tall]);
  expect(rule.inspect(document)[0]!.message).toBe("The window is 610px by 916px, too tall for a window in a page 1440px wide.");

  document.body.replaceChildren();
  frame("ios", 390, 844);
  expect(rule.count(document)).toBe(0);

  document.body.replaceChildren();
  for (const kind of ["macos", "macos-compact", "safari", "chrome", "edge"]) frame(kind, 800, 800);
  expect(rule.count(document)).toBe(5);
  expect(rule.inspect(document)).toEqual([]);

  document.body.replaceChildren();
  page(390);
  frame("safari", 350, 437);
  expect(rule.inspect(document)).toEqual([]);
  frame("safari", 350, 472);
  expect(rule.inspect(document)).toHaveLength(1);
  expect(windowRatioFloor(PHONE_WIDTH)).toBe(0.8);
  expect(windowRatioFloor(PHONE_WIDTH + 1)).toBe(1);
});

test("a frameless window lends its content the page and is no window to measure", () => {
  document.body.innerHTML = `<ds-window frameless></ds-window><ds-window></ds-window>`;
  page(1440);
  sized(document.querySelector("ds-window[frameless]")!, 390, 844);
  sized(document.querySelector("ds-window:not([frameless])")!, 800, 500);
  expect(rule.count(document)).toBe(1);
  expect(rule.inspect(document)).toEqual([]);
});
