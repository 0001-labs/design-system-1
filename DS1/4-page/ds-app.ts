import { LitElement, html, nothing, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import { getText } from "../0-face/i18n";
import controls from "../1-root/controls.css?inline";
import "../2-core/ds-icon";
import { startAppScale } from "./app-scale";
import type { PageLayout } from "./ds-page";
import "./ds-page";
import styles from "./styles/ds-app.css?inline";

/**
 * The app frame: one window every 0001 app stands in, edge to edge on the
 * scaled desktop. A top bar two squares high (and the height's leftover, on
 * Desktop aligned, so the panes below end on the window's bottom edge) holds
 * the app's name, what the bar slot gives it and the actions at its end.
 * Under it a `ds-page` fills the rest: navigation, the work and an inspector,
 * each scrolling on its own, with hairlines between them and dividers that
 * resize the navigation and the inspector in whole squares (4–24), remembered
 * per app. On a phone (under 30 squares) the navigation and the actions fold
 * into the page's drawer, opened by a menu button at the bar's end, and the
 * inspector stands under the work; the page is one document scrolling under
 * the bar.
 *
 * It starts the app scale (`app-scale.ts`): Desktop aligned on a computer,
 * fourteen squares on a phone, with the shared components following `--sf`.
 *
 * - `slot="brand"` replaces the name, a link home
 * - `apps` (`{ name, href }[]`, a property or a JSON attribute) lists the apps the name leads to: hovering,
 *   focusing or tapping the name opens them under the bar, the open one marked
 * - `slot="bar"` stands after the name: a breadcrumb, tabs, a search
 * - `slot="actions"` stands at the bar's end: buttons, the account; in the
 *   drawer, under the navigation, on a phone
 * - `slot="nav"` is the navigation, usually one `ds-sidebar`
 * - the default slot is the work, the main landmark unless it is a `<main>`
 * - `slot="aside"` is the inspector beside the work
 * - `slot="header"` and `slot="footer"` run above and below the work
 *
 * An empty area takes no room: an app without navigation or inspector gives
 * the work the window.
 *
 * @element ds-app
 * @attr name - The app's name, at the bar's start.
 * @attr home - Where the name leads, `/` by default.
 * @attr layout - The page's layout, `inspector` by default (navigation, work and inspector, each optional).
 * @attr nav-width - The navigation's width in whole squares (4–24), 12 by default.
 * @attr aside-width - The inspector's width in whole squares (4–24), 12 by default.
 * @attr resize-key - Where the widths are remembered; `ds-app:<name>` by default.
 * @attr drawer-label - The drawer's name, the shared word "Menu" by default.
 * @attr fixed-scale - Leaves the page's scale to the app (no app scale).
 * @attr flush - The work runs to its pane's edges; the navigation and the inspector keep their room.
 * @csspart bar - The top bar.
 * @csspart brand - The name's link.
 * @csspart switch - The name and its apps, with `apps`.
 * @csspart apps - The apps under the name.
 * @csspart actions - The actions' place at the bar's end, on a computer.
 * @csspart menu - The phone's menu button, at the bar's end; it opens the navigation's drawer.
 * @csspart page - The `ds-page` under the bar.
 * @csspart nav - The page's navigation pane (and `header`, `main`, `aside`, `footer`, `drawer`, `resize`, `resize-aside`: the page's own parts, passed on).
 * @fires ds-page-drawer - From the page: the drawer opened or closed (`detail.open`).
 * @fires ds-page-resize - From the page: a divider moved (`detail.navWidth`, `detail.asideWidth`).
 */
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
  declare apps: AppLink[];
  private declare appsOpen: boolean;
  private declare hasNav: boolean;
  private declare hasActions: boolean;
  private declare narrow: boolean;

  static styles = [unsafeCSS(controls), unsafeCSS(styles)];

  constructor() {
    super();
    this.name = "";
    this.home = "/";
    this.layout = "inspector";
    this.navWidth = 12;
    this.asideWidth = 12;
    this.fixedScale = false;
    this.flush = false;
    this.apps = [];
    this.appsOpen = false;
    this.hasNav = false;
    this.hasActions = false;
    this.narrow = false;
  }

  private readonly relabel = () => this.requestUpdate();
  /** Where the page folds its navigation away (its container under 600px), the actions go with it. */
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

  /** The page under the bar, for its drawer (`openDrawer`, `closeDrawer`). */
  get page() {
    return this.renderRoot?.querySelector("ds-page") ?? null;
  }

  /** Settles once the frame and the page under its bar have both drawn: what is slotted then stands in its place. */
  protected async getUpdateComplete(): Promise<boolean> {
    const done = await super.getUpdateComplete();
    await this.page?.updateComplete;
    return done;
  }

  /** The navigation's drawer, on a phone. */
  openDrawer(): void { this.page?.openDrawer(); }
  closeDrawer(): void { this.page?.closeDrawer(); }

  /** Back to the top of the work, as a new place opens: its pane on a computer, the page on a phone. */
  scrollToStart(): void {
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

  /** The name, and the apps beside it on a hover, a focus or a tap: each a link, the one open marked. */
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
    return html`
      <header class="bar" part="bar">
        <slot name="brand">${this.apps.length ? this.switcher() : html`<a class="ds-button brand" part="brand" href=${this.home}>${this.name}</a>`}</slot>
        <div class="bar-content"><slot name="bar"></slot></div>
        ${this.narrow ? nothing : html`<div class="actions" part="actions"><slot name="actions" @slotchange=${this.syncSlots}></slot></div>`}
        <button class="ds-button ds-button--icon ds-overlay__toggle menu" part="menu" type="button" aria-label=${menu} aria-expanded="false" ?hidden=${!this.hasNav && !(this.narrow && this.hasActions)}>
          <ds-icon type="menu" size="large" aria-hidden="true"></ds-icon><ds-icon type="close" size="large" aria-hidden="true"></ds-icon>
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
        fill
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

/** An app the name's menu leads to: its name as written, and its address. */
export interface AppLink {
  name: string;
  href: string;
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
