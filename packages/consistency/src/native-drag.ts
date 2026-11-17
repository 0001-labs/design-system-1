import { parseBlocks, sidePlacement } from '../../../website/src/vendor/aa/aa';
import { componentDefinition, type NativeComponents } from '../../../shared/consistency-components';
import { isNativeSection, type NativeBlock, type NativeContent, type NativeSection } from '../../../shared/consistency-native-page';
import type { EditorSurface } from './editor-surface';
import { itemLabel, itemsSlot, sectionValue, soleColumnBlock, type NativeEntry } from './native-page-model';
import type { SortableController, SortableResult } from './vendor/drag/sortable';

export interface NativeDragPage {
  doc: Document;
  view: Window;
  root: HTMLElement;
  guides: HTMLElement;
  surface: EditorSurface;
  active(): boolean;
  entries(): Map<string, NativeEntry>;
  element(id: string): HTMLElement | undefined;
  items(): ReadonlyMap<string, { section: string; index: number }>;
  section(id: string): NativeSection | undefined;
  components(): NativeComponents | undefined;
  label(block: NativeBlock): string;
  selection(): ReadonlySet<string>;
  whole(): string | undefined;
  select(ids: Set<string>): void;
  moveBlock(id: string, parent: string, before: string | undefined): string;
  moveBlocks(ids: string[], parent: string, before: string | undefined): void;
  moveItem(section: string, from: number, to: number): void;
  placeBeside(id: string, target: string, at: 'start' | 'end'): void;
  holdWriting(id: string): () => void;
  hold(): void;
  release(): void;
  redraw(): void;
}

const CONTAINER_TAGS = ['div', 'section', 'main', 'article', 'aside', 'nav', 'header', 'footer', 'ds-card', 'ds-carousel', 'ds-row', 'ds-page', 'ds-bento', 'ds-panel', 'ds-container', 'ds-grid'];
const EDITOR_MARKS = ['data-selectable', 'data-selected', 'data-composition-selected', 'data-selection-face', 'data-c9y-broken'];
const NEVER_DRAGS = '[data-editor-chrome],.aa-controls,.aa-menu,.aa-sheet,ds-context,input,textarea,select,summary';
const WRITING = 'aa-editor,[contenteditable]:not([contenteditable="false"])';

export const isCarouselTrack = (element?: HTMLElement) => !!element && (element.localName === 'ds-carousel' || element.classList.contains('ds-carousel__track'));

const inDocumentOrder = (a: HTMLElement, b: HTMLElement) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

export class NativeDrag {
  private sort: SortableController;
  private sorts = new Map<string, { parent: string; element: HTMLElement; lead?: string; dispose(): void }>();
  private containers = new Map<string, { axis: string; element: HTMLElement; dispose(): void }>();
  private carried?: { id: string; parent: string; ids: string[]; rects: DOMRect[]; scrollX: number; scrollY: number };
  private pointer?: { x: number; y: number };
  private beside?: { id: string; at: 'start' | 'end' };
  private sideLine: HTMLElement;
  private folded?: HTMLElement;
  private group?: { ids: string[]; carrier: HTMLElement; places: { element: HTMLElement; parent: Node; next: Node | null }[]; dispose(): void };
  private releaseWriting?: () => void;

  constructor(private page: NativeDragPage) {
    this.sideLine = page.doc.createElement('div');
    this.sideLine.className = 'aa-drop-line aa-drop-side';
    this.sideLine.hidden = true;
    page.guides.append(this.sideLine);
    this.sort = page.surface.sortable({
      lockAxis: undefined,
      onBeforeCapture: ({ draggableId }) => this.beforeLift(draggableId),
      onPreview: preview => this.dress(preview),
      onDragStart: ({ draggableId }) => this.lifted(draggableId),
      prepareDrop: result => this.drop(result),
      onDragEnd: () => { page.release(); this.unfold(); this.clear(); this.giveWritingBack(); page.redraw(); },
    });
    page.doc.addEventListener('pointermove', this.moved, true);
    page.view.addEventListener('scroll', this.scrolled, true);
    page.view.addEventListener('pointerup', this.pressOver, true);
    page.view.addEventListener('pointercancel', this.pressOver, true);
  }
  private pressOver = () => { if (!this.sort.isDragging()) this.giveWritingBack(); };
  private giveWritingBack() { this.releaseWriting?.(); this.releaseWriting = undefined; }

