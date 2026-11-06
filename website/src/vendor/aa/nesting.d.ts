/**
 * Blocks that hold writing of their own, columns and tabs: each column or tab
 * page is an editor of its own, made by `nested` so it has the page's atoms.
 */
import type { Editor } from './editor';
type Nested = (host: HTMLElement, value: string, onChange: (value: string) => void) => Editor;
export declare function createNesting(nested: Nested, state: () => {
    readOnly: boolean;
    placing: boolean;
}): {
    columnEditors: Set<Editor>;
    drawColumns: (element: HTMLElement, source: string) => () => void;
    drawTabs: (element: HTMLElement, source: string) => () => void;
};
export {};
