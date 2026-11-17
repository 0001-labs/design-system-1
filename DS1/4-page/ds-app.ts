import { LitElement, html, nothing, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import { getText } from "../0-face/i18n";
import metrics from "../1-root/component-metrics.css?inline";
import overlay from "../1-root/overlay.css?inline";
import native from "../1-root/native-controls.css?inline";
import "../2-core/ds-icon";
import { startAppScale } from "./app-scale";
import type { PageLayout } from "./ds-page";
import "./ds-page";
import styles from "./styles/ds-app.css?inline";

export interface AppLink {
  name: string;
  href: string;
}

export class App extends LitElement {
  static properties = {
    name: { type: String, reflect: true },
    home: { type: String },
    layout: { type: String, reflect: true },
    navWidth: { type: Number, attribute: "nav-width" },
    asideWidth: { type: Number, attribute: "aside-width" },
    resizeKey: { type: String, attribute: "resize-key" },
    drawerLabel: { type: String, attribute: "drawer-label" },
    fixedScale: { type: Boolean, attribute: "fixed-scale" },
    flush: { type: Boolean, reflect: true },
    flow: { type: Boolean, reflect: true },
    apps: { type: Array },
    appsOpen: { state: true },
    hasNav: { state: true },
    hasActions: { state: true },
    narrow: { state: true },
  };

  declare name: string;
  declare home: string;
  declare layout: PageLayout;
  declare navWidth: number;
  declare asideWidth: number;
  declare resizeKey: string | undefined;
  declare drawerLabel: string | undefined;
  declare fixedScale: boolean;
  declare flush: boolean;
  declare flow: boolean;
  declare apps: AppLink[];
  private declare appsOpen: boolean;
  private declare hasNav: boolean;
  private declare hasActions: boolean;
  private declare narrow: boolean;

  static styles = [unsafeCSS(metrics), unsafeCSS(overlay), unsafeCSS(native), unsafeCSS(styles)];

  constructor() {
    super();
    this.name = "";
    this.home = "/";
    this.layout = "inspector";
    this.navWidth = 12;
    this.asideWidth = 12;
    this.fixedScale = false;
    this.flush = false;
    this.flow = false;
    this.apps = [];
    this.appsOpen = false;
    this.hasNav = false;
    this.hasActions = false;
    this.narrow = false;
  }

  private readonly relabel = () => this.requestUpdate();
  private readonly measure = () => {
    const width = this.getBoundingClientRect().width;
    if (!width) return;
    this.narrow = width < 600;
    this.toggleAttribute("data-narrow", this.narrow);
  };
  private resizing: ResizeObserver | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (!this.fixedScale) startAppScale();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
    this.resizing = typeof ResizeObserver === "function" ? new ResizeObserver(this.measure) : null;
    this.resizing?.observe(this);
    this.slotted?.observe(this, { childList: true, attributes: true, subtree: true, attributeFilter: ["hidden", "slot"] });
    if (this.hasUpdated) this.syncSlots();
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    this.resizing?.disconnect();
    this.resizing = null;
    this.slotted?.disconnect();
    super.disconnectedCallback();
  }

  get page() {
    return this.renderRoot?.querySelector("ds-page") ?? null;
  }

  protected async getUpdateComplete(): Promise<boolean> {
    const done = await super.getUpdateComplete();
    await this.page?.updateComplete;
    return done;
  }

  openDrawer(): void { this.page?.openDrawer(); }
  closeDrawer(): void { this.page?.closeDrawer(); }

  scrollToStart(): void {
    if (this.flow) { window.scrollTo({ top: 0, left: 0 }); return; }
    const page = this.page;
    page?.scrollTo({ top: 0, left: 0 });
    page?.shadowRoot?.querySelector('[part="main"]')?.scrollTo({ top: 0, left: 0 });
  }

  private readonly syncSlots = () => {
    this.hasNav = !!this.querySelector(':scope > [slot="nav"]:not([hidden])');
    this.hasActions = !!this.querySelector(':scope > [slot="actions"]:not([hidden])');
  };
  private readonly slotted = typeof MutationObserver === "function" ? new MutationObserver(this.syncSlots) : null;

  protected firstUpdated() {
    this.syncSlots();
    const page = this.page;
    if (page) page.drawerToggle = this.renderRoot.querySelector<HTMLElement>('[part="menu"]');
  }

  private appsTimer = 0;
  private touched = false;
  private openApps = () => { clearTimeout(this.appsTimer); this.appsOpen = true; };
  private closeApps = (later = false) => {
    clearTimeout(this.appsTimer);
    if (later) this.appsTimer = window.setTimeout(() => { this.appsOpen = false; }, 150);
    else this.appsOpen = false;
  };

  private switcher() {
    const here = typeof location === "undefined" ? "" : location.origin;
    const label = getText("Apps") || "Apps";
    return html`<div
      class="switch"
      part="switch"
      @pointerenter=${(event: PointerEvent) => { if (event.pointerType !== "touch") this.openApps(); }}
      @pointerleave=${(event: PointerEvent) => { if (event.pointerType !== "touch") this.closeApps(true); }}
      @focusin=${this.openApps}
      @focusout=${(event: FocusEvent) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.closeApps(); }}
      @keydown=${(event: KeyboardEvent) => {
        if (event.key !== "Escape" || !this.appsOpen) return;
        event.preventDefault();
        this.closeApps();
        this.renderRoot.querySelector<HTMLElement>('[part="brand"]')?.focus();
      }}
    >
      <a
        class="ds-button brand"
        part="brand"
        href=${this.home}
        aria-expanded=${this.appsOpen ? "true" : "false"}
        aria-controls="apps"
        @pointerdown=${(event: PointerEvent) => { this.touched = event.pointerType === "touch"; }}
        @click=${(event: MouseEvent) => {
          if (!this.touched || this.appsOpen) return;
          event.preventDefault();
          this.openApps();
        }}
      >${this.name}</a>
      <nav class="ds-menu apps" part="apps" id="apps" aria-label=${label} ?hidden=${!this.appsOpen}>
        ${this.apps.map(app => {
          const current = sameOrigin(app.href, here);
          return html`<a class="ds-menu__item" href=${app.href} aria-current=${current ? "page" : nothing}>${app.name}</a>`;
        })}
      </nav>
    </div>`;
  }

  render() {
    const menu = getText(this.drawerLabel || "Menu") || this.drawerLabel || "Menu";
    const menuShown = this.hasNav || (this.narrow && this.hasActions);
    return html`
      <header class="bar" part="bar">
        <slot name="brand">${this.apps.length ? this.switcher() : html`<a class="ds-button brand" part="brand" href=${this.home}>${this.name}</a>`}</slot>
        <div class="bar-content"><slot name="bar"></slot></div>
        ${this.narrow ? nothing : html`<div class="actions" part="actions"><slot name="actions" @slotchange=${this.syncSlots}></slot></div>`}
        <button class="ds-button ds-button--icon ds-overlay__toggle menu" part="menu" type="button" aria-label=${menu} aria-expanded="false" ?hidden=${!menuShown}>
          ${menuShown ? html`<ds-icon type="menu" size="large" aria-hidden="true"></ds-icon><ds-icon type="close" size="large" aria-hidden="true"></ds-icon>` : nothing}
        </button>
      </header>
      <ds-page
        part="page"
        exportparts="nav, header, main, aside, footer, drawer, resize, resize-aside"
        layout=${this.layout}
        nav-width=${this.navWidth}
        aside-width=${this.asideWidth}
        resize-key=${this.resizeKey || `ds-app:${this.name || "app"}`}
        drawer-label=${this.drawerLabel || "Menu"}
        ?flush=${this.flush}
        ?fill=${!this.flow}
        resizable
        divided
        drawer
      >
        <slot name="nav" slot="nav" @slotchange=${this.syncSlots}></slot>
        ${this.narrow ? html`<slot name="actions" slot="nav" @slotchange=${this.syncSlots}></slot>` : nothing}
        <slot name="header" slot="header"></slot>
        <slot></slot>
        <slot name="aside" slot="aside"></slot>
        <slot name="footer" slot="footer"></slot>
      </ds-page>
    `;
  }
}

function sameOrigin(href: string, origin: string): boolean {
  try { return new URL(href, origin || undefined).origin === origin; } catch { return false; }
}

define("ds-app", App);

declare global {
  interface HTMLElementTagNameMap {
    "ds-app": App;
  }
}
