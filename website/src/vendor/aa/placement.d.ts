/** Shared side placement geometry, independent of a document or rendering framework. */
export type PlacementRect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
};
export declare function sidePlacement(rects: readonly PlacementRect[], from: number, point: {
    x: number;
    y: number;
}, unit?: number): {
    index: number;
    at: 'start' | 'end';
    rect: PlacementRect;
} | null;
/** The place in the text a point on the screen falls on, in whichever way the browser says it. */
export declare function caretAt(document: Document, x: number, y: number): {
    node: Node;
    offset: number;
} | null;
