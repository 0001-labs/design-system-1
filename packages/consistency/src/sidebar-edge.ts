import { bindSpacingHandle } from '../../app/src/2-core/spacing-handle';
import './sidebar-edge.css';

export type SidebarState = 'open' | 'collapsed';
export const SIDEBAR_KEY = 'consistency-sidebar';
export const FLICK = 0.4;
export const SETTLE_MS = 240;
const CURVE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const BLUR = 6;
const LEAVE_MS = 200;

export function storedSidebar(): SidebarState {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'collapsed' ? 'collapsed' : 'open'; } catch { return 'open'; }
}
function storeSidebar(state: SidebarState) {
  try { localStorage.setItem(SIDEBAR_KEY, state); } catch {}
}

export function settleTarget(x: number, travel: number, velocity: number): SidebarState {
  if (Math.abs(velocity) >= FLICK) return velocity > 0 ? 'open' : 'collapsed';
  return x >= travel / 2 ? 'open' : 'collapsed';
}

export const awayTarget = (away: boolean, stored: SidebarState): SidebarState => away ? 'collapsed' : stored;

export function bezier([x1, y1, x2, y2]: [number, number, number, number]): (t: number) => number {
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  const slope = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * (1 - t) * t + 3 * (1 - b) * t ** 2;
  return progress => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    let t = progress;
    for (let i = 0; i < 6; i++) { const d = slope(x1, x2, t); if (Math.abs(d) < 1e-6) break; t -= (at(x1, x2, t) - progress) / d; }
    if (t < 0 || t > 1 || Math.abs(at(x1, x2, t) - progress) > 1e-4) {
      let low = 0, high = 1; t = progress;
      for (let i = 0; i < 30; i++) { const value = at(x1, x2, t); if (Math.abs(value - progress) < 1e-5) break; if (value < progress) low = t; else high = t; t = (low + high) / 2; }
    }
    return at(y1, y2, t);
  };
}
const ease = bezier(CURVE);

type Pose = { x: number };

export class SidebarEdge {
  readonly handle: HTMLDivElement;
  readonly reveal: HTMLDivElement;
  private state: SidebarState;
  private pose: Pose = { x: 0 };
  private clear = false;
  private gesture: { from: SidebarState; held: boolean; samples: { t: number; x: number }[] } | null = null;
  private frame = 0;
  private leaving = 0;
  private quiet = false;
  private keyboard = false;
  private unbind: (() => void) | null = null;
  private away = false;

  constructor(private readonly host: HTMLElement) {
    this.state = storedSidebar();
    const handle = document.createElement('div');
    handle.className = 'home-edge';
    handle.tabIndex = 0;
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-label', 'Sidebar');
    handle.setAttribute('aria-controls', 'home-nav');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    this.handle = handle;
    const reveal = document.createElement('div');
    reveal.className = 'home-reveal';
    reveal.setAttribute('aria-hidden', 'true');
    this.reveal = reveal;
  }

  get value(): SidebarState { return this.state; }
  get shown(): boolean { return this.host.hasAttribute('data-sidebar-peek'); }

  connect() {
    this.draw();
    this.unbind = bindSpacingHandle(this.handle, () => ({
      value: this.pose.x, min: 0, max: this.travel(), step: this.travel(), immediateKeyboard: true, threshold: 3,
      onPointerStart: () => { this.stop(); this.keyboard = false; },
      onStart: kind => { if (kind === 'pointer') this.begin(); },
      onPreview: x => { if (this.gesture) this.follow(x); },
      onCommit: x => { if (!this.gesture) this.set(x > 0 ? 'open' : 'collapsed'); },
      onEnd: cancelled => { if (this.gesture) this.release(cancelled); },
      onTap: event => this.tap(event),
    }));
    this.handle.addEventListener('keydown', this.onKey);
    this.handle.addEventListener('pointerleave', this.onHandleLeave);
    this.handle.addEventListener('focus', this.onFocus);
    this.reveal.addEventListener('pointerenter', this.onEnter);
    this.reveal.addEventListener('pointerleave', this.onHandleLeave);
    this.reveal.addEventListener('pointerdown', this.onRevealDown);
    this.host.addEventListener('pointerover', this.onOver);
    this.host.addEventListener('pointerout', this.onOut);
    this.host.addEventListener('focusout', this.onFocusOut);
    addEventListener('pointerdown', this.onDown, true);
    addEventListener('keydown', this.onAnyKey, true);
  }

