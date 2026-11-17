export type ScalingMode = "auto" | "fixed" | "fluid";

export type ScalingSnap = "layout" | "pixel" | false;

export interface ScalingConfig {
  mode: ScalingMode;
  baseWidth: number;
  minScale: number;
  maxScale: number;
  snap?: ScalingSnap;
  desktop?: "aligned";
  columns?: "even";
}

export interface AlignedGrid {
  factor: number;
  columns: number;
  rows: number;
  top: number;
}

export interface ScalingOptions extends Partial<ScalingConfig> {
  root?: HTMLElement;
  surface?: HTMLElement | boolean;
}

export const defaultScalingConfig: ScalingConfig = {
  mode: "auto",
  baseWidth: 280,
  minScale: 0.75,
  maxScale: 2.0,
};

const SQUARE = 20;
const LAYOUT_STEPS = 64;

export function toLayoutStep(factor: number): number {
  return Math.round(factor * SQUARE * LAYOUT_STEPS) / (SQUARE * LAYOUT_STEPS);
}

export function toDevicePixel(factor: number, pixelRatio = 1): number {
  const ratio = pixelRatio > 0 ? pixelRatio : 1;
  return Math.floor(factor * SQUARE * ratio) / (SQUARE * ratio);
}

export function calculateScalingFactor(viewportWidth: number, config: ScalingConfig = defaultScalingConfig, pixelRatio = 1): number {
  if (config.mode === "fixed") return 1;
  const factor = Math.max(config.minScale, Math.min(config.maxScale, viewportWidth / config.baseWidth));
  if (config.snap === "layout") return toLayoutStep(factor);
  if (config.snap === "pixel") return toDevicePixel(factor, pixelRatio);
  return Number(factor.toFixed(3));
}

export function alignedGrid(width: number, height: number, snap: ScalingSnap = false, pixelRatio = 1, columns?: "even"): AlignedGrid {
  if (!(width > 0)) return { factor: 1, columns: 0, rows: 0, top: 0 };
  const across = width / SQUARE;
  const step = columns === "even" ? 2 : 1;
  const fewer = Math.max(step, Math.floor(across / step) * step);
  const more = Math.max(step, Math.ceil(across / step) * step);
  const count = across / fewer - 1 <= 1 - across / more ? fewer : more;
  const exact = width / (count * SQUARE);
  const factor = snap === "layout" ? toLayoutStep(exact) : snap === "pixel" ? toDevicePixel(exact, pixelRatio) : exact;
  const unit = SQUARE * factor;
  const rows = height > 0 ? Math.floor(height / unit + 1e-9) : 0;
  const top = height > 0 ? Math.max(0, Number((height - rows * unit).toFixed(4))) : 0;
  return { factor, columns: count, rows, top };
}

export function detectMobileDevice(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const agent = navigator.userAgent || navigator.vendor || "";
  const byAgent = /Mobile|Android|iP(ad|hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)|Windows Phone|Phone|Tablet/i.test(agent);
  const touch = (navigator.maxTouchPoints || 0) > 1;
  const narrow = Math.min(window.innerWidth || 0, window.innerHeight || 0) <= 820;
  return byAgent || (touch && narrow);
}

function surfacesOf(surface: ScalingOptions["surface"]): HTMLElement[] {
  if (!surface) return [];
  if (surface === true) return Array.from(document.querySelectorAll<HTMLElement>("[data-ds-surface]"));
  return [surface];
}

function applySurface(surface: HTMLElement, target: HTMLElement, config: Partial<ScalingConfig>): number {
  const factor = calculateScalingFactor(surface.clientWidth || 0, { ...defaultScalingConfig, ...config }, window.devicePixelRatio || 1);
  target.style.setProperty("--sf", String(factor));
  target.style.setProperty("--ds-sf", String(factor));
  return factor;
}

export function applyScaling(options: ScalingOptions = {}): number {
  if (typeof document === "undefined" || typeof window === "undefined") return 1;
  const { root, surface, ...config } = options;
  if (surface) {
    const factors = surfacesOf(surface).map(element => applySurface(element, (surface !== true && root) || element, config));
    return factors[0] ?? 1;
  }
  return applyPage(root ?? document.documentElement, config);
}

export function screenWidth(): number {
  const { width = 0, height = 0 } = window.screen ?? {};
  if (!width || !height) return 0;
  const turn = window.screen.orientation?.type;
  const landscape = turn ? turn.startsWith("landscape") : window.matchMedia?.("(orientation: landscape)").matches ?? width > height;
  return landscape ? Math.max(width, height) : Math.min(width, height);
}

function applyPage(root: HTMLElement, config: Partial<ScalingConfig>): number {
  const mobile = detectMobileDevice();
  const page = document.documentElement.clientWidth || window.innerWidth || 0;
  const held = mobile ? screenWidth() : 0;
  const width = held ? Math.min(page, held) : page;
  const settings = { ...defaultScalingConfig, ...config };
  const pixelRatio = window.devicePixelRatio || 1;
  const aligned = !mobile && settings.desktop === "aligned" && settings.mode !== "fixed"
    ? alignedGrid(width, document.documentElement.clientHeight || window.innerHeight || 0, settings.snap, pixelRatio, settings.columns)
    : null;
  const factor = mobile ? calculateScalingFactor(width, settings, pixelRatio) : aligned?.factor ?? 1;
  root.style.setProperty("--sf", String(factor));
  root.toggleAttribute("data-mobile", mobile);
  root.toggleAttribute("data-desktop-aligned", Boolean(aligned));
  const grid = { "--ds-grid-columns": aligned?.columns, "--ds-grid-rows": aligned?.rows, "--ds-grid-top": aligned && `${aligned.top}px` };
  for (const [property, value] of Object.entries(grid)) {
    if (value === null || value === undefined) root.style.removeProperty(property);
    else root.style.setProperty(property, String(value));
  }
  return factor;
}

export function startScaling(options: ScalingOptions = {}): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  const { root, surface, ...config } = options;
  const surfaces = surfacesOf(surface);
  const apply = surface
    ? () => { for (const element of surfaces) applySurface(element, (surface !== true && root) || element, config); }
    : () => { applyPage(root ?? document.documentElement, config); };
  apply();
  const observer = surfaces.length && typeof ResizeObserver === "function" ? new ResizeObserver(apply) : null;
  for (const element of surfaces) observer?.observe(element);
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);
  return () => {
    observer?.disconnect();
    window.removeEventListener("resize", apply);
    window.removeEventListener("orientationchange", apply);
  };
}
