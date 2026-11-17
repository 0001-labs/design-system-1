import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import styles from "./styles/ds-ask.css?inline";

export type AskPreview =
  | { type: "lines"; lines: { text: string; done?: boolean }[] }
  | { type: "text"; text: string }
  | { type: "picture"; src: string; fit?: "cover" | "contain" }
  | { type: "month"; year: number; month: number; marks?: number[]; weekStart?: 0 | 1 };

export type AskRow = {
  kind: string;
  id: string;
  title: string;
  detail: string;
  icon: string;
  label?: string;
  caption?: string;
  tone?: string;
  color?: string;
  ink?: string;
  href?: string;
  public?: boolean;
  preview?: AskPreview;
};

const COPIED_MS = 1400;

const WEEKS = 6;

export function monthWeeks(year: number, month: number, weekStart: 0 | 1 = 1): (number | null)[][] {
  const first = new Date(year, month - 1, 1).getDay();
  const lead = (first - weekStart + 7) % 7;
  const days = new Date(year, month, 0).getDate();
  const cells = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, day) => day + 1)];
  const weeks: (number | null)[][] = [];
  for (let start = 0; start < cells.length && weeks.length < WEEKS; start += 7)
    weeks.push(Array.from({ length: 7 }, (_, day) => cells[start + day] ?? null));
  return weeks;
}

export class Ask extends LitElement {
  static properties = {
    text: { type: String },
    open: { type: Boolean, reflect: true },
    state: { type: String, reflect: true },
    answer: { type: String },
    placeholder: { type: String },
    rows: { attribute: false },
    chosen: { type: Number },
    completion: { type: String },
    copied: { state: true },
  };

  static styles = [unsafeCSS(styles)];

