import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { define } from "../0-face/define";
import metrics from "../1-root/component-metrics.css?inline";
import card from "../1-root/card.css?inline";
import styles from "./styles/ds-card.css?inline";

const squares = (value: number | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : undefined;

const PADDING: Record<string, string> = {
  none: "0px",
  small: "calc(var(--ds-unit) / 2)",
  medium: "var(--ds-unit)",
  large: "calc(var(--ds-unit) * 2)",
};

type Slot = "label" | "title" | "media";

export class Card extends LitElement {
  static properties = {
    href: { type: String, reflect: true },
    interactive: { type: Boolean, reflect: true },
    tone: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
    mediaHeight: { type: Number, attribute: "media-height", reflect: true },
    padding: { type: String, reflect: true },
    media: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    filled: { state: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(card), unsafeCSS(styles)];

  declare href: string | undefined;
  declare interactive: boolean;
  declare tone: string | undefined;
  declare variant: "filled" | "outlined";
  declare width: number | undefined;
  declare height: number | undefined;
  declare mediaHeight: number | undefined;
  declare padding: "none" | "small" | "medium" | "large";
  declare media: "start" | "center" | "bleed";
  declare disabled: boolean;
  declare filled: Set<Slot>;

  constructor() {
    super();
    this.interactive = false;
    this.variant = "filled";
    this.padding = "medium";
    this.media = "start";
    this.disabled = false;
    this.filled = new Set();
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (!this.hasUpdated) this.filled = this.read();
    const width = squares(this.width);
    const height = squares(this.height);
    if (width) this.style.setProperty("--ds-card-width", `calc(var(--ds-unit) * ${width})`);
    else this.style.removeProperty("--ds-card-width");
    if (height) this.style.setProperty("--ds-card-height", `calc(var(--ds-unit) * ${height})`);
    else this.style.removeProperty("--ds-card-height");
    const mediaHeight = squares(this.mediaHeight);
    if (mediaHeight) this.style.setProperty("--ds-card-media-height", `calc(var(--ds-unit) * ${mediaHeight})`);
    else this.style.removeProperty("--ds-card-media-height");
    this.style.setProperty("--ds-card-padding", PADDING[this.padding] ?? PADDING.medium);
  }

  private read(): Set<Slot> {
    const filled = new Set<Slot>();
    for (const child of this.children) {
      const name = child.getAttribute("slot");
      if (name === "label" || name === "title" || name === "media") filled.add(name);
    }
    return filled;
  }

  private readonly changed = () => {
    const next = this.read();
    if ([...next].join() !== [...this.filled].join()) this.filled = next;
  };

  private press(event: Event) {
    if (!this.interactive || this.disabled) return;
    if (event instanceof KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
    }
    this.dispatchEvent(new CustomEvent("ds-card-press", { bubbles: true, composed: true }));
  }

  render() {
    const tone = this.tone || nothing;
    const media = this.media === "center" || this.media === "bleed" ? ` ds-card__media--${this.media}` : "";
    const parts = html`
      <span class="ds-card__label" part="label" ?hidden=${!this.filled.has("label")}><slot name="label" @slotchange=${this.changed}></slot></span>
      <span class="ds-card__title" part="title" ?hidden=${!this.filled.has("title")}><slot name="title" @slotchange=${this.changed}></slot></span>
      <div class="ds-card__body" part="body"><slot></slot></div>
      <div class="ds-card__media${media}${squares(this.mediaHeight) ? " ds-card__media--fixed" : ""}" part="media" ?hidden=${!this.filled.has("media")}><slot name="media" @slotchange=${this.changed}></slot></div>`;
    const className = `ds-card${this.variant === "outlined" ? " ds-card--outlined" : ""}`;
    if (this.href && !this.disabled) {
      return html`<a class=${className} part="card" href=${this.href} data-tone=${tone}>${parts}</a>`;
    }
    if (this.interactive) {
      return html`<div
        class=${className}
        part="card"
        role="button"
        tabindex=${this.disabled ? -1 : 0}
        aria-disabled=${this.disabled ? "true" : nothing}
        data-interactive
        data-tone=${tone}
        @click=${this.press}
        @keydown=${this.press}
      >${parts}</div>`;
    }
    return html`<div class=${className} part="card" data-tone=${tone}>${parts}</div>`;
  }
}

define("ds-card", Card);

declare global {
  interface HTMLElementTagNameMap {
    "ds-card": Card;
  }
}
