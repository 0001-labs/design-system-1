type Point = {
    node: Node;
    offset: number;
};
export declare const holdingAcross: (host: HTMLElement) => boolean;
/** Each block its own editable element again, the selection having come back within one. */
export declare function releaseAcross(host: HTMLElement): void;
/**
 * A selection set from one place in the writing to another. Safari will not
 * hold a selection across two editable elements and clips it to the first, so
 * where a browser does that the editor is one editable element for as long as
 * the selection crosses blocks. Its keys are Aa's meanwhile, so the browser
 * edits nothing, and `releaseAcross` gives each block back its own.
 */
export declare function selectFromTo(host: HTMLElement, selection: Selection, a: Point, f: Point): void;
export declare function selectAcrossBlocks(host: HTMLElement, readOnly: () => boolean): () => void;
export {};
