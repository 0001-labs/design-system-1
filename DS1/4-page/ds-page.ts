import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { define } from "../0-face/define";
import type { Drawer } from "../0-face/attach-overlay";
import { getText } from "../0-face/i18n";
import "../2-core/ds-icon";
import metrics from "../1-root/component-metrics.css?inline";
import overlay from "../1-root/overlay.css?inline";
import native from "../1-root/native-controls.css?inline";
import styles from "./styles/ds-page.css?inline";

const MAIN = "main, [role='main']";

export type PageLayout = "sidebar" | "split" | "inspector" | "column" | "centered" | "tiles";
export const PAGE_LAYOUTS: readonly PageLayout[] = ["sidebar", "split", "inspector", "column", "centered", "tiles"];

export class Page extends LitElement {
  static properties = {
    resizable: { type: Boolean, reflect: true },
    asideWidth: { type: Number, attribute: "aside-width", reflect: true },
    navWidth: { type: Number, attribute: "nav-width", reflect: true },
    resizeKey: { type: String, attribute: "resize-key" },
    split: { type: Number },
    layout: { type: String, reflect: true },
    divided: { type: Boolean, reflect: true },
    measure: { type: Number, reflect: true },
    fill: { type: Boolean, reflect: true },
    flush: { type: Boolean, reflect: true },
    view: { type: Boolean, reflect: true },
    drawer: { type: Boolean, reflect: true },
    drawerLabel: { type: String, attribute: "drawer-label" },
    drawerToggle: { attribute: false },
    landmark: { state: true },
  };

  declare resizable: boolean;
  declare asideWidth: number;
  declare navWidth: number;
  declare resizeKey: string | undefined;
  declare split: number;
  declare layout: PageLayout;
  declare divided: boolean;
  declare measure: number | undefined;
  declare fill: boolean;
  declare flush: boolean;
  declare view: boolean;
  declare drawer: boolean;
  declare drawerLabel: string | undefined;
  declare drawerToggle: HTMLElement | null;
  private declare landmark: boolean;

  static styles = [unsafeCSS(metrics), unsafeCSS(overlay), unsafeCSS(native), unsafeCSS(styles)];

