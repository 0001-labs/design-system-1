// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vite-plus/test";
import { alignedGrid, applyScaling, calculateScalingFactor, defaultScalingConfig, detectMobileDevice, screenWidth, startScaling, toDevicePixel, toLayoutStep } from "../DS1/0-face/scaling";

const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const COMPUTER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const root = document.documentElement;

function screen(agent: string, width: number, pixelRatio = 1) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(agent);
  Object.defineProperty(root, "clientWidth", { configurable: true, get: () => width });
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => pixelRatio });
}

afterEach(() => {
  vi.restoreAllMocks();
  delete (root as { clientWidth?: number }).clientWidth;
  delete (window as { devicePixelRatio?: number }).devicePixelRatio;
  for (const key of ["width", "height", "orientation"]) delete (window.screen as unknown as Record<string, unknown>)[key];
  delete (root as { clientHeight?: number }).clientHeight;
  for (const property of ["--sf", "--ds-grid-columns", "--ds-grid-rows", "--ds-grid-top"]) root.style.removeProperty(property);
  root.removeAttribute("data-mobile");
  root.removeAttribute("data-desktop-aligned");
  root.removeAttribute("data-ds-scaling-managed");
});

test("a phone scales by its width over 280, between 0.75 and 2", () => {
  expect(calculateScalingFactor(375)).toBe(1.339);
  expect(calculateScalingFactor(140)).toBe(0.75);
  expect(calculateScalingFactor(1200)).toBe(2);
  expect(calculateScalingFactor(375, { ...defaultScalingConfig, mode: "fixed" })).toBe(1);
});

test("snapping puts a square on whole layout steps or whole device pixels", () => {
  const layout = calculateScalingFactor(375, { ...defaultScalingConfig, snap: "layout" });
  expect(Number.isInteger(Math.round(layout * 20 * 64 * 1e9) / 1e9)).toBe(true);
  expect(layout).toBe(toLayoutStep(375 / 280));
  const pixel = calculateScalingFactor(375, { ...defaultScalingConfig, snap: "pixel" }, 3);
  expect(Math.round(pixel * 20 * 3 * 1e9) / 1e9).toBe(80);
  expect(pixel).toBeLessThanOrEqual(375 / 280);
  expect(toDevicePixel(375 / 280, 0)).toBe(toDevicePixel(375 / 280, 1));
});

test("a computer stays at 1 however narrow its window, without data-mobile", () => {
  screen(COMPUTER, 400);
  expect(detectMobileDevice()).toBe(false);
  expect(applyScaling()).toBe(1);
  expect(root.style.getPropertyValue("--sf")).toBe("1");
  expect(root.hasAttribute("data-mobile")).toBe(false);
});

test("a phone gets its scale and data-mobile on the root, snapped when asked", () => {
  screen(PHONE, 375, 3);
  expect(applyScaling()).toBe(1.339);
  expect(root.style.getPropertyValue("--sf")).toBe("1.339");
  expect(root.hasAttribute("data-mobile")).toBe(true);
  expect(applyScaling({ snap: "layout" })).toBe(toLayoutStep(375 / 280));
  const surface = document.createElement("div");
  applyScaling({ root: surface, snap: "pixel" });
  expect(Number(surface.style.getPropertyValue("--sf")) * 60).toBeCloseTo(80, 9);
  expect(surface.hasAttribute("data-mobile")).toBe(true);
});

function held(width: number, height: number, turn: string) {
  for (const [key, value] of Object.entries({ width, height, orientation: { type: turn } })) {
    Object.defineProperty(window.screen, key, { configurable: true, get: () => value });
  }
}

test("a phone's scale never comes from a page wider than its screen, so a page it has zoomed out never grows", () => {
  // iOS: the upright size whichever way the phone is turned.
  screen(PHONE, 560, 3);
  held(393, 852, "portrait-primary");
  expect(screenWidth()).toBe(393);
  expect(applyScaling()).toBe(calculateScalingFactor(393));
  held(393, 852, "landscape-primary");
  expect(screenWidth()).toBe(852);
  expect(applyScaling()).toBe(2);
  // A computer is never held to its screen.
  screen(COMPUTER, 560);
  held(393, 852, "portrait-primary");
  expect(applyScaling()).toBe(1);
});

test("startScaling follows resizes and turns until stopped", () => {
  let width = 375;
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(PHONE);
  Object.defineProperty(root, "clientWidth", { configurable: true, get: () => width });
  const stop = startScaling();
  expect(root.style.getPropertyValue("--sf")).toBe("1.339");
  width = 560; window.dispatchEvent(new Event("resize"));
  expect(root.style.getPropertyValue("--sf")).toBe("2");
  width = 280; window.dispatchEvent(new Event("orientationchange"));
  expect(root.style.getPropertyValue("--sf")).toBe("1");
  stop();
  width = 420; window.dispatchEvent(new Event("resize"));
  expect(root.style.getPropertyValue("--sf")).toBe("1");
});

function surfaceOf(width: () => number): HTMLElement {
  const surface = document.createElement("div");
  Object.defineProperty(surface, "clientWidth", { configurable: true, get: width });
  document.body.append(surface);
  return surface;
}

