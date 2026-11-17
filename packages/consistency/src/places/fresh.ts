export function readWhenShown(element: HTMLElement, read: () => void): () => void {
  const shown = () => element.isConnected && !element.hidden && document.visibilityState !== 'hidden';
  const again = () => { if (shown()) read(); };
  const hidden = new MutationObserver(() => { if (!element.hidden) again(); });
  hidden.observe(element, { attributes: true, attributeFilter: ['hidden'] });
  addEventListener('focus', again);
  document.addEventListener('visibilitychange', again);
  return () => { hidden.disconnect(); removeEventListener('focus', again); document.removeEventListener('visibilitychange', again); };
}

export const kept = {
  read<T>(key: string): T | undefined { try { const value = localStorage.getItem(key); return value === null ? undefined : JSON.parse(value) as T; } catch { return undefined; } },
  write(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
};
