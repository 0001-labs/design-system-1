export const CUT_ATTRIBUTE = "data-cut";

export const CUT_FADE_SELECTOR = [
  ".ds-row__name",
  ".ds-sidebar__label",
  ".ds-menu__item",
  ".ds-badge__label",
  ".ds-notice__title",
  ".ds-notice__text",
  ".ds-progress__label",
  ".ds-stat__figure",
  ".ds-document__toc-list a",
  ".ds-footer__links a",
  ".item-text",
].join(", ");

export function isCut(element: Element): boolean {
  return element.scrollWidth > element.clientWidth + 1;
}

export function markCut(element: Element): boolean {
  const cut = isCut(element);
  const mark = element.getAttribute(CUT_ATTRIBUTE);
  if (cut) {
    if (mark !== "end") element.setAttribute(CUT_ATTRIBUTE, "end");
  } else if (mark === "end") element.removeAttribute(CUT_ATTRIBUTE);
  return cut;
}

export type CutSource = Element | Iterable<Element> | (() => Iterable<Element>);

export type CutWatchOptions = {
  text?: boolean;
};

export type CutWatcher = {
  watch(source: CutSource): void;
  select(root: ParentNode, selector: string): void;
  measure(): void;
  disconnect(): void;
};

type Watched = {
  refresh(): Set<Element>;
  stopped: boolean;
};

function markAll(elements: Iterable<Element>) {
  const cuts: [Element, boolean][] = [];
  for (const element of elements) {
    if (element.isConnected && element.checkVisibility?.({contentVisibilityAuto: true}) !== false) cuts.push([element, isCut(element)]);
  }
  hookFonts();
  for (const [element, cut] of cuts) {
    const mark = element.getAttribute(CUT_ATTRIBUTE);
    if (cut) {
      if (mark !== "end") element.setAttribute(CUT_ATTRIBUTE, "end");
    } else if (mark === "end") element.removeAttribute(CUT_ATTRIBUTE);
  }
}

const live = new Set<Watched>();
const queued = new Set<Watched>();
let frame = false;

const nextFrame = (run: () => void) => {
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else setTimeout(run, 0);
};

function flush() {
  frame = false;
  const watchers = [...queued];
  queued.clear();
  const elements = new Set<Element>();
  for (const watcher of watchers) {
    if (watcher.stopped) continue;
    for (const element of watcher.refresh()) elements.add(element);
  }
  markAll(elements);
}

function schedule(watcher: Watched) {
  if (watcher.stopped) return;
  queued.add(watcher);
  if (frame) return;
  frame = true;
  nextFrame(flush);
}

let sizes: ResizeObserver | undefined;
const holders = new Map<Element, number>();
function observe(element: Element) {
  if (typeof ResizeObserver === "undefined") return;
  sizes ??= new ResizeObserver(entries => markAll(entries.map(entry => entry.target)));
  const held = holders.get(element) ?? 0;
  if (!held) sizes.observe(element);
  holders.set(element, held + 1);
}
function unobserve(element: Element) {
  const held = holders.get(element);
  if (!held) return;
  if (held > 1) { holders.set(element, held - 1); return; }
  holders.delete(element);
  sizes?.unobserve(element);
}

let fontsHooked = false;
function hookFonts() {
  if (fontsHooked || typeof document === "undefined") return;
  fontsHooked = true;
  const again = () => { for (const watcher of live) schedule(watcher); };
  const fonts = document.fonts;
  fonts?.ready?.then(again, () => {});
  fonts?.addEventListener?.("loadingdone", again);
}

export function watchCuts(options: CutWatchOptions = {}): CutWatcher {
  const sources: CutSource[] = [];
  let watched = new Set<Element>();
  const words = options.text && typeof MutationObserver !== "undefined"
    ? new MutationObserver(() => schedule(self))
    : undefined;

  const collect = () => {
    const found = new Set<Element>();
    for (const source of sources) {
      const elements = typeof source === "function" ? source() : source instanceof Element ? [source] : source;
      for (const element of elements) found.add(element);
    }
    return found;
  };

  const self: Watched = {
    stopped: false,
    refresh() {
      const next = collect();
      let changed = next.size !== watched.size;
      for (const element of watched) {
        if (!next.has(element)) { unobserve(element); changed = true; }
      }
      for (const element of next) {
        if (!watched.has(element)) { observe(element); changed = true; }
      }
      if (words && changed) {
        words.disconnect();
        for (const element of next) words.observe(element, { childList: true, characterData: true, subtree: true });
      }
      watched = next;
      return watched;
    },
  };
  live.add(self);

  return {
    watch(source) { sources.push(source); schedule(self); },
    select(root, selector) { sources.push(() => root.querySelectorAll(selector)); schedule(self); },
    measure() { schedule(self); },
    disconnect() {
      self.stopped = true;
      live.delete(self);
      queued.delete(self);
      for (const element of watched) unobserve(element);
      words?.disconnect();
      watched = new Set();
      sources.length = 0;
    },
  };
}


type ControllerHost = Element & {
  addController(controller: { hostConnected?(): void; hostUpdated?(): void; hostDisconnected?(): void }): void;
  readonly renderRoot?: unknown;
};

export type CutFadeOptions = {
  selector?: string;
  targets?: () => Iterable<Element>;
  text?: boolean;
};

export class CutFades {
  private watcher: CutWatcher | undefined;
  private words: MutationObserver | undefined;
  private readonly host: ControllerHost;
  private readonly options: CutFadeOptions;

  constructor(host: ControllerHost, options: CutFadeOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostConnected() {
    this.hostDisconnected();
    const watcher = watchCuts();
    const { selector, targets, text } = this.options;
    if (selector) watcher.watch(() => ((this.host.renderRoot as ParentNode | undefined) ?? this.host).querySelectorAll(selector));
    if (targets) watcher.watch(targets);
    this.watcher = watcher;
    if (text && typeof MutationObserver !== "undefined") {
      this.words = new MutationObserver(() => this.measure());
      this.words.observe(this.host, { childList: true, characterData: true, subtree: true });
    }
  }

  hostUpdated() { this.measure(); }

  hostDisconnected() {
    this.words?.disconnect();
    this.words = undefined;
    this.watcher?.disconnect();
    this.watcher = undefined;
  }

  measure() { this.watcher?.measure(); }
}

export function startCutFades(root: ParentNode = document, selector: string = CUT_FADE_SELECTOR): () => void {
  const watcher = watchCuts();
  watcher.select(root, selector);
  markAll(root.querySelectorAll(selector));
  const changes = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(() => watcher.measure());
  const node = root instanceof Document ? root.documentElement : (root as Node);
  changes?.observe(node, { childList: true, characterData: true, subtree: true });
  return () => {
    changes?.disconnect();
    watcher.disconnect();
  };
}
