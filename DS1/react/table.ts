import { createElement as h, forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes } from "react";
import type { DsTable as TableElement, TableColumn, TableMoveDetail, ColumnResizeDetail, TableRow } from "../3-unit/ds-table";

export type { TableColumn, TableMoveDetail, ColumnResizeDetail, TableRow };

export type TableProps = HTMLAttributes<TableElement> & {
  data: TableRow[];
  columns?: (string | TableColumn)[];
  footer?: TableRow;
  sticky?: boolean;
  resizable?: boolean;
  onColumnsResize?: (detail: ColumnResizeDetail) => void;
  sheet?: boolean;
  reorderable?: boolean;
  label?: string;
  onMove?: (move: TableMoveDetail) => void;
};

const useCommitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const Table = forwardRef<TableElement, TableProps>(function Table(
  { data, columns, footer, sticky, resizable, sheet, reorderable, label, onMove, onColumnsResize, ...props }, ref,
) {
  const host = useRef<TableElement>(null);
  useCommitEffect(() => {
    const element = host.current; if (!element) return;
    element.data = data;
    element.columns = columns ?? [];
    element.footer = footer;
  }, [data, columns, footer]);
  useCommitEffect(() => {
    const element = host.current; if (!element || !onMove) return;
    const move = (event: Event) => { event.preventDefault(); onMove((event as CustomEvent<TableMoveDetail>).detail); };
    element.addEventListener("table-move", move);
    return () => element.removeEventListener("table-move", move);
  });
  useCommitEffect(() => {
    const element = host.current; if (!element || !onColumnsResize) return;
    const resize = (event: Event) => onColumnsResize((event as CustomEvent<ColumnResizeDetail>).detail);
    element.addEventListener("table-columns-resize", resize);
    return () => element.removeEventListener("table-columns-resize", resize);
  });
  return h("ds-table", { ...props, label, resizable: resizable || undefined, sticky: sticky || undefined, sheet: sheet || undefined, reorderable: reorderable || undefined,
    ref: (element: TableElement | null) => { host.current = element; if (typeof ref === "function") ref(element); else if (ref) ref.current = element; },
  });
});
