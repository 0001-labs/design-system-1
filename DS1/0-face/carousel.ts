export type CarouselWord = "Carousel" | "Slide" | "Slides" | "Slide {index}" | "{index} of {count}" | "Previous slide" | "Next slide" | "Pause" | "Play";

export interface CarouselDriveOptions {
  bleed?: "none" | "end" | "both";
  loop?: boolean;
  autoplay?: number;
  onCopy?: (copy: HTMLElement) => void;
}

export interface CarouselDrive {
  step(direction: 1 | -1): void;
  pause(paused: boolean): void;
  readonly paused: boolean;
  stop(): void;
}

export const CAROUSEL_AUTOPLAY_MS = 5000;

export function autoplayInterval(value: string | number | boolean | null | undefined): number {
  if (value === null || value === undefined || value === false || value === "false") return 0;
  if (value === "" || value === true || value === "true") return CAROUSEL_AUTOPLAY_MS;
  const milliseconds = Number(value);
  return Number.isFinite(milliseconds) && milliseconds > 0 ? Math.max(1000, milliseconds) : 0;
}

export const COPY = "data-ds-carousel-copy";
const isCopy = (element: Element) => element.hasAttribute(COPY);
export const bleedOf = (value: string | undefined): CarouselDriveOptions["bleed"] => (value === "end" || value === "both" ? value : "none");
export type CarouselWords = Partial<Record<CarouselWord, string>> | ((word: CarouselWord, params: Record<string, string | number>) => string);

const TRANSLATOR = Symbol.for("design-system-1.translate");
let words: CarouselWords | null = null;

export function setCarouselWords(next: CarouselWords | null): void {
  words = next;
}

const fill = (text: string, params: Record<string, string | number>) =>
  text.replace(/\{\{?(\w+)\}?\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));

export function carouselWord(word: CarouselWord, params: Record<string, string | number> = {}): string {
  if (typeof words === "function") return words(word, params);
  const own = words?.[word];
  if (own !== undefined) return fill(own, params);
  const translate = (globalThis as unknown as Record<symbol, unknown>)[TRANSLATOR];
  return fill(typeof translate === "function" ? String(translate(word, params)) : word, params);
}

export type DotState = "past" | "current" | "next" | "future" | "end";

export function dotState(index: number, current: number, count: number, end = false): DotState {
  if (index === current) return "current";
  if (end && index === count - 1) return "end";
  if (index < current) return "past";
  return index === current + 1 ? "next" : "future";
}

