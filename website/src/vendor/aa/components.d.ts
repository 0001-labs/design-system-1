/**
 * What Aa draws with Design system 1's Lit components: an inline button and its
 * panel, and a table of contents. Few documents have either, so this loads the
 * first time one needs it, as its own file beside aa.js.
 */
import type { Editor } from './editor';
import { type Block } from './markdown';
import './vendor/ds1/2-core/ds-button';
import './vendor/ds1/2-core/ds-input';
import './vendor/ds1/3-unit/ds-select';
import './vendor/ds1/4-page/ds-overlay';
import './vendor/ds1/3-unit/ds-table-of-contents';
/** A real component used as an illustration. The wrapper edits even a disabled specimen. */
export declare function drawButtonPartial(element: HTMLElement, source: string, canWrite: () => boolean): () => void;
/** Suggestions keep the caret in the sentence; DS1 owns placement and keyboard navigation. */
export declare function createPartialPicker(editor: Editor): () => void;
/** A document-local outline. Generated words never become part of the Markdown. */
export declare function createTableOfContents(element: HTMLElement, blocks: () => readonly Block[], target: HTMLElement, navigate: (index: number) => void): () => void;
