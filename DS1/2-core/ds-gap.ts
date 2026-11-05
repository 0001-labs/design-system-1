import { LitElement, html, unsafeCSS } from "lit";
import styles from "./styles/ds-gap.css?inline";
import { define } from "../0-face/define";

/**
 * Vertical space on the unit scale.
 *
 * @element ds-gap
 * @attr size - "01", "025", "05", "08", "1" (the default), "2", "3", "4", "8" or "12" squares.
 * @attr tenth, quarter, half, eight-tenth, unit, double, triple, quad, oct, dozen - The same sizes by name.
 *
 * @example
 * <ds-gap size="05"></ds-gap>
 */
export class Gap extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: "01" | "025" | "05" | "08" | "1" | "2" | "3" | "4" | "8" | "12" | undefined;

  static styles = unsafeCSS(styles);

  render() {
    return html``;
  }
}

define("ds-gap", Gap);

declare global {
  interface HTMLElementTagNameMap {
    "ds-gap": Gap;
  }
}
