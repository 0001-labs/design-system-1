import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import styles from "./styles/ds-tag.css?inline";

export class Tag extends LitElement {
  static styles = unsafeCSS(styles);
  render() { return html`<span class="frame" part="frame"><span class="words"><slot></slot></span></span>`; }
}
define("ds-tag", Tag);
declare global { interface HTMLElementTagNameMap { "ds-tag": Tag } }
