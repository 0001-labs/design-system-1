import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../../../../DS1/0-face/define";
import { shortcutLabel, type KeyPlatform } from "../../../../DS1/0-face/keys";
import metrics from "../../../../DS1/1-root/component-metrics.css?inline";
import kbd from "../1-root/kbd.css?inline";
import styles from "./styles/ds-kbd.css?inline";

export class Kbd extends LitElement {
  static properties = {
    shortcut: { type: String },
    plain: { type: Boolean, reflect: true },
    platform: { type: String },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(kbd), unsafeCSS(styles)];

  declare shortcut: string | undefined;
  declare plain: boolean;
  declare platform: KeyPlatform | undefined;

  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.plain = false;
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

  get label(): string {
    if (!this.shortcut) return "";
    try {
      return shortcutLabel(this.shortcut, this.platform ? { platform: this.platform } : undefined);
    } catch {
      return this.shortcut;
    }
  }

  render() {
    const label = this.label;
    return html`<kbd part="kbd" class=${this.plain ? "ds-kbd ds-kbd--plain" : "ds-kbd"}>${label || html`<slot></slot>`}</kbd>`;
  }
}

define("ds-kbd", Kbd);
declare global { interface HTMLElementTagNameMap { "ds-kbd": Kbd } }
