import { LitElement, html, unsafeCSS } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import styles from "./styles/ds-row.css?inline";
import { define } from "../0-face/define";
import { CutFades } from "../0-face/cut-fade";

const CURRENT = new Set(["page", "step", "location", "date", "time", "true"]);

export class Row extends LitElement {
  static properties = {
    subgrid: { type: Boolean, reflect: true },
    deferOffscreen: { type: Boolean, reflect: true, attribute: "defer-offscreen" },
    fill: { type: Boolean, reflect: true },
    centered: { type: Boolean, reflect: true },
    end: { type: Boolean, reflect: true },
    auto: { type: Boolean, reflect: true },
    stacked: { type: Boolean, reflect: true },
    href: { type: String, reflect: true },
    interactive: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    current: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
    nav: { type: Boolean, reflect: true },
    label: { type: String },
    target: { type: String },
    rel: { type: String },
  };

  declare subgrid: boolean;
  declare deferOffscreen: boolean;
  declare fill: boolean;
  declare centered: boolean;
  declare end: boolean;
  declare auto: boolean;
  declare stacked: boolean;
  declare href: string | undefined;
  declare interactive: boolean;
  declare disabled: boolean;
  declare current: string | null | undefined;
  declare open: boolean | undefined;
  declare nav: boolean;
  declare label: string | undefined;
  declare target: string | undefined;
  declare rel: string | undefined;

  constructor() {
    super();
    this.subgrid = false;
    this.deferOffscreen = false;
    this.fill = false;
    this.centered = false;
    this.end = false;
    this.auto = false;
    this.stacked = false;
    this.href = undefined;
    this.interactive = false;
    this.disabled = false;
    this.current = undefined;
    this.open = undefined;
    this.nav = false;
    this.label = undefined;
    this.target = undefined;
    this.rel = undefined;
  }

  static styles = unsafeCSS(styles);

  protected readonly cuts = new CutFades(this, { targets: () => this.querySelectorAll(":scope > .ds-row__name"), text: true });

  private measureNames = () => this.cuts.measure();

  private get currentValue(): string | undefined {
    const value = this.current;
    if (value === null || value === undefined || value === "false") return undefined;
    return CURRENT.has(value) ? value : "page";
  }

  focus(options?: FocusOptions) {
    const target = this.renderRoot?.querySelector<HTMLElement>(".target");
    if (target) target.focus(options);
    else super.focus(options);
  }

  private press(event: MouseEvent) {
    if (this.disabled) { event.preventDefault(); return; }
    if (this.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    const go = this.dispatchEvent(new CustomEvent("ds-row-press", { detail: { href: this.href || undefined }, bubbles: true, composed: true, cancelable: true }));
    if (!go) event.preventDefault();
  }

  render() {
    if (!this.href && !this.interactive) return html`<slot @slotchange=${this.measureNames}></slot>`;
    const current = this.currentValue;
    const label = this.label || undefined;
    const content = html`<slot @slotchange=${this.measureNames}></slot>`;
    const target = this.href
      ? this.disabled
        ? html`<a class="target" part="target" role="link" aria-disabled="true" aria-label=${ifDefined(label)}>${content}</a>`
        : html`<a class="target" part="target" href=${this.href} target=${ifDefined(this.target || undefined)} rel=${ifDefined(this.rel || undefined)}
            aria-expanded=${ifDefined(this.open === undefined ? undefined : String(this.open))} aria-current=${ifDefined(current)} aria-label=${ifDefined(label)} @click=${this.press}>${content}</a>`
      : html`<button class="target" part="target" type="button" ?disabled=${this.disabled}
          aria-expanded=${ifDefined(this.open === undefined ? undefined : String(this.open))} aria-current=${ifDefined(current)} aria-label=${ifDefined(label)} @click=${this.press}>${content}</button>`;
    return html`${target}<slot name="end"></slot>`;
  }
}

define("ds-row", Row);

declare global {
  interface HTMLElementTagNameMap {
    "ds-row": Row;
  }
}
