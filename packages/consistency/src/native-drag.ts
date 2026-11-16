import { parseBlocks, sidePlacement } from '../../../website/src/vendor/aa/aa';
import { componentDefinition, type NativeComponents } from '../../../shared/consistency-components';
import { isNativeSection, type NativeBlock, type NativeContent, type NativeSection } from '../../../shared/consistency-native-page';
import type { EditorSurface } from './editor-surface';
import { itemLabel, itemsSlot, sectionValue, soleColumnBlock, type NativeEntry } from './native-page-model';
import type { SortableController, SortableResult } from './vendor/drag/sortable';

/*
 * Dragging on a native page: the gesture, and nothing of the document.
 *
 * Drag (vendor/drag) carries an element between lists. This module tells it which of the page's
 * blocks and lists those are, folds a selection into one carrier, shows where a drop beside a
 * block would land, and says what the carried preview looks like. What a drop does to the page is
 * the page's: it is handed over as a place (a list and the block it lands before) through
 * NativeDragPage, and the page's model writes the document.
 */

/** What dragging asks of the page it is on. */
export interface NativeDragPage {
  doc: Document;
  view: Window;
  root: HTMLElement;
  /** The editor's own layer over the page, where the line of a drop beside a block is drawn. */
  guides: HTMLElement;
  surface: EditorSurface;
  active(): boolean;
  entries(): Map<string, NativeEntry>;
  element(id: string): HTMLElement | undefined;
  /** A section's items by their derived ids. */
  items(): ReadonlyMap<string, { section: string; index: number }>;
  section(id: string): NativeSection | undefined;
  components(): NativeComponents | undefined;
  label(block: NativeBlock): string;
  selection(): ReadonlySet<string>;
  /** The block chosen to be carried whole: a press anywhere inside it carries it, not what it holds. */
  whole(): string | undefined;
  select(ids: Set<string>): void;
  /** A block moved into a list, before one of its blocks or last; returns the block that lands. */
  moveBlock(id: string, parent: string, before: string | undefined): string;
  /** Several sibling blocks moved together, in document order. */
  moveBlocks(ids: string[], parent: string, before: string | undefined): void;
  /** A section's item moved to another place in it. */
  moveItem(section: string, from: number, to: number): void;
  /** A block put beside another, the two in a row. */
  placeBeside(id: string, target: string, at: 'start' | 'end'): void;
  /**
   * A press on writing of one block is the page's to carry, so the writing must not carry it too
   * (Aa moves its own blocks): its own movement is held off; call what is returned to give it back.
   */
  holdWriting(id: string): () => void;
  /** A block is carried: the page holds its redraws until it is let go. */
  hold(): void;
  /** The carry is over: the page may draw again. */
  release(): void;
  /** Everything is back in the page: draw it as the document says. */
  redraw(): void;
}

/** The tags a component block may hold other blocks in. */
const CONTAINER_TAGS = ['div', 'section', 'main', 'article', 'aside', 'nav', 'header', 'footer', 'ds-card', 'ds-carousel', 'ds-row', 'ds-page', 'ds-bento', 'ds-panel', 'ds-container', 'ds-grid'];
/** The editor's own marks on a block. A clone of the block is Drag's preview, not a block: it carries none of them. */
const EDITOR_MARKS = ['data-selectable', 'data-selected', 'data-composition-selected', 'data-selection-face', 'data-c9y-broken'];
/** Presses that belong to the editor's controls or to a field, never to a drag. */
const NEVER_DRAGS = '[data-editor-chrome],.aa-controls,.aa-menu,.aa-sheet,ds-context,input,textarea,select,summary';
const WRITING = 'aa-editor,[contenteditable]:not([contenteditable="false"])';

export const isCarouselTrack = (element?: HTMLElement) => !!element && (element.localName === 'ds-carousel' || element.classList.contains('ds-carousel__track'));

const inDocumentOrder = (a: HTMLElement, b: HTMLElement) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

