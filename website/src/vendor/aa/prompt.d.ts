/**
 * Asking AI where the words are: Space in an empty block (or on a diagram's
 * board) opens a prompt in its place, written in a live colour so it reads as
 * something said to the AI rather than written into the page; Space again,
 * before anything is written, listens instead, the words heard set in
 * italics as they come. Enter sends
 * it: the prompt glistens while it waits, and so does the writing it is
 * about, then the answer takes the prompt's place, one step to undo. Escape,
 * or Backspace in an empty prompt, puts it away.
 *
 * The product answers (`prompt` in the editor's options): Aa decides when to
 * ask, what it is about and where the answer goes, never which model.
 * Nothing here is part of the document: the prompt stands over the page.
 */
/**
 * Asked with what the person said and what it is about. For writing it
 * answers with edits to what is already written (each an exact passage and
 * what it becomes) and new writing to stand where the prompt is, either or
 * both, or with Markdown alone to put there; for a diagram, with the
 * diagram written again.
 */
export type Prompter = (prompt: string, context: PromptContext) => Promise<string | PromptAnswer>;
/**
 * What a prompt about writing does: the whole `document` as it should be
 * afterwards (`PROMPT_HERE` left where new writing would go, or taken out);
 * or `edits` in place and `insert` where the prompt stood.
 */
export type PromptAnswer = {
    document?: string;
    edits?: {
        find: string;
        replace: string;
    }[];
    insert?: string;
};
export type PromptContext = {
    /** Writing: the answer takes an empty block's place. Diagram: the answer is the diagram written again. */
    kind: 'writing' | 'diagram';
    /** What the prompt is about: the writing around it, or the diagram's words. */
    text: string;
    /** For writing: the Markdown before and after the prompt's block. */
    before?: string;
    after?: string;
    /** For writing: the whole document, `PROMPT_HERE` standing on its own line where the prompt is. */
    document?: string;
    signal: AbortSignal;
};
export type PromptOptions = {
    /** Where the prompt stands: the empty block's place, or the board's. */
    place: () => DOMRect;
    /** How far in its first line starts: at the caret, in a paragraph, so the lines after it start at the paragraph's edge as its own lines do. */
    indent?: number;
    /** The element whose type the prompt is set in. */
    type: Element;
    /** What to say before anything is written. */
    placeholder?: string;
    /** Start listening at once (Space twice). */
    listen?: boolean;
    /** The writing to glisten while the answer is awaited. */
    about: () => Element[];
    /** Sends it, and puts the answer in. */
    send: (prompt: string, signal: AbortSignal) => Promise<void>;
    /** The prompt's height as it grows, to keep room for it in the page so what is under it moves down; 0 once it is put away. */
    grow?: (height: number) => void;
    /** Put away, sent or not; `sent` once the answer is in. */
    close: (sent: boolean) => void;
    root?: Element;
};
export type OpenPrompt = {
    readonly element: HTMLElement;
    close(): void;
};
/** A prompt over the page, focused, until it is sent or put away. */
export declare function openPrompt(options: PromptOptions): OpenPrompt;
