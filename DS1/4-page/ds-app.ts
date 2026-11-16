import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import controls from "../1-root/controls.css?inline";
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
 * per app. On a phone the navigation folds into the page's drawer and the
 * inspector stands under the work.
 *
 * It starts the app scale (`app-scale.ts`): Desktop aligned on a computer,
 * fourteen squares on a phone, with the shared components following `--sf`.
 *
 * - `slot="brand"` replaces the name, a link home
 * - `slot="bar"` stands after the name: a breadcrumb, tabs, a search
 * - `slot="actions"` stands at the bar's end: buttons, the account
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
 * @csspart bar - The top bar.
 * @csspart brand - The name's link.
 * @csspart page - The `ds-page` under the bar.
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
  };

  declare name: string;
  declare home: string;
  declare layout: PageLayout;
  declare navWidth: number;
  declare asideWidth: number;
  declare resizeKey: string | undefined;
  declare drawerLabel: string | undefined;
  declare fixedScale: boolean;

  static styles = [unsafeCSS(controls), unsafeCSS(styles)];

  constructor() {
    super();
    this.name = "";
    this.home = "/";
    this.layout = "inspector";
    this.navWidth = 12;
    this.asideWidth = 12;
    this.fixedScale = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.fixedScale) startAppScale();
  }

  /** The page under the bar, for its drawer (`openDrawer`, `closeDrawer`). */
  get page() {
    return this.renderRoot?.querySelector("ds-page") ?? null;
  }

  render() {
    return html`
      <header class="bar" part="bar">
        <slot name="brand"><a class="ds-button brand" part="brand" href=${this.home}>${this.name}</a></slot>
        <div class="bar-content"><slot name="bar"></slot></div>
        <div class="actions"><slot name="actions"></slot></div>
      </header>
      <ds-page
        part="page"
        layout=${this.layout}
        nav-width=${this.navWidth}
        aside-width=${this.asideWidth}
        resize-key=${this.resizeKey || `ds-app:${this.name || "app"}`}
        drawer-label=${this.drawerLabel || "Menu"}
        fill
        resizable
        divided
        drawer
      >
        <slot name="nav" slot="nav"></slot>
        <slot name="header" slot="header"></slot>
        <slot></slot>
        <slot name="aside" slot="aside"></slot>
        <slot name="footer" slot="footer"></slot>
      </ds-page>
    `;
  }
}

define("ds-app", App);

declare global {
  interface HTMLElementTagNameMap {
    "ds-app": App;
  }
}
