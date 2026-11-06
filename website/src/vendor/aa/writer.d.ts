/**
 * Writer mode: the editor in a frame of its own, for a page where words are
 * written, then kept or dropped: a bar of formatting that always shows, Save
 * and Cancel under the words, and a draft kept while they are neither. Closing
 * the page is not Cancel: the draft is there next time.
 *
 * The saved words stay the product's. Aa asks for them to be kept through
 * `onSave`, and holds a draft of what is not saved yet in the `drafts` store,
 * this browser's own storage unless the product gives another.
 */
import { type Editor, type EditorOptions } from './editor';
import { type ToolbarAction } from './controls';
/** Where drafts are kept, by the key a document has. Reads and writes are at once, so the first frame shows the draft. */
export type DraftStore = {
    load(key: string): string | null;
    save(key: string, value: string): void;
    clear(key: string): void;
};
/** Drafts in this browser's own storage, which can be missing or full: a draft is then only lost, never in the way. */
export declare const localDrafts: DraftStore;
/** `saved`: the words are the saved ones. `draft`: they are not, and are held as a draft where there is a key. */
export type WriterState = 'saved' | 'draft' | 'saving' | 'failed';
export type WriterOptions = Omit<EditorOptions, 'toolbar'> & {
    /** What this document's draft is kept under. Without one, words not saved go with the page. */
    draft?: string;
    drafts?: DraftStore;
    /** Keep the words. A failure, thrown or rejected, leaves them and the draft as they are, to try again. */
    onSave?(value: string): void | Promise<void>;
    /** Cancel was pressed: the words are the saved ones again and the draft is gone. */
    onCancel?(): void;
    onState?(state: WriterState): void;
    /** A product's own buttons, at the end of the bar. */
    actions?: readonly ToolbarAction[];
};
export type Writer = {
    readonly editor: Editor;
    /** The frame, in `host`. */
    readonly element: HTMLElement;
    /** The words as they stand. */
    value: string;
    /** The words last saved. Set it when they change elsewhere: words being written stay, and stay a draft. */
    saved: string;
    readonly dirty: boolean;
    readonly state: WriterState;
    readOnly: boolean;
    /** Keep the words, as Save does. True once they are kept. */
    save(): Promise<boolean>;
    /** Go back to the saved words and drop the draft, as Cancel does. */
    cancel(): void;
    destroy(): void;
};
export declare function createWriter(host: HTMLElement, options?: WriterOptions): Writer;
