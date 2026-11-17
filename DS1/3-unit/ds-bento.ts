import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import { placeBento } from "../0-face/bento";
import metrics from "../1-root/component-metrics.css?inline";
import styles from "./styles/ds-bento.css?inline";

export class Bento extends LitElement {
  static properties = {
    columns: { type: Number, reflect: true },
    squares: { type: Boolean, reflect: true },
    fit: { type: Boolean, reflect: true },
    layout: { type: String, reflect: true },
  };

  declare columns: number | undefined;
  declare squares: boolean;
  declare fit: boolean;
  declare layout: string | undefined;

  static styles = [unsafeCSS(metrics), unsafeCSS(styles)];

  private observer?: MutationObserver;

  constructor() {
    super();
    this.squares = false;
    this.fit = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver(() => this.place());
    this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-place", "hidden"], attributeOldValue: false });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    super.disconnectedCallback();
  }

  protected updated() {
    if (this.columns) this.style.setProperty("--ds-bento-columns", String(this.columns));
    else this.style.removeProperty("--ds-bento-columns");
    this.place();
  }

  private place() {
    if (this.squares) placeBento(this);
  }

  render() {
    return html`<slot @slotchange=${() => this.place()}></slot>`;
  }
}

define("ds-bento", Bento);

declare global {
  interface HTMLElementTagNameMap {
    "ds-bento": Bento;
  }
}
