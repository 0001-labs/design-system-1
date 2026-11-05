import { render } from 'lit';
import type { ReactiveControllerHost } from 'lit';
import { TableColumns } from './table-columns';

/** The leaf cells of a grouped/row-spanning heading, in physical column order. */
function headings(table: HTMLTableElement): HTMLTableCellElement[] {
  const rows = table.tHead ? Array.from(table.tHead.querySelectorAll<HTMLTableRowElement>(':scope > tr')) : table.rows.length ? [table.rows[0]!] : [];
  const grid: HTMLTableCellElement[][] = [];
  rows.forEach((row, r) => {
    grid[r] ??= []; let column = 0;
    for (const cell of Array.from(row.cells)) {
      while (grid[r]![column]) column++;
      for (let y = r; y < Math.min(rows.length, r + cell.rowSpan); y++) {
        grid[y] ??= [];
        for (let x = column; x < column + cell.colSpan; x++) grid[y]![x] = cell;
      }
      column += cell.colSpan;
    }
  });
  const result = grid.at(-1) ?? [];
  return result.every(cell => cell.colSpan === 1) ? result : [];
}

/** Add the shared column interaction without replacing cells, links, sorting or row handlers. */
function bind(table: HTMLTableElement, cells: HTMLTableCellElement[]) {
  const ownViewport = !table.parentElement?.matches('[data-ds-table-viewport], .ds-table-scroll');
  const viewport = ownViewport ? document.createElement('div') : table.parentElement!;
  if (ownViewport) { table.before(viewport); viewport.append(table); }
  viewport.classList.add('ds-table-scroll'); viewport.setAttribute('data-ds-table-viewport', '');
  table.setAttribute('data-ds-column-resize', '');
  let group = table.querySelector<HTMLTableColElement>(':scope > colgroup');
  if (!group) { group = document.createElement('colgroup'); table.prepend(group); }
  const columns = cells.map((_, index) => {
    let col = group!.children[index] as HTMLTableColElement | undefined;
    if (!col) { col = document.createElement('col'); group!.append(col); }
    return col;
  });
  const handles: HTMLElement[] = [];
  const host: ReactiveControllerHost & Pick<HTMLElement, 'dispatchEvent'> = {
    addController() {}, removeController() {}, updateComplete: Promise.resolve(true),
    requestUpdate() {
      handles.forEach((handle, index) => {
        const width = Math.round(sizing.widths[index] ?? 0);
        handle.setAttribute('aria-valuenow', String(width));
        handle.setAttribute('aria-valuetext', width ? `${width} pixels` : 'Automatic width');
      });
    },
    dispatchEvent: event => table.dispatchEvent(event),
  };
  const sizing = new TableColumns(host, {
    scroller: () => viewport,
    headers: () => cells,
    apply: widths => {
      table.style.tableLayout = 'fixed';
      table.style.width = `${widths.reduce((sum, width) => sum + width, 0)}px`;
      columns.forEach((col, index) => { col.style.width = `${widths[index]}px`; });
    },
  });
  cells.forEach((cell, index) => {
    const fragment = document.createElement('div');
    const label = cell.querySelector('button, a, [data-column-label]')?.textContent?.trim() || cell.textContent?.trim() || `Column ${index + 1}`;
    render(sizing.handle(index, label), fragment);
    const handle = fragment.querySelector<HTMLElement>('.ds-table-column-resize')!;
    handles.push(handle); cell.append(handle);
  });
  const unit = handles[0]?.getBoundingClientRect().width ?? 0;
  const initial = cells.map(cell => cell.getBoundingClientRect().width);
  if (unit > 0 && initial.every(width => width > 0)) sizing.widths = initial.map(width => Math.max(unit, Math.round(width / unit) * unit));
  sizing.hostUpdated();
  return {
    cells, intact: () => handles.every((handle, index) => handle.parentElement === cells[index]), update: () => sizing.hostUpdated(),
    disconnect() {
      sizing.hostDisconnected(); handles.forEach(handle => handle.remove());
      table.removeAttribute('data-ds-column-resize');
    },
  };
}

/** Opt existing semantic tables into DS1 resizing, including tables added by later renders. */
export function watchTableColumns(root: ParentNode = document, selector = 'table.ds-table'): () => void {
  const bound = new Map<HTMLTableElement, ReturnType<typeof bind>>();
  let frame = 0;
  const scan = () => {
    frame = 0;
    const present = new Set(root.querySelectorAll<HTMLTableElement>(selector));
    for (const [table, binding] of bound) {
      if (!present.has(table)) { binding.disconnect(); bound.delete(table); }
    }
    for (const table of present) {
      if (table.closest('ds-table')) continue;
      const cells = headings(table), old = bound.get(table);
      if (old && old.intact() && old.cells.length === cells.length && old.cells.every((cell, index) => cell === cells[index])) { old.update(); continue; }
      old?.disconnect(); bound.delete(table);
      if (cells.length) bound.set(table, bind(table, cells));
    }
  };
  const observer = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(scan); });
  scan(); observer.observe(root, {childList: true, subtree: true});
  return () => {
    observer.disconnect(); cancelAnimationFrame(frame);
    for (const binding of bound.values()) binding.disconnect();
    bound.clear();
  };
}