  has(id: string) { return this.sorts.has(id); }
  isDragging() { return this.sort.isDragging(); }
  cancel() { this.sort.cancel(); }
  destroy() {
    this.page.doc.removeEventListener('pointermove', this.moved, true);
    this.page.view.removeEventListener('scroll', this.scrolled, true);
    this.page.view.removeEventListener('pointerup', this.pressOver, true);
    this.page.view.removeEventListener('pointercancel', this.pressOver, true);
    this.giveWritingBack();
    this.sort.destroy();
    this.sideLine.remove();
  }

  bind() {
    const { page } = this, entries = page.entries(), items = page.items(), whole = page.whole();
    const carousel = (id: string) => isCarouselTrack(page.element(id));
    const carouselCard = (id: string) => { for (let entry = entries.get(id); entry; entry = entries.get(entry.parent)) if (carousel(entry.parent)) return entry.block.id; };
    const draggable = (id: string) => {
      const entry = entries.get(id), block = entry?.block, element = page.element(id);
      return !!entry && !!block && !!element && !block.hidden && block.kind !== 'text'
        && soleColumnBlock(entries, entry.parent)?.block.id !== id
        && (!carouselCard(id) || carouselCard(id) === id)
        && !(whole && whole !== id && page.element(whole)?.contains(element))
        && !(block.kind === 'component' && ['inline', 'contents', 'none'].includes(page.view.getComputedStyle(element).display));
    };
    const parentOf = (id: string) => entries.get(id)?.parent ?? (items.has(id) ? `items:${items.get(id)!.section}` : undefined);
    for (const [id, item] of this.sorts) {
      if (parentOf(id) !== item.parent || page.element(id) !== item.element || entries.has(id) && (!draggable(id) || item.lead !== soleColumnBlock(entries, id)?.block.id)) { item.dispose(); this.sorts.delete(id); }
    }
    const parents = new Map<string, { element: HTMLElement; axis: 'horizontal' | 'vertical'; type: string; label: string }>([['page', { element: page.root, axis: 'vertical', type: 'native-block', label: 'Page' }]]);
    for (const [id, { block }] of entries) {
      if (carouselCard(id)) continue;
      const element = page.element(id);
      if (!element) continue;
      if ('children' in block && (block.kind !== 'component' || CONTAINER_TAGS.includes(componentDefinition(block.name, page.components())?.tag ?? ''))) {
        parents.set(id, {
          element: block.kind === 'flow' && block.disclosure ? element.querySelector<HTMLElement>(':scope>.c9y-native-disclosure')! : element,
          axis: carousel(id) ? 'horizontal' : this.axis(element, block), type: carousel(id) ? `carousel:${id}` : 'native-block', label: page.label(block),
        });
      }
      if (isNativeSection(block) && itemsSlot(block.kind) && !(block.kind === 'list' && sectionValue<boolean>(block, 'grouped'))) {
        const container = block.kind === 'footer' ? element.querySelector<HTMLElement>(':scope>.ds-footer__columns') : element;
        if (container) parents.set(`items:${id}`, { element: container, axis: ['questions', 'list'].includes(block.kind) ? 'vertical' : 'horizontal', type: `items:${id}`, label: page.label(block) });
      }
    }
    for (const [id, item] of this.containers) {
      if (!parents.has(id) || parents.get(id)!.axis !== item.axis || parents.get(id)!.element !== item.element) { item.dispose(); this.containers.delete(id); }
    }
    for (const [id, parent] of parents) {
      if (this.containers.has(id)) continue;
      this.containers.set(id, { axis: parent.axis, element: parent.element, dispose: this.sort.container({
        id, type: parent.type, element: parent.element, axis: parent.axis, label: parent.label, lockAxis: parent.type.startsWith('carousel:') ? 'x' : undefined,
        isDropDisabled: () => !!this.carried && (id === this.carried.id || !!page.element(this.carried.id)?.contains(parent.element)),
      }) });
    }
    const canDrag = ({ target }: { target: Element | null }) => page.active() && !page.root.hasAttribute('data-pointer-additive') && !!target && !target.closest(NEVER_DRAGS);
    for (const [id, entry] of entries) {
      if (!draggable(id) || this.sorts.has(id)) continue;
      const element = page.element(id)!, sole = soleColumnBlock(entries, id), lead = sole ?? entry, inCarousel = carousel(entry.parent);
      const writing = lead.block.kind === 'component' || lead.block.kind === 'link' || lead.block.kind === 'content';
      const manyBlocks = () => lead.block.kind === 'content' && parseBlocks((page.entries().get(lead.block.id)?.block as NativeContent | undefined)?.source ?? '').length > 1;
      this.sorts.set(id, { parent: entry.parent, element, lead: sole?.block.id, dispose: this.sort.item({
        id, type: inCarousel ? `carousel:${entry.parent}` : 'native-block', element, label: page.label(entry.block), allowInteractive: true,
        canDrag: by => {
          const mine = canDrag(by)
            && (!inCarousel || !by.target?.closest(WRITING))
            && (inCarousel || writing || page.selection().has(id) || !by.target?.closest('aa-editor,[contenteditable],button,a'))
            && !(manyBlocks() && by.target?.closest('aa-editor'));
          if (mine && lead.block.kind === 'content' && by.input !== 'keyboard') { this.giveWritingBack(); this.releaseWriting = page.holdWriting(lead.block.id); }
          return mine;
        },
        ...(writing && !inCarousel ? { text: { hold: () => 400, axis: 'y' as const } } : {}),
      }) });
    }
    for (const [id, item] of items) {
      const element = page.element(id), type = `items:${item.section}`;
      if (!element || this.sorts.has(id) || !parents.has(type)) continue;
      this.sorts.set(id, { parent: type, element, dispose: this.sort.item({ id, type, element, label: itemLabel(page.section(item.section)!.kind), canDrag }) });
    }
  }

