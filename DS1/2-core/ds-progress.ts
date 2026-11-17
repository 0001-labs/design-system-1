import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { getText } from "../0-face/i18n";
import { define } from "../0-face/define";
import { CutFades } from "../0-face/cut-fade";
import { formatNumber } from "../0-face/format";
import { dotForKey, dotState } from "../0-face/carousel";
import { figureFormat, meterAria, type FigureFormat, type MeterAria } from "./figures";
import "./ds-icon";
import metrics from "../1-root/component-metrics.css?inline";
import progress from "../1-root/progress.css?inline";
import styles from "./styles/ds-progress.css?inline";

const MOST_SQUARES = 100;

export type StepState = "done" | "current" | "upcoming" | "failed";
const STATES: readonly StepState[] = ["done", "current", "upcoming", "failed"];

export type Step = string | { label: string; state?: StepState; href?: string };

const STATE_WORDS: Partial<Record<StepState, string>> = { done: "Done", failed: "Failed" };

export function stepStates(steps: readonly Step[], current: number): StepState[] {
  return steps.map((step, index) => {
    const own = typeof step === "object" && step ? step.state : undefined;
    if (own && STATES.includes(own)) return own;
    const number = index + 1;
    return number < current ? "done" : number === current ? "current" : "upcoming";
  });
}

export interface ProgressSelectDetail {
  index: number;
  previous: number;
}

export type ProgressMode = "meter" | "steps" | "dots";

export class Progress extends LitElement {
  static properties = {
    value: { type: Number },
    min: { type: Number },
    max: { type: Number },
    squares: { type: Number },
    over: { type: Boolean, reflect: true },
    valuetext: { type: String },
    format: { type: String },
    currency: { type: String },
    minor: { type: Boolean },
    whole: { type: Boolean },
    digits: { type: Number },
    steps: { type: Array },
    current: { type: Number },
    vertical: { type: Boolean, reflect: true },
    dots: { type: Number, reflect: true },
    active: { type: Number, reflect: true },
    end: { type: Boolean, reflect: true },
    dotLabel: { type: String, attribute: "dot-label" },
    label: { type: String },
    literal: { type: Boolean, reflect: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(progress), unsafeCSS(styles)];
  protected readonly cuts = new CutFades(this, { selector: ".ds-progress__label" });

  declare value: number;
  declare min: number;
  declare max: number;
  declare squares: number | undefined;
  declare over: boolean;
  declare valuetext: string | undefined;
  declare format: FigureFormat;
  declare currency: string | undefined;
  declare minor: boolean;
  declare whole: boolean;
  declare digits: number | undefined;
  declare steps: Step[] | undefined;
  declare current: number;
  declare vertical: boolean;
  declare dots: number | undefined;
  declare active: number;
  declare end: boolean;
  declare dotLabel: string | undefined;
  declare label: string | undefined;
  declare literal: boolean;

  private ownRole: string | null = null;
  private focusAfterUpdate = false;
  private readonly relabel = () => this.requestUpdate();

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 1;
    this.over = false;
    this.format = "number";
    this.minor = false;
    this.whole = false;
    this.current = 1;
    this.vertical = false;
    this.active = 0;
    this.end = false;
    this.literal = false;
  }

  get mode(): ProgressMode {
    if (Array.isArray(this.steps)) return "steps";
    if (this.dots !== undefined && this.dots !== null) return "dots";
    return "meter";
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
    window.addEventListener("translations-ready", this.relabel);
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    window.removeEventListener("translations-ready", this.relabel);
    super.disconnectedCallback();
  }

  private words(value: string | undefined): string {
    if (!value) return "";
    return this.literal ? value : getText(value) || value;
  }

  private wordsWith(value: string | undefined, fallback: string, params?: Record<string, number>): string {
    const text = value && this.literal ? value : getText(value || fallback, params) || value || fallback;
    return params ? text.replace(/\{\{?(\w+)\}?\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole)) : text;
  }

  private setRole(role: string | null) {
    const written = this.getAttribute("role");
    if (written !== null && written !== this.ownRole) return;
    this.ownRole = role;
    if (role === null) this.removeAttribute("role");
    else if (written !== role) this.setAttribute("role", role);
  }

  get aria(): MeterAria {
    return meterAria(this.value, this.min, this.max, {
      over: this.over, format: figureFormat(this.format), currency: this.currency,
      minor: this.minor, whole: this.whole, digits: this.digits,
    });
  }

  get squareCount(): number {
    const count = Math.floor(Number(this.squares));
    return Number.isFinite(count) && count > 0 ? Math.min(MOST_SQUARES, count) : 0;
  }

  get states(): StepState[] {
    return stepStates(Array.isArray(this.steps) ? this.steps : [], Number(this.current));
  }

  private slotted(name: string): boolean {
    return [...this.children].some(node => node.getAttribute("slot") === name);
  }

  get dotCount(): number {
    return Number.isFinite(this.dots) ? Math.max(0, Math.floor(this.dots as number)) : 0;
  }

  get currentDot(): number {
    const active = Number.isFinite(this.active) ? Math.floor(this.active) : 0;
    return Math.max(0, Math.min(this.dotCount - 1, active));
  }

