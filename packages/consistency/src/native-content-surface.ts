import { AaEditorElement, defineAaEditor, parseBlocks } from '../../../website/src/vendor/aa/aa';
import { createSurfaceElement } from './editor-surface';
import { createPreviewEditorOptions } from './aa';
import { TextSpacingLayer } from './text-spacing';
import { ColumnSpacingLayer } from './column-spacing';
import { CardSpacingLayer } from './card-spacing';
import { ResizingLayer } from './resize';
import type { EditorMedia } from './media';
import { applyProseLook, createProseProbe } from './prose-look';
defineAaEditor();

export interface NativeContentValue { source: string; gaps?: Record<string, number> }
export class NativeContentSurface {
  readonly host: AaEditorElement;
  private preview: Record<string, number> = {};
  private historyEditor: AaEditorElement['editor'];
  private spacing: TextSpacingLayer;
  private columns: ColumnSpacingLayer;
  private cards: CardSpacingLayer;
  private resizing: ResizingLayer;
  private observer: MutationObserver;
  private dirtyField = false;
  private probe: HTMLElement;
  private stage: HTMLElement;
  private lookDue = true;
  get pending() { return this.dirtyField; }
  constructor(private element: HTMLElement, readonly id: string, private options: {
    read(): NativeContentValue; commit(value: NativeContentValue): void;
    undo(): boolean; redo(): boolean; enabled(): boolean; select(id: string): void;
    media: EditorMedia; imageURL(source: string): string; error(message: string): void;
  }) {
    const host = this.host = createSurfaceElement(element.ownerDocument, 'aa-editor') as AaEditorElement;
    host.dataset.editorKey = id; host.setAttribute('aria-label', 'Page content');
    element.classList.add('consistency-site-region', 'consistency-sheet', 'consistency-text-bounds', 'production-on');
    element.style.setProperty('--u', 'calc(20px * var(--sf,1))');
    const optionsAa = createPreviewEditorOptions(() => host, options.error, options.media);
    host.options = { ...optionsAa, atoms: optionsAa.atoms, comments: undefined, value: options.read().source, reordering: parseBlocks(options.read().source).length>1, placing: true };
    host.value = options.read().source;
    host.addEventListener('input', this.input);
    const stage = this.stage = element.ownerDocument.createElement('div'); stage.className = 'c9y-native-region consistency-sheet consistency-text-bounds';
    this.probe = createProseProbe(element.ownerDocument);
    element.replaceChildren(stage); stage.append(host, this.probe); this.look();
    element.ownerDocument.defaultView?.addEventListener('resize', this.relook);
    const controls = { enabled: options.enabled, value: (key: string, fallback: number) => this.preview[key] ?? options.read().gaps?.[key] ?? fallback,
      select: options.select, preview: (key: string, value: number) => { this.preview[key] = value; this.refresh(); },
      commit: (key: string, value: number) => { this.preview = {}; options.commit({ ...options.read(), gaps: { ...options.read().gaps, [key]: value } }); },
      cancel: () => { this.preview = {}; this.refresh(); } };
    this.spacing = new TextSpacingLayer(element, controls);
    this.columns = new ColumnSpacingLayer(element, controls);
    this.cards = new CardSpacingLayer(element, { enabled: options.enabled, consistency: () => false, gaps: () => ({}), commit: () => {} });
    this.resizing = new ResizingLayer(element, { enabled: options.enabled, consistency: () => false, size: () => undefined, commit: () => {} });
    this.observer = new MutationObserver(this.mapImages); this.observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    queueMicrotask(() => this.refresh());
  }
  private input = (event: Event) => {
    const target = event.target as Element;
    if (target === this.host) this.dirtyField = false;
    else if (target.closest?.('.consistency-content-element')) this.dirtyField = true;
    this.options.commit({ ...this.options.read(), source: this.host.value });
  };
  private look() { if (this.lookDue && applyProseLook(this.probe, this.stage)) this.lookDue = false; }
  private relook = () => { this.lookDue = true; this.look(); };
  private mapImages = () => {
    for (const image of this.host.querySelectorAll<HTMLImageElement>('img')) { const source = image.getAttribute('src') ?? '', resolved = this.options.imageURL(source); if (resolved !== source) image.src = resolved; }
    for (const [index, block] of [...this.host.querySelectorAll<HTMLElement>(':scope > .aa-block')].entries()) block.dataset.selectable = `text:${this.id}:${index}`;
  };
  refresh() {
    this.look();
    if (this.host.editor && this.host.editor !== this.historyEditor) { this.historyEditor = this.host.editor; this.host.editor.setHistoryProvider({ undo: this.options.undo, redo: this.options.redo }); }
    const source = this.options.read().source; if (this.host.value !== source) this.host.value = source;
    if(this.host.editor)this.host.editor.reordering=parseBlocks(source).length>1;
    this.spacing.refresh(); this.columns.refresh(); this.cards.refresh(); this.resizing.refresh(); this.mapImages();
  }
  focus() { this.host.focus(); }
  destroy() { this.element.ownerDocument.defaultView?.removeEventListener('resize', this.relook); this.observer.disconnect(); this.spacing.destroy(); this.columns.destroy(); this.cards.destroy(); this.resizing.destroy(); this.host.removeEventListener('input', this.input); this.host.remove(); }
}
