// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from 'vite-plus/test';
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); delete window.DS_ONE_TRANSLATIONS; });

test('a native page asks for no words file of its own', async () => {
  const requests: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (input: string) => {
    requests.push(input);
    return new Response('', { status: 404 });
  }));
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  await import('../shared/consistency-block-client');
  await vi.advanceTimersByTimeAsync(200);
  expect(requests.filter((url) => url.includes('translations'))).toEqual([]);
});

test('the choice stays with the block client, so a site script on the same page still loads its words', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
  await import('../shared/consistency-block-client');
  expect(window.DS_ONE_I18N?.autoLoad).toBeUndefined();
});

test('words another copy of the language module puts on the page reach the block client', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })));
  const { translate } = await import('../DS1/index');
  await import('../shared/consistency-block-client');
  window.DS_ONE_TRANSLATIONS = { en: { greeting: 'Hello' } };
  expect(translate('greeting')).toBe('Hello');
});
