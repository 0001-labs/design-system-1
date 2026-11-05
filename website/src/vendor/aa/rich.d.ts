/**
 * A block's words as they read: letters, each wearing its marks. The document
 * is Markdown, but a mark's two delimiters are one thing to the person writing
 * and only ever two to the text. So where an edit would part a pair (a
 * selection ending inside bold, Enter in the middle of a colour, a space at
 * bold's end, the last letter of a word deleted) the words are taken out of
 * the Markdown, changed as letters, and written back as sound Markdown. An
 * edit that leaves every pair whole stays a plain splice, so a block keeps its
 * own spelling of what it was not asked to change.
 */
import { type AtomSyntax, type Block } from './markdown';
/**
 * A mark as it is written. `family` holds one at a time: a word has one colour
 * and one link. `tight` marks cannot start or end on a space and still be read
 * (`**word **` is not bold), so spaces at their edges are written outside them.
 */
export type Mark = {
    family: string;
    key: string;
    open: string;
    close: string;
    tight: boolean;
    rank: number;
};
export declare const BOLD: Mark;
export declare const ITALIC: Mark;
export declare const STRIKE: Mark;
export declare const HIGHLIGHT: Mark;
export declare const UNDERLINE: Mark;
export declare const CODE: Mark;
export declare const colorMark: (color: string) => Mark;
export declare const backgroundMark: (color: string) => Mark;
export declare const linkMark: (href: string) => Mark;
/** The mark a toolbar's delimiters write; none for what is not a mark of words (an equation's `$`). */
export declare function markOf(delimiter: string, closing: string): Mark | null;
/**
 * One thing that reads as one: a letter, an atom, a line break with the prefix
 * of the line it starts. `fixed` is a block's own prefix, which wears nothing.
 */
export type Unit = {
    source: string;
    marks: readonly Mark[];
    from: number;
    to: number;
    fixed?: boolean;
    breaks?: boolean;
    bare?: string;
};
export declare const isWritten: (block: Block) => boolean;
/** A block read into its units, every character accounted for but the delimiters. */
export declare function unitsOf(block: Block, atoms?: readonly AtomSyntax[]): Unit[];
/** The units as Markdown, with where each one's own characters start and end in it. */
export type Written = {
    text: string;
    starts: number[];
    ends: number[];
    fitted: Unit[];
};
/**
 * Units written as Markdown. The mark that runs furthest goes outermost, so a
 * bold sentence keeps its one `**` round an italic word; code is always
 * innermost, since nothing can be read inside it.
 */
export declare function writeUnits(units: readonly Unit[]): Written;
/** Where a block's words start and end, past the syntax hidden at either end: its edges to the caret. */
export declare function wordEdges(block: Block, atoms?: readonly AtomSyntax[]): {
    start: number;
    end: number;
};
export declare const hasMarks: (block: Block, atoms?: readonly AtomSyntax[]) => boolean;
/** What the next letters typed will wear, or stop wearing, beyond what stands before the caret. `back` units before it wear `add` too. */
export type Carry = {
    add: readonly Mark[];
    remove: readonly string[];
    back: number;
};
export type Edit = {
    source: string;
    caret: number;
    carry?: Carry;
};
/**
 * Replace `from`–`to` in a block's source with `text`, keeping every mark on
 * the words it was on. Null when a plain splice does that already, which is
 * nearly always: no pair is parted, so the text is the text. New words wear
 * what the words they replace wore (or those before the caret), as they would
 * typed by hand, and any marks of their own.
 */
export declare function editBlock(block: Block, from: number, to: number, text: string, atoms?: readonly AtomSyntax[], carry?: Carry | null): Edit | null;
/** A block parted at an offset, each side's marks closed and opened at the cut. Null where nothing is parted. */
export declare function partBlock(block: Block, offset: number, atoms?: readonly AtomSyntax[]): [string, string] | null;
/** Two blocks' sources run together from `a` in the first to `b` in the second, with `text` between. Null where a plain join does that. */
export declare function joinBlocks(first: Block, a: number, second: Block, b: number, text: string, atoms?: readonly AtomSyntax[]): Edit | null;
/** The words between two offsets as Markdown of their own, wearing what they wear. Null where plain slicing does that. */
export declare function sliceBlock(block: Block, from: number, to: number, atoms?: readonly AtomSyntax[]): string | null;
/** What the words a range covers wear in common, and whether there are any. */
export declare function rangeWears(block: Block, from: number, to: number, key: string, atoms?: readonly AtomSyntax[]): {
    words: boolean;
    all: boolean;
};
/** A range's words given a mark, or with their marks of a family taken off. The offsets it gives are of the same words afterwards. */
export declare function markRange(block: Block, from: number, to: number, change: {
    add?: Mark;
    remove?: string | readonly string[];
}, atoms?: readonly AtomSyntax[]): {
    source: string;
    from: number;
    to: number;
};
/** Whether what stands just before a place wears a mark: what ⌘B with no selection is turning off. */
export declare function wornAt(block: Block, offset: number, key: string, atoms?: readonly AtomSyntax[]): boolean;
