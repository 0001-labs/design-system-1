import { feedbackWord } from "./feedback-words";
import { toastIcons, toastStyles } from "./generated/toast-assets";
import {
  SWIPE_THRESHOLD,
  SWIPE_VELOCITY,
  TIME_BEFORE_UNMOUNT,
  TOAST_DURATION,
  TOAST_ICONS,
  VISIBLE_TOASTS,
  listenForToasts,
  setFallbackToaster,
} from "./toast-queue";
import type { ToastButton, ToastData, ToastId, ToastPosition, ToastSignal } from "./toast-queue";

export { toast } from "./toast-queue";
export type { ToastButton, ToastData, ToastId, ToastOptions, ToastPosition, ToastPromiseMessages, ToastType } from "./toast-queue";

export interface ToasterOptions {
  position?: ToastPosition;
  expand?: boolean;
  visibleToasts?: number;
  duration?: number;
  closeButton?: boolean;
  richColors?: boolean;
  label?: string;
  closeLabel?: string;
}

const INK = /(fill|stroke)=("|')(#1E1E1E|#2A2A2A|#000000|#000|black)\2/gi;
const SVGS: Record<string, string> = Object.fromEntries(
  Object.entries(toastIcons)
    .map(([name, svg]) => [name, svg.replace(INK, '$1="currentColor"')]),
);

interface Item { data: ToastData; mounted: boolean; removed: boolean; swipeOut: boolean; index: number; offset: number; element?: HTMLLIElement; drawn?: string }
interface Timer { remaining: number; started: number; handle?: ReturnType<typeof setTimeout> }

let settings: ToasterOptions = {};
let current: PageToaster | undefined;

export function configureToaster(options: ToasterOptions): void {
  settings = { ...settings, ...options };
  current?.render();
}

const frame = (callback: () => void) => typeof requestAnimationFrame === "function" ? requestAnimationFrame(callback) : setTimeout(callback, 16);

function element<K extends keyof HTMLElementTagNameMap>(name: K, attributes: Record<string, string> = {}, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(name: string, className: string): HTMLSpanElement | undefined {
  const svg = SVGS[name];
  if (!svg) return undefined;
  const span = element("span", { class: className, "aria-hidden": "true" });
  span.innerHTML = svg;
  return span;
}

class PageToaster {
  readonly host = element("div", { "data-ds-toaster": "" });
  private readonly section = element("section", { "aria-live": "polite", "aria-relevant": "additions text", "aria-atomic": "false" });
  private readonly list = element("ol", { tabindex: "-1", popover: "manual" });
  private raisedFor: ToastId | undefined;
  private items: Item[] = [];
  private heights = new Map<ToastId, number>();
  private timers = new Map<ToastId, Timer>();
  private hovered = false;
  private focused = false;
  private interacting = false;
  private mounting = false;
  private swipe?: { id: ToastId; start: number; time: number; amount: number };
  private resizes = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => this.measure());

  constructor() {
    const root = this.host.attachShadow({ mode: "open" });
    root.appendChild(element("style", {}, toastStyles));
    root.appendChild(this.section);
    this.section.appendChild(this.list);
    this.list.addEventListener("pointerenter", () => { this.hovered = true; this.render(); });
    this.list.addEventListener("pointerleave", () => { if (!this.interacting) { this.hovered = false; this.render(); } });
    this.list.addEventListener("focusin", () => { this.focused = true; this.render(); });
    this.list.addEventListener("focusout", event => {
      if (!(event.relatedTarget instanceof Node && root.contains(event.relatedTarget))) { this.focused = false; this.render(); }
    });
    document.addEventListener("keydown", this.hotkey);
    document.addEventListener("visibilitychange", this.syncTimers);
    window.addEventListener("language-changed", () => this.render());
    listenForToasts(this.receive, { fallback: true });
    this.attach();
    this.render();
  }

  attach() {
    if (!this.host.isConnected && document.body) document.body.appendChild(this.host);
  }

  private get live(): Item[] { return this.items.filter(item => !item.removed); }
  private get position(): ToastPosition { return settings.position ?? "bottom-right"; }
  private get expanded(): boolean { return !!settings.expand || ((this.hovered || this.focused) && this.live.length > 0); }
  private get paused(): boolean { return this.hovered || this.focused || this.interacting || document.hidden; }

  private receive = (signal: ToastSignal) => {
    if ("dismiss" in signal) {
      for (const item of this.live) if (signal.dismiss === undefined || item.data.id === signal.dismiss) this.removeToast(item.data.id);
      return;
    }
    this.attach();
    const data = signal.toast;
    const existing = this.live.find(item => item.data.id === data.id);
    if (existing) {
      existing.data = { ...existing.data, ...data };
      this.clearTimer(data.id);
    } else {
      this.items = [{ data, mounted: false, removed: false, swipeOut: false, index: 0, offset: 0 }, ...this.items.filter(item => item.data.id !== data.id)];
    }
    this.render();
  };

  private removeToast(id: ToastId, how: "dismiss" | "auto" | "swipe" = "dismiss") {
    const item = this.live.find(entry => entry.data.id === id);
    if (!item) return;
    this.clearTimer(id);
    this.heights.delete(id);
    (how === "auto" ? item.data.onAutoClose : item.data.onDismiss)?.(item.data);
    item.removed = true;
    item.swipeOut = how === "swipe";
    this.render();
    setTimeout(() => {
      this.items = this.items.filter(entry => entry !== item);
      this.render();
    }, TIME_BEFORE_UNMOUNT);
  }

  private clearTimer(id: ToastId) {
    clearTimeout(this.timers.get(id)?.handle);
    this.timers.delete(id);
  }

  private syncTimers = () => {
    const now = Date.now();
    for (const item of this.live) {
      const { id, type } = item.data;
      const duration = item.data.duration ?? settings.duration ?? TOAST_DURATION;
      if (type === "loading" || duration === Infinity) { this.clearTimer(id); continue; }
      let timer = this.timers.get(id);
      if (!timer) { timer = { remaining: duration, started: now }; this.timers.set(id, timer); }
      if (this.paused && timer.handle !== undefined) {
        clearTimeout(timer.handle);
        timer.handle = undefined;
        timer.remaining -= now - timer.started;
      } else if (!this.paused && timer.handle === undefined) {
        timer.started = now;
        timer.handle = setTimeout(() => this.removeToast(id, "auto"), Math.max(0, timer.remaining));
      }
    }
  };

  private hotkey = (event: KeyboardEvent) => {
    if (event.altKey && event.code === "KeyT" && this.live.length) {
      this.focused = true;
      this.list.focus();
      this.render();
    } else if (event.key === "Escape" && this.focused) {
      this.focused = false;
      this.render();
    }
  };

  private measure() {
    let changed = false;
    for (const item of this.live) {
      const toast = item.element;
      const body = toast?.querySelector<HTMLElement>(".body");
      if (!toast || !body) continue;
      const height = body.offsetHeight + toast.offsetHeight - toast.clientHeight;
      if (this.heights.get(item.data.id) !== height) { this.heights.set(item.data.id, height); changed = true; }
    }
    if (changed) this.layout();
  }

  private press(event: MouseEvent, id: ToastId, button: ToastButton) {
    button.onClick?.(event);
    if (button.href || !event.defaultPrevented) this.removeToast(id);
  }

  private button(id: ToastId, button: ToastButton, kind: "cancel" | "action"): HTMLElement {
    const node: HTMLElement = button.href ? element("a", { class: `button ${kind}`, href: button.href }, button.label) : element("button", { class: `button ${kind}`, type: "button" }, button.label);
    node.addEventListener("click", event => this.press(event, id, button));
    return node;
  }

  private draw(item: Item) {
    const { data } = item;
    const dismissible = data.dismissible !== false;
    const closeButton = (data.closeButton ?? settings.closeButton ?? true) && dismissible;
    const closeLabel = settings.closeLabel ?? feedbackWord("Close");
    const key = JSON.stringify([data.title, data.description, data.type, data.icon, data.action?.label, data.action?.href, data.cancel?.label, data.cancel?.href, closeButton, closeLabel]);
    const previous = item.element?.querySelector<HTMLElement>(".body");
    if (item.drawn === key && previous) return;
    item.drawn = key;
    if (previous) this.resizes?.unobserve(previous);
    const body = element("div", { class: "body", "data-id": String(data.id) });
    const symbol = data.type === "loading" ? element("span", { class: "icon", "aria-hidden": "true" }) : icon(data.icon ?? TOAST_ICONS[data.type] ?? "", "icon");
    if (data.type === "loading") symbol!.appendChild(element("span", { class: "spinner" }));
    const content = element("div", { class: "content" });
    content.appendChild(element("div", { class: "title" }, data.title));
    if (data.description) content.appendChild(element("div", { class: "description" }, data.description));
    if (symbol) body.appendChild(symbol);
    body.appendChild(content);
    if (data.cancel) body.appendChild(this.button(data.id, data.cancel, "cancel"));
    if (data.action) body.appendChild(this.button(data.id, data.action, "action"));
    if (closeButton) {
      const close = element("button", { class: "close", type: "button", "aria-label": closeLabel });
      close.innerHTML = SVGS.close!;
      close.addEventListener("click", () => this.removeToast(data.id));
      body.appendChild(close);
    }
    item.element!.replaceChildren(body);
    this.resizes?.observe(body);
  }

  private create(item: Item): HTMLLIElement {
    const toast = element("li", { class: "toast", role: "status", tabindex: "0", "aria-atomic": "true" });
    const id = item.data.id;
    toast.addEventListener("pointerdown", event => {
      const now = this.live.find(entry => entry.data.id === id);
      if (!now || now.data.dismissible === false || now.data.type === "loading") return;
      if (event.composedPath().some(node => node instanceof Element && node.matches("button, a"))) return;
      toast.setPointerCapture?.(event.pointerId);
      this.swipe = { id, start: event.clientY, time: Date.now(), amount: 0 };
      this.interacting = true;
      this.syncTimers();
    });
    toast.addEventListener("pointermove", event => {
      if (!this.swipe || this.swipe.id !== id) return;
      const toward = this.position.startsWith("top") ? -1 : 1;
      this.swipe.amount = Math.max(0, (event.clientY - this.swipe.start) * toward);
      toast.dataset.swiping = "true";
      toast.style.setProperty("--swipe", `${this.swipe.amount * toward}px`);
    });
    const release = () => {
      const swipe = this.swipe;
      if (!swipe || swipe.id !== id) return;
      this.swipe = undefined;
      this.interacting = false;
      delete toast.dataset.swiping;
      const velocity = swipe.amount / Math.max(1, Date.now() - swipe.time);
      if (swipe.amount >= SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) this.removeToast(id, "swipe");
      else toast.style.setProperty("--swipe", "0px");
      this.syncTimers();
    };
    toast.addEventListener("pointerup", release);
    toast.addEventListener("pointercancel", release);
    return toast;
  }

  private raise() {
    const front = this.live[0]?.data.id;
    if (front === this.raisedFor || typeof this.list.showPopover !== "function" || !this.list.isConnected) return;
    this.raisedFor = front;
    try {
      if (this.list.matches(":popover-open")) this.list.hidePopover();
      if (front !== undefined) this.list.showPopover();
    } catch {
    }
  }

  render() {
    this.raise();
    if (!this.live.length) { this.hovered = false; this.focused = false; }
    this.section.setAttribute("aria-label", `${settings.label ?? feedbackWord("Notifications")} alt+T`);
    this.host.toggleAttribute("rich-colors", !!settings.richColors);
    for (const item of this.items) {
      item.element ??= this.create(item);
      this.draw(item);
    }
    this.items.forEach((item, index) => {
      if (this.list.children[index] !== item.element) this.list.insertBefore(item.element!, this.list.children[index] ?? null);
    });
    for (const child of Array.from(this.list.children)) {
      if (this.items.some(item => item.element === child)) continue;
      const body = child.querySelector(".body");
      if (body) this.resizes?.unobserve(body);
      child.remove();
    }
    this.layout();
    this.measure();
    this.syncTimers();
    if (!this.mounting && this.items.some(item => !item.mounted)) {
      this.mounting = true;
      frame(() => {
        this.mounting = false;
        for (const item of this.items) item.mounted = true;
        this.layout();
      });
    }
  }

  private layout() {
    let offset = 0;
    this.live.forEach((item, index) => {
      item.index = index;
      item.offset = offset;
      offset += this.heights.get(item.data.id) ?? 0;
    });
    const live = this.live;
    const frontHeight = live.length ? this.heights.get(live[0]!.data.id) ?? 0 : 0;
    const expanded = this.expanded;
    const [y, x] = this.position.split("-") as ["top" | "bottom", "left" | "center" | "right"];
    Object.assign(this.list.dataset, { y, x, expanded: String(expanded) });
    this.list.style.setProperty("--height", `${expanded ? offset : frontHeight}px`);
    this.list.style.setProperty("--gaps", String(expanded ? Math.max(0, live.length - 1) : 0));
    const visible = settings.visibleToasts ?? VISIBLE_TOASTS;
    for (const item of this.items) {
      const toast = item.element!;
      toast.setAttribute("aria-live", item.data.important ? "assertive" : "polite");
      Object.assign(toast.dataset, {
        type: item.data.type,
        front: String(item.index === 0),
        mounted: String(item.mounted),
        removed: String(item.removed),
        swipeOut: String(item.swipeOut),
        visible: String(item.index < visible),
      });
      toast.style.setProperty("--index", String(item.index));
      toast.style.setProperty("--offset", `${item.offset}px`);
      toast.style.setProperty("--front-height", `${frontHeight}px`);
      toast.style.zIndex = String(this.items.length - item.index);
    }
  }
}

export function pageToaster(): HTMLElement | undefined {
  if (typeof document === "undefined" || !document.body) return undefined;
  current ??= new PageToaster();
  current.attach();
  return current.host;
}

setFallbackToaster(() => { pageToaster(); });

if (typeof document !== "undefined") {
  const ready = () => { if (typeof customElements === "undefined" || !customElements.get("ds-toast")) pageToaster(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
}