export class NativeDrag {
  private sort: SortableController;
  /** The blocks and items Drag knows, by id. */
  private sorts = new Map<string, { parent: string; element: HTMLElement; lead?: string; dispose(): void }>();
  /** The lists Drag knows, by the id of the block that holds them. */
  private containers = new Map<string, { axis: string; element: HTMLElement; dispose(): void }>();
  /** The block being carried, with its siblings as they stood at the lift. */
  private carried?: { id: string; parent: string; ids: string[]; rects: DOMRect[]; scrollX: number; scrollY: number };
  /** Where the pointer was last seen, for a page that scrolls under it. */
  private pointer?: { x: number; y: number };
  /** The sibling a drop would land beside, in a row with it. */
  private beside?: { id: string; at: 'start' | 'end' };
  private sideLine: HTMLElement;
  /** A column carried for its single block stands at that block's height from the lift. */
  private folded?: HTMLElement;
  /**
   * Several selected siblings move together (drag.selection-together): before the lift is measured they are folded,
   * in document order, into one carrier standing where the first of them stood, spaced as their list spaces them,
   * and the carrier is lifted in the pressed block's place. The room it makes is the room they take together.
   */
  private group?: { ids: string[]; carrier: HTMLElement; places: { element: HTMLElement; parent: Node; next: Node | null }[]; dispose(): void };
  /** Gives the pressed writing its own movement back, once the press or the carry is over. */
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
  /** The press ended without a carry. While a block is carried, the carry's own end gives the writing back, once the drop is committed. */
  private pressOver = () => { if (!this.sort.isDragging()) this.giveWritingBack(); };
  private giveWritingBack() { this.releaseWriting?.(); this.releaseWriting = undefined; }

  /** Whether a block or item can be carried now. */
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

  /** Tells Drag the page's lists and blocks as they are drawn now. Literal words belong to their visible block; layout containers share a drop type so nesting never traps a block. */
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
      // A section's items move inside it: side by side where they stand in columns, down the page where they stand in rows; a grouped list keeps its order by date.
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
        // Never into the carried block itself, nor into anything it holds.
        isDropDisabled: () => !!this.carried && (id === this.carried.id || !!page.element(this.carried.id)?.contains(parent.element)),
      }) });
    }
    // A deliberate canvas press outranks passive hover controls; the controls themselves never start a drag.
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
            // Writing of several blocks reorders its own blocks: Aa carries those.
            && !(manyBlocks() && by.target?.closest('aa-editor'));
          // One press, one carrier: writing the page carries is not carried by Aa as well.
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

  /** The line a list's blocks run along, read from how they stand. */
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

  /** The list a block stands in, as Drag knows it. */
  private home(id: string): string | undefined {
    for (let element = this.page.element(id)?.parentElement; element; element = element.parentElement) {
      for (const [key, container] of this.containers) if (!key.startsWith('items:') && container.element === element) return key;
    }
    return undefined;
  }

  /** The block a drop at this index of a list lands before, among the blocks the list keeps once the carried ones have left; none past its last. */
  private before(parent: string, index: number, carried: string[]): string | undefined {
    const entries = this.page.entries();
    const siblings = [...this.sorts.keys()].filter(key => !carried.includes(key) && entries.has(key) && this.home(key) === parent)
      .sort((a, b) => inDocumentOrder(this.page.element(a)!, this.page.element(b)!));
    let before: string | undefined = siblings[Math.max(0, index)], anchor = before ? entries.get(before) : undefined;
    while (anchor && anchor.parent !== parent) { before = anchor.parent; anchor = entries.get(before); }
    return before;
  }

  /** Before the lift is measured: a column carried for its single block stands at that block's height, the room it makes and where it lands bare. */
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

  /** Puts folded blocks back where they stood; returns their ids in document order. */
  private unfold(): string[] | undefined {
    const group = this.group;
    if (!group) return undefined;
    this.group = undefined;
    group.dispose();
    for (const { element, parent, next } of [...group.places].reverse()) parent.insertBefore(element, next && next.parentNode === parent ? next : null);
    group.carrier.remove();
    return group.ids;
  }

  /**
   * The carried preview is the block as it looks (drag.appearance), not a block of the page: it wears none of the
   * editor's marks, so no selection is painted on it, and a carried selection says how many blocks it holds.
   */
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
    (page.doc.activeElement as HTMLElement | null)?.blur?.();
    page.doc.getSelection()?.removeAllRanges();
    page.hold();
    if (!this.group) page.select(new Set([id]));
    const entries = page.entries(), entry = entries.get(id);
    if (!entry) return;
    const ids = [...entries].filter(([key, value]) => value.parent === entry.parent && this.sorts.has(key)).map(([key]) => key);
    this.carried = { id, parent: entry.parent, ids, rects: ids.map(key => page.element(key)!.getBoundingClientRect()), scrollX: page.view.scrollX, scrollY: page.view.scrollY };
  }

  /** The drop, handed to the page as a place; returns the element that landed, for Drag to land the preview on. */
  private drop(result: SortableResult): HTMLElement | null {
    const { page } = this, { destination } = result;
    page.release();
    let landed = result.draggableId;
    try {
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
    // A carousel's cards only change places along their row.
    if (isCarouselTrack(this.page.element(this.carried.parent))) event.stopPropagation();
    this.side();
  };
  /** The page scrolled under a resting pointer: what lies beside it has changed. */
  private scrolled = () => { if (this.carried) this.side(); };

  /** Shows the line of a drop beside a sibling when the pointer is at its side; a carried selection and a carousel's cards never land beside. */
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