  private navigationDrawer: Drawer | null = null;
  private drawerAttempt = 0;
  private givenWidths = { nav: 12, aside: 12 };
  private readonly hiding = typeof MutationObserver === "function" ? new MutationObserver(() => this.syncAreas()) : null;
  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.resizable = false;
    this.navWidth = 12;
    this.asideWidth = 12;
    this.split = 0.5;
    this.layout = "sidebar";
    this.divided = false;
    this.fill = false;
    this.flush = false;
    this.view = false;
    this.drawer = false;
    this.drawerToggle = null;
    this.landmark = true;
  }

  private readonly syncLandmark = () => {
    const slot = this.renderRoot?.querySelector?.<HTMLSlotElement>("slot:not([name])");
    const given = slot?.assignedElements({ flatten: true }).some(element => element.matches(MAIN) || !!element.querySelector(MAIN));
    const inside = !!this.parentElement?.closest(`${MAIN}, ds-page`);
    this.landmark = !given && !inside;
  };

  connectedCallback() {
    super.connectedCallback();
    this.syncLandmark();
    this.givenWidths = { nav: this.navWidth, aside: this.asideWidth };
    if (this.resizeKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(this.resizeKey) || "null");
        if (saved && Number.isFinite(saved.navWidth)) this.navWidth = Math.max(4, Math.min(24, saved.navWidth));
        if (saved && Number.isFinite(saved.asideWidth)) this.asideWidth = Math.max(4, Math.min(24, saved.asideWidth));
        if (saved && Number.isFinite(saved.split)) this.split = Math.max(0.1, Math.min(0.9, saved.split));
      } catch {}
    }
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
    if (this.hasUpdated && this.drawer) void this.attachDrawer();
    if (this.hasUpdated) this.syncAreas();
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    this.cancelResize();
    this.drawerAttempt++;
    this.hiding?.disconnect();
    this.navigationDrawer?.destroy();
    this.navigationDrawer = null;
    super.disconnectedCallback();
  }

  get drawerOpen(): boolean {
    return this.navigationDrawer?.isOpen ?? false;
  }

  openDrawer(): void { this.navigationDrawer?.open(); }

  closeDrawer(): void { this.navigationDrawer?.close(); }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (!changed.has("drawer") && !changed.has("drawerToggle")) return;
    void this.attachDrawer();
  }

  private async attachDrawer() {
    const attempt = ++this.drawerAttempt;
    this.navigationDrawer?.destroy();
    this.navigationDrawer = null;
    if (!this.drawer) return;
    const { attachOverlay } = await import("../0-face/attach-overlay");
    if (attempt !== this.drawerAttempt || !this.isConnected || !this.drawer) return;
    const root = this.renderRoot;
    const toggle = this.drawerToggle ?? root.querySelector<HTMLElement>('[part="drawer-toggle"]');
    const panel = root.querySelector<HTMLDialogElement>('[part="drawer"]');
    const nav = root.querySelector('[part="nav"]');
    if (!toggle || !panel || !nav) return;
    this.navigationDrawer = attachOverlay({
      toggle, panel, content: [nav],
      onToggle: open => this.dispatchEvent(new CustomEvent("ds-page-drawer", { bubbles: true, composed: true, detail: { open } })),
    });
    if (toggle.getRootNode() !== panel.getRootNode()) toggle.removeAttribute("aria-controls");
  }

  private drag: { area: "nav" | "aside"; id: number; handle: HTMLElement; startX: number; startWidth: number; width: number; available: number; unit: number; rtl: boolean } | null = null;
  private splitMetrics(area: "nav" | "aside" = "nav") {
    const page = this.renderRoot.querySelector<HTMLElement>('.page')!;
    const style = getComputedStyle(page);
    const handle = this.renderRoot.querySelector<HTMLElement>(`.resize-${area}`);
    const unit = handle?.getBoundingClientRect().width || 20;
    const otherArea = area === "nav" ? "aside" : "nav";
    const other = this.layout === "inspector" && this.clientWidth >= 600 && !this.renderRoot.querySelector(`[part="${otherArea}"]`)?.hasAttribute("data-empty") ? this.columnWidth(otherArea, unit) + (parseFloat(style.columnGap) || 0) : 0;
    const available = page.clientWidth - other - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0) - (parseFloat(style.columnGap) || 0);
    return { unit, available: Math.max(unit, available) };
  }
  private columnWidth(area: "nav" | "aside", unit: number) {
    const tracks = getComputedStyle(this.renderRoot.querySelector<HTMLElement>('.page')!).gridTemplateColumns.split(/\s+/).map(Number.parseFloat);
    const width = area === "aside" ? tracks.at(-1) : tracks[0];
    return width && Number.isFinite(width) ? width : (area === "aside" ? this.asideWidth : this.navWidth) * unit;
  }
  private splitWidth(value: number, available: number, unit: number) {
    const minimum = Math.min(10 * unit, Math.floor(available / 2 / unit) * unit);
    const maximum = Math.floor((available - minimum) / unit) * unit;
    return Math.max(minimum, Math.min(maximum, Math.round(value / unit) * unit));
  }
  private rememberResize() {
    if (!this.resizeKey) return;
    try { localStorage.setItem(this.resizeKey, JSON.stringify({ navWidth: this.navWidth, split: this.split, asideWidth: this.asideWidth })); }
    catch {}
  }
  private cancelResize() {
    const drag = this.drag;
    if (!drag) return;
    this.drag = null;
    drag.handle.removeAttribute('data-dragging');
    this.renderRoot.querySelector<HTMLElement>('.page')?.style.removeProperty(drag.area === 'aside' ? '--ds-page-resize-aside' : '--ds-page-resize-width');
    if (drag.handle.hasPointerCapture?.(drag.id)) drag.handle.releasePointerCapture(drag.id);
  }
  private resizeTo(value: number, area: "nav" | "aside" = "nav") {
    if (this.layout === "sidebar" || this.layout === "inspector") {
      const {available, unit} = this.splitMetrics(area);
      const width = Math.max(4, Math.min(24, Math.floor((available - 10 * unit) / unit), Math.round(value * available / unit)));
      if (area === "aside") this.asideWidth = width; else this.navWidth = width;
      this.rememberResize();
      this.dispatchEvent(new CustomEvent("ds-page-resize", {bubbles: true, composed: true, detail: {navWidth: this.navWidth, asideWidth: this.asideWidth}}));
      return;
    }
    const { available, unit } = this.splitMetrics();
    this.split = this.splitWidth(value * available, available, unit) / available;
    this.rememberResize();
    this.dispatchEvent(new CustomEvent('ds-page-resize', { bubbles: true, composed: true, detail: { split: this.split } }));
  }
  private resizePointer(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const minimum = Math.min((this.layout !== "split" ? 4 : 10) * drag.unit, Math.floor(drag.available / 2 / drag.unit) * drag.unit);
    const delta = (event.clientX - drag.startX) * (drag.rtl !== (drag.area === "aside") ? -1 : 1);
    drag.width = Math.max(minimum, Math.min((this.layout !== "split" ? Math.min(24 * drag.unit, drag.available - 10 * drag.unit) : drag.available - minimum), drag.startWidth + delta));
    this.renderRoot.querySelector<HTMLElement>('.page')!.style.setProperty(drag.area === 'aside' ? '--ds-page-resize-aside' : '--ds-page-resize-width', `${drag.width}px`);
  }
  private startResize(event: PointerEvent) {
    if (event.button !== 0 || this.drag) return;
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
    handle.setPointerCapture(event.pointerId);
    const area = handle.dataset.resize === "aside" ? "aside" : "nav";
    const { available, unit } = this.splitMetrics(area);
    const width = this.layout !== 'split' ? this.columnWidth(area, unit) : this.renderRoot.querySelector<HTMLElement>('[part="nav"]')!.getBoundingClientRect().width;
    this.drag = { area, id: event.pointerId, handle, startX: event.clientX, startWidth: width, width, available, unit, rtl: getComputedStyle(this).direction === 'rtl' };
    handle.setAttribute('data-dragging', '');
  }
  private endResize(event: PointerEvent) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (event.type === 'pointerup') this.resizePointer(event);
    this.cancelResize();
    drag.handle.blur();
    if (event.type === 'pointerup') this.resizeTo(drag.width / drag.available, drag.area);
  }
  private resizeKeyboard(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.drag) { event.preventDefault(); this.cancelResize(); return; }
    const area = (event.currentTarget as HTMLElement).dataset.resize === "aside" ? "aside" : "nav";
    const rtl = (getComputedStyle(this).direction === 'rtl') !== (area === "aside");
    const { available, unit } = this.splitMetrics(area);
    const width = this.layout !== 'split' ? this.columnWidth(area, unit) : this.renderRoot.querySelector<HTMLElement>('[part="nav"]')!.getBoundingClientRect().width;
    const step = unit * (event.shiftKey ? 5 : 1) / available;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); this.resizeTo(width / available + (event.key === 'ArrowRight' !== rtl ? step : -step), area);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); this.resizeTo(event.key === 'Home' ? 0 : 1, area);
    } else if (event.key === 'Enter') { event.preventDefault(); this.resetResize(area); }
  }

  private resetResize(area: "nav" | "aside" = "nav") {
    if (this.layout !== "split") { const {available, unit} = this.splitMetrics(area); this.resizeTo(this.givenWidths[area] * unit / available, area); }
    else this.resizeTo(0.5);
  }

  private resizer(area: "nav" | "aside" = "nav") {
    if (!this.resizable || !["sidebar", "split", "inspector"].includes(this.layout)) return undefined;
    const column = this.layout !== "split";
    return html`<div class="resize resize-${area}" data-resize=${area} part=${area === "aside" ? "resize-aside" : "resize"} role="separator" tabindex="0" aria-label=${area === "aside" ? "Resize inspector" : column ? "Resize sidebar" : "Resize columns"} aria-orientation="vertical" aria-valuemin=${column ? 4 : 0} aria-valuemax=${column ? 24 : 100} aria-valuenow=${column ? (area === "aside" ? this.asideWidth : this.navWidth) : Math.round(this.split * 100)} @pointerdown=${this.startResize} @pointermove=${this.resizePointer} @pointerup=${this.endResize} @pointercancel=${this.endResize} @lostpointercapture=${this.endResize} @keydown=${this.resizeKeyboard} @dblclick=${() => this.resetResize(area)}></div>`;
  }

  render() {
    const label = getText(this.drawerLabel || "Menu") || this.drawerLabel || "Menu";
    const close = getText("Close") || "Close";
    return html`
      <div class="page" part="page" ?data-toggle-outside=${!!this.drawerToggle} style=${ifDefined([measureStyle(this.measure), this.resizable && this.layout !== "split" ? `--ds-page-nav: var(--ds-page-resize-width, calc(${Math.max(4, Math.min(24, Math.round(this.navWidth || 12)))} * var(--ds-unit)))` : undefined, this.resizable && this.layout === "inspector" ? `--ds-page-aside: var(--ds-page-resize-aside, calc(${Math.max(4, Math.min(24, Math.round(this.asideWidth || 12)))} * var(--ds-unit)))` : undefined, this.resizable ? `--ds-page-split: ${Math.max(0.1, Math.min(0.9, Number.isFinite(this.split) ? this.split : 0.5))}` : undefined].filter(Boolean).join("; ") || undefined)}>
        <div class="bar" part="bar" ?hidden=${!this.drawer || !!this.drawerToggle}>
          <button class="ds-button ds-button--icon ds-overlay__toggle" part="drawer-toggle" type="button" aria-label=${label} aria-controls="drawer" aria-expanded="false">
            ${this.drawer && !this.drawerToggle ? html`<ds-icon type="menu" size="large" aria-hidden="true"></ds-icon><ds-icon type="close" size="large" aria-hidden="true"></ds-icon>` : nothing}
          </button>
        </div>
        <dialog class="ds-overlay ds-overlay--screen" part="drawer" id="drawer" aria-label=${label}>
          <div class="ds-overlay__bar"><button class="ds-button ds-button--icon ds-overlay__close" part="drawer-close" type="button" aria-label=${close}>
            <ds-icon type="close" size="large" aria-hidden="true"></ds-icon>
          </button></div>
        </dialog>
        <div class="area nav" part="nav" data-area="nav" ?data-ds-grid-scroll=${this.fill}><slot name="nav"></slot></div>${this.resizer()}${this.layout === "inspector" ? this.resizer("aside") : undefined}
        <div class="area header" part="header" data-area="header"><slot name="header"></slot></div>
        <div class="area main" part="main" data-area="main" ?data-ds-grid-scroll=${this.fill} role=${ifDefined(this.landmark ? "main" : undefined)}><slot @slotchange=${this.syncLandmark}></slot></div>
        <div class="area aside" part="aside" data-area="aside" ?data-ds-grid-scroll=${this.fill}><slot name="aside"></slot></div>
        <div class="area footer" part="footer" data-area="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }

  private syncAreas() {
    this.hiding?.disconnect();
    for (const slot of this.renderRoot.querySelectorAll("slot")) {
      const nodes = slot.assignedNodes({ flatten: true });
      slot.parentElement?.toggleAttribute("data-empty", nodes.every(empty));
      for (const node of nodes) if (node instanceof Element) this.hiding?.observe(node, { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  firstUpdated() {
    this.renderRoot.querySelectorAll("slot").forEach(slot => slot.addEventListener("slotchange", () => this.syncAreas()));
    this.syncAreas();
    this.syncLandmark();
  }
}

export function measureStyle(measure: number | null | undefined): string | undefined {
  const squares = Math.round(Number(measure));
  return Number.isFinite(squares) && squares >= 1 ? `--ds-page-measure: calc(${squares} * var(--ds-unit))` : undefined;
}

function empty(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE) return !node.textContent?.trim();
  return node.nodeType !== Node.ELEMENT_NODE || (node as Element).hasAttribute("hidden");
}

define("ds-page", Page);

declare global {
  interface HTMLElementTagNameMap {
    "ds-page": Page;
  }
}
