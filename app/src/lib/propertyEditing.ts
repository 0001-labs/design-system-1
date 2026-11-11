import { signal } from "@lit-labs/signals";
import type { HandleChange } from "../screens/CanvasHandles";
import { libraryTokenValues, setLibraryToken } from "./libraryTokens";

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
  /** What draws a token at its default where a design's own value would otherwise stand ("initial" when unset). */
  unset?(token: string): string;
}

/**
 * A library's stylesheet as a draft: a token reads as its last ordinary `:root` value, and one at
 * the template's own value (or `initial`, the written default) reads as unset, so a fresh library
 * shows every property at its default. Writing goes through the caller's own path (the
 * workbench's `setLibraryToken`), into the override block. Taking a token out removes it there;
 * where the library also sets it in a block of its own, which would then show again, the default
 * is written over it instead: the template's value, or `initial`, which leaves the token unset.
 */
export function libraryDraft(css: () => string, write: (token: string, value: string) => void, template = ""): TokenDraft {
  const read = memo(libraryTokenValues);
  const defaults = template ? libraryTokenValues(template) : new Map<string, string>();
  const unset = (token: string) => defaults.get(token) ?? "initial";
  const isDefault = (token: string, value: string | undefined) => value === undefined || value === "initial" || value === defaults.get(token);
  return {
    value(token) {
      const value = read(css()).get(token);
      return isDefault(token, value) ? undefined : value;
    },
    edit: (token, value) => write(token, value),
    remove(token) {
      const rest = libraryTokenValues(setLibraryToken(css(), token, "")).get(token);
      write(token, isDefault(token, rest) ? "" : unset(token));
    },
    unset,
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
  /** Locked lengths read from the component as drawn (px), where their value is not written plainly. */
  readonly drawn = signal<ReadonlyMap<string, number>>(new Map());

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
