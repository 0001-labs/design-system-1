export type FeedbackWord = "OK" | "Cancel" | "Close" | "Copied" | "Could not copy" | "Notifications";
export type FeedbackWords = Partial<Record<FeedbackWord, string>> | ((word: FeedbackWord) => string);

const TRANSLATOR = Symbol.for("design-system-1.translate");

let words: FeedbackWords | null = null;

export function setFeedbackWords(next: FeedbackWords | null): void {
  words = next;
}

export function feedbackWord(word: FeedbackWord): string {
  if (typeof words === "function") return words(word);
  const own = words?.[word];
  if (own !== undefined) return own;
  const translate = (globalThis as unknown as Record<symbol, unknown>)[TRANSLATOR];
  return typeof translate === "function" ? String(translate(word)) : word;
}
