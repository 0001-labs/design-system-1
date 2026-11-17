import { LitElement, html, unsafeCSS } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import styles from "./styles/ds-icon.css?inline";
import type { IconName } from "./generated/ds-icon-map";
import { icons as immediateIcons, deferredIconNames } from "./generated/icons-immediate";
import { define } from "../0-face/define";

const iconNameToSvgMap: Record<string, string> = { ...immediateIcons }
const deferred = new Set<string>(deferredIconNames)

export function provideIcons(icons: Readonly<Record<string, string>>): void {
  for (const [name, svg] of Object.entries(icons)) iconNameToSvgMap[name.toLowerCase()] ??= svg
}
let extraReady = false
let extraLoading: Promise<void> | undefined
function loadExtraIcons(): Promise<void> {
  return (extraLoading ??= import('./generated/icons-extra')
    .then(({ icons }) => {
      Object.assign(iconNameToSvgMap, icons)
      extraReady = true
    })
    .catch((error) => {
      extraLoading = undefined
      throw error
    }))
}


const INK = /(fill|stroke)=("|')(#1E1E1E|#2A2A2A|#000000|#000|black)\2/gi;
const PAINT = /(?:fill|stroke)=("|')([^"']+)\1/gi;
const NOT_A_COLOUR = /^(none|currentColor|white|#fff|#ffffff|url\(.*\))$/i;
const INK_VALUE = /^(#1E1E1E|#2A2A2A|#000000|#000|black)$/i;

const themed = new Map<string, string>();

function hasOwnColours(svg: string): boolean {
  for (const [, , value] of svg.matchAll(PAINT)) {
    if (!NOT_A_COLOUR.test(value) && !INK_VALUE.test(value)) return true;
  }
  return false;
}

export function themeIconSvg(svg: string): string {
  const known = themed.get(svg);
  if (known !== undefined) return known;
  const next = hasOwnColours(svg) ? svg : svg.replace(INK, '$1="currentColor"');
  themed.set(svg, next);
  return next;
}

export type IconVariant = "glyph" | "primary" | "secondary";

export class Icon extends LitElement {
  static properties = {
    type: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  private _type: IconName | "" = "";
  private _iconsReady: Promise<void> | undefined;
  private _failedType: string | undefined;
  declare variant: IconVariant;
  declare size: "small" | "large" | "app" | "app-large" | undefined;

  constructor() {
    super();
    this.variant = "glyph";
  }

  get type(): IconName | "" {
    return this._type;
  }

  set type(val: IconName | "") {
    const oldVal = this._type;
    this._type = val;
    this.requestUpdate("type", oldVal);
  }

  protected async getUpdateComplete(): Promise<boolean> {
    await super.getUpdateComplete()
    await this._iconsReady
    return super.getUpdateComplete()
  }

  static styles = unsafeCSS(styles);

  render() {
    if (!this._type) {
      return html`<slot></slot>`;
    }

    const svg = iconNameToSvgMap[this._type.toLowerCase() as IconName];
    if (svg) {
      return html`${unsafeHTML(this._type.startsWith("app-") ? svg : themeIconSvg(svg))}`;
    }

    if (
      !extraReady &&
      deferred.has(this._type.toLowerCase()) &&
      !this._iconsReady &&
      this._failedType !== this._type
    ) {
      const requested = this._type
      this._iconsReady = loadExtraIcons()
        .then(() => {
          this._failedType = undefined
          this.requestUpdate()
        })
        .catch(() => {
          this._failedType = requested
        })
        .finally(() => {
          this._iconsReady = undefined
        })
    }

    return html`<slot></slot>`;
  }
}

define("ds-icon", Icon);

declare global {
  interface HTMLElementTagNameMap {
    "ds-icon": Icon;
  }
}

export type { IconName };