test("a surface scales to its own width on a computer, with the same rule and snapping", () => {
  screen(COMPUTER, 1440, 3);
  const surface = surfaceOf(() => 390);
  expect(applyScaling({ surface })).toBe(calculateScalingFactor(390));
  expect(surface.style.getPropertyValue("--sf")).toBe(String(calculateScalingFactor(390)));
  // Shared components inside take the same scale.
  expect(surface.style.getPropertyValue("--ds-sf")).toBe(String(calculateScalingFactor(390)));
  // The page and data-mobile are left alone.
  expect(root.style.getPropertyValue("--sf")).toBe("");
  expect(surface.hasAttribute("data-mobile")).toBe(false);
  const snapped = applyScaling({ surface, snap: "pixel" });
  expect(snapped).toBe(toDevicePixel(390 / 280, 3));
  expect(Math.round(snapped * 20 * 3 * 1e9) / 1e9).toBe(83);
  const target = document.createElement("div");
  applyScaling({ surface, root: target, snap: "layout" });
  expect(target.style.getPropertyValue("--sf")).toBe(String(toLayoutStep(390 / 280)));
  surface.remove();
});

test("surface: true scales every data-ds-surface element to its own width", () => {
  screen(COMPUTER, 1440);
  const phone = surfaceOf(() => 375);
  const wide = surfaceOf(() => 560);
  phone.setAttribute("data-ds-surface", "");
  wide.setAttribute("data-ds-surface", "");
  expect(applyScaling({ surface: true })).toBe(1.339);
  expect(phone.style.getPropertyValue("--sf")).toBe("1.339");
  expect(wide.style.getPropertyValue("--sf")).toBe("2");
  expect(root.style.getPropertyValue("--sf")).toBe("");
  phone.remove();
  wide.remove();
});

test("startScaling follows a surface as its size changes, until stopped", () => {
  screen(COMPUTER, 1440);
  const observed: Array<() => void> = [];
  const disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { observed.push(callback); }
    observe() {}
    disconnect() { disconnect(); }
  });
  let width = 375;
  const surface = surfaceOf(() => width);
  const stop = startScaling({ surface });
  expect(surface.style.getPropertyValue("--sf")).toBe("1.339");
  width = 280;
  observed[0]?.();
  expect(surface.style.getPropertyValue("--sf")).toBe("1");
  width = 420;
  window.dispatchEvent(new Event("resize"));
  expect(surface.style.getPropertyValue("--sf")).toBe("1.5");
  stop();
  expect(disconnect).toHaveBeenCalled();
  width = 560;
  window.dispatchEvent(new Event("resize"));
  expect(surface.style.getPropertyValue("--sf")).toBe("1.5");
  vi.unstubAllGlobals();
  surface.remove();
});

test("the device module applies the same rule and reports it", async () => {
  screen(PHONE, 420);
  const device = await import("../DS1/0-face/device");
  expect(device.detectMobileDevice).toBe(detectMobileDevice);
  const changed = vi.fn();
  window.addEventListener("scaling-changed", changed);
  device.updateScalingFactor();
  window.removeEventListener("scaling-changed", changed);
  expect(device.scalingFactor.get()).toBe(1.5);
  expect(root.style.getPropertyValue("--sf")).toBe("1.5");
  expect(root.hasAttribute("data-mobile")).toBe(true);
  expect(changed.mock.calls.at(-1)?.[0].detail.scalingFactor).toBe(1.5);
});

test("the device module preserves an aligned grid managed by the page", async () => {
  screen(COMPUTER, 1715);
  tall(945);
  root.setAttribute("data-ds-scaling-managed", "");
  const factor = applyScaling({ desktop: "aligned" });
  const device = await import("../DS1/0-face/device");
  device.initDeviceDetection();
  expect(root.hasAttribute("data-desktop-aligned")).toBe(true);
  expect(device.getScalingFactor()).toBe(factor);
  expect(Number(root.style.getPropertyValue("--ds-grid-columns")) * factor * 20).toBeCloseTo(1715);
});

function tall(height: number) {
  Object.defineProperty(root, "clientHeight", { configurable: true, get: () => height });
}

test("Desktop aligned makes the width whole squares by the smaller change of scale", () => {
  // Already whole: nothing changes.
  expect(alignedGrid(1440, 900)).toEqual({ factor: 1, columns: 72, rows: 45, top: 0 });
  // 72.35 squares: 72 is nearer, so the page grows a little.
  const up = alignedGrid(1447, 900);
  expect(up.columns).toBe(72);
  expect(up.factor).toBe(1447 / 1440);
  expect(up.columns * 20 * up.factor).toBeCloseTo(1447, 9);
  // 72.65 squares: 73 is nearer, so it shrinks a little.
  const down = alignedGrid(1453, 900);
  expect(down.columns).toBe(73);
  expect(down.factor).toBe(1453 / 1460);
  // Either side of the tie, the count whose scale is nearer 1 wins (the tie is just under half a square).
  expect(alignedGrid(1449, 900).columns).toBe(72);
  expect(alignedGrid(1450, 900).columns).toBe(73);
  // A window narrower than one square still has one, and no size is no grid.
  expect(alignedGrid(12, 900).columns).toBe(1);
  expect(alignedGrid(0, 900)).toEqual({ factor: 1, columns: 0, rows: 0, top: 0 });
});

