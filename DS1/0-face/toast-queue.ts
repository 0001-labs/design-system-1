import { reportFailure, type Failure } from "./failures";

export type ToastId = string | number;
export type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading";
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export interface ToastButton { label: string; onClick?: (event: MouseEvent) => void; href?: string }
export interface ToastOptions {
  failure?: Failure;
  id?: ToastId;
  description?: string;
  duration?: number;
  icon?: string;
  action?: ToastButton;
  cancel?: ToastButton;
  dismissible?: boolean;
  closeButton?: boolean;
  important?: boolean;
  onDismiss?: (toast: ToastData) => void;
  onAutoClose?: (toast: ToastData) => void;
}
export interface ToastData extends ToastOptions { id: ToastId; title: string; type: ToastType }
type Message<T> = string | ((value: T) => string);
export interface ToastPromiseMessages<T> extends ToastOptions {
  loading: string;
  success: Message<T>;
  error: Message<unknown>;
  finally?: () => void;
}

export type ToastSignal = { toast: ToastData } | { dismiss: ToastId | undefined };
type Listener = (signal: ToastSignal) => void;

export const TOAST_DURATION = Infinity;
export const VISIBLE_TOASTS = 3;
export const TIME_BEFORE_UNMOUNT = 200;
export const SWIPE_THRESHOLD = 45;
export const SWIPE_VELOCITY = 0.11;
export const TOAST_ICONS: Partial<Record<ToastType, string>> = { success: "check", info: "notifications", warning: "warning", error: "warning" };

interface Queue {
  toasters: Set<Listener>;
  fallbacks: Set<Listener>;
  lastId: number;
  mountFallback?: () => void;
}

const QUEUE = Symbol.for("design-system-1.toasts");

function queue(): Queue {
  const scope = globalThis as unknown as Record<symbol, Queue | undefined>;
  return (scope[QUEUE] ??= { toasters: new Set(), fallbacks: new Set(), lastId: 0 });
}

export function listenForToasts(listener: Listener, { fallback = false }: { fallback?: boolean } = {}): () => void {
  const listeners = fallback ? queue().fallbacks : queue().toasters;
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function toasterListening(): boolean {
  const state = queue();
  return state.toasters.size > 0 || state.fallbacks.size > 0 || !!state.mountFallback || (typeof customElements !== "undefined" && !!customElements.get("ds-toast"));
}

export function setFallbackToaster(mount: () => void): void {
  queue().mountFallback = mount;
}

function show(title: string, type: ToastType, options: ToastOptions = {}): ToastId {
  const state = queue();
  const id = options.id ?? ++state.lastId;
  if (!state.toasters.size && typeof document !== "undefined" && document.body) {
    if (typeof customElements !== "undefined" && customElements.get("ds-toast")) document.body.appendChild(document.createElement("ds-toast"));
    else if (!state.fallbacks.size) state.mountFallback?.();
  }
  const important = options.important ?? (type === "error" ? true : undefined);
  const data: ToastData = { ...options, ...(important === undefined ? {} : { important }), id, title, type };
  for (const listener of Array.from(state.toasters.size ? state.toasters : state.fallbacks)) listener({ toast: data });
  if (type === "error" && options.failure) reportFailure(options.failure);
  return id;
}

export const toast = Object.assign(
  (title: string, options?: ToastOptions): ToastId => show(title, "default", options),
  {
    message: (title: string, options?: ToastOptions): ToastId => show(title, "default", options),
    success: (title: string, options?: ToastOptions): ToastId => show(title, "success", options),
    info: (title: string, options?: ToastOptions): ToastId => show(title, "info", options),
    warning: (title: string, options?: ToastOptions): ToastId => show(title, "warning", options),
    error: (title: string, options?: ToastOptions): ToastId => show(title, "error", options),
    loading: (title: string, options?: ToastOptions): ToastId => show(title, "loading", options),
    promise<T>(promise: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>): ToastId {
      const { loading, success, error, finally: done, ...options } = messages;
      const id = show(loading, "loading", options);
      Promise.resolve(typeof promise === "function" ? promise() : promise)
        .then(
          value => { show(typeof success === "function" ? success(value) : success, "success", { ...options, id }); },
          reason => { show(typeof error === "function" ? error(reason) : error, "error", { ...options, id, ...(options.failure ? { failure: { ...options.failure, error: reason } } : {}) }); },
        )
        .finally(() => done?.());
      return id;
    },
    dismiss(id?: ToastId): ToastId | undefined {
      const state = queue();
      for (const listener of [...state.toasters, ...state.fallbacks]) listener({ dismiss: id });
      return id;
    },
  },
);
