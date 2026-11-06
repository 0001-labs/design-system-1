import type { Editor, EditorOptions } from './editor';
import { type TurnKind } from './document';
import { type CalloutColor } from './markdown';
/** A button on the bar over selected words; `shortcut` is named in its tooltip (⌘B). */
export type ToolbarAction = {
    id: string;
    label: string;
    icon: string;
    shortcut?: string;
    run(editor: Editor): void;
};
/** `ink`: one of the text colours its row's mark is drawn in. */
/** `swatch`: a callout fill its row's mark is drawn as, a filled square. */
export type Command = ToolbarAction & {
    keywords?: string;
    ink?: string;
    swatch?: CalloutColor;
    enabled?(editor: Editor): boolean;
    preview?(element: HTMLElement, context: {
        input: 'pointer' | 'keyboard';
    }): void | (() => void);
};
export declare const kinds: {
    kind: TurnKind;
    label: string;
    icon: string;
}[];
export declare function button(english: string, icon: string, action: (event: MouseEvent) => void, text?: boolean, shortcut?: string): HTMLButtonElement;
declare const AaToolbarElement_base: {
    new (): HTMLElement;
    prototype: HTMLElement;
};
export declare class AaToolbarElement extends AaToolbarElement_base {
    editor: Editor | null;
    actions: readonly ToolbarAction[];
    /** A second row under the cells: the field that asks AI about the selected words. */
    below: HTMLElement | null;
    connectedCallback(): void;
    refresh(): void;
}
export declare function defineAaToolbar(): void;
/**
 * A command that starts a block an atom draws (a diagram): in place of an
 * empty block, or after the one the caret is in, the caret on its first line
 * of words so they show for writing.
 */
export declare function inserting(atom: NonNullable<EditorOptions['atoms']>[number]): Command | null;
/** A new block of a kind: in place of the empty paragraph the caret is in, or after the block it is in, written as the kind writes an empty block. */
export declare function insertBlock(editor: Editor, kind: TurnKind): void;
/** Whether the page is worked by touch: a phone or a tablet, with no fine pointer. */
export declare const isCoarse: (window: Window) => boolean;
/** Sit directly against the selection, independent of how many rows the bar contains. */
export declare function selectionToolbarPosition(rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'bottom'>, box: Pick<DOMRect, 'width' | 'height'>, view: {
    left: number;
    top: number;
    width: number;
    height: number;
}, _scale: number): {
    left: number;
    top: number;
};
export declare function createControls(editor: Editor, options: EditorOptions): () => void;
export {};
