/** What Aa draws as one thing out of the box: pictures, and people tagged by name. */
import { type AtomSyntax } from './markdown';
/**
 * An atom the editor reads and draws: what it is in the text, and how it is
 * drawn into the element Aa gives it. What `draw` returns is called once the
 * atom leaves the page, to stop whatever it started.
 */
export type Atom = AtomSyntax & {
    draw?(element: HTMLElement, source: string): void | (() => void);
    /** A person tagged: Backspace takes the space written after it along with it, so one press removes the tag however it was made. */
    tag?: true;
    /** A block that starts one, offered in the toolbar and the slash menu: its name, icon and first source. */
    insert?: {
        label: string;
        icon: string;
        source: string;
        keywords?: string;
        preview?(element: HTMLElement, context: {
            input: 'pointer' | 'keyboard';
        }): void | (() => void);
    };
};
/**
 * A person tagged by name, `@Name`: words in the document, drawn and removed as
 * one thing. `people` says who can be tagged, read each time so it can change;
 * the longest name that fits wins, and letters after it make it plain words.
 */
export declare function personAtom(people: () => readonly string[], colour?: (name: string) => string): Atom;
/** One square in pixels where it is drawn, at the page's scale. */
export declare function squareIn(element: HTMLElement): number;
/**
 * A drawn picture made sizable: as wide as its Markdown says in squares (`![caption](address "w12")`),
 * or its own size up to sixteen, with the grip that sizes it. For a product's own picture atom too.
 */
export declare function sizePicture(element: HTMLElement, source: string): void;
/** A picture drawn as itself, as wide as its Markdown says in squares, or its own size up to sixteen. */
export declare const imageAtom: Atom;