export function dotForKey(key: string, index: number, count: number, rtl = false): number | undefined {
  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  const back = rtl ? "ArrowRight" : "ArrowLeft";
  if (key === forward) return Math.min(count - 1, index + 1);
  if (key === back) return Math.max(0, index - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return undefined;
}

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const isRtl = (element: Element) => getComputedStyle(element).direction === "rtl";

export function scrollToSlide(track: HTMLElement, slide: HTMLElement, smooth = true): boolean {
  const rtl = isRtl(track);
  const box = track.getBoundingClientRect();
  const rect = slide.getBoundingClientRect();
  const reach = Math.max(0, track.scrollWidth - track.clientWidth);
  const wanted = track.scrollLeft + (rtl ? rect.right - box.right : rect.left - box.left);
  const left = rtl ? Math.max(-reach, Math.min(0, wanted)) : Math.max(0, Math.min(reach, wanted));
  if (Math.abs(left - track.scrollLeft) < 1) return false;
  track.scrollTo({ left, behavior: smooth && !prefersReducedMotion() ? "smooth" : "instant" });
  return true;
}

export function nearestSlide(track: HTMLElement, slides: readonly HTMLElement[], current = 0): number {
  if (!slides.length) return 0;
  const rtl = isRtl(track);
  const box = track.getBoundingClientRect();
  const start = (rect: DOMRect) => (rtl ? box.right - rect.right : rect.left - box.left);
  const reach = track.scrollWidth - track.clientWidth;
  if (reach > 0 && Math.abs(track.scrollLeft) >= reach - 1) {
    const rect = slides[current]?.getBoundingClientRect();
    const inView = rect && start(rect) >= -1 && start(rect) + rect.width <= box.width + 1;
    return inView ? current : slides.length - 1;
  }
  let nearest = 0;
  let distance = Infinity;
  slides.forEach((slide, index) => {
    const away = Math.abs(start(slide.getBoundingClientRect()));
    if (away < distance) { distance = away; nearest = index; }
  });
  return nearest;
}


export function dragTrack(track: HTMLElement, settle: () => void): () => void {
  let held: { id: number; x: number; left: number; mouse: boolean } | null = null;
  let moved = false;
  let quietUntil = 0;
  const down = (event: PointerEvent) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    held = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, mouse: event.pointerType === "mouse" };
    moved = false;
  };
  const move = (event: PointerEvent) => {
    if (!held || event.pointerId !== held.id) return;
    const dx = event.clientX - held.x;
    if (!moved && Math.abs(dx) < 6) return;
    if (!moved && held.mouse) {
      try { track.setPointerCapture(event.pointerId); } catch {}
      track.setAttribute("data-dragging", "");
    }
    moved = true;
    if (held.mouse) track.scrollLeft = held.left - dx;
  };
  const up = (event: PointerEvent) => {
    if (!held || event.pointerId !== held.id) return;
    const mouse = held.mouse;
    held = null;
    if (!moved) return;
    quietUntil = performance.now() + 400;
    if (mouse) {
      track.removeAttribute("data-dragging");
      settle();
    }
  };
  const scrolled = () => { if (held) moved = true; };
  const click = (event: MouseEvent) => {
    if (performance.now() > quietUntil) return;
    event.preventDefault();
    event.stopPropagation();
  };
  const dragstart = (event: DragEvent) => event.preventDefault();
  track.addEventListener("pointerdown", down);
  track.addEventListener("pointermove", move);
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  track.addEventListener("scroll", scrolled, { passive: true });
  track.addEventListener("click", click, true);
  track.addEventListener("dragstart", dragstart);
  return () => {
    track.removeEventListener("pointerdown", down);
    track.removeEventListener("pointermove", move);
    track.removeEventListener("pointerup", up);
    track.removeEventListener("pointercancel", up);
    track.removeEventListener("scroll", scrolled);
    track.removeEventListener("click", click, true);
    track.removeEventListener("dragstart", dragstart);
    track.removeAttribute("data-dragging");
  };
}

function startOf(track: HTMLElement, slide: HTMLElement): number {
  const box = track.getBoundingClientRect();
  const rect = slide.getBoundingClientRect();
  return isRtl(track) ? track.scrollLeft + rect.right - box.right : track.scrollLeft + rect.left - box.left;
}

export function bleedRoom(element: HTMLElement): { before: number; after: number } {
  const width = document.documentElement.clientWidth || window.innerWidth;
  const rect = element.getBoundingClientRect();
  const left = Math.max(0, rect.left);
  const right = Math.max(0, width - rect.right);
  return isRtl(element) ? { before: right, after: left } : { before: left, after: right };
}

