export interface DrawerOptions {
  toggle: HTMLElement;
  content: readonly Element[] | (() => readonly Element[]);
  panel?: HTMLDialogElement;
  container?: Element | ShadowRoot;
  label?: string;
  closeLabel?: string;
  closeOnLink?: boolean;
  onToggle?: (open: boolean) => void;
}

export interface Drawer {
  readonly panel: HTMLDialogElement;
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

const FOCUSABLE = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, summary, [contenteditable=""], [contenteditable="true"], [tabindex]';

const openDrawers = new WeakMap<Document, object[]>();

const scrollHolders = new WeakMap<Document, { owners: Set<object>; overflow: string; overscroll: string; x: number; y: number }>();

function holdScroll(document: Document, owner: object): void {
  let held = scrollHolders.get(document);
  if (!held) {
    const root = document.documentElement.style;
    held = { owners: new Set(), overflow: root.overflow, overscroll: root.overscrollBehavior, x: document.defaultView?.scrollX ?? 0, y: document.defaultView?.scrollY ?? 0 };
    scrollHolders.set(document, held);
    root.overflow = "hidden";
    root.overscrollBehavior = "none";
  }
  held.owners.add(owner);
}

function releaseScroll(document: Document, owner: object): void {
  const held = scrollHolders.get(document);
  if (!held || !held.owners.delete(owner) || held.owners.size) return;
  const root = document.documentElement.style;
  root.overflow = held.overflow;
  root.overscrollBehavior = held.overscroll;
  scrollHolders.delete(document);
  const view = document.defaultView;
  if (view && (view.scrollX !== held.x || view.scrollY !== held.y)) view.scrollTo(held.x, held.y);
}

export function deepActiveElement(document: Document): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

function shown(element: Element): boolean {
  if (element.closest("[hidden], [inert]")) return false;
  const check = (element as Element & { checkVisibility?: (options?: object) => boolean }).checkVisibility;
  return typeof check === "function" ? check.call(element, { visibilityProperty: true }) : true;
}

export function tabbables(root: Element): HTMLElement[] {
  const found: HTMLElement[] = [];
  const visit = (node: Element) => {
    if (node instanceof HTMLElement && node.matches(FOCUSABLE) && node.tabIndex >= 0 && !(node as HTMLButtonElement).disabled && shown(node)) found.push(node);
    if (node.shadowRoot) for (const child of node.shadowRoot.children) visit(child);
    const children = node instanceof HTMLSlotElement ? node.assignedElements({ flatten: true }) : [...node.children];
    for (const child of children) visit(child);
  };
  for (const child of root.children) visit(child);
  return found;
}

export function attachOverlay(options: DrawerOptions): Drawer {
  const { toggle } = options;
  const document = toggle.ownerDocument;
  const made = !options.panel;
  const panel = options.panel ?? document.createElement("dialog");
  let placeholders: [Element, Comment][] = [];
  let open = false;
  let closeButton: HTMLElement | null = options.panel?.querySelector<HTMLElement>(".ds-overlay__close") ?? null;

  if (made) {
    panel.className = "ds-overlay ds-overlay--screen";
    const bar = document.createElement("div");
    bar.className = "ds-overlay__bar";
    closeButton = toggle.cloneNode(true) as HTMLElement;
    closeButton.removeAttribute("id");
    closeButton.removeAttribute("aria-controls");
    closeButton.removeAttribute("aria-expanded");
    closeButton.removeAttribute("aria-haspopup");
    closeButton.classList.remove("ds-overlay__toggle", "ds-header__toggle");
    closeButton.classList.add("ds-overlay__close");
    closeButton.setAttribute("aria-label", options.closeLabel || "Close");
    if (closeButton instanceof HTMLButtonElement) closeButton.type = "button";
    bar.append(closeButton);
    panel.append(bar);
    if (options.container) options.container.append(panel);
    else toggle.after(panel);
  }
  panel.classList.add("ds-overlay--screen");
  const label = () => options.label || toggle.getAttribute("aria-label") || toggle.textContent?.trim() || "";
  if (!panel.hasAttribute("aria-label") && !panel.hasAttribute("aria-labelledby") && label()) panel.setAttribute("aria-label", label());
  if (!panel.id) panel.id = `ds-overlay-${Math.random().toString(36).slice(2, 10)}`;
  if (!toggle.hasAttribute("aria-controls")) toggle.setAttribute("aria-controls", panel.id);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-haspopup", "dialog");
  toggle.classList.add("ds-overlay__toggle");

  const parts = () => (typeof options.content === "function" ? options.content() : options.content).filter(Boolean);

  function show() {
    if (open || !toggle.isConnected) return;
    open = true;
    const content = parts();
    placeholders = content.map(element => {
      const mark = document.createComment("ds-overlay");
      element.before(mark);
      return [element, mark];
    });
    panel.append(...content);
    holdScroll(document, drawer);
    const stack = openDrawers.get(document) ?? [];
    openDrawers.set(document, [...stack.filter(entry => entry !== drawer), drawer]);
    toggle.setAttribute("aria-expanded", "true");
    if (typeof panel.showModal === "function" && panel.isConnected) {
      try { panel.showModal(); } catch { panel.setAttribute("open", ""); }
    } else panel.setAttribute("open", "");
    (closeButton ?? tabbables(panel)[0])?.focus({ preventScroll: true });
    view?.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    options.onToggle?.(true);
  }

  function hide() {
    if (!open) return;
    open = false;
    if (panel.open) panel.close();
    panel.removeAttribute("open");
    for (const [element, mark] of placeholders) {
      if (mark.isConnected) mark.replaceWith(element);
      else mark.remove();
    }
    placeholders = [];
    releaseScroll(document, drawer);
    openDrawers.set(document, (openDrawers.get(document) ?? []).filter(entry => entry !== drawer));
    toggle.setAttribute("aria-expanded", "false");
    view?.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKey);
    if (toggle.isConnected && shown(toggle)) toggle.focus({ preventScroll: true });
    options.onToggle?.(false);
  }

