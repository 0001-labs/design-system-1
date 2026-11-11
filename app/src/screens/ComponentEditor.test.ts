// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vite-plus/test';
vi.mock('../lib/backend', async () => {
  const { signal } = await import('@lit-labs/signals');
  return { authToken: signal('fixture-session'), authState: signal({ isLoading: false, isAuthenticated: true }), LiveQuery: class { value = undefined; } };
});
import './ComponentEditor';
import { currentLocation } from '../router';
let host: HTMLElement;
const settle = async () => { for (let i = 0; i < 6; i++) await new Promise(resolve => setTimeout(resolve, 5)); };
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ base: null, history: [] })));
  currentLocation.set({ path: '/base', search: new URLSearchParams('component=button') });
  host = document.createElement('ds1-component-editor');
});
afterEach(() => { host.remove(); document.documentElement.removeAttribute('data-docs-embed'); vi.unstubAllGlobals(); });
it('keeps navigation, canvas and properties in independent shared Page areas', async () => {
  document.body.append(host); await settle();
  const page = host.querySelector('ds-page')!;
  expect(page.getAttribute('layout')).toBe('inspector');
  expect(page.querySelector('[slot=nav] ds-sidebar')).not.toBeNull();
  expect(page.querySelector(':scope > main')).not.toBeNull();
  expect(page.querySelector('[slot=aside]')).not.toBeNull();
  expect(page.hasAttribute('resizable')).toBe(true);
  expect(page.shadowRoot!.querySelectorAll('[role=separator]')).toHaveLength(2);
});
it('uses the surrounding documentation navigation without leaving a phantom pane', async () => {
  document.documentElement.setAttribute('data-docs-embed', '');
  document.body.append(host); await settle();
  const page = host.querySelector('ds-page')!;
  expect(page.querySelector('[slot=nav]')).toBeNull();
  expect(page.querySelector('[slot=aside]')).not.toBeNull();
  expect(page.shadowRoot!.querySelector('[data-area=nav]')!.hasAttribute('data-empty')).toBe(true);
  currentLocation.set({ path: '/base', search: new URLSearchParams('view=history') }); await settle();
  expect(page.querySelector('[slot=aside]')).toBeNull();
  expect(page.shadowRoot!.querySelector('[data-area=aside]')!.hasAttribute('data-empty')).toBe(true);
});
it('opens the stylesheet split while retaining the mounted library canvas', async () => {
  const workbench = document.createElement('ds1-system-workbench') as HTMLElement & { stylesheetOpen: boolean };
  document.body.append(workbench);
  try {
    await settle();
    const panes = workbench.querySelector('ds-page.system-workbench-panes')!;
    const outer = workbench.querySelector('ds-page.system-workbench-body')!;
    expect(outer.getAttribute('layout')).toBe('inspector');
    expect(panes.querySelector('[slot=nav]')).not.toBeNull();
    expect(panes.querySelector('[slot=aside]')).not.toBeNull();
    workbench.stylesheetOpen = true; await settle();
    expect(outer.getAttribute('layout')).toBe('split');
    expect(workbench.querySelector('ds-page.system-workbench-panes')).toBe(panes);
    expect(panes.getAttribute('slot')).toBe('nav');
    expect(workbench.querySelector('#library-stylesheet')).not.toBeNull();
    expect(outer.shadowRoot!.querySelectorAll('[role=separator]')).toHaveLength(1);
  } finally { workbench.remove(); }
});
it('previews a handle on the canvas and in the inspector without the draft, and commits it once through the draft', async () => {
  document.body.append(host); await settle();
  const editor = host as HTMLElement & { draft: { value(token: string): string | undefined } };
  const handles = host.querySelector('ds1-canvas-handles')!;
  expect([...handles.querySelectorAll('[role=slider]')].map(handle => handle.getAttribute('aria-label'))).toEqual(['Height', 'Padding at the start', 'Padding at the end', 'Width', 'Corner']);
  const canvas = host.querySelector<HTMLElement>('[data-testid=component-canvas]')!;
  const send = (type: string, detail: unknown) => handles.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  send('handle-preview', { token: '--ds-button-size', value: '36px' }); await settle();
  expect(canvas.style.getPropertyValue('--ds-button-size')).toBe('36px');
  expect((host.querySelector('ds-number[data-token="--ds-button-size"]') as HTMLElement & { value: number }).value).toBe(36);
  expect(editor.draft.value('--ds-button-size')).toBeUndefined();
  send('handle-preview', null); await settle();
  expect(canvas.style.getPropertyValue('--ds-button-size')).toBe('');
  send('handle-commit', { token: '--ds-button-size', value: '36px' }); await settle();
  expect(editor.draft.value('--ds-button-size')).toBe('36px');
  send('handle-commit', { token: '--ds-button-size', value: '' }); await settle();
  expect(editor.draft.value('--ds-button-size')).toBeUndefined();
});
