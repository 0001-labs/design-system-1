import { html, nothing } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";
import { bindSpacingHandle } from "../../../packages/app/src/2-core/spacing-handle";
import { SQUARE, readLength, type ComponentSpec } from "../component-specs";
import { bandRect, canvasHandles, handleNumber, handleSlider, handleToken, hitRect, readout, readoutGroup, readoutPlaces, resetToken, snapHandle, type CanvasHandle, type HandleKind, type Rect } from "../lib/canvasHandles";
import { AppElement, defineElement } from "../lib/element";

export type CanvasBox = { width: number; height: number; left: number; top: number; sf: number };
export type HandleChange = { token: string; value: string };

const LABELS: Record<HandleKind, string> = {
  height: "Height", width: "Width", "padding-start": "Padding at the start", "padding-end": "Padding at the end", corner: "Corner", size: "Size",
};
const px = (rect: Rect) => ({ left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });

export class CanvasHandles extends AppElement {
  static properties = {
    spec: { attribute: false },
    box: { attribute: false },
    values: { attribute: false },
    locked: { attribute: false },
    active: { state: true },
    measuring: { state: true },
  };
  declare spec: ComponentSpec;
  declare box: CanvasBox;
  declare values: Record<string, string | undefined>;
  declare locked: ReadonlySet<string>;
  declare active: HandleKind | null;
  declare measuring: boolean;
  #unbind = new Map<HTMLElement, () => void>();
  #drag: { value: number; pointer: boolean } | null = null;
  #pointer = { x: -1, y: -1, shift: false };