export function driveCarousel(block: HTMLElement, track: HTMLElement, holder: HTMLElement, options: CarouselDriveOptions = {}): CarouselDrive {
  const stops: (() => void)[] = [];
  const slides = () => [...holder.children].filter((child): child is HTMLElement => child instanceof HTMLElement && !child.hasAttribute("slot"));
  const originals = () => slides().filter((slide) => !isCopy(slide));

  const bleed = options.bleed ?? "none";
  if (bleed !== "none") {
    const measure = () => {
      const { before, after } = bleedRoom(block);
      block.style.setProperty("--ds-carousel-before", `${before}px`);
      block.style.setProperty("--ds-carousel-after", `${after}px`);
    };
    measure();
    const sized = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    sized?.observe(document.documentElement);
    sized?.observe(block);
    window.addEventListener("resize", measure);
    stops.push(() => { sized?.disconnect(); window.removeEventListener("resize", measure); });
  }

  const count = originals().length;
  const looping = !!options.loop && count > 1;
  if (looping) {
    const copies = () => originals().map((slide) => {
      const copy = slide.cloneNode(true) as HTMLElement;
      copy.setAttribute(COPY, "");
      copy.setAttribute("aria-hidden", "true");
      copy.inert = true;
      copy.removeAttribute("id");
      copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      options.onCopy?.(copy);
      return copy;
    });
    const first = originals()[0];
    const after = copies();
    first.before(...copies());
    holder.append(...after);
    stops.push(() => slides().filter(isCopy).forEach((copy) => copy.remove()));
  }
  const span = () => {
    const all = slides();
    return looping && all.length > count ? Math.abs(startOf(track, all[count]) - startOf(track, all[0])) : 0;
  };
  const direction = () => (isRtl(track) ? -1 : 1);
  const within = () => {
    const length = span();
    if (!length) return;
    const at = Math.abs(track.scrollLeft);
    if (at < length * 0.5) track.scrollLeft += length * direction();
    else if (at >= length * 1.5) track.scrollLeft -= length * direction();
  };
  if (looping) {
    const place = () => {
      if (!track.clientWidth) return false;
      track.scrollLeft = span() * direction();
      return true;
    };
    if (!place()) {
      const sized = new ResizeObserver(() => { if (place()) sized.disconnect(); });
      sized.observe(track);
      stops.push(() => sized.disconnect());
    }
    track.addEventListener("scrollend", within);
    stops.push(() => track.removeEventListener("scrollend", within));
  }

  const atStart = (): number => {
    const all = slides();
    const at = Math.abs(track.scrollLeft);
    let nearest = 0;
    let distance = Infinity;
    all.forEach((slide, index) => {
      const away = Math.abs(Math.abs(startOf(track, slide)) - at);
      if (away < distance) { distance = away; nearest = index; }
    });
    return nearest;
  };

  const step = (towards: 1 | -1) => {
    if (looping) within();
    const all = slides();
    const target = all[atStart() + towards];
    if (target) scrollToSlide(track, target, true);
    else if (!looping && towards === 1 && options.autoplay) scrollToSlide(track, all[0], true);
  };

  let paused = false;
  const every = options.autoplay ?? 0;
  if (every > 0 && !prefersReducedMotion()) {
    let held = false;
    let seen = typeof IntersectionObserver !== "function";
    const hold = () => { held = true; };
    const release = () => { held = false; };
    const later = () => setTimeout(release, every);
    const listeners: [string, EventListener, AddEventListenerOptions?][] = [
      ["pointerenter", hold], ["pointerleave", release],
      ["touchstart", hold, { passive: true }], ["touchend", later, { passive: true }],
      ["focusin", hold], ["focusout", release],
    ];
    for (const [name, listener, options] of listeners) block.addEventListener(name, listener, options);
    const watch = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => { seen = !!entry?.isIntersecting; }, { threshold: 0.3 })
      : null;
    watch?.observe(track);
    const timer = setInterval(() => {
      if (paused || held || !seen || document.hidden) return;
      step(1);
    }, every);
    stops.push(() => {
      clearInterval(timer);
      watch?.disconnect();
      for (const [name, listener] of listeners) block.removeEventListener(name, listener);
    });
  }

  return {
    step,
    pause(next: boolean) { paused = next; },
    get paused() { return paused; },
    stop() { stops.splice(0).forEach((stop) => stop()); },
  };
}

function iconButton(className: string, icon: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `ds-button ds-button--icon ${className}`;
  const mark = document.createElement("span");
  mark.className = "ds-icon";
  mark.setAttribute("aria-hidden", "true");
  mark.dataset.icon = icon;
  button.append(mark);
  return button;
}

function drawIcon(button: HTMLButtonElement, icon: string, base: string) {
  const mark = button.querySelector<HTMLElement>(".ds-icon");
  if (!mark) return;
  mark.dataset.icon = icon;
  if (base) mark.style.setProperty("--ds-icon", `url("${base}${icon}.svg")`);
}

export interface DotsOptions {
  count: number;
  current?: number;
  end?: boolean;
  onSelect?: (index: number) => void;
}

export interface DotsHandle {
  set(count: number, current: number): void;
  stop(): void;
}

const written = new WeakMap<Element, Set<string>>();
function own(element: Element, name: string, value: string): void {
  const mine = written.get(element) ?? new Set<string>();
  if (element.hasAttribute(name) && !mine.has(name)) return;
  mine.add(name);
  written.set(element, mine);
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}
const named = (element: Element) => element.hasAttribute("aria-labelledby") || (element.hasAttribute("aria-label") && !written.get(element)?.has("aria-label"));
function onLanguage(relabel: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  for (const name of ["language-changed", "translations-loaded"]) window.addEventListener(name, relabel);
  return () => { for (const name of ["language-changed", "translations-loaded"]) window.removeEventListener(name, relabel); };
}

