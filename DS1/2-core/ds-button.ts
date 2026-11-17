import { html, unsafeCSS } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import "./ds-text";
import { ChoiceContrast } from "../0-face/choice-contrast";
import { Control } from "../0-face/control";
import { define } from "../0-face/define";
import hostStyles from "./styles/ds-button-host.css?inline";
import styles from "./styles/ds-button.css?inline";

import { renderSplit, focusSplit, type SplitSegment } from "./button-split";
import splitStyles from "./styles/ds-button-split.css?inline";
export type { SplitSegment } from "./button-split";

export class Button extends Control {
  static formAssociated = true;
  static properties = {
    split: { type: Boolean, reflect: true },
    segment: { type: String },
    options: { type: String },
    segments: { attribute: false },
    value: { type: String, reflect: true },
    actions: { type: Boolean, reflect: true },
    labelled: { type: Boolean, reflect: true },
    literal: { type: Boolean, reflect: true },
    compact: { type: Boolean, reflect: true },
    plain: { type: Boolean, reflect: true },
    _fieldsetDisabled: { state: true },
    primary: { type: Boolean, reflect: true },
    secondary: { type: Boolean, reflect: true },
    control: { type: String, reflect: true, noAccessor: true },
    active: { type: Boolean, reflect: true },
    choice: { type: Boolean, reflect: true },
    icon: { type: Boolean, reflect: true },
    wide: { type: Boolean, reflect: true },
    fixed: { type: Boolean, reflect: true },
    fit: { type: Boolean, reflect: true },
    danger: { type: Boolean, reflect: true },
    menuItem: { type: Boolean, reflect: true, attribute: "menu-item" },
    blank: { type: Boolean, reflect: true },
    language: { type: String },
    text: { type: String },
    label: { type: String },
    href: { type: String },
    target: { type: String },
    rel: { type: String },
    _loading: { type: Boolean, state: true },
  };

  declare split: boolean;
  declare segment?: string;
  declare options: string;
  declare segments: ReadonlyArray<SplitSegment> | undefined;
  declare value: string;
  declare actions: boolean;
  declare labelled: boolean;
  declare literal: boolean;
  declare compact: boolean;
  declare plain: boolean;
  declare private _fieldsetDisabled: boolean;
  private splitRole = false;
  get splitDisabled(): boolean { return this.disabled || this._fieldsetDisabled; }
  private splitLanguageChanged = () => { if (this.split) this.requestUpdate(); };

  declare primary: boolean;
  declare secondary: boolean;
  declare active: boolean;
  declare choice: boolean;
  declare icon: boolean;
  declare wide: boolean;
  declare fixed: boolean;
  declare fit: boolean;
  declare danger: boolean;
  declare menuItem: boolean;
  private _control = "native";
  get control(): string { return this._control; }
  set control(value: string) {
    const old = this._control;
    this._control = value;
    this.syncControl();
    this.requestUpdate("control", old);
  }
  protected get hostControl(): boolean { return this.control === "host" && !this.split; }
  declare blank: boolean;
  declare language: string;
  declare text: string;
  declare label: string;
  declare href: string;
  declare target: string;
  declare rel: string;

  declare _loading: boolean;

