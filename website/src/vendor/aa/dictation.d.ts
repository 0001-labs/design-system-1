export type SpeechRecognitionLike = EventTarget & {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{
            transcript: string;
        }> & {
            isFinal: boolean;
        }>;
    }) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: {
        error?: string;
    }) => void) | null;
    onaudiostart?: (() => void) | null;
};
/** What went wrong with listening, in plain words, where the person can do something about it. */
export declare function listeningFailure(error: string | undefined): string | null;
/** The browser's speech recognition, where it has one. */
export declare function recognition(): SpeechRecognitionLike | null;
/** How long the dot stands still after the words last carried it before it breathes again, in milliseconds. */
export declare const SETTLE = 500;
/**
 * The listening dot's opacity. Carried along by the words as they come, it is
 * steady, so it moves at one size and one strength; standing still, it is a
 * slow pulse (0 to 1) mixed with the voice's level (0 to 1), so it breathes and
 * brightens as the voice does.
 */
export declare function dotOpacity(moving: boolean, pulse: number, level: number): number;
/**
 * A listening dot's breath: its opacity, never its size. Standing still, a slow
 * pulse with the voice's level over it once `followVoice` has the microphone
 * (asked for only once dictation has it, never beside it in Safari, where the
 * pulse is alone). While the words carry it along it holds steady, the pulse
 * and the voice set aside, and it breathes again once it has stood still for
 * `SETTLE`, the pulse starting afresh. It eases between the two rather than
 * jumping. Still where less motion is asked for.
 */
export declare function breatheDot(dot: HTMLElement, view: Window): {
    followVoice: (() => Promise<void>) | null;
    stop(): void;
};
/** Whether the browser can listen at all. */
export declare const canDictate: () => boolean;
/**
 * Listening for a plain field (a comment's reply): everything heard so far, as
 * one run of words, each time more comes, and what went wrong when it ends.
 * Started within the key's own press, so the browser asks for the microphone once.
 */
export declare function dictate(options: {
    lang: string;
    heard: (words: string) => void;
    end: (failure: string | null) => void;
    audio?: () => void;
}): {
    stop(): void;
    abort(): void;
} | null;
