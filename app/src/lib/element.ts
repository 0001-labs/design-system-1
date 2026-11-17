import { LitElement } from "lit";
import { SignalWatcher } from "@lit-labs/signals";

export class AppElement extends SignalWatcher(LitElement) {
  static box = false;

  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!(this.constructor as typeof AppElement).box) this.style.display = "contents";
  }

  protected emit<T>(type: string, detail?: T) {
    return this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true, cancelable: true }));
  }
}

export function defineElement(name: string, element: CustomElementConstructor) {
  if (!customElements.get(name)) customElements.define(name, element);
}
