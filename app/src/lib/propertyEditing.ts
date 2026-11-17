import { signal } from "@lit-labs/signals";
import type { HandleChange } from "../screens/CanvasHandles";
import { libraryTokenValues, setLibraryToken } from "./libraryTokens";

export interface TokenDraft {
  value(token: string): string | undefined;
  edit(token: string, value: string): void;
  remove(token: string): void;
  unset?(token: string): string;
}

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

export class PropertyEditing {
  readonly preview = signal<HandleChange | null>(null);
  readonly drawn = signal<ReadonlyMap<string, number>>(new Map());

  constructor(readonly draft: TokenDraft) {}

  written(token: string) {
    const preview = this.preview.get();
    return preview?.token === token ? preview.value || undefined : this.draft.value(token);
  }

  edit(token: string, value: string) {
    if (value) this.draft.edit(token, value);
    else this.draft.remove(token);
  }
}
