import type { Editor } from './editor';
import type { Atom } from './atoms';
import type { Block } from './markdown';
export declare const loadComponents: () => Promise<typeof import("./components")>;
/** A real component used as an illustration; its label stands in until the component has loaded. */
export declare const buttonPartialAtom: (canWrite: () => boolean) => Atom;
export declare const createPartialPicker: (editor: Editor) => () => void;
/** A document-local outline, drawn once its component has loaded; the update it gives waits with it. */
export declare function createTableOfContents(element: HTMLElement, blocks: () => readonly Block[], target: HTMLElement, navigate: (index: number) => void): () => void;