export function startDots(element: HTMLElement, options: DotsOptions): DotsHandle {
  let count = Math.max(0, Math.floor(options.count));
  let current = options.current ?? 0;
  const draw = () => {
    own(element, "role", "group");
    if (!named(element)) own(element, "aria-label", carouselWord("Slides"));
    const dots = [...element.querySelectorAll<HTMLButtonElement>(":scope > .ds-progress__dot")];
    for (const extra of dots.splice(count)) extra.remove();
    while (dots.length < count) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "ds-progress__dot";
      element.append(dot);
      dots.push(dot);
    }
    dots.forEach((dot, index) => {
      const state = dotState(index, current, count, options.end);
      dot.dataset.state = state;
      if (!named(dot)) own(dot, "aria-label", carouselWord("Slide {index}", { index: index + 1 }));
      if (state === "current") dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current");
      dot.tabIndex = state === "current" ? 0 : -1;
    });
  };
  const dotList = () => [...element.querySelectorAll<HTMLButtonElement>(":scope > .ds-progress__dot")];
  const pick = (index: number, focus: boolean) => {
    options.onSelect?.(index);
    if (focus) dotList()[index]?.focus();
  };
  const click = (event: MouseEvent) => {
    const index = dotList().indexOf((event.target as Element).closest?.(".ds-progress__dot") as HTMLButtonElement);
    if (index >= 0) pick(index, false);
  };
  const keydown = (event: KeyboardEvent) => {
    const dots = dotList();
    const from = dots.indexOf(event.target as HTMLButtonElement);
    if (from < 0) return;
    const to = dotForKey(event.key, from, dots.length, isRtl(element));
    if (to === undefined) return;
    event.preventDefault();
    pick(to, true);
  };
  element.addEventListener("click", click);
  element.addEventListener("keydown", keydown);
  const quiet = onLanguage(draw);
  draw();
  return {
    set(nextCount, nextCurrent) { count = Math.max(0, Math.floor(nextCount)); current = nextCurrent; draw(); },
    stop() { element.removeEventListener("click", click); element.removeEventListener("keydown", keydown); quiet(); },
  };
}

export interface CarouselHandle {
  readonly current: number;
  goTo(index: number): void;
  stop(): void;
}

export interface CarouselChangeDetail { index: number; previous: number }

const running = new WeakMap<HTMLElement, CarouselHandle>();

export interface StartCarouselOptions {
  icons?: string;
}

