import { hasSlottedContent } from "../0-face/light-dom";

import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { getText } from "../0-face/i18n";
import { define } from "../0-face/define";
import { attachOverlay, type Drawer } from "../0-face/attach-overlay";
import { markCurrentLink } from "../0-face/header";
import "../2-core/ds-icon";
import metrics from "../1-root/component-metrics.css?inline";
import controls from "../1-root/controls.css?inline";
import styles from "./styles/ds-header.css?inline";

export const MENU_LABEL = "Menu";



export class Header extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    brand: { type: String },
    href: { type: String },
    label: { type: String },
    literal: { type: Boolean, reflect: true },
    sticky: { type: Boolean, reflect: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(controls), unsafeCSS(styles)];

  declare variant: "site" | "app";
  declare brand: string | undefined;
  declare href: string;
  declare label: string | undefined;
  declare literal: boolean;
  declare sticky: boolean;

  private drawer: Drawer | null = null;
  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.variant = "site";
    this.href = "/";
    this.literal = false;
    this.sticky = false;
  }

  get menuOpen(): boolean {
    return this.drawer?.isOpen ?? false;
  }

  openMenu(): void { this.drawer?.open(); }

  closeMenu(): void { this.drawer?.close(); }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    this.drawer?.destroy();
    this.drawer = null;
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    markCurrentLink(this.links());
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.drawer) return;
    const root = this.renderRoot;
    const toggle = root.querySelector<HTMLElement>('[part="toggle"]');
    const panel = root.querySelector<HTMLDialogElement>('[part="drawer"]');
    if (!toggle || !panel) return;
    this.drawer = attachOverlay({
      toggle,
      panel,
      content: () => [...root.querySelectorAll(':is([part="nav"], [part="actions"]):not([hidden])')],
      onToggle: open => this.dispatchEvent(new CustomEvent("ds-header-menu", { bubbles: true, composed: true, detail: { open } })),
    });
  }

  private words(value: string | undefined): string {
    if (!value) return "";
    return this.literal ? value : getText(value) || value;
  }


  private links(): HTMLAnchorElement[] {
    return [...this.children].filter((child): child is HTMLAnchorElement => child.localName === "a" && !child.hasAttribute("slot"));
  }

  private onNavChange = () => {
    markCurrentLink(this.links());
    this.requestUpdate();
  };

  render() {
    const menu = getText(MENU_LABEL) || MENU_LABEL;
    const close = getText("Close") || "Close";
    const hasNav = hasSlottedContent(this, "");
    const hasActions = hasSlottedContent(this, "actions");
    const brand = hasSlottedContent(this, "brand")
      ? html`<span class="ds-header__brand" part="brand"><slot name="brand" @slotchange=${this.relabel}></slot></span>`
      : this.brand
        ? html`<a class="ds-header__brand" part="brand" href=${this.href || "/"}>${this.words(this.brand)}</a>`
        : html`<slot name="brand" @slotchange=${this.relabel}></slot>`;
    return html`<header class="ds-header${this.variant === "app" ? " ds-header--app" : ""}${this.sticky ? " ds-header--sticky" : ""}" part="header">
      ${brand}
      <nav class="ds-header__nav" part="nav" id="nav" aria-label=${this.label ? this.words(this.label) : nothing} ?hidden=${!hasNav}><slot @slotchange=${this.onNavChange}></slot></nav>
      <div class="ds-header__actions" part="actions" ?hidden=${!hasActions}><slot name="actions" @slotchange=${this.relabel}></slot></div>
      <button class="ds-button ds-button--icon ds-header__toggle" part="toggle" type="button" aria-label=${menu} aria-controls="drawer" ?hidden=${!hasNav && !hasActions}>
        <ds-icon type="menu" size="large" aria-hidden="true"></ds-icon><ds-icon type="close" size="large" aria-hidden="true"></ds-icon>
      </button>
      <dialog class="ds-overlay ds-overlay--screen" part="drawer" id="drawer" aria-label=${menu}>
        <div class="ds-overlay__bar"><button class="ds-button ds-button--icon ds-overlay__close" part="close" type="button" aria-label=${close}>
          <ds-icon type="close" size="large" aria-hidden="true"></ds-icon>
        </button></div>
      </dialog>
    </header>`;
  }
}

define("ds-header", Header);

declare global {
  interface HTMLElementTagNameMap {
    "ds-header": Header;
  }
}
