import { LitElement, html, unsafeCSS } from "lit";
import { define } from "../0-face/define";
import {
  translate,
  currentLanguage,
  getAvailableLanguagesSync,
  getLanguageDisplayName,
  setLanguage,
} from "../0-face/i18n";
import type { LanguageCode } from "../0-face/i18n";
import { LANGUAGE_METADATA, isLanguage, normalizeLanguage } from "../0-face/languages";
import { currentThemeMode, setThemeMode, THEME_MODES } from "../0-face/theme";
import type { ThemeMode } from "../0-face/theme";
import { getShape, setShape, SHAPES, type Shape } from "../0-face/shape";
import { savePreferences } from "../0-face/preferences";
import "./ds-button";
import "./ds-icon";
import "./ds-text";
import styles from "./styles/ds-cycle.css?inline";

const saveAccentColor = (color: string) => {
  localStorage.setItem("accentColor", color);
};

const getAccentColor = (): string => {
  return localStorage.getItem("accentColor") || "--sharp-blue";
};

const applyAccentColor = () => {
  const color = getAccentColor();
  document.documentElement.style.setProperty("--accent-color", `var(${color})`);
};

export function nativeLanguageName(code: string): string {
  if (!code) return "";
  if (isLanguage(code)) return LANGUAGE_METADATA[code].nativeLabel;
  const member = normalizeLanguage(code, null);
  if (member) return LANGUAGE_METADATA[member].nativeLabel;
  return getLanguageDisplayName(code, { locale: code });
}

const SETTINGS = new Set(["language", "theme", "shape", "accent-color"]);

export class Cycle extends LitElement {
  static formAssociated = true;
  static get properties() {
    return {
      type: { type: String, reflect: true },
      chip: { type: Boolean, reflect: true },
      values: { type: Array },
      value: { type: String },
      label: { type: String, reflect: true },
      currentValue: { type: String, state: true },
      translationsReady: { type: Boolean, state: true },
      disabled: { type: Boolean, reflect: true },
      _fieldsetDisabled: { state: true },
      variant: { type: String },
      primary: { type: Boolean, reflect: true },
      secondary: { type: Boolean, reflect: true },
    };
  }

  static styles = unsafeCSS(styles);

  declare type: string;
  declare chip: boolean;
  declare values: string[];
  declare value: string;
  declare label: string;
  declare currentValue: string;
  declare translationsReady: boolean;
  declare disabled: boolean;
  declare protected _fieldsetDisabled: boolean;
  declare variant: string;
  declare primary: boolean;
  declare secondary: boolean;

  private boundHandlers: {
    translationsLoaded: EventListener;
    languageChanged: EventListener;
    handleLanguageChanged: EventListener;
    handleThemeChanged: EventListener;
    handleAccentColorChanged: EventListener;
  };

  constructor() {
    super();
    if (typeof this.attachInternals === "function") this.attachInternals();
    this._fieldsetDisabled = false;
    this.variant = "";

    this.type = "";
    this.chip = false;
    this.values = [];
    this.value = "";
    this.label = "";
    this.currentValue = "";
    this.translationsReady = false;
    this.disabled = false;
    this.primary = false;
    this.secondary = false;

    this.boundHandlers = {
      translationsLoaded: this.handleTranslationsLoaded.bind(this),
      languageChanged: this.handleLanguageChanged.bind(this),
      handleLanguageChanged: this.handleLanguageChanged.bind(this),
      handleThemeChanged: this.handleThemeChanged.bind(this),
      handleAccentColorChanged: this.handleAccentColorChanged.bind(this),
    };
  }

  formDisabledCallback(disabled: boolean) { this._fieldsetDisabled = disabled; }

  focus(options?: FocusOptions) { this.shadowRoot?.querySelector<HTMLElement>("ds-button, button")?.focus(options); }

  connectedCallback() {
    super.connectedCallback();

    window.addEventListener(
      "translations-loaded",
      this.boundHandlers.translationsLoaded
    );
    window.addEventListener(
      "language-changed",
      this.boundHandlers.languageChanged
    );
    window.addEventListener(
      "theme-changed",
      this.boundHandlers.handleThemeChanged
    );
    window.addEventListener("shape-changed", this.onShapeChanged);
    window.addEventListener(
      "accent-color-changed",
      this.boundHandlers.handleAccentColorChanged
    );

    this.initializeValues();
  }

