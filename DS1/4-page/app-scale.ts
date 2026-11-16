import { startScaling } from "../0-face/scaling";

const STARTED = Symbol.for("ds1.app-scale");
type Started = { [STARTED]?: () => void };

/**
 * The scale every app frame stands on: a phone's fourteen squares, and on a
 * computer Desktop aligned, so the window is whole squares across and down.
 * The shared components follow it (`--ds-sf` takes `--sf`), so the controls,
 * the panes and the type grow and shrink together. Call it as early as the
 * page allows (an app's first module); `ds-app` calls it too. Idempotent: a
 * second call returns the first one's stop. The root is marked
 * `data-ds-scaling-managed`, so the device module (`0-face/device.ts`, which
 * the full component entry starts) reads this scale instead of putting its own.
 */
export function startAppScale(): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  const started = window as unknown as Started;
  const running = started[STARTED];
  if (running) return running;
  const root = document.documentElement;
  root.setAttribute("data-ds-scaling-managed", "");
  root.style.setProperty("--ds-sf", "var(--sf, 1)");
  const stopScaling = startScaling({ desktop: "aligned" });
  const stop = () => {
    stopScaling();
    root.removeAttribute("data-ds-scaling-managed");
    delete started[STARTED];
  };
  started[STARTED] = stop;
  return stop;
}
