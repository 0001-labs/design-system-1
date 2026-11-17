import { LitElement, html, unsafeCSS } from "lit";
import "../2-core/ds-text";
import "../2-core/ds-icon";
import "../2-core/ds-button";
import { define } from "../0-face/define";
import styles from "./styles/ds-accordion.css?inline";

export class Accordion extends LitElement {
  static properties = {
    summary: { type: String },
    details: { type: String },
    literal: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    control: { type: String, reflect: true },
    icon: { type: String, reflect: true },
    _hasSlottedContent: { type: Boolean, state: true },
  };

  declare summary: string;
  declare details: string;
  declare literal: boolean;
  declare open: boolean;
  declare control: string;
  declare icon: string;
  declare _hasSlottedContent: boolean;

  constructor() {
    super();
    this.summary = "";
    this.details = "";
    this.literal = false;
    this.open = false;
    this.control = "native";
    this.icon = "chevron-down";
    this._hasSlottedContent = false;
    this.addEventListener("click", event => {
      if (this.control !== "slotted") return;
      const trigger = this.querySelector<HTMLButtonElement>(':scope > [slot="trigger"] > button');
      if (!trigger || trigger.disabled || event.defaultPrevented || !event.composedPath().includes(trigger)) return;
      const request = new CustomEvent("ds-accordion-toggle", {detail: {open: !this.open}, bubbles: true, composed: true, cancelable: true});
      if (this.dispatchEvent(request)) this.open = !this.open;
    });
  }

  private syncFrame = () => {
    if (this.control !== "slotted") return;
    const trigger = this.querySelector<HTMLButtonElement>(':scope > [slot="trigger"] > button');
    const content = this.querySelector<HTMLElement>(':scope > [slot="details"]');
    if (trigger) trigger.setAttribute("aria-expanded", String(this.open));
    if (content) {
      if (!this.open && content.contains(this.ownerDocument.activeElement)) trigger?.focus({preventScroll: true});
      content.hidden = !this.open;
    }
  };
  updated() { this.syncFrame(); }

  static styles = unsafeCSS(styles);

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const assignedNodes = slot.assignedNodes({ flatten: true });
    const hasContent = assignedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
    );
    this._hasSlottedContent = hasContent;
  }

  render() {
    if (this.control === "slotted") return html`<div class="header"><slot name="trigger" @slotchange=${this.syncFrame}></slot><slot name="actions"></slot></div><slot name="details" @slotchange=${this.syncFrame}></slot>`;
    return html`
      <details ?open=${this.open}>
        <summary part="summary">
          <span class="summaryRow" part="row">
            <slot class="summaryText" name="summary"><ds-text .text=${this.summary} ?literal=${this.literal}></ds-text></slot>
            <ds-icon class="chevron" type=${this.icon} size="large" aria-hidden="true"></ds-icon>
          </span>
        </summary>

        <div class="detailsBody" part="details">
          <slot name="details" @slotchange=${this._handleSlotChange}></slot>
          ${!this._hasSlottedContent
            ? html`<ds-text
                class="detailsText"
                .text=${this.details}
                ?literal=${this.literal}
              ></ds-text>`
            : ""}
        </div>
      </details>
    `;
  }
}

define("ds-accordion", Accordion);

declare global {
  interface HTMLElementTagNameMap {
    "ds-accordion": Accordion;
  }
}