  constructor() {
    super();
    if (typeof this.attachInternals === "function") this.attachInternals();
    this.split = false; this.options = ""; this.value = "";
    this.actions = false; this.labelled = false; this.literal = false; this.compact = false; this.plain = false; this._fieldsetDisabled = false;
    this.addEventListener("click", event => {
      if (this._fieldsetDisabled) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { capture: true });
    this.active = false;
    this.choice = false;
    this.icon = false;
    this.wide = false;
    this.fixed = false;
    this.fit = false;
    this.danger = false;
    this.menuItem = false;
    this.primary = false;
    this.secondary = false;
    this.disabled = false;
    this.blank = false;
    this.language = "en-US";
    this.text = "";
    this.label = "";
    this.href = "";
    this.target = "";
    this.rel = "";
    this._loading = false;
  }

  static styles = [unsafeCSS(styles), unsafeCSS(hostStyles), unsafeCSS(splitStyles)];

  _reflectIcon() {
    if (this.control !== "native" || this.split) return;
    const only = this.firstElementChild;
    const icon = !this.text && this.childElementCount === 1 && only?.localName === 'ds-icon' && !(this.textContent ?? '').trim();
    this.toggleAttribute('icon', !!icon);
  }

  private syncSlottedControl() {
    if (this.control !== "slotted" || this.split) return;
    const button = this.querySelector<HTMLButtonElement>(":scope > button");
    if (button) button.disabled = this.splitDisabled;
  }

  private syncSplitRole() {
    if (this.split && !this.hasAttribute("role")) { this.setAttribute("role", "group"); this.splitRole = true; }
    else if (!this.split && this.splitRole) { this.removeAttribute("role"); this.splitRole = false; this.syncControl(); }
  }

  private choiceContrast?: ChoiceContrast;
  updated() {
    const joinedChoice = this.split && !this.plain && !this.actions || this.hasAttribute("segment") && this.active;
    if (joinedChoice) {
      this.choiceContrast ??= new ChoiceContrast(this, () => [...this.renderRoot.querySelectorAll<HTMLElement>(this.split ? 'button[aria-pressed="true"]' : '[part="control"]')]);
      this.choiceContrast.connect();
      this.choiceContrast.resolve();
    } else {
      this.choiceContrast?.disconnect();
      this.renderRoot.querySelectorAll<HTMLElement>('[style]').forEach(control => control.style.removeProperty("--_ds-choice-ink"));
    }
    this.syncSplitRole();
    this.syncSlottedControl();
  }

  focus(options?: FocusOptions) {
    if (this.split) { focusSplit(this, options); return; }
    if (this.control === "slotted") this.querySelector<HTMLElement>(":scope > :is(button, a)")?.focus(options);
    else if (this.hostControl) super.focus(options);
    else this.shadowRoot?.querySelector<HTMLElement>('[part="control"]')?.focus(options);
  }

  connectedCallback() {
    super.connectedCallback();
    this.syncSplitRole();
    if (this.split && !this.plain && !this.actions || this.hasAttribute("segment") && this.active) {
      this.choiceContrast?.connect();
      void this.updateComplete.then(() => this.choiceContrast?.resolve());
    }
    this._reflectIcon();
    this.syncSlottedControl();
    window.addEventListener("language-changed", this.splitLanguageChanged);
    window.addEventListener("translations-loaded", this.splitLanguageChanged);
  }

  disconnectedCallback() {
    this.choiceContrast?.disconnect();
    window.removeEventListener("language-changed", this.splitLanguageChanged);
    window.removeEventListener("translations-loaded", this.splitLanguageChanged);
    super.disconnectedCallback();
  }
  formDisabledCallback(disabled: boolean) { this._fieldsetDisabled = disabled; this.syncSlottedControl(); }

  render() {
    if (this.split) return renderSplit(this);
    const hasTextProps = this.text;
    if (this.control === "slotted") return html`<slot @slotchange=${this.syncSlottedControl}></slot>`;
    if (this.hostControl) return html`<slot name="icon"></slot><slot></slot><slot name="trailing"></slot>`;

    const content = hasTextProps
      ? html`<ds-text .text=${this.text}></ds-text>`
      : html`<slot @slotchange=${this._reflectIcon}></slot>`;

    if (this.href) {
      const disabled = this.splitDisabled;
      const target = this.target || (this.blank ? "_blank" : "");
      const rel = this.rel || (target === "_blank" ? "noopener noreferrer" : "");
      return html`<a
        part="control"
        ?primary=${this.primary}
        ?secondary=${this.secondary}
        href=${ifDefined(disabled ? undefined : this.href)}
        target=${ifDefined(disabled || !target ? undefined : target)}
        rel=${ifDefined(disabled || !rel ? undefined : rel)}
        role=${ifDefined(disabled ? "link" : undefined)}
        aria-disabled=${ifDefined(disabled ? "true" : undefined)}
        aria-label=${ifDefined(this.label || undefined)}
        @click=${this._handleClick}
      >${content}</a>`;
    }

    return html`
      <button
        part="control"
        type="button"
        ?primary=${this.primary}
        ?secondary=${this.secondary}
        ?disabled=${this.splitDisabled}
        aria-label=${ifDefined(this.label || undefined)}
        @click=${this._handleClick}
      >
        ${content}
      </button>
    `;
  }

  private _handleClick(e: Event) {
    if (this.splitDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
}

define("ds-button", Button);

declare global {
  interface HTMLElementTagNameMap {
    "ds-button": Button;
  }
}
