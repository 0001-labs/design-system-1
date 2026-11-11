import { readFileSync } from "node:fs";
import { expect, it } from "vite-plus/test";
import { templateStamp } from "./libraryTemplate";
import { scopeLibrary } from "./libraryScope";

it("turns :root into the specimens' :host, a compound root into :host(), and leaves other rules alone", () => {
  const { rules, faces } = scopeLibrary(":root { --a: 1; }\n:root.dark-theme, :root:not([x]) .b { --a: 2; }\n@media (prefers-color-scheme: dark) { :root { --a: 3; } }\nds-button::part(control) { color: red; }\nbutton { padding: 0; }");
  expect(rules).toBe(":host { --a: 1; }\n:host(.dark-theme), :host(:not([x])) .b { --a: 2; }\n@media (prefers-color-scheme: dark) { :host { --a: 3; } }\nds-button::part(control) { color: red; }\nbutton { padding: 0; }");
  expect(faces).toBe("");
});

it("moves faces to the document under a private family name the rules follow, and keeps only font stylesheets of the imports", () => {
  const css = `@import url("https://fonts.googleapis.com/css2?family=Lora");\n@import "./component-appearance.css";\n@import url(https://cdn.jsdelivr.net/x.css);\n@font-face { font-family: "Brand Sans"; src: url(data:font/woff2;base64,AA) format("woff2"); }\n:root { --ds-typeface-regular: "Brand Sans", sans-serif; --b: Brand Sans; }\np { font-family: 'Brand Sans'; content: "{;}"; }`;
  const { rules, faces } = scopeLibrary(css);
  expect(rules).not.toMatch(/@import|@font-face/);
  expect(rules).toContain(`:host { --ds-typeface-regular: "ds1-library Brand Sans", sans-serif; --b: "ds1-library Brand Sans"; }`);
  expect(rules).toContain(`p { font-family: "ds1-library Brand Sans"; content: "{;}"; }`);
  expect(faces.split("\n")).toEqual([`@import url("https://fonts.googleapis.com/css2?family=Lora");`, `@font-face { font-family: "ds1-library Brand Sans"; src: url(data:font/woff2;base64,AA) format("woff2"); }`]);
});

it("scopes a new library's template with no import left and every :root a :host", () => {
  // The app's tests read stylesheets as empty modules, so the template is put together from its files here.
  const template = `${templateStamp}\n${["component-metrics", "component-tokens"].map(name => readFileSync(new URL(`../../../DS1/1-root/${name}.css`, import.meta.url), "utf8")).join("\n")}`;
  const { rules, faces } = scopeLibrary(template);
  expect(rules).not.toMatch(/@import|@font-face|:root\b/);
  expect(rules).toContain(":host");
  expect(faces).toContain(`font-family: "ds1-library Inter Arrows"`);
  expect(rules).toContain(`"ds1-library Inter Arrows"`);
});
