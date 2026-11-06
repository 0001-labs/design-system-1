/** Aa's icons by path, as they are in the folder. */
export declare const icons: Record<string, string>;
/** An icon as a CSS mask: black where it is drawn, whichever colour it was drawn in. */
export declare function iconMask(name: string): string;
/** An icon as an element, in whatever colour the text around it has. */
export declare function iconElement(name: string, document?: Document): HTMLElement;
