/** Paint the native selection without adding nodes to the editable document. */
export type SelectionRect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
/** Merge inline fragments, join wrapped lines, and round the outside and inside turns. */
export declare function selectionPath(rects: readonly SelectionRect[], lineHeight: number, radius: number): string | null;
export declare function paintSelection(host: HTMLElement): () => void;
/** `schedule` called whenever what is drawn over `host` may have moved; what it returns stops that. */
export declare function watchLayout(view: Window, host: Element, schedule: () => void): () => void;
