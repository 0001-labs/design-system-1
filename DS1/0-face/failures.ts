export interface Failure {
  code: string;
  message: string;
  error?: unknown;
  stack?: string;
}
export const FAILURE_EVENT = "ds-failure";
const PENDING = Symbol.for("design-system-1.pending-failures");

export function reportFailure(failure: Failure): void {
  if (typeof window === "undefined" || typeof failure?.code !== "string" || typeof failure.message !== "string" || !/^[a-z][a-z0-9_.-]{0,79}$/.test(failure.code) || !failure.message.trim()) return;
  const source = failure.error instanceof Error ? failure.error : new Error();
  const stack = (failure.stack ?? source.stack ?? "").split("\n")
    .filter(line => /^\s*at\s/.test(line) || /@.*:\d+/.test(line))
    .slice(0, 8).join("\n").trim().slice(0, 500);
  const detail = { code: failure.code, message: failure.message.trim().slice(0, 200), ...(stack ? { stack } : {}) };
  if (window.dispatchEvent(new CustomEvent<Failure>(FAILURE_EVENT, { detail, cancelable: true }))) {
    const scope = globalThis as unknown as Record<symbol, Failure[] | undefined>;
    const pending = scope[PENDING] ??= [];
    pending.push(detail);
    if (pending.length > 20) pending.shift();
  }
}
