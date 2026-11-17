import { expect, it, vi } from "vite-plus/test";
import { libraryTokenValues, setLibraryToken } from "./libraryTokens";
import { libraryDraft, PropertyEditing } from "./propertyEditing";

const library = (initial: string, template = "") => {
  let css = initial;
  const write = vi.fn((token: string, value: string) => { css = setLibraryToken(css, token, value); });
  return { draft: libraryDraft(() => css, write, template), write, css: () => css };
};

it("reads a library's tokens from its stylesheet, its template's own values as unset, and writes through the caller", () => {
  const { draft, write } = library(":root { --ds-switch-track-on: #529d36; }", ":root { --ds-switch-track-on: #529d36; }");
  expect(draft.value("--ds-switch-track-on")).toBeUndefined();
  draft.edit("--ds-button-size", "56px");
  expect(draft.value("--ds-button-size")).toBe("56px");
  draft.remove("--ds-button-size");
  expect(write).toHaveBeenLastCalledWith("--ds-button-size", "");
  expect(draft.value("--ds-button-size")).toBeUndefined();
  expect(draft.unset!("--ds-switch-track-on")).toBe("#529d36");
  expect(draft.unset!("--ds-button-size")).toBe("initial");
});

it("takes out a token the library sets in a block of its own by writing the default over it", () => {
  const own = library(":root { --ds-button-primary-fill: rgb(255, 0, 102); --ds-switch-track-on: red; }", ":root { --ds-switch-track-on: #529d36; }");
  expect(own.draft.value("--ds-button-primary-fill")).toBe("rgb(255, 0, 102)");
  own.draft.remove("--ds-button-primary-fill");
  expect(own.write).toHaveBeenLastCalledWith("--ds-button-primary-fill", "initial");
  expect(libraryTokenValues(own.css()).get("--ds-button-primary-fill")).toBe("initial");
  expect(own.draft.value("--ds-button-primary-fill")).toBeUndefined();
  own.draft.remove("--ds-switch-track-on");
  expect(own.write).toHaveBeenLastCalledWith("--ds-switch-track-on", "#529d36");
  expect(own.draft.value("--ds-switch-track-on")).toBeUndefined();
  own.draft.edit("--ds-button-primary-fill", "blue");
  own.draft.remove("--ds-button-primary-fill");
  expect(libraryTokenValues(own.css()).get("--ds-button-primary-fill")).toBe("initial");
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