  private axis(element: HTMLElement, block: NativeBlock): 'horizontal' | 'vertical' {
    const boxes = [...element.children].filter(child => child.hasAttribute('data-c9y-block') && !child.hasAttribute('hidden')).map(child => child.getBoundingClientRect()).filter(box => box.width > 0 && box.height > 0);
    if (boxes.length > 1) {
      const [a, b] = boxes;
      if (b.top >= a.bottom - 1) return 'vertical';
      if (b.left >= a.right - 1 && Math.abs(a.top - b.top) < Math.min(a.height, b.height)) return 'horizontal';
    }
    const css = this.page.view.getComputedStyle(element);
    return block.kind === 'flow' && block.direction === 'row' || css.display.includes('flex') && css.flexDirection.startsWith('row') ? 'horizontal' : 'vertical';
  }

  private home(id: string): string | undefined {
    for (let element = this.page.element(id)?.parentElement; element; element = element.parentElement) {
      for (const [key, container] of this.containers) if (!key.startsWith('items:') && container.element === element) return key;
    }
    return undefined;
  }

  private before(parent: string, index: number, carried: string[]): string | undefined {
    const entries = this.page.entries();
    const siblings = [...this.sorts.keys()].filter(key => !carried.includes(key) && entries.has(key) && this.home(key) === parent)
      .sort((a, b) => inDocumentOrder(this.page.element(a)!, this.page.element(b)!));
    let before: string | undefined = siblings[Math.max(0, index)], anchor = before ? entries.get(before) : undefined;
    while (anchor && anchor.parent !== parent) { before = anchor.parent; anchor = entries.get(before); }
    return before;
  }

  private beforeLift(id: string) {
    const element = this.page.element(id);
    if (element && soleColumnBlock(this.page.entries(), id)) { element.style.alignSelf = 'flex-start'; this.folded = element; }
    this.fold(id);
  }

  private fold(id: string) {
    const { page } = this, entries = page.entries(), parent = entries.get(id)?.parent, selection = page.selection();
    if (!parent || parent.startsWith('items:') || selection.size < 2 || !selection.has(id) || isCarouselTrack(page.element(parent))) return;
    const ids = [...selection];
    if (ids.some(key => entries.get(key)?.parent !== parent || !this.sorts.has(key) || !page.element(key)?.isConnected)) return;
    const elements = ids.map(key => page.element(key)!).sort(inDocumentOrder);
    const places = elements.map(element => ({ element, parent: element.parentNode!, next: element.nextSibling })), list = page.view.getComputedStyle(elements[0].parentElement!);
    const carrier = page.doc.createElement('div');
    carrier.setAttribute('data-drag-group', '');
    if (/flex|grid/.test(list.display)) Object.assign(carrier.style, { display: 'flex', flexDirection: 'column', gap: list.rowGap });
    elements[0].before(carrier);
    carrier.append(...elements);
    for (const key of ids) { this.sorts.get(key)?.dispose(); this.sorts.delete(key); }
    this.group = {
      ids: elements.map(element => ids.find(key => page.element(key) === element)!), carrier, places,
      dispose: this.sort.item({ id, type: 'native-block', element: carrier, label: `${ids.length} blocks`, allowInteractive: true }),
    };
  }

