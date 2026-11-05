/** A public page reports its visit now; its full snapshot waits for interest or a longer read. */
export const VISITOR_WAIT_MS = 15_000;

/** Start once, at idle after interaction or the bounded quiet read; returns cancellation. */
export function whenVisitorActs(run: () => void): () => void {
  const signals = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
  let stopped = false;
  let idle: number | undefined;
  let fallback: ReturnType<typeof setTimeout> | undefined;
  const remove = () => {
    clearTimeout(wait);
    for (const signal of signals) window.removeEventListener(signal, go, true);
  };
  const begin = () => { if (!stopped) run(); };
  const go = () => {
    remove();
    if ('requestIdleCallback' in window) idle = window.requestIdleCallback(begin, { timeout: 2000 });
    else fallback = setTimeout(begin, 200);
  };
  const wait = setTimeout(go, VISITOR_WAIT_MS);
  for (const signal of signals) window.addEventListener(signal, go, { capture: true, passive: true });
  return () => {
    stopped = true;
    remove();
    if (idle !== undefined) window.cancelIdleCallback(idle);
    if (fallback !== undefined) clearTimeout(fallback);
  };
}
