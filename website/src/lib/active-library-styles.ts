import { ACTIVE_LIBRARY_EVENT, ACTIVE_LIBRARY_KEY, BASE_LIBRARY, parseActiveLibrary, readActiveLibrary, type ActiveLibrary } from '../../../shared/active-library';
import { NAVIGATION_BRIDGE_REQUEST } from './navigation-session';

/**
 * The documentation's examples are drawn with the design system the signed-in person is working
 * in. For a library of their own, the hidden bridge keeps its draft stylesheet live and every
 * example frame takes it as `ds1-example-styles`; for Design system 1 itself, signed out, or with
 * none, the examples stay as they are. The draft is the person's own: it travels only between
 * same-origin frames of this tab and is kept, for the first frame of the next page, in this tab's
 * `sessionStorage` alone.
 */
export const LIBRARY_STYLES_KEY = 'ds1:active-library-styles:v1';
/** The frames refuse a larger stylesheet, so none is kept or sent. */
export const LIBRARY_STYLES_MAX = 524288;

type Kept = { id: string; name: string; css: string };
const bytes = (css: string) => new TextEncoder().encode(css).length;

export function readKeptStyles(id: string): Kept | null {
  try {
    const kept = JSON.parse(sessionStorage.getItem(LIBRARY_STYLES_KEY) ?? 'null') as Kept | null;
    if (kept?.id !== id || typeof kept.css !== 'string' || typeof kept.name !== 'string' || bytes(kept.css) > LIBRARY_STYLES_MAX) return null;
    return kept;
  } catch { return null; }
}

function keepStyles(kept: Kept | null) {
  try {
    if (kept && bytes(kept.css) <= LIBRARY_STYLES_MAX) sessionStorage.setItem(LIBRARY_STYLES_KEY, JSON.stringify(kept));
    else sessionStorage.removeItem(LIBRARY_STYLES_KEY);
  } catch { /* Storage is optional: the bridge's answer draws the examples. */ }
}

export type ExampleFrames = {
  /** The example frames on the page, with the label naming the design each is drawn with. */
  examples(): { frame: HTMLIFrameElement; label: HTMLElement | null }[];
  /** The signed-in bridge's frame. */
  bridge(): HTMLIFrameElement | null;
};

const pageFrames: ExampleFrames = {
  examples: () => [...document.querySelectorAll<HTMLElement>('section[data-example]')].flatMap(section => {
    const frame = section.querySelector<HTMLIFrameElement>('iframe[data-preview-frame]');
    return frame ? [{ frame, label: section.querySelector<HTMLElement>('[data-example-library]') }] : [];
  }),
  bridge: () => document.querySelector<HTMLIFrameElement>('#navigation-auth'),
};

let connected: ReturnType<typeof connectActiveLibraryStyles> | undefined;
/** Once per page, however many examples it has. */
export function connectPageLibraryStyles() {
  return connected ??= connectActiveLibraryStyles(pageFrames);
}

export function connectActiveLibraryStyles(frames: ExampleFrames) {
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  /** The custom library being drawn, or null for the examples as they are. */
  let library: ActiveLibrary | null = null;
  let css = '';
  /** Whether the bridge has answered for this library; until then it is asked again whenever it speaks. */
  let answered = false;

  const send = (frame: HTMLIFrameElement) => frame.contentWindow?.postMessage({ type: 'ds1-example-styles', css }, location.origin);
  const draw = (nextCss: string, nextName: string) => {
    const changed = nextCss !== css;
    css = nextCss;
    for (const { frame, label } of frames.examples()) {
      if (changed) send(frame);
      if (label) { label.textContent = css ? nextName : ''; label.title = css ? `Drawn with ${nextName}` : ''; label.hidden = !css; }
    }
  };
  const ask = () => frames.bridge()?.contentWindow?.postMessage({ type: 'ds1:active-library-request', id: library?.id ?? null }, location.origin);

  const follow = (next: ActiveLibrary | null) => {
    const custom = next && next.id !== BASE_LIBRARY ? next : null;
    if (custom?.id === library?.id) { library = custom; if (custom && css) draw(css, custom.name); return; }
    const was = library;
    library = custom;
    answered = false;
    if (!custom) {
      keepStyles(null);
      draw('', '');
      if (was) ask();
      return;
    }
    // First paint from the last known truth, then the bridge's answer.
    const kept = readKeptStyles(custom.id);
    if (!kept) keepStyles(null);
    draw(kept?.css ?? '', custom.name);
    window.dispatchEvent(new Event(NAVIGATION_BRIDGE_REQUEST));
    ask();
  };

  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    const bridge = frames.bridge()?.contentWindow;
    if (bridge && event.source === bridge) {
      if (event.data?.type === 'ds1:active-library-styles') {
        const { id, css: answer, name: answerName } = event.data;
        if (!library || id !== library.id) return;
        if (answer !== null && (typeof answer !== 'string' || bytes(answer) > LIBRARY_STYLES_MAX)) return;
        answered = true;
        const shown = typeof answerName === 'string' && answerName.trim() ? answerName.trim().slice(0, 80) : library.name;
        if (answer === null) { keepStyles(null); draw('', ''); return; }
        keepStyles({ id, name: shown, css: answer });
        draw(answer, shown);
      } else if (library && !answered) ask();
      return;
    }
    if (event.data?.type !== 'ds1-example-library-ready' || !css) return;
    // Frames load lazily: each takes the styles when it is ready for them.
    const example = frames.examples().find(({ frame }) => frame.contentWindow === event.source);
    if (example) send(example.frame);
  }, options);
  frames.bridge()?.addEventListener('load', () => { if (library) ask(); }, options);
  window.addEventListener(ACTIVE_LIBRARY_EVENT, event => follow(parseActiveLibrary((event as CustomEvent<{ library: unknown }>).detail?.library)), options);
  window.addEventListener('storage', event => {
    if (event.storageArea === localStorage && (event.key === null || event.key === ACTIVE_LIBRARY_KEY)) follow(readActiveLibrary());
  }, options);

  follow(readActiveLibrary());
  // The page's other scripts, the navigation session among them, listen once the document is parsed.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if (library) window.dispatchEvent(new Event(NAVIGATION_BRIDGE_REQUEST)); }, { ...options, once: true });

  return { dispose() { listeners.abort(); } };
}
