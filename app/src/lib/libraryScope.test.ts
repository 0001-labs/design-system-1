import { readFileSync } from "node:fs";
import { expect, it } from "vite-plus/test";
import { templateStamp } from "./libraryTemplate";
import { hostSelector, scopeLibrary } from "./libraryScope";

it("turns :root into the specimens' :host, a compound root into :host(), and leaves other rules alone", () => {
  const { rules, faces } = scopeLibrary(":root { --a: 1; }\n:root.dark-theme, :root:not([x]) .b { --a: 2; }\n@media (prefers-color-scheme: dark) { :root { --a: 3; } }\nds-button::part(control) { color: red; }\nbutton { padding: 0; }");
  expect(rules).toBe(":host { --a: 1; }\n:host(.dark-theme), :host(:not([x])) .b { --a: 2; }\n@media (prefers-color-scheme: dark) { :host { --a: 3; } }\nds-button::part(control) { color: red; }\nbutton { padding: 0; }");
  expect(faces).toBe("");
});

it("maps the theme patterns and balanced parentheses faithfully, and leaves out a rule it cannot say", () => {
  expect(hostSelector(":root:not(.light-theme):not(.dark-theme)")).toBe(":host(:not(.light-theme):not(.dark-theme))");
  expect(hostSelector(":root[data-theme='dark'] ds-button::part(control)")).toBe(":host([data-theme='dark']) ds-button::part(control)");
  expect(hostSelector(":root:is(.a, .b) > p, :root::before")).toBe(":host(:is(.a, .b)) > p, :host::before");
  expect(hostSelector(".x :root-ish, p")).toBe(".x :root-ish, p");
  for (const broken of [":root:has(:not(.a))", "html:root", ":is(:root) p", "p, :root:has(.a) b"]) expect(hostSelector(broken), broken).toBeNull();
  expect(scopeLibrary("p { color: red; }\n:root:has(:not(.a)) { --a: 1; }\nb { color: blue; }").rules).toBe("p { color: red; }\n\nb { color: blue; }");
});

it("moves faces to the document under a private family name the rules follow, with their conditions, and leaves every import out", () => {
  const css = `@import url("https://fonts.googleapis.com/css2?family=Lora");\n@import "./component-appearance.css";\n@font-face { font-family: "Brand Sans"; src: url(data:font/woff2;base64,AA) format("woff2"); }\n@media (min-width: 600px) { @font-face { font-family: Wide; src: url(data:font/woff2;base64,BB); } :root { --w: Wide; } }\n:root { --ds-typeface-regular: "Brand Sans", sans-serif; --b: Brand Sans; }\np { font-family: 'Brand Sans'; content: "{;}"; }`;
  const { rules, faces } = scopeLibrary(css);
  expect(rules).not.toMatch(/@import|@font-face|fonts\.googleapis/);
  expect(rules).toMatch(/@media \(min-width: 600px\) \{\s+:host \{ --w: "ds1-library Wide"; \} \}/);
  expect(rules).toContain(`:host { --ds-typeface-regular: "ds1-library Brand Sans", sans-serif; --b: "ds1-library Brand Sans"; }`);
  expect(rules).toContain(`p { font-family: "ds1-library Brand Sans"; content: "{;}"; }`);
  expect(faces.split("\n")).toEqual([
    `@font-face { font-family: "ds1-library Brand Sans"; src: url(data:font/woff2;base64,AA) format("woff2"); }`,
    `@media (min-width: 600px) { @font-face { font-family: "ds1-library Wide"; src: url(data:font/woff2;base64,BB); } }`,
  ]);
});

it("keeps other at-rules as they are", () => {
  const css = "@keyframes spin { from { opacity: 0; } }\n@property --x { syntax: '<length>'; inherits: true; initial-value: 0px; }\n@layer base;";
  expect(scopeLibrary(css).rules).toBe(css);
});

it("scopes a new library's template with no import left and every :root a :host", () => {
  const template = `${templateStamp}\n${["component-metrics", "component-tokens"].map(name => readFileSync(new URL(`../../../DS1/1-root/${name}.css`, import.meta.url), "utf8")).join("\n")}`;
  const { rules, faces } = scopeLibrary(template);
  expect(rules).not.toMatch(/@import|@font-face|:root\b/);
  expect(rules).toContain(":host");
  expect(faces).toContain(`font-family: "ds1-library Inter Arrows"`);
  expect(rules).toContain(`"ds1-library Inter Arrows"`);
});
