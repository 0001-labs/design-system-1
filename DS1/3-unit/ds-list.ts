import { LitElement, html, nothing, unsafeCSS } from "lit";
import styles from "./styles/ds-list.css?inline";
import { define } from "../0-face/define";
import { CutFades } from "../0-face/cut-fade";

const NOT_ITEMS = new Set(["template", "script", "style", "slot"]);
const CONTROLS = new Set(["a", "button", "input", "select", "textarea", "summary", "details"]);

export class List extends LitElement {
  static properties = {
    columns: { type: Number, reflect: true },
    heading: { type: String, reflect: true },
  };

  declare columns: number | undefined;
  declare heading: string | undefined;

  static styles = unsafeCSS(styles);
  protected readonly cuts = new CutFades(this, { selector: ".heading" });

  private ownItems = new Set<Element>();
  private ownRole = false;
  private ownLabel = false;

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute("role")) { this.setAttribute("role", "list"); this.ownRole = true; }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.ownRole && this.getAttribute("role") === "list") this.removeAttribute("role");
    this.ownRole = false;
  }

  private syncItems = () => {
    const slot = this.shadowRoot?.querySelector("slot");
    const list = this.getAttribute("role") === "list";
    const items = new Set(list && slot ? slot.assignedElements().filter(item => !NOT_ITEMS.has(item.localName)) : []);
    for (const item of this.ownItems) {
      if (items.has(item)) continue;
      if (item.getAttribute("role") === "listitem") item.removeAttribute("role");
      this.ownItems.delete(item);
    }
    for (const item of items) {
      if (item.hasAttribute("role") || CONTROLS.has(item.localName)) continue;
      item.setAttribute("role", "listitem");
      this.ownItems.add(item);
    }
  };

  firstUpdated(): void {
    this.syncItems();
  }

  updated(changed: Map<string, unknown>): void {
    if (typeof this.columns === "number" && Number.isInteger(this.columns) && this.columns > 0) this.style.setProperty("--ds-list-columns", String(this.columns));
    else this.style.removeProperty("--ds-list-columns");
    if (changed.has("heading")) this.nameByHeading();
  }

  private nameByHeading() {
    const heading = this.heading?.trim();
    if (heading && (this.ownLabel || !this.hasAttribute("aria-label"))) {
      this.setAttribute("aria-label", heading);
      this.ownLabel = true;
    } else if (!heading && this.ownLabel) {
      this.removeAttribute("aria-label");
      this.ownLabel = false;
    }
  }

  render() {
    const heading = this.heading?.trim();
    return html`${heading ? html`<span class="heading" part="heading" aria-hidden="true">${heading}</span>` : nothing}<slot @slotchange=${this.syncItems}></slot>`;
  }
}

define("ds-list", List);

declare global {
  interface HTMLElementTagNameMap {
    "ds-list": List;
  }
}
