import { SQUARE, readLength, readWidth, tokenValue, type ComponentProperty, type ComponentSpec } from "../component-specs";

/**
 * The canvas handles' arithmetic, kept apart from the drawing: which handles a component has, the
 * value each one drags (in its own unit), the token a value writes, its readout, and where each
 * handle, band and readout stands on the box of the component as drawn.
 *
 * Heights and widths drag in whole squares, so a pointer snaps them exactly as the inspector does;
 * every other handle drags in unscaled px on its property's step. Boxes are in CSS px at the
 * surface's scale (`sf`); values are unscaled, as the tokens are.
 */
export type HandleKind = "height" | "width" | "padding-start" | "padding-end" | "corner" | "size";

export interface CanvasHandle { kind: HandleKind; property: ComponentProperty }

/** A handle's slider in its own unit: squares for a height or a width, px otherwise. */
export interface HandleSlider {
  value: number; min: number; max: number; step: number; shiftStep: number;
  axis: "horizontal" | "vertical";
  /** Units per pointer px: the drag follows the hand at the surface's scale. */
  gain: number;
}

export interface Box { width: number; height: number }
export interface Rect { left: number; top: number; width: number; height: number }

/** Each handle the spec's properties call for, in drawing order (later ones win where hit areas meet). */
export function canvasHandles(spec: ComponentSpec): CanvasHandle[] {
  const handles: CanvasHandle[] = [];
  const find = (test: (property: ComponentProperty) => boolean) => spec.properties.find(test);
  const height = find(property => property.kind === "control" || property.kind === "row");
  const width = find(property => property.kind === "width");
  const padding = find(property => property.kind === "length" && property.label === "Padding");
  const corner = find(property => property.kind === "length" && property.label === "Corner");
  const size = find(property => property.kind === "length" && property.label === "Size");
  if (height) handles.push({ kind: "height", property: height });
  if (padding) handles.push({ kind: "padding-start", property: padding }, { kind: "padding-end", property: padding });
  if (width) handles.push({ kind: "width", property: width });
  if (corner) handles.push({ kind: "corner", property: corner });
  if (size) handles.push({ kind: "size", property: size });
  return handles;
}

/** The spare four above a control's face: a control is N × 20 − 4 high, a row N × 20. */
const offset = (property: ComponentProperty) => property.kind === "control" ? 4 : 0;

/**
 * A handle's slider for a property's written value (undefined while unset). A width that hugs or
 * fills starts from the squares it is drawn across, so the first drag makes it fixed where it stands.
 */
export function handleSlider(handle: CanvasHandle, written: string | undefined, box: Box, sf: number): HandleSlider {
  const { kind, property } = handle;
  if (kind === "height") {
    const squares = (px: number) => (px + offset(property)) / SQUARE;
    return { value: squares(readLength(property, written)), min: squares(property.min!), max: squares(property.max!), step: 1, shiftStep: 1, axis: "vertical", gain: 1 / (SQUARE * sf) };
  }
  if (kind === "width") {
    const { mode, squares } = readWidth(property, written);
    const drawn = Math.min(property.max!, Math.max(property.min!, Math.round(box.width / sf / SQUARE)));
    return { value: mode === "fixed" ? squares : drawn, min: property.min!, max: property.max!, step: 1, shiftStep: property.bigStep ?? 1, axis: "horizontal", gain: 1 / (SQUARE * sf) };
  }
  // The end band grows inward, against the pointer; the rest grow with it.
  const gain = (kind === "padding-end" ? -1 : 1) / sf;
  return { value: readLength(property, written), min: property.min!, max: property.max!, step: property.step!, shiftStep: property.bigStep ?? property.step!, axis: "horizontal", gain };
}

/** A dragged value on the slider's step (Shift: its big step), within its range. */
export function snapHandle(slider: HandleSlider, value: number, shift = false) {
  const step = shift ? slider.shiftStep : slider.step;
  return Math.min(slider.max, Math.max(slider.min, Math.round(value / step) * step));
}

