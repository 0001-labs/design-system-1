import { startScaling } from "../0-face/scaling";

const STARTED = Symbol.for("ds1.app-scale");
type Started = { [STARTED]?: () => void };

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