  private unfold(): string[] | undefined {
    const group = this.group;
    if (!group) return undefined;
    this.group = undefined;
    group.dispose();
    for (const { element, parent, next } of [...group.places].reverse()) parent.insertBefore(element, next && next.parentNode === parent ? next : null);
    group.carrier.remove();
    return group.ids;
  }

  private dress(preview: HTMLElement) {
    for (const element of [preview, ...preview.querySelectorAll<HTMLElement>(EDITOR_MARKS.map(mark => `[${mark}]`).join(','))]) {
      for (const mark of EDITOR_MARKS) element.removeAttribute(mark);
    }
    for (const chrome of preview.querySelectorAll('[data-editor-chrome]')) chrome.remove();
    if (!this.group) return;
    const badge = this.page.doc.createElement('span');
    badge.className = 'c9y-drag-count';
    badge.textContent = String(this.group.ids.length);
    badge.setAttribute('aria-hidden', 'true');
    preview.append(badge);
  }

  private lifted(id: string) {
    const { page } = this;
    page.hold();
    if (!this.group) page.select(new Set([id]));
    const entries = page.entries(), entry = entries.get(id);
    if (!entry) return;
    const ids = [...entries].filter(([key, value]) => value.parent === entry.parent && this.sorts.has(key)).map(([key]) => key);
    this.carried = { id, parent: entry.parent, ids, rects: ids.map(key => page.element(key)!.getBoundingClientRect()), scrollX: page.view.scrollX, scrollY: page.view.scrollY };
  }

  private drop(result: SortableResult): HTMLElement | null {
    const { page } = this, { destination } = result;
    page.release();
    let landed = result.draggableId;
    try {
      if (destination?.droppableId === result.source.droppableId
        && destination.index === result.source.index
        && isCarouselTrack(page.element(destination.droppableId))) return page.element(landed) ?? null;
      const group = this.unfold();
      if (group) {
        if (destination) page.moveBlocks(group, destination.droppableId, this.before(destination.droppableId, destination.index, group));
        return page.element(group[0]) ?? null;
      }
      const item = page.items().get(result.draggableId);
      if (item) { if (destination) page.moveItem(item.section, item.index, destination.index); }
      else if (this.beside && destination?.droppableId === result.source.droppableId) page.placeBeside(result.draggableId, this.beside.id, this.beside.at);
      else if (destination) landed = page.moveBlock(result.draggableId, destination.droppableId, this.before(destination.droppableId, destination.index, [result.draggableId]));
      if (landed !== result.draggableId) page.select(new Set([landed]));
      return page.element(landed) ?? null;
    } finally {
      this.clear();
    }
  }

  private moved = (event: PointerEvent) => {
    if (!this.carried) return;
    this.pointer = { x: event.clientX, y: event.clientY };
    if (isCarouselTrack(this.page.element(this.carried.parent))) event.stopPropagation();
    this.side();
  };
  private scrolled = () => { if (this.carried) this.side(); };

  private side() {
    const carry = this.carried, point = this.pointer, { view } = this.page;
    if (!carry || !point || this.group || isCarouselTrack(this.page.element(carry.parent))) { this.beside = undefined; this.sideLine.hidden = true; return; }
    const dx = carry.scrollX - view.scrollX, dy = carry.scrollY - view.scrollY;
    const rects = carry.rects.map(rect => ({ left: rect.left + dx, right: rect.right + dx, top: rect.top + dy, bottom: rect.bottom + dy, width: rect.width, height: rect.height }));
    const result = sidePlacement(rects, carry.ids.indexOf(carry.id), point, 20);
    this.beside = result ? { id: carry.ids[result.index], at: result.at } : undefined;
    this.sideLine.hidden = !result;
    if (result) Object.assign(this.sideLine.style, { left: `${result.rect.left}px`, top: `${result.rect.top}px`, height: `${result.rect.height}px` });
  }

  private clear() {
    this.carried = undefined;
    this.pointer = undefined;
    this.beside = undefined;
    this.sideLine.hidden = true;
    this.folded?.style.removeProperty('align-self');
    this.folded = undefined;
  }
}
