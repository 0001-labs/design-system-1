// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
import { getFunctionName } from 'convex/server';
const mocks = vi.hoisted(() => ({ create: vi.fn(), libraries: {} as Record<string, unknown>, asked: [] as unknown[] }));
vi.mock('./lib/backend', async () => {
  const { signal } = await import('@lit-labs/signals');
  const { getFunctionName } = await import('convex/server');
  return {
    authState: signal({ isAuthenticated: true, isLoading: false }),
    authToken: signal('test-session'),
    authStorageKey: '__convexAuthJWT_test',
    mutation: (...args: unknown[]) => mocks.create(...args),
    LiveQuery: class {
      constructor(host: { addController(controller: unknown): void }, private ref: any, private args: () => unknown) { host.addController(this); }
      get value() {
        const args = this.args();
        if (args === 'skip') return undefined;
        if (getFunctionName(this.ref) === 'libraries:get') { mocks.asked.push(args); return mocks.libraries[(args as { id: string }).id]; }
        return getFunctionName(this.ref) === 'users:profile' ? { companyName: 'Example' } : [{ _id: 'one', name: 'Library one', publishedVersion: 2 }];
      }
    },
  };
});
import type { Signal } from '@lit-labs/signals';
import { authState } from './lib/backend';
import './NavigationAuth';
import { readNavigationCache, clearNavigationCache } from '../../shared/navigation-cache';

void getFunctionName;
const session = authState as unknown as Signal.State<{ isAuthenticated: boolean; isLoading: boolean }>;
const settle = async () => { for (let tick = 0; tick < 8; tick++) await new Promise(resolve => setTimeout(resolve, 0)); };
const mount = async () => { const element = document.createElement('ds1-navigation-auth'); document.body.append(element); await settle(); return element; };
afterEach(() => { mocks.libraries = {}; mocks.asked = []; localStorage.clear(); clearNavigationCache(); document.body.replaceChildren(); session.set({ isAuthenticated: true, isLoading: false }); vi.unstubAllGlobals(); mocks.create.mockReset(); });

test('workspace creation accepts only the parent and ignores duplicate or signed-out requests', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
  const sent = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  let finish!: (result: any) => void;
  mocks.create.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const request = (origin = location.origin, source: MessageEventSource | null = window.parent) => window.dispatchEvent(new MessageEvent('message', { origin, source, data: { type: 'ds1:create-library' } }));
  try {
    await mount();
    expect(sent.mock.calls.at(-1)?.[0]).toMatchObject({ companyName: 'Example', libraries: [{ id: 'one', name: 'Library one', publishedVersion: 2 }] });
    request('https://elsewhere.example'); request(location.origin, null);
    await settle();
    expect(mocks.create).not.toHaveBeenCalled();
    request(); request();
    await settle();
    expect(mocks.create).toHaveBeenCalledOnce();
    finish({ _id: 'new-library' });
    await settle();
    expect(sent).toHaveBeenCalledWith({ type: 'ds1:library-created', id: 'new-library' }, location.origin);
    session.set({ isAuthenticated: false, isLoading: false });
    await settle();
    expect(sent.mock.calls.at(-1)?.[0]).toMatchObject({ authenticated: false, companyName: '', libraries: [] });
    request();
    await settle();
    expect(mocks.create).toHaveBeenCalledOnce();
  } finally { sent.mockRestore(); }
});

test('the bridge exposes App only after server authorization and clears it on sign-out', async () => {
  const components = [{ name: 'Keyboard shortcut', href: '/libraries/workspace/?internal=keyboard-shortcut', layer: 2 }];
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url) => url === '/api/app-navigation' ? Response.json({ components }) : new Response(null, { status: 204 })));
  const sent = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  try {
    await mount();
    expect(sent.mock.calls.at(-1)?.[0]).toMatchObject({ authenticated: true, appComponents: components });
    expect(fetch).toHaveBeenCalledWith('/api/app-navigation', expect.objectContaining({ headers: { Authorization: 'Bearer test-session' }, cache: 'no-store' }));
    expect(fetch).toHaveBeenCalledTimes(1);
    session.set({ isAuthenticated: false, isLoading: false });
    await settle();
    expect(sent.mock.calls.at(-1)?.[0]).toMatchObject({ authenticated: false, appComponents: [] });
    expect(fetch).toHaveBeenCalledWith('/api/dashboard/session', expect.objectContaining({ method: 'DELETE' }));
  } finally { sent.mockRestore(); }
});

