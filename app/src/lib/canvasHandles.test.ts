import { describe, expect, test } from "vite-plus/test";
import { COMPONENTS, componentSpec, tokenValue } from "../component-specs";
import { bandRect, canvasHandles, cornerPoint, handleNumber, handleSlider, handleToken, hitRect, readout, readoutGroup, readoutPlaces, resetToken, snapHandle, type CanvasHandle, type HandleKind } from "./canvasHandles";

const handle = (component: string, kind: HandleKind): CanvasHandle => canvasHandles(componentSpec(component)).find(candidate => candidate.kind === kind)!;
const button = { width: 100, height: 16 };

describe("canvas handles", () => {
  test("each component has a handle for each property it has, and only those", () => {
    const kinds = Object.fromEntries(COMPONENTS.map(spec => [spec.id, canvasHandles(spec).map(candidate => candidate.kind)]));
    expect(kinds).toEqual({
      button: ["height", "padding-start", "padding-end", "width", "corner"],
      input: ["height", "padding-start", "padding-end", "width", "corner"],
      checkbox: ["corner", "size"],
      switch: ["height"],
      tag: ["height", "padding-start", "padding-end", "corner"],
    });
  });

  test("a height drags in whole squares and writes 16, 36, 56 as snapHeight does", () => {
    const height = handle("button", "height");
    const slider = handleSlider(height, undefined, button, 1);
    expect(slider).toMatchObject({ value: 1, min: 1, max: 3, step: 1, axis: "vertical", gain: 1 / 20 });
    expect(snapHandle(slider, slider.value + 20 * slider.gain)).toBe(2);
    expect(snapHandle(handleSlider(height, undefined, button, 1.5), 1 + 30 * handleSlider(height, undefined, button, 1.5).gain)).toBe(2);
    expect(handleToken(height, 2)).toBe("36px");
    expect(handleToken(height, 1)).toBe("");
    expect(snapHandle(slider, 9)).toBe(3);
    expect(handleSlider(height, "36px", button, 1).value).toBe(2);
    expect(handleNumber(height, 3)).toBe(56);
  });

  test("a width drag starts from the squares drawn and makes the width fixed, within its range", () => {
    const width = handle("button", "width");
    expect(handleSlider(width, undefined, button, 1).value).toBe(5);
    expect(handleSlider(width, undefined, { width: 150, height: 24 }, 1.5).value).toBe(5);
    expect(handleSlider(width, "calc(7 * var(--ds-unit, 20px))", button, 1).value).toBe(7);
    expect(handleSlider(width, undefined, { width: 1000, height: 16 }, 1).value).toBe(16);
    expect(handleToken(width, 6)).toBe("calc(6 * var(--ds-unit, 20px))");
    expect(resetToken(width)).toBe("");
    expect(resetToken(handle("input", "width"))).toBe(tokenValue(handle("input", "width").property, { mode: "fill", squares: 12 }));
  });

  test("padding snaps on its step, Shift on its big step, and the end band grows against the pointer", () => {
    const start = handleSlider(handle("button", "padding-start"), undefined, button, 1);
    const end = handleSlider(handle("button", "padding-end"), undefined, button, 2);
    expect(start).toMatchObject({ value: 4, step: 4, shiftStep: 20, gain: 1 });
    expect(end.gain).toBe(-0.5);
    expect(snapHandle(start, 4 + 5)).toBe(8);
    expect(snapHandle(start, 4 + 7, true)).toBe(20);
    expect(snapHandle(start, -10)).toBe(0);
    expect(handleToken(handle("button", "padding-start"), 8)).toBe("8px");
    expect(handleToken(handle("button", "padding-end"), 4)).toBe("");
  });

  test("corner and size snap on their steps", () => {
    const corner = handleSlider(handle("button", "corner"), undefined, button, 1);
    expect(snapHandle(corner, 4 + 3)).toBe(8);
    expect(handleToken(handle("button", "corner"), 6)).toBe("6px");
    const size = handleSlider(handle("checkbox", "size"), undefined, { width: 16, height: 16 }, 1);
    expect(size).toMatchObject({ value: 16, min: 12, max: 20, step: 4 });
    expect(snapHandle(size, 19)).toBe(20);
    expect(handleToken(handle("checkbox", "size"), 16)).toBe("");
  });

  test("readouts are plain numbers after the property's letter", () => {
    expect(readout(handle("button", "height"), 2)).toBe("H 36");
    expect(readout(handle("button", "padding-end"), 8)).toBe("P 8");
    expect(readout(handle("button", "corner"), 4)).toBe("R 4");
    expect(readout(handle("button", "width"), 6)).toBe("W 6 sq");
    expect(readout(handle("checkbox", "size"), 16)).toBe("S 16");
    expect(readoutGroup("height")).toBe("side");
    expect(readoutGroup("width")).toBe("below");
    expect(readoutPlaces(button, 1)).toEqual({ side: { left: 106, top: 0, width: 0, height: 16 }, below: { left: 0, top: 20, width: 100, height: 16 } });
  });

  test("bands stand inside the edges at the padding's drawn width", () => {
    expect(bandRect("padding-start", button, 8, 1.5)).toEqual({ left: 0, top: 0, width: 12, height: 16 });
    expect(bandRect("padding-end", button, 8, 1)).toEqual({ left: 92, top: 0, width: 8, height: 16 });
    expect(bandRect("padding-end", { width: 10, height: 16 }, 8, 1).width).toBe(5);
  });

  test("hit areas are a square thick at the edges and do not overlap one another", () => {
    const spec = componentSpec("button");
    const handles = canvasHandles(spec);
    const kinds = handles.map(candidate => candidate.kind);
    const rects = handles.map(candidate => hitRect(candidate, button, { padding: 4, corner: 4 }, 1, kinds));
    const [height, start, end, width, corner] = rects;
    expect(height).toEqual({ left: 0, top: 12, width: 96, height: 20 });
    expect(width).toEqual({ left: 96, top: 0, width: 20, height: 16 });
    expect(start!.width).toBeGreaterThanOrEqual(20);
    const overlap = (a: typeof height, b: typeof height) => a!.left < b!.left + b!.width && b!.left < a!.left + a!.width && a!.top < b!.top + b!.height && b!.top < a!.top + a!.height;
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) expect(overlap(rects[i], rects[j]), `${kinds[i]} and ${kinds[j]}`).toBe(false);
    expect(end!.left + end!.width).toBe(96);
    expect(cornerPoint(button, 4, 1)).toBe(-6);
    expect(corner!.left + corner!.width).toBe(0);
    expect(cornerPoint({ width: 100, height: 36 }, 4, 1)).toBe(8);
    expect(cornerPoint({ width: 100, height: 36 }, 12, 1)).toBe(12);
    expect(cornerPoint({ width: 100, height: 36 }, 20, 1)).toBe(18);
  });
});
