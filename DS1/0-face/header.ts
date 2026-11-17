import { attachOverlay, type Drawer } from "./attach-overlay";

const started = new WeakMap<Element, Drawer>();

function normalise(path: string): string {
  return path.replace(/\/index\.html?$/, "/").replace(/\.html?$/, "").replace(/\/+$/, "") || "/";
}

export function markCurrentLink(links: Iterable<HTMLAnchorElement>, location: { href: string } = globalThis.location): HTMLAnchorElement | null {
  const all = [...links];
  const marked = all.find(link => link.hasAttribute("aria-current") && link.getAttribute("aria-current") !== "false");
  if (marked || !location) return marked ?? null;
  const here = new URL(location.href);
  const match = all.find(link => {
    if (!link.getAttribute("href") || link.getAttribute("href")!.startsWith("#")) return false;
    const target = new URL(link.href, here);
    return target.origin === here.origin && normalise(target.pathname) === normalise(here.pathname);
  });
  match?.setAttribute("aria-current", "page");
  return match ?? null;
}

export function startHeaders(root: ParentNode = document): Drawer[] {
  const drawers: Drawer[] = [];
  for (const header of root.querySelectorAll<HTMLElement>(".ds-header")) {
    const nav = header.querySelector<HTMLElement>(":scope > .ds-header__nav");
    if (nav) markCurrentLink(nav.querySelectorAll<HTMLAnchorElement>("a[href]"));
    if (started.has(header)) continue;
    const toggle = header.querySelector<HTMLElement>(":scope > .ds-header__toggle");
    if (!toggle) continue;
    const drawer = attachOverlay({
      toggle,
      content: () => [...header.querySelectorAll(":scope > :is(.ds-header__nav, .ds-header__actions)")],
      closeLabel: toggle.dataset.closeLabel,
    });
    started.set(header, drawer);
    drawers.push(drawer);
  }
  return drawers;
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => startHeaders(), { once: true });
  else startHeaders();
}
