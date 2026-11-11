import { expect, it, vi } from "vite-plus/test";
import { setLibraryToken } from "./libraryTokens";
import { libraryDraft, PropertyEditing } from "./propertyEditing";

it("reads a library's tokens from its stylesheet, its template's own values as unset, and writes through the caller", () => {
  let css = ":root { --ds-switch-track-on: #529d36; --ds-button-size: 36px; }";
  const write = vi.fn((token: string, value: string) => { css = setLibraryToken(css, token, value); });
  const draft = libraryDraft(() => css, write, ":root { --ds-switch-track-on: #529d36; }");
  expect(draft.value("--ds-switch-track-on")).toBeUndefined();
  expect(draft.value("--ds-button-size")).toBe("36px");
  draft.edit("--ds-button-size", "56px");
  expect(draft.value("--ds-button-size")).toBe("56px");
  draft.remove("--ds-button-size");
  expect(write).toHaveBeenLastCalledWith("--ds-button-size", "");
  expect(draft.value("--ds-button-size")).toBe("36px");
});

it("shows a drag's preview before the draft, and an empty value removes the token", () => {
  const values = new Map([["--a", "4px"]]);
  const editing = new PropertyEditing({ value: token => values.get(token), edit: (token, value) => values.set(token, value), remove: token => values.delete(token) });
  expect(editing.written("--a")).toBe("4px");
  editing.preview.set({ token: "--a", value: "8px" });
  expect(editing.written("--a")).toBe("8px");
  editing.preview.set({ token: "--a", value: "" });
  expect(editing.written("--a")).toBeUndefined();
  editing.preview.set(null);
  editing.edit("--a", "");
  expect(values.has("--a")).toBe(false);
  editing.edit("--a", "12px");
  expect(editing.written("--a")).toBe("12px");
});
