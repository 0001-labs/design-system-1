import { html, type ReactiveController, type ReactiveControllerHost } from 'lit';

export const snapColumn = (width: number, unit: number, minimum = 2 * unit) => Math.max(minimum, Math.round(width / unit) * unit);
export interface ColumnResizeDetail { widths: number[] }
/** Shared table interaction for native tables and product-owned grid rows. Widths are CSS pixels; emitted widths are squares. */
export class TableColumns implements ReactiveController {
  widths: number[] = [];
  private observer?: ResizeObserver;
  private watched?: HTMLElement;
  private content?: HTMLElement;
  private frame = 0;
  private resizeFrame = 0;
  private drag?: { pointer: number; index: number; start: number; before: number[]; unit: number; minimum: number; rtl: boolean };
  constructor(private host: ReactiveControllerHost & Pick<HTMLElement, 'dispatchEvent'>, private options: {
    scroller: () => HTMLElement | null;
    headers: () => HTMLElement[];
    apply: (widths: number[]) => void;
    minimum?: (index: number, unit: number) => number;
  }) { host.addController(this); }
  hostUpdated() {
    const scroller = this.options.scroller(), content = scroller?.firstElementChild as HTMLElement | null;
    if (scroller !== this.watched || content !== this.content) {
      this.disconnect();
      this.watched = scroller ?? undefined; this.content = content ?? undefined;
      scroller?.addEventListener('scroll', this.measure, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(this.measure);
        if (scroller) this.observer.observe(scroller);
        if (content) this.observer.observe(content);
      }
    }
    if (this.widths.length) this.options.apply(this.widths);
    this.measure();
  }
  hostDisconnected() { this.disconnect(); if (this.drag) this.widths = this.drag.before; this.drag = undefined; this.watched = undefined; this.content = undefined; }
  private disconnect() {
    this.observer?.disconnect(); this.watched?.removeEventListener('scroll', this.measure);
    cancelAnimationFrame(this.frame); this.frame = 0;
    cancelAnimationFrame(this.resizeFrame); this.resizeFrame = 0;
  }
  private measure = () => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      const viewport = this.watched, content = this.content;
      if (!viewport || !content) return;
      const box = viewport.getBoundingClientRect(), inner = content.getBoundingClientRect();
      const left = inner.left < box.left - 1, right = inner.right > box.left + viewport.clientWidth + 1;
      const edge = left && right ? 'both' : left ? 'left' : right ? 'right' : '';
      if (viewport.dataset.dsTableEdge !== edge) viewport.dataset.dsTableEdge = edge;
      const bottom = viewport.lastElementChild?.getBoundingClientRect().bottom ?? inner.bottom;
      const handles = [...viewport.querySelectorAll<HTMLElement>('.ds-table-column-resize')];
      const heights = handles.map(handle => `${Math.max(0, bottom - handle.getBoundingClientRect().top)}px`);
      handles.forEach((handle, i) => {
        if (handle.style.getPropertyValue('--ds-table-resize-height') !== heights[i]) handle.style.setProperty('--ds-table-resize-height', heights[i]!);
      });
    });
  };
  handle(index: number, label: string) {
    return html`<span class="ds-table-column-resize" role="separator" aria-orientation="vertical" tabindex="0"
      aria-label=${`Resize ${label} column`} aria-valuemin="0" aria-valuemax="100000" aria-valuenow=${Math.round(this.widths[index] ?? 0)} aria-valuetext=${this.widths[index] ? `${Math.round(this.widths[index]!)} pixels` : 'Automatic width'}
      @click=${(e: Event) => e.stopPropagation()}
      @pointerdown=${(e: PointerEvent) => this.start(e, index, label)} @pointermove=${this.move} @pointerup=${this.end} @pointercancel=${this.cancel} @lostpointercapture=${this.cancel}
      @keydown=${(e: KeyboardEvent) => this.key(e, index, label)}></span>`;
  }
  private metrics(handle: HTMLElement, label: string, index: number) {
    const unit = handle.getBoundingClientRect().width || 20;
    const font = getComputedStyle(this.options.headers()[0] ?? handle);
    const canvas = document.createElement('canvas').getContext('2d');
    if (canvas) canvas.font = font.font || `${font.fontSize} ${font.fontFamily}`;
    const minimum = Math.max(this.options.minimum?.(index, unit) ?? 0, 2 * unit, Math.ceil(((canvas?.measureText(label).width ?? label.length * 8) + unit) / unit) * unit);
    return { unit, minimum, rtl: getComputedStyle(handle).direction === 'rtl' };
  }
  private initial(unit: number) { return this.options.headers().map((header, i) => snapColumn(this.widths[i] ?? header.getBoundingClientRect().width, unit)); }
  private start(e: PointerEvent, index: number, label: string) {
    if (e.button !== 0 || this.drag) return;
    e.preventDefault(); e.stopPropagation();
    const handle = e.currentTarget as HTMLElement, metrics = this.metrics(handle, label, index);
    this.widths = this.initial(metrics.unit);
    this.drag = { pointer: e.pointerId, index, start: e.clientX, before: [...this.widths], ...metrics };
    handle.focus({ preventScroll: true, focusVisible: false } as FocusOptions); handle.setPointerCapture(e.pointerId); handle.dataset.resizing = '';
  }
  private move = (e: PointerEvent) => {
    const d = this.drag; if (!d || e.pointerId !== d.pointer) return;
    this.widths[d.index] = Math.max(d.minimum, d.before[d.index]! + (e.clientX - d.start) * (d.rtl ? -1 : 1));
    if (!this.resizeFrame) this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = 0;
      this.options.apply(this.widths); this.measure();
    });
  };
  private finish(handle: HTMLElement, cancelled: boolean) {
    const d = this.drag; if (!d) return;
    this.drag = undefined;
    cancelAnimationFrame(this.resizeFrame); this.resizeFrame = 0;
    this.widths = cancelled ? d.before : this.widths.map((w, i) => snapColumn(w, d.unit, i === d.index ? d.minimum : 2 * d.unit));
    delete handle.dataset.resizing;
    handle.blur();
    if (handle.hasPointerCapture?.(d.pointer)) handle.releasePointerCapture(d.pointer);
    this.options.apply(this.widths); this.host.requestUpdate(); this.measure();
    if (!cancelled) this.emit(d.unit);
  }
  private end = (e: PointerEvent) => { if (this.drag?.pointer === e.pointerId) this.finish(e.currentTarget as HTMLElement, false); };
  private cancel = (e: PointerEvent) => { if (this.drag?.pointer === e.pointerId) this.finish(e.currentTarget as HTMLElement, true); };
  private key(e: KeyboardEvent, index: number, label: string) {
    if (e.key === 'Escape' && this.drag) { e.preventDefault(); e.stopPropagation(); this.finish(e.currentTarget as HTMLElement, true); return; }
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const { unit, minimum, rtl } = this.metrics(e.currentTarget as HTMLElement, label, index);
    this.widths = this.initial(unit);
    this.widths[index] = snapColumn(this.widths[index]! + (e.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1) * (e.shiftKey ? 5 : 1) * unit, unit, minimum);
    this.options.apply(this.widths); this.host.requestUpdate(); this.measure(); this.emit(unit);
  }
  private emit(unit: number) { this.host.dispatchEvent(new CustomEvent<ColumnResizeDetail>('table-columns-resize', { detail: { widths: this.widths.map(w => w / unit) }, bubbles: true, composed: true })); }
}
