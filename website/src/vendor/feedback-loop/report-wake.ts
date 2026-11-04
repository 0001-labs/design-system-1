/**
 * Report woken by its first gesture (report-sheet.ts): a product that turns
 * Report on for the owner loads nothing of it at startup. This small file
 * listens for a plain right click, ⌥⇧R or a touch, and only then has the
 * product load the sheet and Aa's editor (`load`); the right click or the
 * shortcut that woke it opens the sheet about what it was on once loaded, and
 * a touch loads it quietly so the three taps work from then on. Nothing here
 * imports report-sheet.ts, so a bundle keeps the sheet out of the startup path.
 */

/** Whether a key press is the shortcut, ⌥⇧R: by the key's place, since ⌥ changes the letter on a Mac. */
export const isReportShortcut = (event: Pick<KeyboardEvent, 'code' | 'altKey' | 'shiftKey' | 'metaKey' | 'ctrlKey'>) =>
  event.code === 'KeyR' && event.altKey && event.shiftKey && !event.metaKey && !event.ctrlKey;

/** Whether a context menu gesture is the owner's plain right click: a mouse, no modifier held; the ContextMenu key counts too. */
export const isPlainRightClick = (event: Pick<MouseEvent, 'button' | 'altKey' | 'shiftKey' | 'metaKey' | 'ctrlKey'> & { pointerType?: string }) =>
  (event.button === 2 || event.button === 0) && event.pointerType !== 'touch' && !event.altKey && !event.shiftKey && !event.metaKey && !event.ctrlKey;

/** A field being written: a right click there stays the browser's own, so pasting stays a click away. */
export const EDITABLE = 'input, textarea, [contenteditable=""], [contenteditable="true"]';

/** What `load` gives back: the sheet (report-sheet.ts `startReport`), or anything that opens and stops like it. */
export interface WokenSheet { open(about?: Element | null): void; stop(): void }

export interface ReportWakeOptions {
  /** Loads the sheet and what it needs (the product's copy of Aa, report-sheet.ts) and starts it with the product's own `send`. */
  load(): Promise<WokenSheet>;
  /** A plain right click wakes and opens it (the owner's way); without it, only the shortcut and the taps do. */
  rightClick?: boolean;
  /** The document to watch; the page's own by default. */
  doc?: Document;
}

/**
 * Watches for the first gesture that could open Report and loads it then; returns how to stop, which also stops a
 * sheet it loaded. A load that fails is forgotten, so the next gesture tries again.
 */
export function wakeReport(options: ReportWakeOptions): () => void {
  const doc = options.doc ?? document;
  const asElement = (node: EventTarget | null): Element | null => (node && typeof (node as Element).closest === 'function' ? (node as Element) : null);
  let loading: Promise<WokenSheet> | null = null;
  let sheet: WokenSheet | null = null;
  let stopped = false;
  const load = (then?: (sheet: WokenSheet) => void) => {
    loading ??= options.load().then(loaded => {
      if (stopped) { loaded.stop(); return loaded; }
      sheet = loaded;
      unwatch();
      return loaded;
    }, error => { loading = null; throw error; });
    if (then) loading.then(loaded => { if (!stopped) then(loaded); }).catch(() => { /* The next gesture tries again. */ });
    else loading.catch(() => { /* The next gesture tries again. */ });
  };
  const context = (event: MouseEvent) => {
    if (!options.rightClick || sheet || !isPlainRightClick(event as MouseEvent & { pointerType?: string })) return;
    const at = asElement(event.target);
    if (at?.closest(EDITABLE)) return;
    event.preventDefault(); event.stopPropagation();
    const under = event.button === 2 ? doc.elementFromPoint(event.clientX, event.clientY) : null;
    load(loaded => loaded.open(under ?? at));
  };
  const keydown = (event: KeyboardEvent) => {
    if (sheet || !isReportShortcut(event) || event.repeat) return;
    event.preventDefault(); event.stopPropagation();
    const focused = doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement : null;
    load(loaded => loaded.open(focused));
  };
  const touch = (event: PointerEvent) => { if (!sheet && event.pointerType !== 'mouse') load(); };
  const unwatch = () => {
    doc.removeEventListener('contextmenu', context, true);
    doc.removeEventListener('keydown', keydown, true);
    doc.removeEventListener('pointerdown', touch, true);
  };
  doc.addEventListener('contextmenu', context, true);
  doc.addEventListener('keydown', keydown, true);
  doc.addEventListener('pointerdown', touch, { capture: true, passive: true });
  return () => {
    stopped = true;
    unwatch();
    sheet?.stop();
    sheet = null;
  };
}