  const view = document.defaultView;
  const onToggleClick = () => (open ? hide() : show());
  const onResize = () => { if (open && !shown(toggle)) hide(); };
  const onKey = (event: KeyboardEvent) => {
    if (!open || event.defaultPrevented || openDrawers.get(document)?.slice(-1)[0] !== drawer) return;
    if (event.key === "Escape") {
      event.preventDefault();
      hide();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = tabbables(panel);
    if (!controls.length) { event.preventDefault(); return; }
    const active = deepActiveElement(document);
    const first = controls[0]!, last = controls[controls.length - 1]!;
    const index = active ? controls.indexOf(active as HTMLElement) : -1;
    if (event.shiftKey && index <= 0) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (index === -1 || active === last)) { event.preventDefault(); first.focus(); }
  };
  const onCancel = (event: Event) => { event.preventDefault(); hide(); };
  const onNativeClose = () => { if (open) hide(); };
  const onPanelClick = (event: MouseEvent) => {
    const path = event.composedPath();
    if (closeButton && path.includes(closeButton)) { hide(); return; }
    if (options.closeOnLink === false) return;
    if (path.slice(0, path.indexOf(panel)).some(node => node instanceof Element && node.matches("a[href]"))) hide();
  };

  toggle.addEventListener("click", onToggleClick);
  panel.addEventListener("cancel", onCancel);
  panel.addEventListener("close", onNativeClose);
  panel.addEventListener("click", onPanelClick);

  const drawer: Drawer = {
    panel,
    get isOpen() { return open; },
    open: show,
    close: hide,
    toggle: onToggleClick,
    destroy() {
      hide();
      toggle.removeEventListener("click", onToggleClick);
      panel.removeEventListener("cancel", onCancel);
      panel.removeEventListener("close", onNativeClose);
      panel.removeEventListener("click", onPanelClick);
      toggle.removeAttribute("aria-expanded");
      toggle.removeAttribute("aria-haspopup");
      if (made) panel.remove();
    },
  };
  return drawer;
}
