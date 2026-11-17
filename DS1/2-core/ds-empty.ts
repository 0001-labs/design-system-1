import { hasSlottedContent } from "../0-face/light-dom";

import { LitElement, html, nothing, unsafeCSS } from "lit";
import { getText } from "../0-face/i18n";
import { define } from "../0-face/define";
import "./ds-icon";
import metrics from "../1-root/component-metrics.css?inline";
import empty from "../1-root/empty.css?inline";
import styles from "./styles/ds-empty.css?inline";

export const EMPTY_HEADING = "Nothing here yet";

export class Empty extends LitElement {
  static properties = {
    heading: { type: String },
    text: { type: String },
    literal: { type: Boolean, reflect: true },
    icon: { type: String },
    centered: { type: Boolean, reflect: true },
    level: { type: Number },
    tone: { type: String, reflect: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(empty), unsafeCSS(styles)];

  declare heading: string | undefined;
  declare text: string | undefined;
  declare literal: boolean;
  declare icon: string | undefined;
  declare centered: boolean;
  declare level: number | undefined;
  declare tone: "done" | undefined;

  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.literal = false;
    this.centered = true;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    super.disconnectedCallback();
  }

  private words(value: string | undefined): string {
    if (!value) return "";
    return this.literal ? value : getText(value) || value;
  }


  render() {
    const heading = this.heading ? this.words(this.heading) : getText(EMPTY_HEADING) || EMPTY_HEADING;
    const text = this.words(this.text);
    const done = this.tone === "done";
    const icon = this.icon || (done ? "check" : "");
    const hasIcon = Boolean(icon) || hasSlottedContent(this, "icon");
    const slottedText = hasSlottedContent(this, "");
    const hasText = Boolean(text) || slottedText;
    const hasActions = hasSlottedContent(this, "actions");
    const level = this.level && this.level >= 1 && this.level <= 6 ? Math.round(this.level) : undefined;
    const changed = () => this.requestUpdate();
    return html`<div class="ds-empty${this.centered ? " ds-empty--centered" : " ds-empty--start"}${done ? " ds-empty--done" : ""}" part="empty">
      <div class="ds-empty__heading" part="heading">
      <div class="ds-empty__icon" part="icon" aria-hidden="true" ?hidden=${!hasIcon}>
        <slot name="icon" @slotchange=${changed}>${icon ? html`<ds-icon size=${done ? "small" : "large"} .type=${icon}></ds-icon>` : nothing}</slot>
      </div>
      <div class="ds-empty__title" part="title" role=${level ? "heading" : nothing} aria-level=${level ?? nothing}>
        <slot name="heading" @slotchange=${changed}>${heading}</slot>
      </div>
      </div>
      <div class="ds-empty__text" part="text" ?hidden=${!hasText}><slot @slotchange=${changed}></slot>${slottedText ? nothing : text}</div>
      <div class="ds-empty__actions" part="actions" ?hidden=${!hasActions}><slot name="actions" @slotchange=${changed}></slot></div>
    </div>`;
  }
}

define("ds-empty", Empty);

declare global {
  interface HTMLElementTagNameMap {
    "ds-empty": Empty;
  }
}
