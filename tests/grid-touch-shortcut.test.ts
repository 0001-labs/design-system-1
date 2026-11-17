// @vitest-environment happy-dom
import { expect, test } from "vite-plus/test";
import { initGridShortcut } from "../DS1/0-face/grid";
let allowed = false;
initGridShortcut({ canTouchToggle: () => allowed });
document.documentElement.setAttribute("data-mobile", "");
const tap = (distance = 0) => {
  window.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1, pointerType: "touch", isPrimary: true, clientX: 100, clientY: 100 }));
  window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1, pointerType: "touch", isPrimary: true, clientX: 100 + distance, clientY: 100 }));
};
const shown = () => document.documentElement.hasAttribute("data-ds-grid-visible");
test("only an allowed reader can toggle the grid with five taps", () => {
  for (let i = 0; i < 5; i++) tap();
  expect(shown()).toBe(false);
  allowed = true;
  for (let i = 0; i < 4; i++) tap();
  expect(shown()).toBe(false);
  tap();
  expect(shown()).toBe(true);
  for (let i = 0; i < 5; i++) tap();
  expect(shown()).toBe(false);
  tap(30);
  for (let i = 0; i < 4; i++) tap();
  expect(shown()).toBe(false);
  allowed = false;
  tap();
  expect(shown()).toBe(false);
});
