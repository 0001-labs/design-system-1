import { signal } from "@lit-labs/signals";
import { applyScaling, calculateScalingFactor as calculateScale, defaultScalingConfig, detectMobileDevice, type ScalingConfig } from "./scaling";
export type { ScalingConfig, ScalingMode, ScalingOptions, ScalingSnap } from "./scaling";
export { applyScaling, detectMobileDevice, startScaling, toDevicePixel, toLayoutStep } from "./scaling";

export type DeviceType = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchCapable: boolean;
  deviceType: DeviceType;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
}

export const scalingFactor = signal<number>(1);

export const scalingConfig = signal<ScalingConfig>(defaultScalingConfig);

export function getDeviceInfo(): DeviceInfo {
  const isMobile = detectMobileDevice();
  const nav = navigator as any;
  const win = window as any;

  const touchPoints = (nav && nav.maxTouchPoints) || 0;
  const isTouchCapable = touchPoints > 1;

  const screenWidth =
    typeof document !== "undefined"
      ? document.documentElement.clientWidth
      : win?.innerWidth || 0;
  const screenHeight =
    typeof document !== "undefined"
      ? document.documentElement.clientHeight
      : win?.innerHeight || 0;
  const isTablet = isMobile && Math.min(screenWidth, screenHeight) >= 600;

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile,
    isTouchCapable,
    deviceType: isMobile ? (isTablet ? "tablet" : "mobile") : "desktop",
    userAgent: (nav && (nav.userAgent || nav.vendor)) || "",
    screenWidth,
    screenHeight,
  };
}

export function calculateScalingFactor(
  viewportWidth: number,
  config: ScalingConfig = scalingConfig.get()
): number {
  return calculateScale(viewportWidth, config);
}

export function setScalingConfig(config: Partial<ScalingConfig>): void {
  const currentConfig = scalingConfig.get();
  const newConfig = { ...currentConfig, ...config };
  scalingConfig.set(newConfig);

  if (typeof window !== "undefined") {
    updateScalingFactor();
  }
}

export function updateScalingFactor(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const config = scalingConfig.get();
  const root = document.documentElement;
  const factor = root.hasAttribute("data-ds-scaling-managed")
    ? Number(root.style.getPropertyValue("--sf")) || 1
    : applyScaling(config);
  scalingFactor.set(factor);
  window.dispatchEvent(
    new CustomEvent("scaling-changed", {
      detail: { scalingFactor: factor, config },
    })
  );
}

export function getScalingFactor(): number {
  return scalingFactor.get();
}

export function scale(designPx: number): number {
  return designPx * scalingFactor.get();
}

export function unscale(scaledPx: number): number {
  const factor = scalingFactor.get();
  return factor === 0 ? scaledPx : scaledPx / factor;
}

export function initDeviceDetection(): DeviceInfo {
  const deviceInfo = getDeviceInfo();

  if (typeof document === "undefined") {
    return deviceInfo;
  }

  if (deviceInfo.isMobile) {
    document.documentElement.classList.add("mobile");
    document.documentElement.classList.remove("desktop");
  } else {
    document.documentElement.classList.add("desktop");
    document.documentElement.classList.remove("mobile");
  }

  updateScalingFactor();

  const factor = scalingFactor.get();
  if (typeof window !== "undefined" && (window as any).DS_ONE_DEBUG) {
    console.log(
      deviceInfo.isMobile
        ? `[Design system 1] Mobile device detected - ${deviceInfo.deviceType} (${deviceInfo.screenWidth}x${deviceInfo.screenHeight}), scaling factor: ${factor.toFixed(2)}`
        : `[Design system 1] Desktop device detected (${deviceInfo.screenWidth}x${deviceInfo.screenHeight})`
    );
    console.log("[Design system 1] Device Info:", {
      type: deviceInfo.deviceType,
      isMobile: deviceInfo.isMobile,
      isTablet: deviceInfo.isTablet,
      isDesktop: deviceInfo.isDesktop,
      isTouchCapable: deviceInfo.isTouchCapable,
      viewport: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`,
      scalingFactor: factor,
      userAgent: deviceInfo.userAgent,
    });
  }

  return deviceInfo;
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initDeviceDetection();
    });
  } else {
    initDeviceDetection();
  }

  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initDeviceDetection();
    }, 100);
  });

  window.addEventListener("orientationchange", () => {
    setTimeout(initDeviceDetection, 100);
  });
}

export function applike(): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.setAttribute("name", "viewport");
    document.head.appendChild(viewport);
  }
  viewport.setAttribute(
    "content",
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  );

  const style = document.createElement("style");
  style.id = "ds-one-applike-style";
  style.textContent = `
    * {
      touch-action: pan-x pan-y !important;
      -ms-touch-action: pan-x pan-y !important;
    }
    html, body {
      touch-action: pan-x pan-y !important;
      -ms-touch-action: pan-x pan-y !important;
    }
  `;
  const existingStyle = document.getElementById("ds-one-applike-style");
  if (existingStyle) {
    existingStyle.remove();
  }
  document.head.appendChild(style);

  let lastTouchEnd = 0;
  let touchStartTime = 0;

  const preventZoom = (event: TouchEvent | WheelEvent | Event) => {
    if (event instanceof TouchEvent) {
      if (event.touches.length > 1) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const now = Date.now();

      if (event.type === "touchstart") {
        if (now - lastTouchEnd < 300) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        touchStartTime = now;
      } else if (event.type === "touchend") {
        const touchDuration = now - touchStartTime;
        if (touchDuration < 300 && now - lastTouchEnd < 300) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        lastTouchEnd = now;
      } else if (event.type === "touchmove") {
        if (event.touches.length > 1) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    }

    if (event instanceof WheelEvent && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  };

  const options = { passive: false, capture: true };

  document.addEventListener("touchstart", preventZoom, options);
  document.addEventListener("touchmove", preventZoom, options);
  document.addEventListener("touchend", preventZoom, options);
  document.addEventListener("touchcancel", preventZoom, options);

  document.addEventListener("wheel", preventZoom, options);

  document.addEventListener(
    "gesturestart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    options
  );
  document.addEventListener(
    "gesturechange",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    options
  );
  document.addEventListener(
    "gestureend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    options
  );
}