export function startCarousel(element: HTMLElement, options: StartCarouselOptions = {}): CarouselHandle {
  const existing = running.get(element);
  if (existing) return existing;
  const track = element.querySelector<HTMLElement>(".ds-carousel__track");
  if (!track) throw new Error("A .ds-carousel needs a .ds-carousel__track");
  const bleed = bleedOf(element.dataset.bleed);
  const loop = element.dataset.loop !== undefined && element.dataset.loop !== "false";
  const every = autoplayInterval(element.dataset.autoplay ?? null);
  const drive = bleed !== "none" || loop || every > 0 ? driveCarousel(element, track, track, { bleed, loop, autoplay: every }) : undefined;
  const previousButton = element.querySelector<HTMLButtonElement>(".ds-carousel__previous");
  const nextButton = element.querySelector<HTMLButtonElement>(".ds-carousel__next");
  let status = element.querySelector<HTMLElement>(".ds-carousel__status");
  if (!status) {
    status = document.createElement("span");
    status.className = "ds-carousel__status";
    element.append(status);
  }
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");

  const slides = () => [...track.children].filter((child): child is HTMLElement => child instanceof HTMLElement && !isCopy(child));
  let current = 0;
  let pending: number | undefined;
  let settle: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;

  const label = () => {
    own(element, "role", "region");
    own(element, "aria-roledescription", carouselWord("Carousel"));
    if (!named(element)) own(element, "aria-label", carouselWord("Carousel"));
    const all = slides();
    all.forEach((slide, index) => {
      own(slide, "role", "group");
      own(slide, "aria-roledescription", carouselWord("Slide"));
      if (!named(slide)) own(slide, "aria-label", carouselWord("{index} of {count}", { index: index + 1, count: all.length }));
    });
    if (previousButton && !named(previousButton)) own(previousButton, "aria-label", carouselWord("Previous slide"));
    if (nextButton && !named(nextButton)) own(nextButton, "aria-label", carouselWord("Next slide"));
  };
  const dotsElement = loop ? null : element.querySelector<HTMLElement>(".ds-progress--dots");
  const dots = dotsElement ? startDots(dotsElement, { count: slides().length, end: dotsElement.hasAttribute("data-end"), onSelect: index => go(index, true) }) : undefined;

  const show = (index: number, announce: boolean) => {
    const count = slides().length;
    const previous = current;
    current = Math.max(0, Math.min(count - 1, index));
    dots?.set(count, current);
    if (previousButton) previousButton.disabled = !drive && current <= 0;
    if (nextButton) nextButton.disabled = !drive && current >= count - 1;
    if (announce && current !== previous) {
      status!.textContent = carouselWord("{index} of {count}", { index: current + 1, count });
      element.dispatchEvent(new CustomEvent<CarouselChangeDetail>("change", { bubbles: true, detail: { index: current, previous } }));
    }
  };
  const go = (index: number, announce: boolean) => {
    const all = slides();
    const target = Math.max(0, Math.min(all.length - 1, index));
    if (!all[target]) return;
    if (scrollToSlide(track, all[target]!)) {
      pending = target;
      clearTimeout(settle);
      settle = setTimeout(() => { pending = undefined; }, 600);
    }
    show(target, announce);
  };
  const scrolled = () => {
    cancelAnimationFrame(frame);
    if (loop) return;
    frame = requestAnimationFrame(() => {
      if (pending !== undefined) {
        clearTimeout(settle);
        settle = setTimeout(() => { pending = undefined; }, 150);
        return;
      }
      show(nearestSlide(track, slides(), current), true);
    });
  };
  const ended = () => { pending = undefined; };
  const previous = () => (drive ? drive.step(-1) : go(current - 1, true));
  const next = () => (drive ? drive.step(1) : go(current + 1, true));
  let pause: HTMLButtonElement | null = null;
  const drawPause = () => {
    if (!pause || !drive) return;
    pause.setAttribute("aria-pressed", String(drive.paused));
    pause.setAttribute("aria-label", carouselWord(drive.paused ? "Play" : "Pause"));
    drawIcon(pause, drive.paused ? "play-alt" : "pause", options.icons ?? "");
  };
  if (drive && every > 0 && !prefersReducedMotion()) {
    let controls = element.querySelector<HTMLElement>(":scope > .ds-carousel__controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "ds-carousel__controls";
      track.after(controls);
    }
    pause = controls.querySelector<HTMLButtonElement>(".ds-carousel__pause") ?? iconButton("ds-carousel__pause", "pause");
    if (!pause.isConnected) controls.prepend(pause);
    pause.addEventListener("click", () => { drive.pause(!drive.paused); drawPause(); });
    drawPause();
  }
  const observer = typeof MutationObserver === "function" ? new MutationObserver(() => { label(); show(current, false); }) : undefined;

  track.addEventListener("scroll", scrolled, { passive: true });
  track.addEventListener("scrollend", ended);
  const undrag = dragTrack(track, () => (loop ? undefined : go(nearestSlide(track, slides(), current), true)));
  previousButton?.addEventListener("click", previous);
  nextButton?.addEventListener("click", next);
  observer?.observe(track, { childList: true });
  const quiet = onLanguage(() => { label(); drawPause(); });
  label();
  show(0, false);

  const handle: CarouselHandle = {
    get current() { return current; },
    goTo: index => go(index, false),
    stop() {
      track.removeEventListener("scroll", scrolled);
      track.removeEventListener("scrollend", ended);
      undrag();
      previousButton?.removeEventListener("click", previous);
      nextButton?.removeEventListener("click", next);
      observer?.disconnect();
      quiet();
      dots?.stop();
      drive?.stop();
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      running.delete(element);
    },
  };
  running.set(element, handle);
  return handle;
}

export function startCarousels(root: ParentNode = document, options: StartCarouselOptions = {}): () => void {
  const handles = [...root.querySelectorAll<HTMLElement>(".ds-carousel")].map((element) => startCarousel(element, options));
  return () => handles.forEach(handle => handle.stop());
}