/** The px (or, for a width, squares) a slider value stands for: what the readout and the slider's value say. */
export function handleNumber(handle: CanvasHandle, value: number) {
  return handle.kind === "height" ? value * SQUARE - offset(handle.property) : value;
}

/** The token value a handle writes, "" to take the token out (back to its default). */
export function handleToken(handle: CanvasHandle, value: number) {
  if (handle.kind === "width") return tokenValue(handle.property, { mode: "fixed", squares: value });
  return tokenValue(handle.property, handleNumber(handle, value));
}

/** The token value a double-click writes: the default, a width in its first mode. */
export function resetToken(handle: CanvasHandle) {
  return handle.kind === "width" ? tokenValue(handle.property, { mode: handle.property.modes![0]!, squares: Number(handle.property.default) }) : "";
}

/** The readout beside a handle, plain numbers after the property's letter: `H 36`, `P 8`, `W 6 sq`. */
export function readout(handle: CanvasHandle, value: number) {
  const unit = handle.property.unit ? ` ${handle.property.unit}` : "";
  return `${handle.property.lead ?? ""} ${handleNumber(handle, value)}${unit}`.trim();
}

/** The padding band inside one edge, as drawn: `padding` is unscaled px. */
export function bandRect(kind: "padding-start" | "padding-end", box: Box, padding: number, sf: number): Rect {
  const width = Math.min(box.width / 2, padding * sf);
  return { left: kind === "padding-start" ? 0 : box.width - width, top: 0, width, height: box.height };
}

/**
 * Where a handle takes the pointer, relative to the box's top left: edges a square thick straddling
 * the edge, mostly outside; bands at least a square wide from their edge, short of the edges'
 * strips; the corner a small target inset at its radius; the size a square on the far corner.
 */
export function hitRect(handle: CanvasHandle, box: Box, values: { padding: number; corner: number }, sf: number, kinds: readonly HandleKind[]): Rect {
  const unit = SQUARE * sf;
  const inside = 4 * sf;
  const { width: w, height: h } = box;
  const foot = kinds.includes("height") ? h - inside : h;
  switch (handle.kind) {
    case "height": return { left: 0, top: h - inside, width: kinds.includes("width") ? w - inside : w, height: unit };
    case "width": return { left: w - inside, top: 0, width: unit, height: h };
    case "padding-start": {
      const right = Math.min(w / 2, Math.max(values.padding * sf, 16 * sf));
      return { left: -8 * sf, top: 0, width: right + 8 * sf, height: foot };
    }
    case "padding-end": {
      const right = kinds.includes("width") ? w - inside : w + 8 * sf;
      const left = Math.max(w / 2, w - Math.max(values.padding * sf, 16 * sf));
      return { left, top: 0, width: right - left, height: foot };
    }
    case "corner": {
      const at = cornerPoint(box, values.corner, sf);
      const size = 12 * sf;
      return { left: at - size / 2, top: at - size / 2, width: size, height: size };
    }
    case "size": return { left: w - unit / 2, top: h - unit / 2, width: unit, height: unit };
  }
}

/**
 * The corner handle's centre on the diagonal from the top left: inset by the radius (at least 8,
 * at most half the box) where the box is two controls across, or just outside the corner on a box
 * smaller than that, where an inset handle would cover the padding bands.
 */
export function cornerPoint(box: Box, corner: number, sf: number) {
  if (Math.min(box.width, box.height) < 36 * sf) return -6 * sf;
  return Math.min(Math.min(box.width, box.height) / 2, Math.max(8 * sf, corner * sf));
}

/** Where a readout stands: beside the face's foot (a height, a size, the corner) or below it on the size line's row (the padding at the start, the width at the end). */
export const readoutGroup = (kind: HandleKind): "side" | "below" => kind === "height" || kind === "size" || kind === "corner" ? "side" : "below";

/** The two readout rows: beside the foot, one line high, and below the face, at least as wide as it. */
export function readoutPlaces(box: Box, sf: number): Record<"side" | "below", Rect> {
  const line = 16 * sf;
  return {
    side: { left: box.width + 6 * sf, top: box.height - line, width: 0, height: line },
    below: { left: 0, top: box.height + 4 * sf, width: box.width, height: line },
  };
}