test('private links stay hidden when the owner document session cannot be established', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response(null, { status: 403 })));
  const sent = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  try {
    await mount();
    expect(sent.mock.calls.at(-1)?.[0]).toMatchObject({ authenticated: true, appComponents: [] });
  } finally { sent.mockRestore(); }
});

test('restoring authentication does not delete an existing document session', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
  session.set({ isAuthenticated: false, isLoading: true });
  const sent = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  try {
    await mount();
    expect(fetch).not.toHaveBeenCalled();
    expect(sent.mock.calls.at(-1)?.[0]).toMatchObject({ loading: true });
  } finally { sent.mockRestore(); }
});


test('a confirmed navigation summary is available to the next document without storing its token', async () => {
  localStorage.setItem('__convexAuthJWT_test', 'test-session');
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => Response.json({ components: [{ name: 'IndexedDB', href: '/libraries/workspace/?internal=indexeddb', layer: 1 }] })));
  const sent = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  try {
    await mount();
    const saved = await readNavigationCache();
    expect(saved?.summary).toMatchObject({ authenticated: true, owner: true, companyName: 'Example', librariesLoaded: true });
    expect(saved?.summary.appComponents[0].name).toBe('IndexedDB');
    expect(JSON.stringify(saved)).not.toContain('test-session');
  } finally { sent.mockRestore(); }
});

test('the active library\'s draft reaches only the parent, live, and is withdrawn when it is not the caller\'s or nobody is signed in', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
  const sent = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  const styles = () => sent.mock.calls.filter(([message]) => (message as { type?: string }).type === 'ds1:active-library-styles');
  const ask = (id: unknown, origin = location.origin, source: MessageEventSource | null = window.parent) => window.dispatchEvent(new MessageEvent('message', { origin, source, data: { type: 'ds1:active-library-request', id } }));
  try {
    const element = await mount() as HTMLElement & { requestUpdate(): void };
    expect(mocks.asked).toEqual([]);
    mocks.libraries.lib1 = { _id: 'lib1', name: 'Acme', draftCss: ':root { --ds-radius: 0px; }' };
    ask('lib1', 'https://elsewhere.example'); ask('lib1', location.origin, null); ask('base'); ask('not an id'); ask(42);
    await settle();
    expect(styles()).toEqual([]);
    ask('lib1');
    await settle();
    expect(styles()).toEqual([[{ type: 'ds1:active-library-styles', id: 'lib1', name: 'Acme', css: ':root { --ds-radius: 0px; }' }, location.origin]]);
    // Unrelated updates send nothing new; a new draft is sent once.
    element.requestUpdate(); await settle();
    expect(styles()).toHaveLength(1);
    mocks.libraries.lib1 = { _id: 'lib1', name: 'Acme', draftCss: ':root { --ds-radius: 4px; }' };
    element.requestUpdate(); await settle();
    expect(styles().at(-1)?.[0]).toMatchObject({ id: 'lib1', css: ':root { --ds-radius: 4px; }' });
    expect(styles()).toHaveLength(2);
    // Asking again answers again; another person's library, or one that is gone, is withdrawn.
    ask('lib1'); await settle();
    expect(styles()).toHaveLength(3);
    mocks.libraries.lib2 = null;
    ask('lib2'); await settle();
    expect(styles().at(-1)?.[0]).toEqual({ type: 'ds1:active-library-styles', id: 'lib2', name: null, css: null });
    ask('lib1'); await settle();
    session.set({ isAuthenticated: false, isLoading: false });
    await settle();
    expect(styles().at(-1)?.[0]).toEqual({ type: 'ds1:active-library-styles', id: 'lib1', name: null, css: null });
    // Stopping sends nothing more.
    const count = styles().length;
    ask(null); session.set({ isAuthenticated: true, isLoading: false }); await settle();
    expect(styles()).toHaveLength(count);
    expect(sent.mock.calls.every(([, origin]) => origin === location.origin)).toBe(true);
  } finally { sent.mockRestore(); }
});
