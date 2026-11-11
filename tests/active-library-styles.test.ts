// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
import { ACTIVE_LIBRARY_KEY, writeActiveLibrary } from '../shared/active-library';
import { connectActiveLibraryStyles } from '../website/src/lib/active-library-styles';
import { LIBRARY_STYLES_KEY } from '../shared/active-library';
import { NAVIGATION_BRIDGE_REQUEST } from '../website/src/lib/navigation-session';

const pink = ':root { --ds-button-primary-fill: var(--pink); }';
const square = ':root { --ds-radius: 0px; }';
const active: { dispose(): void }[] = [];
afterEach(() => { active.splice(0).forEach(connection => connection.dispose()); localStorage.clear(); sessionStorage.clear(); vi.restoreAllMocks(); });

/** Stands in for a frame's window: what it was sent, and a way for it to speak. */
function fakeWindow() { return { postMessage: vi.fn() }; }
function page(count = 2) {
  const examples = Array.from({ length: count }, () => ({ frame: { contentWindow: fakeWindow() } as unknown as HTMLIFrameElement, label: Object.assign(document.createElement('span'), { hidden: true }) }));
  const bridgeWindow = fakeWindow();
  const bridge = Object.assign(new EventTarget(), { contentWindow: bridgeWindow }) as unknown as HTMLIFrameElement;
  const started = vi.fn();
  window.addEventListener(NAVIGATION_BRIDGE_REQUEST, started);
  const connection = connectActiveLibraryStyles({ examples: () => examples, bridge: () => bridge });
  active.push(connection, { dispose: () => window.removeEventListener(NAVIGATION_BRIDGE_REQUEST, started) });
  const sent = (index: number) => (examples[index]!.frame.contentWindow!.postMessage as ReturnType<typeof vi.fn>).mock.calls.map(([message, origin]) => { expect(origin).toBe(location.origin); return message; });
  const speak = (source: unknown, data: unknown, origin = location.origin) => window.dispatchEvent(new MessageEvent('message', { origin, source: source as MessageEventSource, data }));
  return { examples, bridgeWindow, started, sent, speak, answer: (data: object, origin?: string) => speak(bridgeWindow, { type: 'ds1:active-library-styles', ...data }, origin) };
}
const keep = (library: { id: string; name: string }) => localStorage.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify(library));

test('with no active library, the base, or nobody signed in, the examples stay as they are and the bridge is not started', () => {
  for (const library of [null, { id: 'base', name: 'Design system 1' }]) {
    if (library) keep(library);
    const { sent, started, bridgeWindow, examples, speak } = page();
    speak(examples[0]!.frame.contentWindow, { type: 'ds1-example-library-ready' });
    expect(sent(0)).toEqual([]);
    expect(started).not.toHaveBeenCalled();
    expect(bridgeWindow.postMessage).not.toHaveBeenCalled();
    expect(examples[0]!.label.hidden).toBe(true);
    active.splice(0).forEach(connection => connection.dispose());
  }
});

test('a custom library draws from the kept stylesheet at once, then follows the bridge live', () => {
  keep({ id: 'lib1', name: 'Acme' });
  sessionStorage.setItem(LIBRARY_STYLES_KEY, JSON.stringify({ id: 'lib1', name: 'Acme', css: pink }));
  const { sent, started, bridgeWindow, examples, answer } = page();
  expect(sent(0)).toEqual([{ type: 'ds1-example-styles', css: pink }]);
  expect(sent(1)).toEqual([{ type: 'ds1-example-styles', css: pink }]);
  expect(examples[1]!.label).toMatchObject({ hidden: false, textContent: 'Acme' });
  expect(started).toHaveBeenCalled();
  expect(bridgeWindow.postMessage).toHaveBeenCalledWith({ type: 'ds1:active-library-request', id: 'lib1' }, location.origin);
  // The same stylesheet confirmed sends nothing again; a new draft goes to every frame and is kept.
  answer({ id: 'lib1', name: 'Acme', css: pink });
  expect(sent(0)).toHaveLength(1);
  answer({ id: 'lib1', name: 'Acme studio', css: square });
  expect(sent(0).at(-1)).toEqual({ type: 'ds1-example-styles', css: square });
  expect(examples[0]!.label.textContent).toBe('Acme studio');
  expect(JSON.parse(sessionStorage.getItem(LIBRARY_STYLES_KEY)!)).toEqual({ id: 'lib1', name: 'Acme studio', css: square });
  expect(localStorage.getItem(LIBRARY_STYLES_KEY)).toBeNull();
});