  select(index: number): boolean {
    if (this.dotCount === 0) return false;
    const target = Math.max(0, Math.min(this.dotCount - 1, Math.floor(index)));
    const event = new CustomEvent<ProgressSelectDetail>("select", {
      bubbles: true, composed: true, cancelable: true, detail: { index: target, previous: this.currentDot },
    });
    if (!this.dispatchEvent(event)) return false;
    this.active = target;
    return true;
  }

  private dotKeydown(event: KeyboardEvent, index: number) {
    const to = dotForKey(event.key, index, this.dotCount, getComputedStyle(this).direction === "rtl");
    if (to === undefined) return;
    event.preventDefault();
    if (this.select(to)) {
      this.focusAfterUpdate = true;
      return;
    }
    this.renderRoot.querySelectorAll<HTMLButtonElement>(".ds-progress__dot")[to]?.focus();
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    const mode = this.mode;
    if (mode === "meter") {
      const aria = this.aria;
      const label = this.words(this.label);
      this.setRole("meter");
      this.setAttribute("aria-valuenow", String(aria.now));
      this.setAttribute("aria-valuemin", String(aria.min));
      this.setAttribute("aria-valuemax", String(aria.max));
      this.setAttribute("aria-valuetext", this.words(this.valuetext) || aria.text);
      if (label) this.setAttribute("aria-label", label);
      else if (changed.has("label")) this.removeAttribute("aria-label");
      this.toggleAttribute("data-over", aria.over);
      return;
    }
    for (const name of ["aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "data-over"]) this.removeAttribute(name);
    if (mode === "dots") {
      this.setRole("group");
      if (!this.hasAttribute("aria-labelledby")) this.setAttribute("aria-label", this.wordsWith(this.label, "Slides"));
      return;
    }
    this.setRole(null);
    if (changed.has("label") || changed.has("steps")) this.removeAttribute("aria-label");
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (!this.focusAfterUpdate) return;
    this.focusAfterUpdate = false;
    this.renderRoot.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
  }

  private renderMeter() {
    const aria = this.aria;
    const count = this.squareCount;
    const over = aria.over ? " ds-progress--over" : "";
    if (count) {
      const on = Math.round(aria.fraction * count);
      return html`<div class="ds-progress ds-progress--squares${over}" part="progress">${Array.from({ length: count }, (_, index) =>
        html`<span class="ds-progress__square${index < on ? " ds-progress__square--on" : ""}" part="square"></span>`)}</div>`;
    }
    return html`<div class="ds-progress${over}" part="progress" style="--ds-progress-value: ${aria.fraction}"><span class="ds-progress__fill" part="fill"></span></div>`;
  }

  private renderSteps() {
    const steps = Array.isArray(this.steps) ? this.steps : [];
    const states = this.states;
    const label = this.words(this.label);
    const changed = () => this.requestUpdate();
    return html`<ol class="ds-progress ds-progress--steps${this.vertical ? " ds-progress--vertical" : ""}" part="steps" aria-label=${label || nothing}>
      ${steps.map((step, index) => {
        const state = states[index]!;
        const name = this.words(typeof step === "string" ? step : step?.label);
        const href = typeof step === "object" && step ? step.href : undefined;
        const number = index + 1;
        const said = STATE_WORDS[state];
        const mark = state === "done" || state === "failed"
          ? html`<ds-icon size="small" type=${state === "done" ? "check" : "warning"}></ds-icon>`
          : formatNumber(number);
        const face = html`<span class="ds-progress__mark" part="mark" aria-hidden="true">${mark}</span><span class="ds-progress__label" part="label">${name}</span>${said
          ? html`<span class="ds-progress__state"> ${getText(said) || said}</span>`
          : nothing}`;
        return html`<li class="ds-progress__step${state === "upcoming" ? "" : ` ds-progress__step--${state}`}" part="step" data-state=${state} aria-current=${state === "current" ? "step" : nothing}>
          ${href ? html`<a class="ds-progress__link" part="link" href=${href}>${face}</a>` : face}
          ${this.vertical
            ? html`<div class="ds-progress__body" part="body" ?hidden=${!this.slotted(`step-${number}`)}><slot name=${`step-${number}`} @slotchange=${changed}></slot></div>`
            : nothing}
        </li>`;
      })}
    </ol>`;
  }

  private renderDots() {
    const current = this.currentDot;
    return html`<div class="ds-progress ds-progress--dots" part="dots">
      ${Array.from({ length: this.dotCount }, (_, index) => {
        const state = dotState(index, current, this.dotCount, this.end);
        return html`<button
          class="ds-progress__dot"
          part="dot"
          type="button"
          data-state=${state}
          aria-label=${this.wordsWith(this.dotLabel, "Slide {index}", { index: index + 1 })}
          aria-current=${state === "current" ? "true" : "false"}
          tabindex=${state === "current" ? 0 : -1}
          @click=${() => this.select(index)}
          @keydown=${(event: KeyboardEvent) => this.dotKeydown(event, index)}
        ></button>`;
      })}
    </div>`;
  }

  render() {
    const mode = this.mode;
    return mode === "steps" ? this.renderSteps() : mode === "dots" ? this.renderDots() : this.renderMeter();
  }
}

define("ds-progress", Progress);

declare global {
  interface HTMLElementTagNameMap {
    "ds-progress": Progress;
  }
}