  initializeValues(): void {
    if (this.type === "language") {
      const availableLanguages = getAvailableLanguagesSync();
      this.values = availableLanguages;
      this.currentValue = currentLanguage.value;
    } else if (this.type === "theme") {
      this.values = [...THEME_MODES];
      this.currentValue = currentThemeMode.get();
    } else if (this.type === "shape") {
      this.values = [...SHAPES];
      this.currentValue = getShape();
    } else if (this.type === "accent-color") {
      this.values = [
        "--apple-green",
        "--every-green",
        "--zenith-blue",
        "--sharp-blue",
        "--pink",
        "--tuned-red",
        "--orange",
        "--yellow",
      ];

      const currentAccentColor = getAccentColor();
      this.currentValue = currentAccentColor;

      applyAccentColor();
    }

    this.requestUpdate();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === "type" && oldValue !== newValue) {
      this.initializeValues();
    }
  }

  setupInitialValue(): void {
    if (this.type === "language") {
      const currentLang = currentLanguage.value;
      this.currentValue = currentLang;
    } else if (this.type === "theme") {
      this.currentValue = currentThemeMode.get();
    } else if (this.type === "shape") {
      this.currentValue = getShape();
    } else if (this.type === "accent-color") {
      const currentAccentColor = getAccentColor();
      this.currentValue = currentAccentColor;

      applyAccentColor();
    }

    this.requestUpdate();
  }

  handleSettingsChanges() {
    this.setupInitialValue();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener(
      "translations-loaded",
      this.boundHandlers.translationsLoaded
    );
    window.removeEventListener(
      "language-changed",
      this.boundHandlers.languageChanged
    );
    window.removeEventListener(
      "theme-changed",
      this.boundHandlers.handleThemeChanged
    );
    window.removeEventListener("shape-changed", this.onShapeChanged);
    window.removeEventListener(
      "accent-color-changed",
      this.boundHandlers.handleAccentColorChanged
    );
  }

  handleButtonClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    if (this.disabled || this._fieldsetDisabled || !this.values.length || this.values.every(value => value === this.currentValue)) {
      return;
    }

    if (this.type === "language") {
      const currentIndex = this.values.indexOf(this.currentValue);
      const nextIndex = (currentIndex + 1) % this.values.length;
      const newLanguage = this.values[nextIndex];

      this.currentValue = newLanguage;

      if ((document as any).startViewTransition) {
        (document as any).startViewTransition(() => {
          setLanguage(newLanguage as LanguageCode);
        });
      } else {
        setLanguage(newLanguage as LanguageCode);
      }

      savePreferences({ language: newLanguage as LanguageCode });

    } else if (this.type === "theme") {
      const currentIndex = this.values.indexOf(this.currentValue);
      const nextIndex = (currentIndex + 1) % this.values.length;
      const newTheme = this.values[nextIndex];

      this.currentValue = newTheme;

      setThemeMode(newTheme as ThemeMode);

      savePreferences({ theme: newTheme as ThemeMode });
    } else if (this.type === "shape") {
      const next = this.values[(this.values.indexOf(this.currentValue) + 1) % this.values.length];
      this.currentValue = next;
      setShape(next as Shape);
    } else if (this.type === "accent-color") {
      const currentIndex = this.values.indexOf(this.currentValue);
      const nextIndex = (currentIndex + 1) % this.values.length;
      const newColor = this.values[nextIndex];

      this.currentValue = newColor;

      saveAccentColor(newColor);

      applyAccentColor();

      savePreferences({ accentColor: newColor });

      window.dispatchEvent(
        new CustomEvent("accent-color-changed", {
          detail: { color: newColor },
        })
      );
    } else if (!SETTINGS.has(this.type)) {
      const next = this.values[(this.values.indexOf(this.currentValue) + 1) % this.values.length];
      this.currentValue = this.value = next;
      this.dispatchEvent(new CustomEvent("change", { detail: { value: next }, bubbles: true, composed: true }));
    }

    this.requestUpdate();
  }

  private onShapeChanged = (): void => {
    if (this.type === "shape") this.setupInitialValue();
  };

  getValueDisplay(value: string): string | any {
    if (this.type === "language") {
      return nativeLanguageName(value);
    } else if (this.type === "shape") {
      const word = value.charAt(0).toUpperCase() + value.slice(1);
      const translated = this.translationsReady ? translate(word) : "";
      return translated && translated !== word ? translated : word;
    } else if (this.type === "theme") {
      if (this.translationsReady) {
        const translatedName = translate(value);
        if (translatedName && translatedName !== value) {
          return translatedName;
        }
      }

      return value;
    } else if (this.type === "accent-color") {
      return this.getColorName(value);
    }

    return value;
  }

  getColorKey(colorVar: string): string {
    const colorMap: { [key: string]: string } = {
      "--tuned-red": "Red",
      "--orange": "Orange",
      "--yellow": "Yellow",
      "--apple-green": "Apple green",
      "--every-green": "Green",
      "--zenith-blue": "Light blue",
      "--sharp-blue": "Blue",
      "--pink": "Pink",
    };

    return colorMap[colorVar] || colorVar.replace("--", "").replace("-", " ");
  }

  getColorName(colorVar: string): string {
    const colorMap: { [key: string]: string } = {
      "--tuned-red": "Red",
      "--orange": "Orange",
      "--yellow": "Yellow",
      "--apple-green": "Apple green",
      "--every-green": "Green",
      "--zenith-blue": "Light blue",
      "--sharp-blue": "Blue",
      "--pink": "Pink",
    };

    const translationText = colorMap[colorVar];
    if (translationText && this.translationsReady) {
      const translatedName = translate(translationText);
      if (translatedName && translatedName !== translationText) {
        return translatedName;
      }
    }

    return colorVar.replace("--", "").replace("-", " ");
  }

  willUpdate(changed: Map<PropertyKey, unknown>) {
    if (!SETTINGS.has(this.type) && this.values.length) {
      if (changed.has("value") && this.values.includes(this.value)) this.currentValue = this.value;
      else if (!this.values.includes(this.currentValue)) this.currentValue = this.values.includes(this.value) ? this.value : this.values[0];
    }
    if (changed.has("variant") && this.variant) {
      this.primary = this.variant === "primary";
      this.secondary = this.variant === "secondary";
    }
    if ((!this.hasUpdated || changed.has("type")) && !this.primary && !this.secondary) {
      if (this.type === "language" || this.type === "theme") this.secondary = true;
      else this.primary = true;
    }
  }

  valueText(): string {
    const value = this.currentValue;
    if (this.type === "language") return nativeLanguageName(value);
    if (this.type === "theme") return translate(value === "light" ? "Light" : value === "dark" ? "Dark" : "System");
    if (this.type === "accent-color") return translate(this.getColorKey(value));
    return value;
  }

  accessibleLabel(): string {
    if (this.label) return `${translate(this.label)}: ${this.valueText()}`;
    return this.type === "language" ? `${translate("Language")}: ${this.valueText()}` : "";
  }

  private renderLanguagePicker() {
    const code = this.currentValue || currentLanguage.value;
    const button = html`<button
      type="button"
      lang=${code}
      aria-label=${this.accessibleLabel()}
      ?disabled=${this.disabled || this._fieldsetDisabled}
      @click=${this.handleButtonClick}
    >
      ${nativeLanguageName(code)}
    </button>`;
    return html`<ds-button fit control="slotted"
      ?primary=${this.primary && !this.secondary} ?secondary=${this.secondary}
      ?disabled=${this.disabled || this._fieldsetDisabled}>${button}</ds-button>`;
  }

  render() {
    if (this.type === "language") return this.renderLanguagePicker();
    return html`
      <div class="cycle">
        <ds-button fit
          .label=${this.accessibleLabel()}
          ?primary=${this.primary && !this.secondary}
          ?secondary=${this.secondary}
          ?disabled=${this.disabled || this._fieldsetDisabled}
          @click=${this.handleButtonClick}
        >
          ${this.type === "language"
              ? html`<ds-text
                  literal text=${this.getValueDisplay(this.currentValue)}
                ></ds-text>`
              : this.type === "theme"
                ? html`<ds-text
                    text=${this.currentValue === "light" ? "Light" : this.currentValue === "dark" ? "Dark" : "System"}
                  ></ds-text>`
                : this.type === "accent-color"
                  ? html`<ds-text
                      text=${this.getColorKey(this.currentValue)}
                    ></ds-text>`
                  : html`<ds-text
                        literal text=${this.getValueDisplay(this.currentValue)}
                      ></ds-text>`}
        </ds-button>
      </div>
    `;
  }

  private handleTranslationsLoaded() {
    this.translationsReady = true;

    if (this.type === "language") {
      const availableLanguages = getAvailableLanguagesSync();
      this.values = availableLanguages;
    }

    this.setupInitialValue();
  }

  private handleLanguageChanged() {
    this.setupInitialValue();
  }

  private handleThemeChanged() {
    this.setupInitialValue();
  }

  private handleAccentColorChanged() {
    this.setupInitialValue();
  }
}

define("ds-cycle", Cycle);

declare global {
  interface HTMLElementTagNameMap {
    "ds-cycle": Cycle;
  }
}