  declare text: string;
  declare open: boolean;
  declare state: "writing" | "listening" | "thinking" | "answered" | "failed";
  declare answer: string;
  declare placeholder: string;
  declare rows: AskRow[];
  declare chosen: number;
  declare completion: string;
  declare copied: number;
  #copiedTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.text = "";
    this.open = false;
    this.state = "writing";
    this.answer = "";
    this.placeholder = "";
    this.rows = [];
    this.chosen = 0;
    this.completion = "";
    this.copied = -1;
  }

  async copyLink(index = this.chosen): Promise<boolean> {
    const href = this.rows[index]?.href;
    if (!href) return false;
    const url = new URL(href, location.href).href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return false;
    }
    this.copied = index;
    clearTimeout(this.#copiedTimer);
    this.#copiedTimer = setTimeout(() => { this.copied = -1; }, COPIED_MS);
    this.dispatchEvent(new CustomEvent("ask-copy", { detail: { index, url }, bubbles: true, composed: true }));
    return true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("pointerdown", this.dismiss);
    this.addEventListener("wheel", this.slide, { passive: false });
  }

  disconnectedCallback() {
    this.removeEventListener("pointerdown", this.dismiss);
    this.removeEventListener("wheel", this.slide);
    super.disconnectedCallback();
  }

  private readonly dismiss = (event: PointerEvent) => {
    if (!this.open) return;
    const path = event.composedPath();
    const address = path.find((node) => node instanceof HTMLElement && node.dataset.copy !== undefined) as HTMLElement | undefined;
    if (address) {
      event.preventDefault();
      event.stopPropagation();
      void this.copyLink(Number(address.dataset.copy));
      return;
    }
    const row = path.find((node) => node instanceof HTMLElement && node.dataset.index !== undefined) as HTMLElement | undefined;
    if (row) {
      event.preventDefault();
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("ask-choose", { detail: { index: Number(row.dataset.index) }, bubbles: true, composed: true }));
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent("ask-dismiss", { bubbles: true, composed: true }));
  };

  private readonly slide = (event: WheelEvent) => {
    const strip = this.renderRoot.querySelector<HTMLElement>(".cards");
    if (!this.open || !strip || !event.composedPath().includes(strip)) return;
    event.preventDefault();
    strip.scrollLeft += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  };

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has("rows") || changed.has("state") || changed.has("text") || changed.has("completion")) this.markCuts();
    if (changed.has("chosen") || changed.has("rows")) this.reveal();
  }

  private markCuts() {
    for (const words of this.renderRoot.querySelectorAll<HTMLElement>(".prose, .lines"))
      words.toggleAttribute("data-cut", words.scrollHeight > words.clientHeight + 1);
    const line = this.renderRoot.querySelector<HTMLElement>(".line");
    line?.toggleAttribute("data-cut", line.scrollWidth > line.clientWidth + 1);
  }

  private reveal() {
    const strip = this.renderRoot.querySelector<HTMLElement>(".cards");
    const card = strip?.querySelector<HTMLElement>(`[data-index="${this.chosen}"]`);
    if (!strip || !card) return;
    const room = parseFloat(getComputedStyle(strip).scrollPaddingInlineStart) || 0;
    const start = card.offsetLeft - room;
    const end = card.offsetLeft + card.offsetWidth + room - strip.clientWidth;
    const left = strip.scrollLeft > start ? start : strip.scrollLeft < end ? end : strip.scrollLeft;
    if (left === strip.scrollLeft) return;
    const smooth = typeof matchMedia === "function" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollTo?.({ left, behavior: smooth ? "smooth" : "auto" });
  }

  private line() {
    if (this.state === "listening")
      return html`<span class="dot" aria-hidden="true"></span>${this.text
        ? html`<span class="words heard">${this.text}</span>`
        : html`<span class="placeholder">${this.placeholder}</span>`}`;
    const caret = this.state === "writing" ? html`<span class="caret" aria-hidden="true"></span>` : null;
    if (!this.text && this.state === "writing")
      return html`${caret}<span class="placeholder">${this.placeholder}</span>`;
    return html`<span class="words">${this.text}</span>${this.state === "writing" && this.completion
      ? html`<span class="completion">${this.completion}</span>` : null}${caret}`;
  }

  private preview(row: AskRow) {
    const preview = row.preview;
    if (!preview) return html`<div class="prose named">${row.title}</div>`;
    if (preview.type === "lines")
      return html`<div class="lines">${preview.lines.map((line) => html`<div class="entry" ?data-done=${line.done}>${line.text}</div>`)}</div>`;
    if (preview.type === "text") return html`<div class="prose">${preview.text}</div>`;
    if (preview.type === "picture")
      return html`<img class="picture" data-fit=${preview.fit ?? "cover"} src=${preview.src} alt="" decoding="async" draggable="false" />`;
    const marks = new Set(preview.marks ?? []);
    const now = new Date();
    const today = now.getFullYear() === preview.year && now.getMonth() + 1 === preview.month ? now.getDate() : 0;
    return html`<div class="month">${monthWeeks(preview.year, preview.month, preview.weekStart ?? 1).map((week) =>
      week.map((day) => html`<span class="day" ?data-mark=${day !== null && marks.has(day)} ?data-today=${day !== null && day === today}>${day ?? ""}</span>`))}</div>`;
  }

  private cardStyle(row: AskRow, index: number): string {
    return [
      `--ds-ask-distance: ${this.chosen < 0 ? 1 : Math.abs(index - this.chosen)}`,
      row.color ? `--ds-ask-tone: ${row.color}` : "",
      row.ink ? `--ds-ask-head-ink: ${row.ink}` : "",
    ].filter(Boolean).join("; ");
  }

  private address(row: AskRow, index: number) {
    const globe = row.public ? html`<ds-icon class="globe" type="globe" aria-label="Public"></ds-icon>` : nothing;
    const words = this.copied === index ? "Copied" : row.caption ?? "";
    if (!row.href) return html`<span class="caption">${globe}<span class="address">${words}</span></span>`;
    return html`<span class="caption" data-copy=${index} role="button" title="Copy link" aria-label=${`Copy link: ${row.caption ?? row.href}`}>${globe}<span class="address">${words}</span></span>`;
  }

  private cards() {
    if (this.state !== "writing" || !this.rows.length) return null;
    return html`<div class="cards" role="listbox" aria-label="Results">${this.rows.map((row, index) => html`
      <div class="card" role="option" data-index=${index} data-kind=${row.kind} data-tone=${row.tone ?? nothing}
        aria-selected=${index === this.chosen ? "true" : "false"} aria-label=${`${row.label ?? row.detail}: ${row.title}`}
        style=${this.cardStyle(row, index)}>
        <div class="head">
          <span class="label">${row.label ?? row.detail}</span>
          <ds-icon class="icon" type=${row.icon}></ds-icon>
          <span class="detail">${row.label ? row.detail : ""}</span>
        </div>
        <div class="body" data-preview=${row.preview?.type ?? "title"}>${this.preview(row)}</div>
        <div class="foot">
          <span class="title">${row.title}</span>
          ${this.address(row, index)}
        </div>
      </div>`)}</div>`;
  }

  render() {
    const answered = this.state === "answered" || this.state === "failed";
    return html`<div class="veil" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="dock">
        ${this.cards()}
        <div class="answer" part="answer" role="status" aria-live="polite">${answered ? this.answer : ""}</div>
        <div class="line" part="line">${this.line()}</div>
      </div>`;
  }
}

if (!customElements.get("ds-ask")) customElements.define("ds-ask", Ask);

declare global {
  interface HTMLElementTagNameMap {
    "ds-ask": Ask;
  }
}
