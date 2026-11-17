import { LitElement, type PropertyDeclarations } from "lit";

export abstract class Control extends LitElement {
    static properties: PropertyDeclarations = {
      disabled: { type: Boolean, reflect: true, noAccessor: true },
    };

    #disabled = false;
    #enabledTabIndex: string | null | undefined;
    protected get hostControl(): boolean { return true; }
    protected syncControl(): void { if (this.isConnected) this.#syncDisabled(); }

    get disabled(): boolean {
      return this.#disabled;
    }

    set disabled(value: boolean) {
      const old = this.#disabled;
      this.#disabled = Boolean(value);
      if (this.isConnected) this.#syncDisabled();
      this.requestUpdate("disabled", old);
    }

    constructor() {
      super();
      this.addEventListener("keydown", this.#onKeyDown);
      this.addEventListener("keyup", this.#onKeyUp);
      this.addEventListener("click", this.#onClick, { capture: true });
    }

    connectedCallback(): void {
      super.connectedCallback();
      if (this.hostControl && !this.hasAttribute("role")) this.setAttribute("role", "button");
      this.#syncDisabled();
    }

    #syncDisabled(): void {
      this.toggleAttribute("disabled", this.#disabled);
      if (!this.hostControl) return;
      if (!this.hasAttribute("role")) this.setAttribute("role", "button");
      if (this.#disabled) {
        if (this.#enabledTabIndex === undefined) this.#enabledTabIndex = this.getAttribute("tabindex");
        this.setAttribute("aria-disabled", "true");
        this.setAttribute("tabindex", "-1");
      } else {
        this.removeAttribute("aria-disabled");
        if (this.#enabledTabIndex !== undefined) {
          if (this.#enabledTabIndex === null) this.setAttribute("tabindex", "0");
          else this.setAttribute("tabindex", this.#enabledTabIndex);
          this.#enabledTabIndex = undefined;
        } else if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
      }
    }

    #onClick = (event: Event): void => {
      if (!this.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    #onKeyDown = (event: KeyboardEvent): void => {
      if (!this.hostControl || this.disabled || event.target !== this) return;
      if (event.key === "Enter") {
        event.preventDefault();
        this.click();
      } else if (event.key === " ") {
        event.preventDefault();
      }
    };

    #onKeyUp = (event: KeyboardEvent): void => {
      if (!this.hostControl || this.disabled || event.target !== this) return;
      if (event.key === " ") {
        event.preventDefault();
        this.click();
      }
    };
}