test('frames that announce later take the styles; other windows, origins and libraries are ignored', () => {
  keep({ id: 'lib1', name: 'Acme' });
  const { sent, examples, answer, speak, bridgeWindow } = page();
  expect(sent(0)).toEqual([]);
  // The bridge is asked again whenever it speaks until it has answered.
  speak(bridgeWindow, { type: 'ds1:navigation-auth' });
  expect(bridgeWindow.postMessage).toHaveBeenCalledTimes(2);
  answer({ id: 'lib1', name: 'Acme', css: pink }, 'https://elsewhere.example');
  speak(fakeWindow(), { type: 'ds1:active-library-styles', id: 'lib1', name: 'Acme', css: pink });
  answer({ id: 'lib2', name: 'Other', css: pink });
  answer({ id: 'lib1', name: 'Acme', css: 'x'.repeat(524289) });
  expect(sent(0)).toEqual([]);
  answer({ id: 'lib1', name: 'Acme', css: pink });
  speak(bridgeWindow, { type: 'ds1:navigation-auth' });
  expect(bridgeWindow.postMessage).toHaveBeenCalledTimes(2);
  expect(sent(1)).toHaveLength(1);
  speak(examples[1]!.frame.contentWindow, { type: 'ds1-example-library-ready' });
  speak(examples[1]!.frame.contentWindow, { type: 'ds1-example-library-ready' }, 'https://elsewhere.example');
  speak(fakeWindow(), { type: 'ds1-example-library-ready' });
  expect(sent(1)).toEqual([{ type: 'ds1-example-styles', css: pink }, { type: 'ds1-example-styles', css: pink }]);
  expect(sent(0)).toHaveLength(1);
});

test('switching to the base, signing out, or a library that is not the caller\'s puts the examples back and forgets the stylesheet', () => {
  keep({ id: 'lib1', name: 'Acme' });
  const { sent, examples, answer, bridgeWindow } = page();
  answer({ id: 'lib1', name: 'Acme', css: pink });
  writeActiveLibrary({ id: 'base', name: 'Design system 1' });
  expect(sent(0).at(-1)).toEqual({ type: 'ds1-example-styles', css: '' });
  expect(examples[0]!.label.hidden).toBe(true);
  expect(sessionStorage.getItem(LIBRARY_STYLES_KEY)).toBeNull();
  expect(bridgeWindow.postMessage).toHaveBeenLastCalledWith({ type: 'ds1:active-library-request', id: null }, location.origin);

  // Another tab opens the library again, then the bridge says it is not the caller's.
  keep({ id: 'lib1', name: 'Acme' });
  window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: ACTIVE_LIBRARY_KEY }));
  answer({ id: 'lib1', name: 'Acme', css: pink });
  expect(sent(0).at(-1)).toEqual({ type: 'ds1-example-styles', css: pink });
  answer({ id: 'lib1', name: null, css: null });
  expect(sent(0).at(-1)).toEqual({ type: 'ds1-example-styles', css: '' });
  expect(sessionStorage.getItem(LIBRARY_STYLES_KEY)).toBeNull();

  // Signing out takes the active library away.
  answer({ id: 'lib1', name: 'Acme', css: square });
  writeActiveLibrary(null);
  expect(sent(0).at(-1)).toEqual({ type: 'ds1-example-styles', css: '' });
  expect(sessionStorage.getItem(LIBRARY_STYLES_KEY)).toBeNull();
});

test('a kept stylesheet of another library is never drawn', () => {
  sessionStorage.setItem(LIBRARY_STYLES_KEY, JSON.stringify({ id: 'lib2', name: 'Other', css: pink }));
  keep({ id: 'lib1', name: 'Acme' });
  const { sent } = page();
  expect(sent(0)).toEqual([]);
  expect(sessionStorage.getItem(LIBRARY_STYLES_KEY)).toBeNull();
});
