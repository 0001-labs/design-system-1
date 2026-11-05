/**
 * A table's columns sized by hand, as Design system 1's tables are: on its
 * `.ds-table-column-resize` handle the edge follows the pointer exactly and
 * settles on whole squares when let go; arrows move a square, Shift five, and
 * Escape takes a drag back. The width is the table's own Markdown, its dashes
 * counted in squares (`tableWidths`), so nothing is kept beside the document.
 */
type Options = {
    readOnly(): boolean;
    /** One square in pixels where a block is drawn. */
    square(block: HTMLElement): number;
    /** The columns' widths in squares, written as one step to undo; gives back the block drawn anew. */
    write(block: HTMLElement, widths: readonly number[]): HTMLElement | null;
};
export declare function resizeColumns(host: HTMLElement, options: Options): () => void;
export {};