test("Desktop aligned gives the height's leftover to the top, always under one square", () => {
  const up = alignedGrid(1447, 900);
  const unit = 20 * up.factor;
  expect(up.rows).toBe(44);
  expect(up.top).toBeCloseTo(900 - 44 * unit, 4);
  expect(up.top).toBeCloseTo(15.7222, 4);
  const down = alignedGrid(1453, 900);
  expect(down.rows).toBe(45);
  expect(down.top).toBeCloseTo(4.3151, 4);
  for (const [width, height] of [[1280, 800], [1366, 768], [1512, 982], [1920, 1013], [2560, 1297]]) {
    const grid = alignedGrid(width, height);
    const square = 20 * grid.factor;
    expect(Math.abs(grid.factor - 1)).toBeLessThan(0.01);
    expect(grid.columns * square).toBeCloseTo(width, 9);
    expect(grid.top).toBeGreaterThanOrEqual(0);
    expect(grid.top).toBeLessThan(square);
    expect(grid.rows * square + grid.top).toBeCloseTo(height, 3);
  }
  // A height of whole squares keeps them all, whatever a float's last digit says.
  const exact = alignedGrid(1447, 44 * unit);
  expect(exact.rows).toBe(44);
  expect(exact.top).toBe(0);
});

test("Desktop aligned can snap for sharp lines, giving up the exact fit", () => {
  const layout = alignedGrid(1447, 900, "layout");
  expect(layout.factor).toBe(toLayoutStep(1447 / 1440));
  const pixel = alignedGrid(1447, 900, "pixel", 2);
  expect(pixel.factor).toBe(toDevicePixel(1447 / 1440, 2));
  expect(pixel.factor).toBe(1);
});

test("a computer asked for Desktop aligned gets the grid on the root, and loses it when the option goes", () => {
  screen(COMPUTER, 1447);
  tall(900);
  expect(applyScaling({ desktop: "aligned" })).toBe(1447 / 1440);
  expect(root.style.getPropertyValue("--sf")).toBe(String(1447 / 1440));
  expect(root.hasAttribute("data-desktop-aligned")).toBe(true);
  expect(root.hasAttribute("data-mobile")).toBe(false);
  expect(root.style.getPropertyValue("--ds-grid-columns")).toBe("72");
  expect(root.style.getPropertyValue("--ds-grid-rows")).toBe("44");
  expect(root.style.getPropertyValue("--ds-grid-top")).toBe("15.7222px");
  // Without the option a computer is back at 1 with nothing left behind.
  expect(applyScaling()).toBe(1);
  expect(root.style.getPropertyValue("--sf")).toBe("1");
  expect(root.hasAttribute("data-desktop-aligned")).toBe(false);
  for (const property of ["--ds-grid-columns", "--ds-grid-rows", "--ds-grid-top"]) expect(root.style.getPropertyValue(property)).toBe("");
  // A fixed scale stays 1 too.
  expect(applyScaling({ desktop: "aligned", mode: "fixed" })).toBe(1);
  expect(root.hasAttribute("data-desktop-aligned")).toBe(false);
});

test("a phone keeps its own scale under Desktop aligned", () => {
  screen(COMPUTER, 1447);
  tall(900);
  applyScaling({ desktop: "aligned" });
  // The same page on a phone: its fourteen squares, and nothing of the computer's grid.
  screen(PHONE, 375, 3);
  expect(applyScaling({ desktop: "aligned" })).toBe(1.339);
  expect(root.hasAttribute("data-mobile")).toBe(true);
  expect(root.hasAttribute("data-desktop-aligned")).toBe(false);
  for (const property of ["--ds-grid-columns", "--ds-grid-rows", "--ds-grid-top"]) expect(root.style.getPropertyValue(property)).toBe("");
});

test("startScaling keeps a computer aligned through resizes", () => {
  let width = 1440;
  let height = 900;
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(COMPUTER);
  Object.defineProperty(root, "clientWidth", { configurable: true, get: () => width });
  Object.defineProperty(root, "clientHeight", { configurable: true, get: () => height });
  const stop = startScaling({ desktop: "aligned" });
  expect(root.style.getPropertyValue("--sf")).toBe("1");
  expect(root.style.getPropertyValue("--ds-grid-top")).toBe("0px");
  width = 1453; height = 910; window.dispatchEvent(new Event("resize"));
  expect(root.style.getPropertyValue("--sf")).toBe(String(1453 / 1460));
  expect(root.style.getPropertyValue("--ds-grid-columns")).toBe("73");
  expect(root.style.getPropertyValue("--ds-grid-rows")).toBe("45");
  stop();
  width = 1280; window.dispatchEvent(new Event("resize"));
  expect(root.style.getPropertyValue("--ds-grid-columns")).toBe("73");
});
