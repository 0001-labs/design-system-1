import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { message } from '../../../../DS1/2-core/ds-message';
import '../../../../DS1/0-face/toaster';
import { SiteApiError } from './api';

export class KeepCurrent implements ReactiveController {
  private running: Promise<void> | null = null;
  private again = false;
  private retry: ReturnType<typeof setTimeout> | undefined;
  private readonly seen = new MutationObserver(() => { if (!this.host.hidden) void this.run(); });
  private readonly onFocus = () => { if (this.host.isConnected && !this.host.hidden && document.visibilityState === 'visible') void this.run(); };
  constructor(private readonly host: ReactiveControllerHost & HTMLElement, private readonly read: () => Promise<boolean>) { host.addController(this); }
  hostConnected() {
    this.seen.observe(this.host, { attributes: true, attributeFilter: ['hidden'] });
    addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onFocus);
    void this.run();
  }
  hostDisconnected() {
    this.seen.disconnect();
    removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onFocus);
    clearTimeout(this.retry);
  }
  run(): Promise<void> {
    if (this.running) { this.again = true; return this.running; }
    clearTimeout(this.retry);
    this.running = this.read().catch(() => false).then(read => {
      this.running = null;
      if (this.again) { this.again = false; void this.run(); }
      else if (!read && this.host.isConnected) this.retry = setTimeout(this.onFocus, RETRY);
    });
    return this.running;
  }
}
export const RETRY = 15_000;

export type Tone = 'success' | 'warning' | 'danger' | 'muted' | 'accent';
export const toneStyle = (tone: Tone) => tone === 'muted' ? '' : `--ds-tag-accent: var(--ds-${tone === 'accent' ? 'accent' : tone}-color)`;

export function failed(error: unknown, what: string): string {
  if (error instanceof SiteApiError) {
    if (error.status === 401 || error.status === 403) return error.message;
    if (error.code) return `${what}: the site answered “${error.code}”.`;
  }
  return `${what}: the site could not be reached.`;
}

export const say = (words: string, tone: 'default' | 'error' = 'default') => tone === 'error' ? message.error(words) : message(words);
