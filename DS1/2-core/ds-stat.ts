import { LitElement, html, nothing, unsafeCSS } from "lit";
import { getText } from "../0-face/i18n";
import { define } from "../0-face/define";
import { CutFades } from "../0-face/cut-fade";
import { figureCells, figureFormat, formatFigure, type FigureFormat, type FigureOptions } from "./figures";
import "./ds-icon";
import metrics from "../1-root/component-metrics.css?inline";
import figures from "../1-root/figures.css?inline";
import styles from "./styles/ds-stat.css?inline";

export type StatTone = "danger" | "warning";
const TONES: readonly StatTone[] = ["danger", "warning"];

export class Stat extends LitElement {
  static properties = {
    label: { type: String },
    value: { type: Number },
    figure: { type: String },
    format: { type: String, reflect: true },
    currency: { type: String },
    minor: { type: Boolean },
    whole: { type: Boolean },
    digits: { type: Number },
    change: { type: Number },
    changeFormat: { type: String, attribute: "change-format" },
    changeTone: { type: String, attribute: "change-tone", reflect: true },
    caption: { type: String },
    icon: { type: String },
    tone: { type: String, reflect: true },
    cells: { type: Boolean, reflect: true },
    literal: { type: Boolean, reflect: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(figures), unsafeCSS(styles)];
  protected readonly cuts = new CutFades(this, { selector: ".ds-stat__figure" });

  declare label: string | undefined;
  declare value: number | undefined;
  declare figure: string | undefined;
  declare format: FigureFormat;
  declare currency: string | undefined;
  declare minor: boolean;
  declare whole: boolean;
  declare digits: number | undefined;
  declare change: number | undefined;
  declare changeFormat: FigureFormat | undefined;
  declare changeTone: StatTone | undefined;
  declare caption: string | undefined;
  declare icon: string | undefined;
  declare tone: StatTone | undefined;
  declare cells: boolean;
  declare literal: boolean;

  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.format = "number";
    this.minor = false;
    this.whole = false;
    this.cells = false;
    this.literal = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
    window.addEventListener("translations-ready", this.relabel);
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    window.removeEventListener("translations-ready", this.relabel);
    super.disconnectedCallback();
  }

  private words(value: string | undefined): string {
    if (!value) return "";
    return this.literal ? value : getText(value) || value;
  }

  private options(format: string | undefined): FigureOptions {
    return { format: figureFormat(format), currency: this.currency, minor: this.minor, whole: this.whole, digits: this.digits };
  }

  get text(): string {
    if (this.figure) return this.words(this.figure);
    return typeof this.value === "number" ? formatFigure(this.value, this.options(this.format)) : "";
  }

  get changeText(): string {
    if (typeof this.change !== "number" || !Number.isFinite(this.change)) return "";
    const format = this.changeFormat ?? this.format;
    return formatFigure(this.change, { ...this.options(format), signed: true });
  }

  private slotted(name: string): boolean {
    return [...this.children].some(node => (node.getAttribute("slot") ?? "") === name);
  }

  private drawFigure(text: string) {
    if (!this.cells || !text) return text;
    return html`<span class="hidden-words">${text}</span><span aria-hidden="true">${figureCells(text).map(cell =>
      cell.digit ? html`<span class="ds-stat__digit">${cell.text}</span>` : cell.text)}</span>`;
  }

  render() {
    const changed = () => this.requestUpdate();
    const label = this.words(this.label);
    const caption = this.words(this.caption);
    const change = this.changeText;
    const tone = TONES.includes(this.tone as StatTone) ? this.tone : undefined;
    const changeTone = TONES.includes(this.changeTone as StatTone) ? this.changeTone : undefined;
    const hasLabel = Boolean(label) || this.slotted("label");
    const hasCaption = Boolean(caption) || Boolean(change) || this.slotted("caption");
    const direction = typeof this.change === "number" && this.change !== 0 ? (this.change > 0 ? "up" : "down") : undefined;
    return html`<div class="ds-stat${tone ? ` ds-stat--${tone}` : ""}" part="stat">
      <div class="ds-stat__label" part="label" ?hidden=${!hasLabel}>
        ${this.icon ? html`<span class="ds-stat__icon" part="icon" aria-hidden="true"><ds-icon .type=${this.icon}></ds-icon></span>` : nothing}<slot name="label" @slotchange=${changed}>${label}</slot>
      </div>
      <div class="ds-stat__figure" part="figure"><slot name="figure" @slotchange=${changed}>${this.drawFigure(this.text)}</slot></div>
      <slot></slot>
      <div class="ds-stat__caption" part="caption" ?hidden=${!hasCaption}>
        ${change
          ? html`<span class="ds-stat__change${changeTone ? ` ds-stat__change--${changeTone}` : ""}" part="change">${direction
              ? html`<ds-icon size="small" type=${direction} aria-hidden="true"></ds-icon>`
              : nothing}${change}</span>`
          : nothing}<slot name="caption" @slotchange=${changed}>${caption}</slot>
      </div>
    </div>`;
  }
}

define("ds-stat", Stat);

declare global {
  interface HTMLElementTagNameMap {
    "ds-stat": Stat;
  }
}
