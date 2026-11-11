import type { Browser } from 'playwright';

const probes = new WeakMap<Browser, Promise<string | undefined>>();

/** Probe once per browser, before fixtures: a closed-lid Mac may draw only 3–6 fps.
 * A bounded sample also handles a browser whose animation clock has stopped.
 * Launch/navigation errors propagate; only a measured slow clock permits a skip.
 */
export function browserTimingReason(browser: Browser): Promise<string | undefined> {
  let probe = probes.get(browser);
  if (!probe) {
    probe = (async () => {
      const page = await browser.newPage();
      try {
        const fps = await page.evaluate(() => new Promise<number>(resolve => {
          let frames = 0;
          let first: number | undefined;
          let last = 0;
          let frame = 0;
          const finish = () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
            resolve(first === undefined || last === first ? 0 : (frames - 1) * 1000 / (last - first));
          };
          const timer = setTimeout(finish, 1500);
          const sample = (at: number) => {
            first ??= at;
            last = at;
            if (++frames >= 10) finish();
            else frame = requestAnimationFrame(sample);
          };
          frame = requestAnimationFrame(sample);
        }));
        const reason = fps < 30
          ? `Browser timing unavailable: ${fps.toFixed(1)} fps (requires 30 fps; closed lid or host load).`
          : undefined;
        if (reason) console.info(reason);
        return reason;
      } finally { await page.close(); }
    })();
    probes.set(browser, probe);
  }
  return probe;
}
