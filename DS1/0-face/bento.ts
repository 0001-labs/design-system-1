import { isHTMLElement } from "./light-dom";

export type BentoPlace = readonly [x: number, y: number, w: number, h: number];

export interface BentoReach { start: boolean; top: boolean; end: boolean; bottom: boolean }

export function bentoPlace(value: string | null | undefined): BentoPlace | undefined {
  const parts = (value ?? "").trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0)) return undefined;
  const [x, y, w, h] = parts as [number, number, number, number];
  return w > 0 && h > 0 ? [x, y, w, h] : undefined;
}

const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

export function bentoReach(places: readonly BentoPlace[]): BentoReach[] {
  return places.map(([x, y, w, h], index) => {
    const others = places.filter((_, other) => other !== index);
    return {
      start: others.some(([ox, oy, ow, oh]) => ox + ow + 1 === x && overlaps(y, y + h, oy, oy + oh)),
      end: others.some(([ox, oy, , oh]) => x + w + 1 === ox && overlaps(y, y + h, oy, oy + oh)),
      top: others.some(([ox, oy, ow, oh]) => oy + oh + 1 === y && overlaps(x, x + w, ox, ox + ow)),
      bottom: others.some(([ox, oy, ow]) => y + h + 1 === oy && overlaps(x, x + w, ox, ox + ow)),
    };
  });
}

export function tilePlace(tile: HTMLElement, layout = ""): BentoPlace | undefined {
  const own = layout ? tile.getAttribute(`data-place-${layout}`) : null;
  return bentoPlace(own ?? tile.dataset.place);
}

export function placeBento(bento: HTMLElement): void {
  const layout = bento.dataset.layout ?? bento.getAttribute("layout") ?? "";
  const tiles = [...bento.children].filter((child): child is HTMLElement => isHTMLElement(child) && !child.hidden);
  const placed = tiles.map(tile => ({ tile, place: tilePlace(tile, layout) })).filter((entry): entry is { tile: HTMLElement; place: BentoPlace } => !!entry.place);
  const reach = bentoReach(placed.map(entry => entry.place));
  placed.forEach(({ tile, place: [x, y, w, h] }, index) => {
    const sides = reach[index]!;
    tile.style.setProperty("--ds-bento-x", String(x));
    tile.style.setProperty("--ds-bento-y", String(y));
    tile.style.setProperty("--ds-bento-w", String(w));
    tile.style.setProperty("--ds-bento-h", String(h));
    for (const side of ["start", "top", "end", "bottom"] as const) tile.style.setProperty(`--ds-bento-${side}`, sides[side] ? "1" : "0");
  });
}

export function placeBentos(root: ParentNode = document): () => void {
  const bentos = [...root.querySelectorAll<HTMLElement>(".ds-bento[data-squares]")];
  const observer = new MutationObserver(records => {
    for (const record of records) {
      const bento = isHTMLElement(record.target) && record.target.matches(".ds-bento[data-squares]") ? record.target : (record.target as HTMLElement).parentElement;
      if (bento?.matches(".ds-bento[data-squares]")) placeBento(bento);
    }
  });
  for (const bento of bentos) {
    placeBento(bento);
    observer.observe(bento, { childList: true, subtree: false, attributes: true, attributeFilter: ["data-place", "data-layout", "hidden"] });
    for (const tile of bento.children) observer.observe(tile, { attributes: true, attributeFilter: ["data-place", "hidden"] });
  }
  return () => observer.disconnect();
}
