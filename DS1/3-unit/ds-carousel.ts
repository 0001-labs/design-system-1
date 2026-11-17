import { isHTMLElement } from "../0-face/light-dom";

import { LitElement, html, nothing, unsafeCSS, type PropertyValues } from "lit";
import { getText } from "../0-face/i18n";
import { define } from "../0-face/define";
import { COPY, autoplayInterval, bleedOf, dragTrack, driveCarousel, nearestSlide, prefersReducedMotion, scrollToSlide, type CarouselDrive } from "../0-face/carousel";
import "../2-core/ds-icon";
import "../2-core/ds-progress";
import type { ProgressSelectDetail } from "../2-core/ds-progress";
import metrics from "../1-root/component-metrics.css?inline";
import controls from "../1-root/controls.css?inline";
import carousel from "../1-root/carousel.css?inline";
import styles from "./styles/ds-carousel.css?inline";

export interface CarouselChangeDetail {
  index: number;
  previous: number;
}

const squares = (value: number | undefined, least: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= least ? Math.floor(value) : undefined;

export class Carousel extends LitElement {
  static properties = {
    label: { type: String },
    literal: { type: Boolean, reflect: true },
    current: { type: Number, reflect: true },
    buttons: { type: Boolean, reflect: true },
    noDots: { type: Boolean, reflect: true, attribute: "no-dots" },
    noDrag: { type: Boolean, reflect: true, attribute: "no-drag" },
    end: { type: Boolean, reflect: true },
    slideWidth: { attribute: "slide-width", reflect: true, converter: {
      fromAttribute: (value: string | null) => (value === null ? undefined : value === "auto" ? "auto" : Number(value)),
      toAttribute: (value: number | string | undefined) => (value === undefined ? null : String(value)),
    } },
    gap: { type: Number },
    bleed: { type: String, reflect: true },
    loop: { type: Boolean, reflect: true },
    autoplay: { type: String, reflect: true },
    free: { type: Boolean, reflect: true },
    count: { state: true },
    announcement: { state: true },
    paused: { state: true },
  };

  static styles = [unsafeCSS(metrics), unsafeCSS(controls), unsafeCSS(carousel), unsafeCSS(styles)];

  declare label: string | undefined;
  declare literal: boolean;
  declare current: number;
  declare buttons: boolean;
  declare noDots: boolean;
  declare noDrag: boolean;
  declare end: boolean;
  declare slideWidth: number | string | undefined;
  declare gap: number | undefined;
  declare bleed: "none" | "end" | "both";
  declare loop: boolean;
  declare autoplay: string | null;
  declare free: boolean;
  declare count: number;
  declare announcement: string;
  declare paused: boolean;
  private drive: CarouselDrive | null = null;
  private undrag: (() => void) | undefined;

  private readonly own = new Map<Element, Set<string>>();
  private pending: number | undefined;
  private settle: ReturnType<typeof setTimeout> | undefined;
  private frame = 0;
  private moving = false;
  private readonly relabel = () => { this.labelSlides(); this.requestUpdate(); };

  constructor() {
    super();
    this.literal = false;
    this.current = 0;
    this.buttons = false;
    this.noDots = false;
    this.noDrag = false;
    this.end = false;
    this.bleed = "none";
    this.loop = false;
    this.autoplay = null;
    this.free = false;
    this.count = 0;
    this.announcement = "";
    this.paused = false;
  }

  get slides(): HTMLElement[] {
    return [...this.children].filter((child): child is HTMLElement => isHTMLElement(child) && !child.hasAttribute("slot") && !child.hasAttribute(COPY));
  }

  private get every(): number {
    return autoplayInterval(this.autoplay);
  }

  private get strip(): boolean {
    return this.slideWidth === "auto";
  }

  private get track(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".ds-carousel__track");
  }

  private get index(): number {
    const current = Number.isFinite(this.current) ? Math.floor(this.current) : 0;
    return Math.max(0, Math.min(this.count - 1, current));
  }

  private startDrag() {
    const track = this.track;
    if (this.noDrag) { this.undrag?.(); this.undrag = undefined; return; }
    if (track && !this.undrag) this.undrag = dragTrack(track, () => { if (!this.loop) this.move(nearestSlide(track, this.slides, this.index)); });
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.startDrag();
    window.addEventListener("language-changed", this.relabel);
    window.addEventListener("translations-loaded", this.relabel);
  }

  disconnectedCallback() {
    window.removeEventListener("language-changed", this.relabel);
    window.removeEventListener("translations-loaded", this.relabel);
    cancelAnimationFrame(this.frame);
    clearTimeout(this.settle);
    this.drive?.stop();
    this.drive = null;
    this.undrag?.();
    this.undrag = undefined;
    super.disconnectedCallback();
  }

  private words(value: string | undefined, fallback: string, params?: Record<string, number>): string {
    const text = value && this.literal ? value : getText(value || fallback, params) || value || fallback;
    return params ? text.replace(/\{\{?(\w+)\}?\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole)) : text;
  }

  private write(element: Element, name: string, value: string) {
    const mine = this.own.get(element) ?? new Set<string>();
    if (element.hasAttribute(name) && !mine.has(name)) return;
    mine.add(name);
    this.own.set(element, mine);
    if (element.getAttribute(name) !== value) element.setAttribute(name, value);
  }

  private labelSlides() {
    const slides = this.slides;
    const labelled = (slide: Element) => slide.hasAttribute("aria-labelledby");
    slides.forEach((slide, index) => {
      this.write(slide, "role", "group");
      this.write(slide, "aria-roledescription", this.words(undefined, "Slide"));
      if (!labelled(slide)) this.write(slide, "aria-label", this.words(undefined, "{index} of {count}", { index: index + 1, count: slides.length }));
    });
    this.count = slides.length;
  }

  protected willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (!this.hasUpdated) this.labelSlides();
    this.write(this, "role", "region");
    this.write(this, "aria-roledescription", this.words(undefined, "Carousel"));
    if (!this.hasAttribute("aria-labelledby")) this.write(this, "aria-label", this.words(this.label, "Carousel"));
    const width = squares(typeof this.slideWidth === "string" && this.slideWidth !== "auto" ? Number(this.slideWidth) : typeof this.slideWidth === "number" ? this.slideWidth : undefined, 1);
    const gap = squares(this.gap, 0);
    if (this.strip) this.style.setProperty("--ds-carousel-slide", "max-content");
    else if (width) this.style.setProperty("--ds-carousel-slide", `calc(var(--ds-unit) * ${width})`);
    else this.style.removeProperty("--ds-carousel-slide");
    if (gap !== undefined) this.style.setProperty("--ds-carousel-gap", `calc(var(--ds-unit) * ${gap})`);
    else this.style.removeProperty("--ds-carousel-gap");
  }

  protected firstUpdated() {
    const track = this.track;
    this.startDrag();
    const bleed = bleedOf(this.bleed);
    if (track && (bleed !== "none" || this.loop || this.every > 0)) {
      this.drive = driveCarousel(this, track, this, { bleed, loop: this.loop, autoplay: this.every });
    }
  }

  protected updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has("noDrag")) this.startDrag();
    if (this.loop) return;
    if (changed.has("current")) {
      if (this.moving) { this.moving = false; return; }
      this.travel(this.index, changed.get("current") !== undefined);
    } else if (changed.has("count") && !changed.get("count") && this.index > 0) {
      this.travel(this.index, false);
    }
  }

  goTo(index: number): void {
    this.current = index;
  }

  next(): void {
    if (this.drive) this.drive.step(1);
    else this.move(this.index + 1);
  }

  previous(): void {
    if (this.drive) this.drive.step(-1);
    else this.move(this.index - 1);
  }

  private togglePause() {
    this.paused = !this.paused;
    this.drive?.pause(this.paused);
  }

  private travel(index: number, smooth: boolean) {
    const track = this.track;
    const slide = this.slides[index];
    if (!track || !slide || !scrollToSlide(track, slide, smooth)) return;
    this.pending = index;
    clearTimeout(this.settle);
    this.settle = setTimeout(() => { this.pending = undefined; }, 600);
  }

  private show(index: number) {
    const target = Math.max(0, Math.min(this.count - 1, index));
    const previous = this.index;
    if (target === previous || this.count === 0) return;
    this.moving = true;
    this.current = target;
    this.announcement = this.words(undefined, "{index} of {count}", { index: target + 1, count: this.count });
    this.dispatchEvent(new CustomEvent<CarouselChangeDetail>("change", { bubbles: true, composed: true, detail: { index: target, previous } }));
  }

  private move(index: number) {
    const target = Math.max(0, Math.min(this.count - 1, index));
    this.travel(target, true);
    this.show(target);
  }

  private readonly scrolled = () => {
    cancelAnimationFrame(this.frame);
    if (this.loop) return;
    this.frame = requestAnimationFrame(() => {
      if (this.pending !== undefined) {
        clearTimeout(this.settle);
        this.settle = setTimeout(() => { this.pending = undefined; }, 150);
        return;
      }
      const track = this.track;
      if (track) this.show(nearestSlide(track, this.slides, this.index));
    });
  };

  private readonly ended = () => { this.pending = undefined; };

  private readonly picked = (event: CustomEvent<ProgressSelectDetail>) => {
    event.stopPropagation();
    event.preventDefault();
    this.move(event.detail.index);
  };

  render() {
    const index = this.index;
    const driven = this.drive !== null || bleedOf(this.bleed) !== "none" || this.loop || this.every > 0;
    const button = (which: "previous" | "next") => html`<button
      class="ds-button ds-button--icon ds-carousel__${which}"
      part=${which}
      type="button"
      aria-label=${this.words(undefined, which === "previous" ? "Previous slide" : "Next slide")}
      ?disabled=${!driven && (which === "previous" ? index <= 0 : index >= this.count - 1)}
      @click=${() => (which === "previous" ? this.previous() : this.next())}
    ><ds-icon type=${which === "previous" ? "left" : "right"} aria-hidden="true"></ds-icon></button>`;
    const moving = this.every > 0 && !prefersReducedMotion();
    const dots = !this.noDots && !this.loop;
    const controls = this.buttons || dots || moving;
    const bleed = bleedOf(this.bleed);
    return html`<div class="ds-carousel" part="carousel" data-slides=${this.strip ? "auto" : nothing} data-bleed=${bleed === "none" ? nothing : bleed} data-snap=${this.free ? "none" : nothing}>
      <div class="ds-carousel__track" part="track" @scroll=${this.scrolled} @scrollend=${this.ended}>
        <slot @slotchange=${() => this.labelSlides()}></slot>
      </div>
      ${controls && this.count > 1
        ? html`<div class="ds-carousel__controls" part="controls">
            ${moving
              ? html`<button
                  class="ds-button ds-button--icon ds-carousel__pause"
                  part="pause"
                  type="button"
                  aria-pressed=${String(this.paused)}
                  aria-label=${this.words(undefined, this.paused ? "Play" : "Pause")}
                  @click=${this.togglePause}
                ><ds-icon type=${this.paused ? "play-alt" : "pause"} aria-hidden="true"></ds-icon></button>`
              : nothing}
            ${this.buttons ? button("previous") : nothing}
            ${dots ? html`<ds-progress part="dots" .dots=${this.count} .active=${index} ?end=${this.end} @select=${this.picked}></ds-progress>` : nothing}
            ${this.buttons ? button("next") : nothing}
          </div>`
        : nothing}
      <span class="ds-carousel__status" part="status" aria-live="polite" aria-atomic="true">${this.announcement}</span>
    </div>`;
  }
}

define("ds-carousel", Carousel);

declare global {
  interface HTMLElementTagNameMap {
    "ds-carousel": Carousel;
  }
}
