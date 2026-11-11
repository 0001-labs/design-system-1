// @vitest-environment happy-dom
import { expect, test, vi } from 'vite-plus/test';
import { EXAMPLES } from '../website/src/lib/component-examples';

vi.stubGlobal('fetch', vi.fn(async () => new Response('{}')));
document.body.innerHTML = `<link rel="stylesheet" href="/ds1/base/latest.css" data-ds1-base /><main id="sample">${EXAMPLES.button.html}</main><output id="event-output"></output>`;
document.body.dataset.exampleId = 'button';
await import('../website/src/lib/example-runtime');

const base = document.querySelector<HTMLLinkElement>('link[data-ds1-base]')!;
const library = () => [...document.head.querySelectorAll('style')].map(style => style.textContent).join('\n');
const styles = (data: object, origin = location.origin) => window.dispatchEvent(new MessageEvent('message', { origin, source: window, data: { type: 'ds1-example-styles', ...data } }));
const frame = () => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));

test('a library stylesheet replaces the live DS1 design, and an empty one brings it back', () => {
  expect(base.hasAttribute('disabled')).toBe(false);
  styles({ css: ':root { --ds-radius: 0px; }' });
  expect(library()).toContain('--ds-radius: 0px');
  expect(base.hasAttribute('disabled')).toBe(true);
  styles({ css: ':root { --ds-radius: 1px; }' }, 'https://elsewhere.example');
  styles({ css: 42 });
  expect(library()).toContain('--ds-radius: 0px');
  styles({ css: '' });
  expect(library()).not.toContain('--ds-radius');
  expect(base.hasAttribute('disabled')).toBe(false);
});

test('only a sender asking with a request id gets the button\'s box', async () => {
  const sent = vi.spyOn(window, 'postMessage');
  styles({ css: ':root { --ds-radius: 0px; }', hoverRegion: 'padding' });
  await frame();
  expect(sent.mock.calls.some(([message]) => (message as { type?: string }).type === 'ds1-example-button-metrics')).toBe(false);
  styles({ css: ':root { --ds-radius: 0px; }', requestId: 7 });
  await frame();
  expect(sent.mock.calls.some(([message]) => (message as { type?: string; requestId?: number }).type === 'ds1-example-button-metrics' && (message as { requestId?: number }).requestId === 7)).toBe(true);
  sent.mockRestore();
});