  disconnect() {
    this.stop(); clearTimeout(this.leaving);
    this.unbind?.(); this.unbind = null;
    this.handle.removeEventListener('keydown', this.onKey);
    this.handle.removeEventListener('pointerleave', this.onHandleLeave);
    this.handle.removeEventListener('focus', this.onFocus);
    this.reveal.removeEventListener('pointerenter', this.onEnter);
    this.reveal.removeEventListener('pointerleave', this.onHandleLeave);
    this.reveal.removeEventListener('pointerdown', this.onRevealDown);
    this.host.removeEventListener('pointerover', this.onOver);
    this.host.removeEventListener('pointerout', this.onOut);
    this.host.removeEventListener('focusout', this.onFocusOut);
    removeEventListener('pointerdown', this.onDown, true);
    removeEventListener('keydown', this.onAnyKey, true);
  }

  set(state: SidebarState) {
    this.stop();
    this.state = state;
    if (state === 'open') this.show(false);
    storeSidebar(state);
    this.draw();
  }

  giveWay(on: boolean) {
    if (this.away === on) return;
    this.away = on;
    const target = awayTarget(on, storedSidebar());
    if (target !== this.state) this.settle(target, false, false);
  }

  chosen() { if (this.shown) this.show(false); }

  private unit() { return this.handle.offsetWidth || 20; }
  private travel() { return 12 * this.unit(); }
  private page() { return this.host.querySelector<HTMLElement>(':scope > ds-page'); }
  private nav() { return this.host.querySelector<HTMLElement>(':scope > ds-page > nav.home-nav'); }
  private rest(state: SidebarState): Pose { return { x: state === 'open' ? this.travel() : 0 }; }

  private draw() {
    this.host.setAttribute('data-sidebar', this.state);
    this.host.removeAttribute('data-sidebar-moving');
    this.handle.setAttribute('aria-valuenow', this.state === 'open' ? '100' : '0');
    this.handle.setAttribute('aria-valuetext', this.state === 'open' ? 'Sidebar open' : 'Sidebar folded');
    for (const element of [this.page(), this.nav(), this.handle]) element?.style.removeProperty('transform');
    this.nav()?.style.removeProperty('opacity');
    this.nav()?.style.removeProperty('filter');
    this.clear = false;
    this.pose = this.rest(this.state);
  }

  private place(pose: Pose) {
    this.pose = pose;
    const base = this.state === 'open' ? this.travel() : 0;
    const shift = pose.x - base;
    const covered = Math.min(1, Math.max(0, 1 - pose.x / this.travel()));
    const page = this.page(), nav = this.nav();
    if (page) page.style.transform = `translateX(${shift}px)`;
    if (nav) {
      nav.style.transform = shift ? `translateX(${-shift}px)` : '';
      nav.style.opacity = this.clear ? '1' : String(1 - covered);
      nav.style.filter = this.clear || !covered ? '' : `blur(${(covered * BLUR * this.unit() / 20).toFixed(2)}px)`;
    }
    this.handle.style.transform = `translateX(${shift}px)`;
  }

  private begin() {
    clearTimeout(this.leaving);
    const from = this.state;
    this.gesture = { from, held: from === 'collapsed' && this.shown, samples: [] };
    this.clear = this.gesture.held;
    this.host.setAttribute('data-sidebar-moving', '');
  }

  private follow(x: number) {
    const gesture = this.gesture!;
    const now = performance.now();
    gesture.samples.push({ t: now, x });
    while (gesture.samples.length > 2 && now - gesture.samples[0].t > 80) gesture.samples.shift();
    this.place({ x });
  }

  private release(cancelled: boolean) {
    const gesture = this.gesture!;
    this.gesture = null;
    const first = gesture.samples[0], last = gesture.samples.at(-1);
    const velocity = first && last && last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;
    const target = cancelled ? gesture.from : settleTarget(this.pose.x, this.travel(), velocity);
    if (target === 'collapsed' && gesture.from === 'open') this.quiet = true;
    this.settle(target, target === 'collapsed' && gesture.held);
  }

