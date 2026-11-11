import { afterAll, beforeAll, expect, test } from 'vite-plus/test';
import { chromium, type Browser } from 'playwright';
import { browserTimingReason } from './browser-timing';

let browser: Browser;
beforeAll(async () => { browser = await chromium.launch({ headless: true }); });
afterAll(async () => { await browser.close(); });

// Control only the animation clock: the probe still runs in a real browser page.
for (const fps of [6, 29, 30, 60]) test(`the timing gate handles ${fps} fps and caches its probe`, async () => {
  const context = await browser.newContext();
  await context.addInitScript(fps => {
    let at = 0;
    window.requestAnimationFrame = callback => window.setTimeout(() => callback(at += 1000 / fps), 1);
    window.cancelAnimationFrame = clearTimeout;
  }, fps);
  let pages = 0;
  const subject = { newPage: () => { pages++; return context.newPage(); } } as unknown as Browser;
  try {
    const reason = await browserTimingReason(subject);
    if (fps < 30) expect(reason).toContain(`${fps.toFixed(1)} fps (requires 30 fps`);
    else expect(reason).toBeUndefined();
    expect(await browserTimingReason(subject)).toBe(reason);
    expect(pages).toBe(1);
    expect(context.pages()).toHaveLength(0);
  } finally { await context.close(); }
});

test('launch failures fail the suite instead of being treated as a slow clock', async () => {
  const subject = { newPage: async () => { throw new Error('browser unavailable'); } } as unknown as Browser;
  await expect(browserTimingReason(subject)).rejects.toThrow('browser unavailable');
});

test('a stopped animation clock gives a bounded skip', async () => {
  const context = await browser.newContext();
  await context.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  const subject = { newPage: () => context.newPage() } as unknown as Browser;
  try {
    expect(await browserTimingReason(subject)).toContain('0.0 fps');
    expect(context.pages()).toHaveLength(0);
  } finally { await context.close(); }
});
