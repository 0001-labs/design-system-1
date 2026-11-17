import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../../../../DS1/0-face/define";
import { getText } from "../../../../DS1/0-face/i18n";
import styles from "./styles/ds-loading.css?inline";

export const LOADING_LABEL = "Loading";

export const LOADING_CONTROLS =
  "button, [role='button'], ds-button, .ds-button, ds-input, ds-select, .ds-field, .ds-input, .ds-select";

export function inLoadingControl(element: Element): boolean {
  let node: Element | null = element.parentElement ?? hostOf(element);
  while (node) {
    if (node.closest(LOADING_CONTROLS)) return true;
    node = hostOf(node);
  }
  return false;
}

function hostOf(element: Element): Element | null {
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

export class LoadingIndicator extends LitElement {
  static properties = {
    label: { type: String },
    variant: { type: String },
    gradient: { type: Boolean, reflect: true },
    inControl: { state: true },
  };
  static styles = unsafeCSS(styles);
  declare label: string;
  declare variant: string;
  declare gradient: boolean;
  declare inControl: boolean;
  constructor() {
    super();
    this.label = "";
    this.variant = "bar";
    this.gradient = false;
    this.inControl = false;
  }
  private readonly relabel = () => this.requestUpdate();
  connectedCallback() {
    super.connectedCallback();
    this.inControl = inLoadingControl(this);
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
  }
  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    super.disconnectedCallback();
  }
  render() {
    const label = this.label || getText(LOADING_LABEL) || LOADING_LABEL;
    return html`<span class="ds-loading" data-variant=${this.variant} ?data-gradient=${this.gradient} data-context=${this.inControl ? "control" : "page"} role="status" aria-label=${label} aria-busy="true"><span class="ds-loading__fill" aria-hidden="true"></span></span>`;
  }
}
define("ds-loading", LoadingIndicator);