  private settle(target: SidebarState, shown: boolean, keep = true) {
    this.stop();
    const from = { ...this.pose };
    this.state = target;
    if (keep) storeSidebar(target);
    this.host.setAttribute('data-sidebar', target);
    this.host.toggleAttribute('data-sidebar-peek', target === 'collapsed' && shown);
    this.handle.setAttribute('aria-valuenow', target === 'open' ? '100' : '0');
    this.handle.setAttribute('aria-valuetext', target === 'open' ? 'Sidebar open' : 'Sidebar folded');
    const to = this.rest(target);
    this.clear = target === 'collapsed' && shown;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || from.x === to.x) { this.draw(); return; }
    this.host.setAttribute('data-sidebar-moving', '');
    this.place(from);
    const start = performance.now();
    const step = (now: number) => {
      const progress = ease(Math.min(1, (now - start) / SETTLE_MS));
      this.place({ x: from.x + (to.x - from.x) * progress });
      if (progress < 1) this.frame = requestAnimationFrame(step);
      else { this.frame = 0; this.draw(); }
    };
    this.frame = requestAnimationFrame(step);
  }

  private stop() { if (this.frame) { cancelAnimationFrame(this.frame); this.frame = 0; } }

  private tap(event: PointerEvent) {
    if (event.pointerType === 'touch' && this.state === 'collapsed') { this.settle('collapsed', true); return; }
    const target = this.state === 'open' ? 'collapsed' : 'open';
    if (target === 'collapsed') this.quiet = true;
    this.settle(target, false);
  }

  private show(on: boolean) {
    clearTimeout(this.leaving);
    if (on && (this.state !== 'collapsed' || this.gesture || this.frame)) return;
    this.host.toggleAttribute('data-sidebar-peek', on);
    if (this.state === 'collapsed') this.pose = this.rest('collapsed');
  }

  private leaveSoon() {
    clearTimeout(this.leaving);
    if (!this.shown) return;
    this.leaving = window.setTimeout(() => {
      const nav = this.nav();
      if (this.gesture || this.reveal.matches(':hover') || this.handle.matches(':hover') || nav?.matches(':hover') || nav?.querySelector('[aria-expanded="true"]')) return;
      if (this.keyboard && (nav?.contains(document.activeElement) || document.activeElement === this.handle)) return;
      this.show(false);
    }, LEAVE_MS);
  }

  private inside(node: EventTarget | null) { return node instanceof Node && (this.handle.contains(node) || this.reveal.contains(node) || Boolean(this.nav()?.contains(node))); }

  private readonly onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.set(this.state === 'open' ? 'collapsed' : 'open');
  };
  private readonly onEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || this.quiet || event.buttons) return;
    this.show(true);
  };
  private readonly onHandleLeave = () => { this.quiet = false; this.leaveSoon(); };
  private readonly onRevealDown = (event: PointerEvent) => { if (event.pointerType === 'touch') this.show(true); };
  private readonly onFocus = () => { if (this.keyboard) this.show(true); };
  private readonly onOver = (event: PointerEvent) => { if (this.shown && this.inside(event.target)) clearTimeout(this.leaving); };
  private readonly onOut = (event: PointerEvent) => { if (this.shown && this.inside(event.target) && !this.inside(event.relatedTarget)) this.leaveSoon(); };
  private readonly onFocusOut = (event: FocusEvent) => { if (this.shown && this.keyboard && !this.inside(event.relatedTarget)) this.leaveSoon(); };
  private readonly onDown = (event: PointerEvent) => {
    this.keyboard = false;
    if (this.shown && !event.composedPath().some(node => node === this.handle || node === this.reveal || node === this.nav())) this.show(false);
  };
  private readonly onAnyKey = (event: KeyboardEvent) => {
    this.keyboard = true;
    if (event.key === 'Escape' && this.shown && !this.gesture && !this.nav()?.querySelector('[aria-expanded="true"]')) {
      const within = this.nav()?.contains(document.activeElement);
      this.show(false);
      if (within) this.handle.focus();
    }
  };
}
