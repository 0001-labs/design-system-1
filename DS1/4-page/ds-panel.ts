import { LitElement, html, unsafeCSS } from "lit";
import styles from "./styles/ds-panel.css?inline";
import { define } from "../0-face/define";

export class Panel extends LitElement {
  static styles = unsafeCSS(styles);

  render() {
    return html`
      <slot name="header" part="header"></slot>
      <div class="body" part="body"><slot></slot></div>
      <slot name="footer" part="footer"></slot>
    `;
  }
}

define("ds-panel", Panel);

declare global {
  interface HTMLElementTagNameMap {
    "ds-panel": Panel;
  }
}
