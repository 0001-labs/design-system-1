export const TOUCH_TOOLTIP_DURATION = 2000;
export const LONG_PRESS_DELAY = 500;
const PRESS_SLOP = 10;

export type ShowTooltipOptions = {
  duration?: number;
};

type Controller = {
  show(target: HTMLElement, options?: ShowTooltipOptions): void;
  hide(): void;
};

const KEY = Symbol.for("ds-one:tooltips");
type TooltipWindow = Window & { [KEY]?: Controller };

function controller(): Controller | undefined {
  return typeof window === "undefined" ? undefined : (window as TooltipWindow)[KEY];
}

export function showTooltip(target: HTMLElement, options?: ShowTooltipOptions): void {
  initTooltips();
  controller()?.show(target, options);
}

export function hideTooltip(): void {
  controller()?.hide();
}

export function initTooltips(): void {
  if (typeof document === "undefined" || !document.body) return;
  const root = document.documentElement;
  if (root.hasAttribute("data-ds-tooltips-ready")) return;
  root.setAttribute("data-ds-tooltips-ready", "");

  const bubble = document.createElement("div");
  bubble.setAttribute("data-ds-tooltip", "");
  bubble.setAttribute("role", "tooltip");
  bubble.id = "ds-tooltip";
  const style = document.createElement("style");
  style.textContent = `
    [data-ds-tooltip] {
      position: fixed; z-index: 2147483646; top: 0; left: 0; pointer-events: none; visibility: hidden;
      max-width: 320px; min-height: 16px; box-sizing: border-box; padding: 0 2.5px; border-radius: 4px;
      background: var(--ds-tooltip-background, light-dark(#000, #fff));
      color: var(--ds-tooltip-color, light-dark(#fff, #000));
      font-family: var(--typeface-regular, var(--font-regular, system-ui)), sans-serif;
      font-size: 14px; font-weight: 400; line-height: 16px; letter-spacing: 0; white-space: nowrap;
    }
    [data-ds-tooltip].is-wide { white-space: normal; }
    [data-ds-tooltip].is-visible { visibility: visible; }
    @media print { [data-ds-tooltip] { display: none; } }
  `;
  document.head.appendChild(style);
  document.body.appendChild(bubble);

  let current: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const place = (target: HTMLElement) => {
    const box = target.getBoundingClientRect();
    const width = bubble.offsetWidth;
    const height = bubble.offsetHeight;
    const left = Math.min(Math.max(4, box.left + box.width / 2 - width / 2), window.innerWidth - width - 4);
    const over = target.closest<HTMLElement>("[data-tooltip-over]")?.getBoundingClientRect() ?? box;
    const top = over.top - height - 2 >= 4 ? over.top - height - 2 : over.bottom + 2;
    bubble.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  };
  const draw = (target: HTMLElement): boolean => {
    const text = target.dataset.tooltip;
    if (!text) return false;
    bubble.textContent = text;
    const colour = target.dataset.tooltipColour;
    if (colour) {
      bubble.style.setProperty("--ds-tooltip-background", colour);
      bubble.style.setProperty("--ds-tooltip-color", "#1e1e1e");
    } else {
      bubble.style.removeProperty("--ds-tooltip-background");
      bubble.style.removeProperty("--ds-tooltip-color");
    }
    bubble.classList.remove("is-wide");
    if (bubble.scrollWidth > 320) bubble.classList.add("is-wide");
    place(target);
    return true;
  };
  const watcher = typeof MutationObserver === "function"
    ? new MutationObserver(() => { if (current && (!current.isConnected || !draw(current))) hide(); })
    : null;
  const show = (target: HTMLElement, options: ShowTooltipOptions = {}) => {
    clearTimeout(timer);
    timer = undefined;
    if (current && current !== target) hide();
    if (!draw(target)) return;
    current = target;
    if (target.getRootNode() === document) target.setAttribute("aria-describedby", bubble.id);
    watcher?.disconnect();
    watcher?.observe(target, { attributes: true, attributeFilter: ["data-tooltip", "data-tooltip-colour"] });
    bubble.classList.add("is-visible");
    if (options.duration !== undefined && options.duration >= 0) timer = setTimeout(hide, options.duration);
  };
  function hide() {
    clearTimeout(timer);
    timer = undefined;
    watcher?.disconnect();
    current?.removeAttribute("aria-describedby");
    current = null;
    bubble.classList.remove("is-visible");
  }
  (window as TooltipWindow)[KEY] = { show, hide };

  const find = (event: Event): HTMLElement | null => {
    for (const node of event.composedPath()) {
      if (node === document || node === window) break;
      if ((node as Element).hasAttribute?.("data-tooltip")) return node as HTMLElement;
    }
    return (event.target as Element | null)?.closest?.<HTMLElement>("[data-tooltip]") ?? null;
  };
  const keyboardFocus = (event: Event): boolean => {
    const focused = event.composedPath()[0] as Element | undefined;
    try {
      return Boolean(focused?.matches?.(":focus-visible"));
    } catch {
      return false;
    }
  };
  const touch = (event: Event) => (event as PointerEvent).pointerType === "touch";

  document.addEventListener("pointerover", (event) => {
    if (touch(event)) return;
    const target = find(event);
    if (target !== current) target ? show(target) : hide();
  }, { passive: true });
  document.addEventListener("pointerleave", (event) => { if (!touch(event)) hide(); }, { passive: true });
  document.addEventListener("focusin", (event) => {
    const target = find(event);
    if (target && keyboardFocus(event)) show(target);
  });
  document.addEventListener("focusout", hide);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
  window.addEventListener("scroll", hide, { passive: true, capture: true });

  let press: { target: HTMLElement; id: number; x: number; y: number; timer: ReturnType<typeof setTimeout> } | null = null;
  let swallowClick = false;
  const release = () => {
    if (press) clearTimeout(press.timer);
    press = null;
  };
  document.addEventListener("pointerdown", (event) => {
    swallowClick = false;
    if (!touch(event)) return;
    release();
    hide();
    const target = find(event);
    if (!target?.dataset.tooltip) return;
    const pointer = event as PointerEvent;
    press = {
      target,
      id: pointer.pointerId,
      x: pointer.clientX,
      y: pointer.clientY,
      timer: setTimeout(() => {
        if (!press) return;
        swallowClick = true;
        show(press.target, { duration: TOUCH_TOOLTIP_DURATION });
        press = null;
      }, LONG_PRESS_DELAY),
    };
  }, { passive: true, capture: true });
  document.addEventListener("pointermove", (event) => {
    const pointer = event as PointerEvent;
    if (press && pointer.pointerId === press.id && Math.hypot(pointer.clientX - press.x, pointer.clientY - press.y) > PRESS_SLOP) release();
  }, { passive: true, capture: true });
  document.addEventListener("pointerup", (event) => {
    if (!press || (event as PointerEvent).pointerId !== press.id) return;
    const { target } = press;
    release();
    if (target.hasAttribute("data-tooltip-press")) show(target, { duration: TOUCH_TOOLTIP_DURATION });
  }, { passive: true, capture: true });
  document.addEventListener("pointercancel", release, { passive: true, capture: true });
  document.addEventListener("click", (event) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, { capture: true });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initTooltips, { once: true });
  else initTooltips();
}
