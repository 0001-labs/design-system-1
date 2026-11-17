import { LitElement, html, nothing, unsafeCSS } from "lit";
import { getText } from "../0-face/i18n";
import { define } from "../0-face/define";
import { CutFades } from "../0-face/cut-fade";
import metrics from "../1-root/component-metrics.css?inline";
import documentSheet from "../1-root/document.css?inline";
import documentRules from "../1-root/document.css?raw";
import proseRules from "../1-root/prose.css?raw";
import styles from "./styles/ds-document.css?inline";

export const CONTENTS_LABEL = "Contents";

export interface DocumentEntry {
  id: string;
  text: string;
  level: number;
}

export function headingId(text: string, taken: Set<string>, index: number): string {
  const base = text.normalize("NFKC").toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || `section-${index + 1}`;
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

export function documentLevels(value: string | null | undefined): number[] {
  const levels = [...new Set(String(value ?? "2").split(/[\s,]+/).map(Number).filter(level => Number.isInteger(level) && level >= 2 && level <= 6))].sort();
  return levels.length ? levels : [2];
}

const styledRoots = new WeakSet<Document | ShadowRoot>();
function styleRoot(root: Node) {
  const target = root instanceof ShadowRoot ? root : root instanceof Document ? root : null;
  if (!target || styledRoots.has(target) || typeof CSSStyleSheet === "undefined" || !("adoptedStyleSheets" in target)) return;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync([proseRules, documentRules].map(css => css.replace(/^@import[^;]*;\s*$/gm, "")).join("\n"));
    target.adoptedStyleSheets = [...target.adoptedStyleSheets, sheet];
    styledRoots.add(target);
  } catch {
  }
}

export class DocumentPage extends LitElement {
  static properties = {
    levels: { type: String },
    label: { type: String },
    literal: { type: Boolean, reflect: true },
    hideContents: { type: Boolean, attribute: "hide-contents", reflect: true },
    entries: { state: true },
    current: { state: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(documentSheet), unsafeCSS(styles)];
  protected readonly cuts = new CutFades(this, { selector: ".ds-document__toc-list a" });

  declare levels: string;
  declare label: string | undefined;
  declare literal: boolean;
  declare hideContents: boolean;
  declare entries: DocumentEntry[];
  declare current: string | null;

  private readonly relabel = () => this.requestUpdate();
  private observer: MutationObserver | null = null;
  private frame = 0;

  constructor() {
    super();
    this.levels = "2";
    this.literal = false;
    this.hideContents = false;
    this.entries = [];
    this.current = null;
  }

  connectedCallback() {
    super.connectedCallback();
    styleRoot(this.getRootNode());
    if (!this.hasAttribute("data-ds-prose")) this.setAttribute("data-ds-prose", "");
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
    document.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    window.addEventListener("resize", this.onScroll, { passive: true });
    this.observer = new MutationObserver(() => this.collect());
    this.observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["id"] });
    this.collect();
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    document.removeEventListener("scroll", this.onScroll, { capture: true });
    window.removeEventListener("resize", this.onScroll);
    this.observer?.disconnect();
    this.observer = null;
    cancelAnimationFrame(this.frame);
    super.disconnectedCallback();
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has("levels") && this.hasUpdated) this.collect();
  }

  get headings(): HTMLElement[] {
    const levels = documentLevels(this.levels);
    return [...this.querySelectorAll<HTMLElement>(levels.map(level => `h${level}`).join(","))]
      .filter(heading => !heading.closest("[data-ds-not-prose]") && !heading.closest('[slot="contents"]'));
  }

  collect(): void {
    const taken = new Set([...this.querySelectorAll("[id]")].map(element => element.id));
    const entries = this.headings.map((heading, index) => {
      const text = (heading.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!heading.id) {
        heading.id = headingId(text, taken, index);
      }
      return { id: heading.id, text, level: Number(heading.tagName.slice(1)) };
    });
    const same = entries.length === this.entries.length && entries.every((entry, i) => entry.id === this.entries[i]!.id && entry.text === this.entries[i]!.text && entry.level === this.entries[i]!.level);
    if (!same) this.entries = entries;
    this.onScroll();
  }

  private onScroll = () => {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => {
      const view = window.innerHeight || 0;
      const end = document.documentElement;
      const line = view && window.scrollY > 0 && window.scrollY + view >= end.scrollHeight - 1 ? view : view / 5;
      let current: string | null = null;
      for (const entry of this.entries) {
        const heading = this.heading(entry.id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top <= line) current = entry.id;
        else break;
      }
      this.current = current ?? this.entries[0]?.id ?? null;
    });
  };

  private heading(id: string): HTMLElement | undefined {
    return this.headings.find(heading => heading.id === id);
  }

  private follow(event: MouseEvent, id: string) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const heading = this.heading(id);
    if (!heading) return;
    event.preventDefault();
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    heading.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    history.replaceState(history.state, "", `#${id}`);
    this.current = id;
  }

  render() {
    const label = this.literal ? this.label || CONTENTS_LABEL : getText(this.label || CONTENTS_LABEL) || this.label || CONTENTS_LABEL;
    const top = Math.min(...this.entries.map(entry => entry.level));
    const own = [...this.children].some(child => child.getAttribute("slot") === "contents");
    const showContents = !this.hideContents && (own || this.entries.length >= 2);
    return html`<div class="ds-document" part="document">
      <nav class="ds-document__toc" part="contents" aria-labelledby="contents-title" ?hidden=${!showContents}>
        <div class="ds-document__contents">
          <p class="ds-document__toc-title" id="contents-title" part="contents-title">${label}</p>
          <slot name="contents" @slotchange=${this.relabel}>
            <ol class="ds-document__toc-list" part="contents-list">
              ${this.entries.map(entry => html`<li class=${entry.level > top ? "ds-document__toc-sub" : nothing}>
                <a href="#${entry.id}" aria-current=${this.current === entry.id ? "location" : nothing} @click=${(event: MouseEvent) => this.follow(event, entry.id)}>${entry.text}</a>
              </li>`)}
            </ol>
          </slot>
        </div>
      </nav>
      <div class="ds-document__body" part="body"><slot></slot></div>
    </div>`;
  }
}

define("ds-document", DocumentPage);

declare global {
  interface HTMLElementTagNameMap {
    "ds-document": DocumentPage;
  }
}
