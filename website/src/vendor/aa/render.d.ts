/**
 * A block drawn from its source, and read back from the screen. Every
 * character of the source is in the DOM as text, syntax included; syntax is
 * never displayed, while writing either, so the caret passes over it as if it
 * were not there, and the text still reads straight back.
 */
import { type AtomSyntax, type Block, type Run } from './markdown';
/** A run of a block's words drawn with a class (and a title, and attributes a layer reads back, `data-comment` say); `from === to` is a caret. */
export type Decoration = {
    from: number;
    to: number;
    className: string;
    label?: string;
    attributes?: Record<string, string>;
};
/**
 * Makes the element an atom is drawn in: a `.aa-atom` that is not editable,
 * carrying its source in `data-source`, which is what reads back.
 */
export type AtomDrawer = (name: string, source: string) => HTMLElement;
/** The atom as its own words, for an editor given nothing better. */
export declare const drawAtomAsText: AtomDrawer;
export declare function atomElement(name: string, source: string, document?: Document): HTMLElement;
/** Which part of a block the selection is in, in its own offsets; null when the selection is elsewhere. */
export type Reveal = {
    from: number;
    to: number;
} | null;
/**
 * How a link whose words are its own address reads: without `https://`,
 * `www.` or a closing slash, and cut short at a word near `ADDRESS_LENGTH`,
 * fading out there.
 * The letters stay in the page and in the document; the caret entering the
 * link brings them all back, so nothing is out of reach of editing.
 */
export declare function addressFold(run: Run, text: string): {
    shown: number;
    end: number;
    more: boolean;
} | null;
/**
 * The key of what a reveal changes in a block's drawing: which atoms show their
 * source, and whether the caret is in a callout's body. Same key, same drawing:
 * delimiters are never shown, so the caret crossing bold redraws nothing.
 */
export declare function revealKey(block: Block, reveal: Reveal, atoms?: readonly AtomSyntax[]): string;
/**
 * Whether a block's element already shows `block`, the browser having typed
 * the same words into it: same runs, same looks, same letters, and nothing
 * that sets the block apart changed. Then nothing is drawn, so the text
 * nodes, the caret, the spelling marks and a phone's keyboard all stay.
 */
export declare function stillShows(element: HTMLElement, was: Block, block: Block, atoms?: readonly AtomSyntax[]): boolean;
export declare function renderBlock(element: HTMLElement, block: Block, reveal: Reveal, atoms?: readonly AtomSyntax[], draw?: AtomDrawer, decorations?: readonly Decoration[]): void;
/** The block's source, read back from whatever the browser left in it. */
export declare function readBlock(element: HTMLElement): string;
/** A DOM point in a block as an offset into its source. */
export declare function offsetIn(element: HTMLElement, node: Node, nodeOffset: number): number;
/** The DOM point for an offset into a block's source, in text that is displayed. */
export declare function pointAt(element: HTMLElement, offset: number): {
    node: Node;
    offset: number;
};
