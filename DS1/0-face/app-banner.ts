import { detectMobileDevice } from "./scaling";

export interface AppBannerOptions {
  appId?: string;
  appUrl?: string;
  open?: string;
  key?: string;
}

export type AppBannerPlacement = "safari" | "drawn" | "none";

export interface AppBannerDevice {
  userAgent: string;
  touchPoints: number;
  mobile: boolean;
  standalone: boolean;
}

const OTHER_BROWSERS = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|DuckDuckGo|Ddg\/|YaBrowser|Focus\/|Brave\//;

export function appBannerDevice(): AppBannerDevice {
  if (typeof navigator === "undefined" || typeof window === "undefined") return { userAgent: "", touchPoints: 0, mobile: false, standalone: false };
  const standalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
    || Boolean(window.matchMedia?.("(display-mode: standalone)").matches);
  return { userAgent: navigator.userAgent || "", touchPoints: navigator.maxTouchPoints || 0, mobile: detectMobileDevice(), standalone };
}

export function isAppleMobile({ userAgent, touchPoints }: Pick<AppBannerDevice, "userAgent" | "touchPoints">): boolean {
  return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1);
}

export function appleBrowser(userAgent: string): "safari" | "other" | "webview" {
  if (OTHER_BROWSERS.test(userAgent)) return "other";
  return /Safari\//.test(userAgent) ? "safari" : "webview";
}

export function appBannerKey(options: AppBannerOptions): string {
  return options.key || `ds-app-banner:${options.appId || options.appUrl || options.open || ""}`;
}

export function appStoreUrl(options: AppBannerOptions): string {
  return options.appUrl || (options.appId ? `https://apps.apple.com/app/id${options.appId}` : "");
}

export function isAppBannerClosed(options: AppBannerOptions): boolean {
  try { return localStorage.getItem(appBannerKey(options)) === "closed"; } catch { return false; }
}

export function closeAppBanner(options: AppBannerOptions): void {
  try { localStorage.setItem(appBannerKey(options), "closed"); } catch {}
}

export function appBannerPlacement(options: AppBannerOptions, device: AppBannerDevice = appBannerDevice()): AppBannerPlacement {
  if (!appStoreUrl(options) && !options.open) return "none";
  if (!device.mobile || device.standalone || !isAppleMobile(device)) return "none";
  const browser = appleBrowser(device.userAgent);
  if (browser === "webview") return "none";
  if (browser === "safari" && options.appId) return "safari";
  return isAppBannerClosed(options) ? "none" : "drawn";
}

export function ensureSmartAppBanner(options: AppBannerOptions): void {
  if (typeof document === "undefined" || !options.appId) return;
  if (document.head.querySelector('meta[name="apple-itunes-app"]')) return;
  const meta = document.createElement("meta");
  meta.name = "apple-itunes-app";
  meta.content = [`app-id=${options.appId}`, options.open ? `app-argument=${options.open}` : ""].filter(Boolean).join(", ");
  document.head.appendChild(meta);
}

export function openApp(options: AppBannerOptions, wait = 1500): void {
  const store = appStoreUrl(options);
  if (!options.open) { if (store) location.href = store; return; }
  location.href = options.open;
  if (!store) return;
  const timer = window.setTimeout(() => { if (document.visibilityState === "visible") location.href = store; }, wait);
  const left = () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", left); window.removeEventListener("pagehide", left); };
  document.addEventListener("visibilitychange", left);
  window.addEventListener("pagehide", left);
}

export function startAppBanners(root: ParentNode = document): () => void {
  const undo: (() => void)[] = [];
  for (const block of root.querySelectorAll<HTMLElement>(".ds-notice--app")) {
    const options: AppBannerOptions = { appId: block.dataset.appId, appUrl: block.dataset.appUrl, open: block.dataset.open, key: block.dataset.remember };
    const placement = appBannerPlacement(options);
    if (placement === "safari") ensureSmartAppBanner(options);
    block.hidden = placement !== "drawn";
    if (block.hidden) continue;
    const link = block.querySelector<HTMLAnchorElement>(".ds-notice__open");
    const close = block.querySelector<HTMLButtonElement>(".ds-notice__dismiss");
    if (link && !link.getAttribute("href")) link.href = appStoreUrl(options);
    const onOpen = (event: MouseEvent) => { if (!options.open) return; event.preventDefault(); openApp(options); };
    const onClose = () => { closeAppBanner(options); block.hidden = true; };
    link?.addEventListener("click", onOpen);
    close?.addEventListener("click", onClose);
    undo.push(() => { link?.removeEventListener("click", onOpen); close?.removeEventListener("click", onClose); });
  }
  return () => undo.forEach(fn => fn());
}
