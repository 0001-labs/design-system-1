import type { Block } from './markdown';
export type Cell = {
    text: string;
    from: number;
    to: number;
};
/** Cells keep offsets into the original Markdown, including escaped pipes. */
export declare function tableRows(source: string): Cell[][];
/** Whether a range stands inside one cell. */
export declare const inOneCell: (source: string, from: number, to: number) => boolean;
/** A column's alignment, from the delimiter row: `:---` start, `:---:` centre, `---:` end. */
export type Alignment = 'start' | 'center' | 'end' | null;
export declare function tableAlignments(source: string): Alignment[];
/**
 * A column's width in squares: its dashes in the delimiter row, counted. Every
 * Markdown reader lets them run to any length and pandoc reads them as relative
 * widths, so the width travels with the table. Three, the least there can be, is
 * no width of its own.
 */
export declare function tableWidths(source: string): (number | null)[];
/** A table's source with its columns set to these widths, nothing else changed. */
export declare function setTableWidths(source: string, widths: readonly (number | null)[]): string;
export declare function writeTable(rows: readonly (readonly string[])[], alignments?: readonly Alignment[], widths?: readonly (number | null)[]): string;
export declare function fromTSV(text: string): string | null;
export type TableAction = 'add-row' | 'delete-row' | 'add-column' | 'delete-column' | 'bold-header';
export declare function editTable(block: Block, action: TableAction, row: number, column: number): string;
