import { LitElement, html, unsafeCSS } from "lit";
import { getText, currentLanguage } from "../0-face/i18n";
import { define } from "../0-face/define";
import { CutFades } from "../0-face/cut-fade";
import styles from "./styles/ds-text.css?inline";

export class Text extends LitElement {
  static get properties() {
    return {
      text: { type: String, reflect: true },
      literal: { type: Boolean, reflect: true },
      tone: { type: String, reflect: true },
      size: { type: String, reflect: true },
      strong: { type: Boolean, reflect: true },
      wrap: { type: Boolean, reflect: true },
      _text: { type: String, state: true },
    };
  }

  declare text: string;
  declare literal: boolean;
  declare tone?: "muted" | "title" | "warning" | "danger";
  declare size?: "small" | "heading" | "display";
  declare strong: boolean;
  declare wrap: boolean;
  declare _text: string;
  declare _currentLanguage: string;
  private _slotKey: string = "";
  protected readonly cuts = new CutFades(this, { targets: () => (this.literal && !this.wrap ? [this] : []), text: true });
  private boundHandlers: { languageChanged: EventListener };

  constructor() {
    super();
    this.text = "";
    this.literal = false;
    this.strong = false;
    this.wrap = false;
    this._text = "";
    this._currentLanguage = currentLanguage.value;

    this.boundHandlers = {
      languageChanged: (() => {
        this._currentLanguage = currentLanguage.value;
        this._updateLanguageAttribute();
        this._loadText();
        this.requestUpdate();
      }) as EventListener,
    };
  }

  static styles = unsafeCSS(styles);

  connectedCallback() {
    super.connectedCallback();

    if (!this.text && !this.literal) {
      const slotContent = this.textContent?.trim() || "";
      if (slotContent) {
        this._slotKey = slotContent;
        this.textContent = "";
      }
    }

    this._currentLanguage = currentLanguage.value;
    this._updateLanguageAttribute();
    this._loadText();

    window.addEventListener(
      "language-changed",
      this.boundHandlers.languageChanged
    );

    window.addEventListener(
      "translations-loaded",
      this.boundHandlers.languageChanged
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "language-changed",
      this.boundHandlers.languageChanged
    );
    window.removeEventListener(
      "translations-loaded",
      this.boundHandlers.languageChanged
    );
  }

  willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has("text") || changedProperties.has("literal")) {
      this._loadText();
    }
  }

  _updateLanguageAttribute() {
    const lang = this._currentLanguage || currentLanguage.value;
    const parts = (lang || "").toLowerCase().split(/[-_]/).filter(Boolean);
    const primaryLang = parts[0] || "";

    if (primaryLang === "ja") {
      this.setAttribute("data-language", "ja");
      return;
    }

    if (primaryLang === "zh") {
      const hasHans =
        parts.includes("hans") || parts.includes("cn") || parts.includes("sg");
      const hasHant =
        parts.includes("hant") ||
        parts.includes("tw") ||
        parts.includes("hk") ||
        parts.includes("mo");

      if (hasHans) this.setAttribute("data-language", "zh-hans");
      else if (hasHant) this.setAttribute("data-language", "zh-hant");
      else this.setAttribute("data-language", "zh");
      return;
    }

    this.removeAttribute("data-language");
  }

  _loadText() {
    const key = this.text || this._slotKey;

    if (!key) {
      this._text = "";
      this._updateLanguageAttribute();
      return;
    }

    if (this.literal) {
      this._text = key;
      this._updateLanguageAttribute();
      return;
    }

    try {
      const translatedText = getText(key);
      this._text = translatedText || key;
    } catch (error) {
      console.error("Error loading text for key:", key, error);
      this._text = key;
    }
    this._updateLanguageAttribute();
  }

  render() {
    if (this.literal && !this.text) return html`<slot></slot>`;
    return html`<span>${this._text || this.text || this._slotKey}</span>`;
  }
}

define("ds-text", Text);

declare global {
  interface HTMLElementTagNameMap {
    "ds-text": Text;
  }
}
