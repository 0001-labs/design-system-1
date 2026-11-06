/** Code in a file of its own, beside aa.js, loaded the first time it is needed; from then on it is here at once. */
export declare function lazy<T>(load: () => Promise<T>): {
    get: () => Promise<T | NonNullable<T>>;
    here: () => T | undefined;
    /** Runs `start` as soon as the code is here; what it returns stops it, and stopping first means it never starts. */
    when(start: (code: T) => (() => void) | void): () => void;
};
