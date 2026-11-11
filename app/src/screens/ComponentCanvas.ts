import { html, LitElement, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { keyed } from "lit/directives/keyed.js";
import { styleMap } from "lit/directives/style-map.js";
import "../../../DS1/2-core/ds-button";
import "../../../DS1/2-core/ds-checkbox";
import "../../../DS1/2-core/ds-icon";
import "../../../DS1/2-core/ds-input";
import "../../../DS1/2-core/ds-switch";
import "../../../DS1/2-core/ds-tag";
import "../../../DS1/4-page/ds-grid";
import type { ComponentSpec } from "../component-specs";
import { AppElement, defineElement } from "../lib/element";
import { scopeLibrary } from "../lib/libraryScope";
import type { PropertyEditing } from "../lib/propertyEditing";
import "./CanvasHandles";
import type { CanvasBox, HandleChange } from "./CanvasHandles";
import "./component-editor.css";

type Specimen = { name: string; render: () => TemplateResult };

/** Each component in the states a person meets it in, as its documentation draws it. */
const SPECIMENS: Record<string, Specimen[]> = {
  button: [
    { name: "Primary", render: () => html`<ds-button primary>Save changes</ds-button>` },
    { name: "Secondary", render: () => html`<ds-button secondary>Cancel</ds-button>` },
    { name: "Text", render: () => html`<ds-button>Text button</ds-button>` },
    { name: "With an icon", render: () => html`<ds-button primary><ds-icon type="check"></ds-icon> Save</ds-button>` },
    { name: "Disabled", render: () => html`<ds-button primary disabled>Disabled</ds-button>` },
  ],
  input: [
    { name: "Empty", render: () => html`<ds-input variant="field" aria-label="Your name" placeholder="Enter your name"></ds-input>` },
    { name: "Filled", render: () => html`<ds-input variant="field" aria-label="Email" value="hello@example.com"></ds-input>` },
    { name: "Disabled", render: () => html`<ds-input variant="field" aria-label="Unavailable" value="Read only" disabled></ds-input>` },
  ],
  checkbox: [
    { name: "Off", render: () => html`<ds-checkbox><input type="checkbox" aria-label="Updates"></ds-checkbox>` },
    { name: "Ticked", render: () => html`<ds-checkbox><input type="checkbox" aria-label="News" checked></ds-checkbox>` },
    { name: "Mixed", render: () => html`<ds-checkbox><input type="checkbox" aria-label="Some" .indeterminate=${true}></ds-checkbox>` },
    { name: "Disabled", render: () => html`<ds-checkbox><input type="checkbox" aria-label="Unavailable" disabled></ds-checkbox>` },
  ],
  switch: [
    { name: "On", render: () => html`<ds-switch><button type="button" role="switch" aria-label="Notifications" aria-checked="true"></button></ds-switch>` },
    { name: "Off", render: () => html`<ds-switch><button type="button" role="switch" aria-label="Sharing" aria-checked="false"></button></ds-switch>` },
    { name: "Disabled", render: () => html`<ds-switch><button type="button" role="switch" aria-label="Unavailable" aria-checked="false" disabled></button></ds-switch>` },
  ],
  tag: [
    { name: "Short", render: () => html`<ds-tag>App</ds-tag>` },
    { name: "Longer words", render: () => html`<ds-tag>Waiting for review</ds-tag>` },
  ],
};

const sheet = (text: string) => {
  try { const result = new CSSStyleSheet(); result.replaceSync(text); return result; } catch { return null; }
};
/** The canvas's own mark inside a specimen: another state under the pointer takes a faint outline on its face, as a design tool hovers. */
const HOVER = sheet(`:host([data-hover]) > :not(ds-checkbox), :host([data-hover]) > ds-checkbox > input { outline: 1px solid var(--component-editor-hover-line); outline-offset: 0; }`);

/**
 * One specimen's body, a shadow root around the component. Its stylesheets are the design's own
 * (a library's scoped rules, `lib/libraryScope.ts`) and the canvas's hover mark; nothing of the
 * page around it reaches in but what is inherited, and nothing of the design reaches out.
 */
export class SpecimenBody extends LitElement {
  static override properties = { content: { attribute: false }, designs: { attribute: false } };
  declare content: TemplateResult;
  /** The design's sheets, in order: its stylesheet, then a preview drawn over it. */
  declare designs: (CSSStyleSheet | null)[];

  constructor() {
    super();
    this.designs = [];
  }

  override willUpdate() {
    (this.renderRoot as ShadowRoot).adoptedStyleSheets = [...this.designs, HOVER].filter((item): item is CSSStyleSheet => !!item);
  }

  override render() { return this.content; }
}
defineElement("ds1-specimen", SpecimenBody);

/**
 * A component's states on the grid, the selected one measured and edited on its own handles
 * (`CanvasHandles.ts`), as a design tool does: a drag previews on the canvas and in the property
 * groups (`editing.preview`) without touching the draft, and commits once on release through
 * `editing`, the property groups' own path. The base system's editor draws its draft's `tokens`
 * on the canvas; a library's workbench gives its `stylesheet`, which only the specimens take.
 */
export class ComponentCanvas extends AppElement {
  static properties = {
    spec: { attribute: false },
    editing: { attribute: false },
    tokens: { attribute: false },
    stylesheet: { attribute: false },
    overlay: { attribute: false },
    locked: { attribute: false },
    theme: { state: true },
    selected: { state: true },
    hovered: { state: true },
    measure: { state: true },
  };
  declare spec: ComponentSpec;
  declare editing: PropertyEditing;
  /** Tokens drawn on the canvas itself, inherited by every specimen (the base's draft). */
  declare tokens: Record<string, string>;
  /** A design's whole stylesheet, drawn on the specimens alone (a library); undefined for the base. */
  declare stylesheet: string | undefined;
  /** A short sheet drawn over the stylesheet on the specimens while something else previews (the box model's drag), scoped on its own so the stylesheet is not. */
  declare overlay: string;
  /** Properties something else draws, each with its value: shown, not edited (`buttonBoxPins`). */
  declare locked: ReadonlyMap<string, string>;
  declare selected: number;
  declare hovered: number;
  /** The selected component's face as drawn, relative to the canvas, at the surface's scale. */
  declare measure: CanvasBox | null;
  /** The document's theme, mirrored onto each specimen so a design's theme selectors match as on its page. */
  declare theme: SpecimenTheme;
  #component = "";
  #handlesFor = "";
  #observer: ResizeObserver | null = null;
  #frame = 0;
  #design: { css: string; sheet: CSSStyleSheet | null; faces: HTMLStyleElement } | null = null;
  #overlay: { css: string; sheet: CSSStyleSheet | null } = { css: "", sheet: null };
  #themes = typeof MutationObserver === "undefined" ? null : new MutationObserver(() => { this.theme = documentTheme(); });

  constructor() {
    super();
    this.tokens = {};
    this.stylesheet = undefined;
    this.overlay = "";
    this.theme = documentTheme();
    this.locked = new Map();
    this.selected = 0;
    this.hovered = -1;
    this.measure = null;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined") this.#observer = new ResizeObserver(() => this.#scheduleMeasure());
    this.#themes?.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "data-docs-theme"] });
    this.theme = documentTheme();
  }

  override disconnectedCallback() {
    this.#observer?.disconnect();
    this.#themes?.disconnect();
    cancelAnimationFrame(this.#frame);
    this.#design?.faces.remove();
    this.#design = null;
    super.disconnectedCallback();
  }

  override willUpdate() {
    // A newly opened component starts on its first state.
    if (this.spec.id !== this.#component) { this.#component = this.spec.id; this.selected = 0; }
    // Another component, state or set of locked properties ends a drag on the last one: its handles
    // are drawn anew (keyed in render, so the old ones cancel as they disconnect) and its preview goes.
    const handlesFor = this.#handlesKey();
    if (handlesFor !== this.#handlesFor) { this.#handlesFor = handlesFor; this.editing.preview.set(null); }
  }

  #handlesKey() { return `${this.spec.id}:${this.selected}:${[...this.locked.keys()].join(",")}`; }

  override updated() {
    const canvas = this.querySelector(".component-editor-canvas");
    if (canvas) this.#observer?.observe(canvas);
    this.#scheduleMeasure();
  }

  #scheduleMeasure() {
    cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => this.#measure());
  }

  /** The selected specimen's face, read from the component as drawn, for the selection, its handles and its numbers. */
  #measure() {
    const canvas = this.querySelector<HTMLElement>(".component-editor-canvas");
    const element = canvas?.querySelector(".component-editor-specimen[aria-selected='true'] .component-editor-specimen-body")?.shadowRoot?.firstElementChild;
    if (!canvas || !element) { if (this.measure) this.measure = null; return; }
    // A face the component does not draw shows no handles rather than handles on the wrong box.
    const target = this.spec.face ? element.querySelector<HTMLElement>(this.spec.face) : element;
    if (!target) { if (this.measure) this.measure = null; return; }
    const outer = canvas.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const sf = Number.parseFloat(getComputedStyle(canvas).getPropertyValue("--ds-sf")) || 1;
    const next = { width: Math.round(box.width), height: Math.round(box.height), left: Math.round(box.left - outer.left), top: Math.round(box.top - outer.top), sf };
    const current = this.measure;
    if (!current || (Object.keys(next) as (keyof CanvasBox)[]).some(key => current[key] !== next[key])) this.measure = next;
    // A locked length whose value the block does not say plainly is read from the component as drawn.
    const part = target.shadowRoot?.querySelector<HTMLElement>("[part~='control']") ?? target;
    const drawn = new Map(this.spec.properties.flatMap(({ token, label }) => this.locked.get(token) === "" && DRAWN[label]
      ? [[token, Math.round(Number.parseFloat(getComputedStyle(part).getPropertyValue(DRAWN[label])) / sf)] as const] : []));
    const known = this.editing.drawn.get();
    if (drawn.size !== known.size || [...drawn].some(([token, value]) => known.get(token) !== value)) this.editing.drawn.set(drawn);
  }

  /**
   * The design's stylesheet for the specimens, scoped once per change: its rules shared by every
   * specimen's shadow root, its faces in the document, where faces work in every browser.
   */
  #sheet(): CSSStyleSheet | null {
    const css = this.stylesheet;
    if (css === undefined) { this.#design?.faces.remove(); this.#design = null; return null; }
    if (this.#design?.css === css) return this.#design.sheet;
    const scoped = scopeLibrary(css);
    const faces = this.#design?.faces ?? document.createElement("style");
    faces.dataset.ds1LibraryFaces = "";
    // Faces set again would be loaded again, with a flash of the fallback face and a moving measure.
    if (faces.textContent !== scoped.faces) faces.textContent = scoped.faces;
    if (!faces.isConnected) document.head.append(faces);
    this.#design = { css, sheet: sheet(scoped.rules), faces };
    return this.#design.sheet;
  }

  #overlaySheet(): CSSStyleSheet | null {
    if (this.#overlay.css !== this.overlay) this.#overlay = { css: this.overlay, sheet: this.overlay ? sheet(scopeLibrary(this.overlay).rules) : null };
    return this.#overlay.sheet;
  }

  /** A drag's preview, only while its component is the one open (a cancelled drag's last word may come after). */
  #preview(spec: ComponentSpec, change: HandleChange | null) {
    if (change && spec.id !== this.#component) return;
    this.editing.preview.set(change);
  }

  /** A handle's release, through the same path as the property groups' fields. */
  #commit(spec: ComponentSpec, change: HandleChange) {
    if (spec.properties.some(property => property.token === change.token) && !this.locked.has(change.token)) this.editing.edit(change.token, change.value);
  }

  /** What each property's handle shows: a drag's preview first, a locked one's drawn value (a height as measured). */
  #values(measure: CanvasBox) {
    return Object.fromEntries(this.spec.properties.map(({ token, kind }) => {
      const locked = this.locked.get(token);
      if (locked === undefined) return [token, this.editing.written(token)];
      if (kind === "control" || kind === "row") return [token, `${Math.round(measure.height / measure.sf)}px`];
      const drawn = this.editing.drawn.get().get(token);
      return [token, locked || (drawn === undefined ? undefined : `${drawn}px`)];
    }));
  }

  override render() {
    const { spec, editing } = this;
    const specimens = SPECIMENS[spec.id] ?? [];
    const selected = Math.min(this.selected, specimens.length - 1);
    const preview = editing.preview.get();
    const overrides = { ...this.tokens };
    if (preview) { if (preview.value) overrides[preview.token] = preview.value; else delete overrides[preview.token]; }
    const designs = [this.#sheet(), this.#overlaySheet()];
    const { theme } = this;
    // A design's own `:host` values are the specimen's, so the scale and a drag's preview are set on
    // the specimen itself, where they win over them ("initial" being a token's unset value).
    const own = this.stylesheet !== undefined ? { "--ds-sf": "inherit", "--sf": "inherit", ...(preview ? { [preview.token]: preview.value || (editing.draft.unset?.(preview.token) ?? "initial") } : {}) } : {};
    const keys = (event: KeyboardEvent) => {
      const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      this.selected = (selected + step + specimens.length) % specimens.length;
      void this.updateComplete.then(() => this.querySelector<HTMLElement>(".component-editor-specimen[aria-selected='true']")?.focus());
    };
    const measure = this.measure;
    const pinned = spec.properties.filter(property => this.locked.has(property.token)).map(property => property.label.toLowerCase());
    return html`<div class="component-editor-canvas" data-testid="component-canvas" style=${styleMap(overrides)}>
      <ds-grid contained></ds-grid>
      <div class="component-editor-specimens" role="listbox" aria-label=${`${spec.name} states`} @keydown=${keys}>
        ${specimens.map((specimen, index) => html`<div class="component-editor-specimen" role="option" aria-selected=${String(index === selected)} tabindex=${index === selected ? 0 : -1}
          @click=${() => { this.selected = index; }} @pointerenter=${() => { this.hovered = index; }} @pointerleave=${() => { if (this.hovered === index) this.hovered = -1; }}>
          <span class="component-editor-specimen-name">${specimen.name}</span>
          <ds1-specimen class=${`component-editor-specimen-body${theme.name ? ` ${theme.name}-theme` : ""}`} inert ?data-hover=${index === this.hovered && index !== selected}
            data-theme=${ifDefined(theme.data)} data-docs-theme=${ifDefined(theme.docs)}
            style=${styleMap(own)} .designs=${designs} .content=${specimen.render()}></ds1-specimen>
          ${index === selected && measure ? html`<span class="component-editor-size" data-testid="component-size">${measure.width} × ${measure.height}</span>` : nothing}
        </div>`)}
      </div>
      ${measure ? keyed(this.#handlesKey(), html`<ds1-canvas-handles .spec=${spec} .box=${measure} .values=${this.#values(measure)} .locked=${new Set(this.locked.keys())}
        @handle-preview=${(event: CustomEvent<HandleChange | null>) => this.#preview(spec, event.detail)}
        @handle-commit=${(event: CustomEvent<HandleChange>) => this.#commit(spec, event.detail)}></ds1-canvas-handles>`) : nothing}
    </div>
    ${pinned.length ? html`<p class="component-editor-note" data-testid="canvas-pinned">${sentence(pinned)} ${pinned.length > 1 ? "are" : "is"} set in the box model.</p>` : nothing}`;
  }
}
defineElement("ds1-component-canvas", ComponentCanvas);

/** The CSS property a locked length is measured by on the drawn component, by its label. */
const DRAWN: Record<string, string> = { Padding: "padding-left", Corner: "border-top-left-radius" };

type SpecimenTheme = { name: "dark" | "light" | ""; data: string | undefined; docs: string | undefined };

/**
 * The document's theme as the specimens carry it: the root's `dark-theme`/`light-theme` class, or
 * the documentation's theme (`data-docs-theme`) when the app stands in its frame, as the example
 * frames take it, and the root's `data-theme` and `data-docs-theme` as they are.
 */
export function documentTheme(root: Element = document.documentElement): SpecimenTheme {
  const docs = root.getAttribute("data-docs-theme") ?? undefined;
  const name = root.classList.contains("dark-theme") ? "dark" : root.classList.contains("light-theme") ? "light" : docs === "dark" || docs === "light" ? docs : "";
  return { name, data: root.getAttribute("data-theme") ?? undefined, docs };
}

/** "height, padding and corner" → "Height, padding and corner". */
const sentence = (words: string[]) => {
  const text = words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : words[0]!;
  return text[0]!.toUpperCase() + text.slice(1);
};