  constructor() {
    super();
    this.values = {};
    this.locked = new Set();
    this.active = null;
    this.measuring = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("pointermove", this.#track, true);
    window.addEventListener("keydown", this.#key);
    window.addEventListener("keyup", this.#key);
    window.addEventListener("blur", this.#leave);
  }

  override disconnectedCallback() {
    window.removeEventListener("pointermove", this.#track, true);
    window.removeEventListener("keydown", this.#key);
    window.removeEventListener("keyup", this.#key);
    window.removeEventListener("blur", this.#leave);
    for (const unbind of this.#unbind.values()) unbind();
    this.#unbind.clear();
    super.disconnectedCallback();
  }

  get #all() { return canvasHandles(this.spec); }
  get #handles() { return this.#all.filter(handle => !this.locked.has(handle.property.token)); }

  #slider(handle: CanvasHandle) { return handleSlider(handle, this.values[handle.property.token], this.box, this.box.sf); }

  #track = (event: PointerEvent) => {
    this.#pointer = { x: event.clientX, y: event.clientY, shift: event.shiftKey };
    if (event.altKey || this.measuring) this.#measure(event.altKey);
  };
  #key = (event: KeyboardEvent) => {
    if (event.key !== "Alt") return;
    this.#measure(event.type === "keydown");
    if (this.measuring) event.preventDefault();
  };
  #leave = () => { this.measuring = false; };

  #measure(alt: boolean) {
    const frame = this.querySelector(".component-editor-handles")?.getBoundingClientRect();
    const margin = SQUARE * this.box.sf;
    const over = !!frame && this.#pointer.x >= frame.left - margin && this.#pointer.x <= frame.right + margin && this.#pointer.y >= frame.top - margin && this.#pointer.y <= frame.bottom + margin;
    const next = alt && over && !this.#drag;
    if (next !== this.measuring) this.measuring = next;
  }

  #emit(type: "handle-preview" | "handle-commit", handle: CanvasHandle, value: string | null) {
    this.emit<HandleChange | null>(type, value === null ? null : { token: handle.property.token, value });
  }

  override updated() {
    for (const [element, unbind] of this.#unbind) if (!element.isConnected) { unbind(); this.#unbind.delete(element); }
    for (const element of this.querySelectorAll<HTMLElement>(".component-editor-handle")) {
      if (this.#unbind.has(element)) continue;
      const current = this.#handles.find(candidate => candidate.kind === element.dataset.handle);
      if (!current) continue;
      this.#unbind.set(element, bindSpacingHandle(element, () => {
        const slider = this.#slider(current);
        return {
          ...slider, threshold: 3, immediateKeyboard: true,
          onStart: source => { this.#drag = { value: slider.value, pointer: source === "pointer" }; this.measuring = false; this.active = current.kind; },
          onPreview: value => {
            if (!this.#drag) return;
            this.#drag.value = snapHandle(slider, value, this.#pointer.shift);
            this.#emit("handle-preview", current, handleToken(current, this.#drag.value));
          },
          onCommit: value => this.#emit("handle-commit", current, handleToken(current, this.#drag?.pointer ? this.#drag.value : value)),
          onEnd: () => {
            this.#drag = null;
            this.#emit("handle-preview", current, null);
            this.active = element.matches(":focus-visible") ? current.kind : null;
          },
        };
      }));
    }
    this.#placeReadouts();
  }

  #placeReadouts() {
    const side = this.querySelector<HTMLElement>(".component-editor-readouts[data-group='side']");
    const canvas = this.closest(".component-editor-canvas") ?? this.parentElement;
    if (!side || !canvas) return;
    side.removeAttribute("data-flip");
    side.toggleAttribute("data-flip", side.getBoundingClientRect().right > canvas.getBoundingClientRect().right);
  }

  #focus(kind: HandleKind, event: FocusEvent) {
    if (event.type === "focus" && (event.currentTarget as HTMLElement).matches(":focus-visible")) this.active = kind;
    else if (event.type === "blur" && !this.#drag && this.active === kind) this.active = null;
  }

  override render() {
    const { box } = this;
    const all = this.#all;
    const handles = this.#handles;
    const kinds = handles.map(handle => handle.kind);
    const padding = all.find(handle => handle.kind === "padding-start");
    const corner = all.find(handle => handle.kind === "corner");
    const values = {
      padding: padding ? readLength(padding.property, this.values[padding.property.token]) : 0,
      corner: corner ? readLength(corner.property, this.values[corner.property.token]) : 0,
    };
    const places = readoutPlaces(box, box.sf);
    const shown = this.measuring ? all.filter(handle => handle.kind !== "padding-end") : handles.filter(handle => handle.kind === this.active);
    return html`<div class="component-editor-handles" data-testid="canvas-handles" data-active=${this.active ?? nothing} ?data-measuring=${this.measuring}
      style=${styleMap(px(box))}>
      ${padding ? (["padding-start", "padding-end"] as const).map(kind => html`<span class="component-editor-band" data-band=${kind} aria-hidden="true"
        style=${styleMap(px(bandRect(kind, box, values.padding, box.sf)))}></span>`) : nothing}
      ${repeat(handles, handle => handle.kind, handle => {
        const slider = this.#slider(handle);
        return html`<div class="component-editor-handle" data-handle=${handle.kind} data-testid=${`handle-${handle.kind}`} role="slider" tabindex="0"
          aria-label=${LABELS[handle.kind]} aria-orientation=${slider.axis}
          aria-valuenow=${handleNumber(handle, slider.value)} aria-valuemin=${handleNumber(handle, slider.min)} aria-valuemax=${handleNumber(handle, slider.max)}
          aria-valuetext=${readout(handle, slider.value)}
          style=${styleMap({ ...px(hitRect(handle, box, values, box.sf, kinds)), "--mark-x": handle.kind === "height" ? `${box.width / 2}px` : undefined })}
          @focus=${(event: FocusEvent) => this.#focus(handle.kind, event)} @blur=${(event: FocusEvent) => this.#focus(handle.kind, event)}
          @dblclick=${() => this.#emit("handle-commit", handle, resetToken(handle))}></div>`;
      })}
      ${(["side", "below"] as const).map(group => {
        const items = shown.filter(handle => readoutGroup(handle.kind) === group);
        return items.length ? html`<span class="component-editor-readouts" data-group=${group} aria-hidden="true"
          style=${styleMap({ "--x": `${places[group].left}px`, "--y": `${places[group].top}px`, minWidth: `${places[group].width}px` })}>
          ${items.map(handle => html`<span class="component-editor-readout" data-readout=${handle.kind}>${readout(handle, this.#slider(handle).value)}</span>`)}
        </span>` : nothing;
      })}
    </div>`;
  }
}
defineElement("ds1-canvas-handles", CanvasHandles);
