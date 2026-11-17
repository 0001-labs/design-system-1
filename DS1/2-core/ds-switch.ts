import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import styles from "./styles/ds-switch.css?inline";

export class Switch extends LitElement {
  static properties = { compact: { type: Boolean, reflect: true }, monochrome: { type: Boolean, reflect: true } };
  declare compact: boolean;
  declare monochrome: boolean;
  constructor() { super(); this.compact = false; this.monochrome = false; }
  static styles = unsafeCSS(styles);
  focus(options?: FocusOptions) { this.querySelector<HTMLButtonElement>(":scope > button")?.focus(options); }
  render() { return html`<slot></slot>`; }
}

define("ds-switch", Switch);
declare global { interface HTMLElementTagNameMap { "ds-switch": Switch } }
