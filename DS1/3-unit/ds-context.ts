import { unsafeCSS, type PropertyValues } from "lit";
import { define } from "../0-face/define";
import menuStyles from "./styles/ds-menu.css?inline";
import styles from "./styles/ds-context.css?inline";
import { Menu, type MenuAnchor, type MenuCloseReason } from "./ds-menu";

const ROW = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';
const REFUSED = 1400;

export class Context extends Menu {
  static properties = {
    ...Menu.properties,
    pending: { type: Boolean, reflect: true },
    bar: { type: Boolean, reflect: true },
  };
  static styles = [unsafeCSS(menuStyles), unsafeCSS(styles)];
  declare pending: boolean;
  declare bar: boolean;
  private quietObserver = new MutationObserver(() => this.quietSeparators());

  constructor() {
    super();
    this.pending = false;
    this.bar = false;
    this.triggerMode = "context";
    this.floating = true;
    this.closesOnChoice = true;
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "menu");
    super.connectedCallback();
    this.quietObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    this.quietSeparators();
  }
  disconnectedCallback() {
    this.quietObserver.disconnect();
    super.disconnectedCallback();
  }
  protected willUpdate(changed: PropertyValues) {
    this.triggerMode = "context";
    this.floating = true;
    this.toggleAttribute("data-ds-hug", !this.bar);
    if (this.bar) {
      this.setAttribute("aria-orientation", "horizontal");
      this.placement = "top";
      this.focusOnOpen = false;
    } else if (changed.has("bar")) {
      this.removeAttribute("aria-orientation");
      this.placement = "bottom";
      this.focusOnOpen = true;
    }
    super.willUpdate(changed);
  }
  updated() {
    super.updated();
    this.markIcons();
    for (const row of this.querySelectorAll<HTMLElement>(ROW)) {
      if (this.pending && row.getAttribute("aria-disabled") !== "true") { row.setAttribute("aria-disabled", "true"); row.dataset.dsContextHeld = ""; }
      else if (!this.pending && row.dataset.dsContextHeld !== undefined) { row.removeAttribute("aria-disabled"); delete row.dataset.dsContextHeld; }
    }
    this.toggleAttribute("aria-busy", this.pending);
  }

  requestClose(reason: MenuCloseReason) {
    if (this.pending && reason !== "parent") return;
    super.requestClose(reason);
  }
  select() { if (!this.pending) super.select(); }

  refuse(row: HTMLElement) {
    row.setAttribute("data-ds-refused", "");
    setTimeout(() => row.removeAttribute("data-ds-refused"), REFUSED);
  }

  openOver(anchor: MenuAnchor) {
    this.anchor = anchor;
    this.open = true;
  }

  private markIcons() {
    for (const row of this.querySelectorAll<HTMLElement>(ROW)) {
      if (row.closest("ds-context") !== this) continue;
      row.toggleAttribute("data-ds-context-icon", this.bar && !(row.textContent ?? "").trim() && !!row.querySelector("ds-icon, svg, img"));
    }
  }

  private quietSeparators() {
    this.markIcons();
    let previousWasGap = true;
    const children = [...this.children] as HTMLElement[];
    const visible = children.filter(child => !child.hidden);
    for (const child of children) child.removeAttribute("data-ds-quiet");
    visible.forEach((child, index) => {
      const gap = child.matches("hr, [data-ds-menu-separator]");
      if (gap && (previousWasGap || index === visible.length - 1)) child.setAttribute("data-ds-quiet", "");
      if (!gap || !child.hasAttribute("data-ds-quiet")) previousWasGap = gap;
    });
  }
}

define("ds-context", Context);
declare global { interface HTMLElementTagNameMap { "ds-context": Context } }
