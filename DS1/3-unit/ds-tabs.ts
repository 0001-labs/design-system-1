import { LitElement, html, unsafeCSS, type PropertyValues } from "lit";
import styles from "./styles/ds-tabs.css?inline";
import { define } from "../0-face/define";

export class Tabs extends LitElement {
  static properties = {
    fill: { type: Boolean, reflect: true },
    wrap: { type: Boolean, reflect: true },
    text: { type: Boolean, reflect: true },
    split: { type: Boolean, reflect: true },
    paper: { type: Boolean, reflect: true },
  };

  declare fill: boolean;
  declare wrap: boolean;
  declare text: boolean;
  declare split: boolean;
  declare paper: boolean;

  constructor() {
    super();
    this.fill = false;
    this.wrap = false;
    this.text = false;
    this.split = false;
    this.paper = false;
    this.addEventListener("keydown", this.navigate);
  }

  static styles = unsafeCSS(styles);

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute("role")) this.setAttribute("role", "tablist");
  }

  private navigate = (event: KeyboardEvent): void => {
    if (this.getAttribute("role") !== "tablist") return;
    const tabs = [...this.querySelectorAll<HTMLElement>('[role="tab"]')]
      .filter(tab => tab.closest("ds-tabs") === this && !tab.hasAttribute("disabled") && tab.getAttribute("aria-disabled") !== "true");
    const current = tabs.findIndex(tab => tab === event.target);
    if (current < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const rtl = getComputedStyle(this).direction === "rtl";
    const step = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + step + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  };

  private syncFaces = (): void => {
    const tabs = [...this.children].filter(child => child.localName === "ds-button");
    tabs.forEach((tab, index) => {
      const place = tabs.length === 1 ? "only" : index === 0 ? "first" : index === tabs.length - 1 ? "last" : "middle";
      if (this.split) tab.setAttribute("segment", place);
      else if (/^(first|middle|last|only)$/.test(tab.getAttribute("segment") ?? "")) tab.removeAttribute("segment");
      if (this.paper) tab.setAttribute("paper", "");
      else tab.removeAttribute("paper");
    });
  };

  protected updated(changed: PropertyValues): void {
    if (changed.has("split") || changed.has("paper")) this.syncFaces();
  }

  render() {
    return html`<slot @slotchange=${this.syncFaces}></slot>`;
  }
}

define("ds-tabs", Tabs);

declare global {
  interface HTMLElementTagNameMap {
    "ds-tabs": Tabs;
  }
}
