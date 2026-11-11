import { signal } from "@lit-labs/signals";
import type { HandleChange } from "../screens/CanvasHandles";
import { libraryTokenValues } from "./libraryTokens";

/**
 * What the component canvas and its property groups edit: a design's tokens, one at a time. The
 * base system's draft (`BaseDraft`) is one; a library's stylesheet (`libraryDraft`) is another.
 */
export interface TokenDraft {
  /** What a token is written as now; undefined while it keeps its default. */
  value(token: string): string | undefined;
  /** Writes a token (a value equal to the property's default has already become a `remove`). */
  edit(token: string, value: string): void;
  /** Takes a token out, back to its default. */
  remove(token: string): void;
}

/**
 * A library's stylesheet as a draft: a token reads as its last ordinary `:root` value, and one
 * still at the template's own value reads as unset, so a fresh library shows every property at its
 * default; writing goes through the caller's own path (the workbench's `setLibraryToken`).
 */
export function libraryDraft(css: () => string, write: (token: string, value: string) => void, template = ""): TokenDraft {
  const read = memo(libraryTokenValues);
  const defaults = template ? libraryTokenValues(template) : new Map<string, string>();
  return {
    value(token) {
      const value = read(css()).get(token);
      return value === defaults.get(token) ? undefined : value;
    },
    edit: (token, value) => write(token, value),
    remove: token => write(token, ""),
  };
}

const memo = <T>(compute: (input: string) => T) => {
  let last: { input: string; output: T } | null = null;
  return (input: string) => (last?.input === input ? last : (last = { input, output: compute(input) })).output;
};

/**
 * The editing the canvas and the property groups share: the draft they write to, and a handle's
 * value while it is dragged, which both show and neither writes until the drag is let go.
 */
export class PropertyEditing {
  readonly preview = signal<HandleChange | null>(null);

  constructor(readonly draft: TokenDraft) {}

  /** A property's written value, a drag's preview first. */
  written(token: string) {
    const preview = this.preview.get();
    return preview?.token === token ? preview.value || undefined : this.draft.value(token);
  }

  /** Writes a property's value; "" takes its token out. */
  edit(token: string, value: string) {
    if (value) this.draft.edit(token, value);
    else this.draft.remove(token);
  }
}
