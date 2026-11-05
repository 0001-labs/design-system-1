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
