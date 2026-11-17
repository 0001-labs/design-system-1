import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { constraints, skillBlock, skillEnd, skillStart } from "../DS1/0-face/constraints";

const root = join(import.meta.dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const docs = join(root, "website/src/content/docs");
const visualKit = new Set(["ds-window"]);
const page = (tag: string) => visualKit.has(tag) ? "visual-kit/index.mdx" : readdirSync(docs, { withFileTypes: true }).filter(entry => entry.isDirectory())
  .flatMap(entry => [`${entry.name}/${tag.replace(/^ds-/, "")}.mdx`, `${entry.name}/${tag.replace(/^ds-/, "")}.md`])
  .find(path => existsSync(join(docs, path)));

test("every constraint has a code of its own, lower case, named by its component", () => {
  const codes = constraints.map(c => c.code);
  expect(new Set(codes).size).toBe(codes.length);
  for (const { code, components } of constraints) {
    expect(code).toMatch(/^[a-z0-9-]+\.[a-z0-9-]+$/);
    expect(components.length).toBeGreaterThan(0);
    expect(`ds-${code.split(".")[0]}`).toBe(components[0]);
  }
});

test("every constraint is one sentence", () => {
  for (const { rule } of constraints) expect(rule).toMatch(/^[A-Z][^]*[^.]\.$/);
});

test("every automated constraint names a test that exists", () => {
  for (const { code, check } of constraints) {
    if (!('file' in check)) continue;
    expect(existsSync(join(root, check.file)), `${code}: ${check.file}`).toBe(true);
    expect(read(check.file), `${code}: no test named "${check.test}"`).toContain(`test(${JSON.stringify(check.test)}`);
  }
});

test("every component that keeps a constraint lists it on its page", () => {
  for (const tag of new Set(constraints.flatMap(c => c.components))) {
    const path = page(tag);
    expect(path, `${tag} has no page`).toBeDefined();
    expect(readFileSync(join(docs, path!), "utf8")).toContain(`<ConstraintList component="${tag}" />`);
  }
  expect(read("website/src/content/docs/1-root/constraints.mdx")).toContain("<ConstraintList />");
});

test("the skill carries the constraints as they are (vp run constraints:write)", () => {
  const skill = read("skills/design-system-1/SKILL.md");
  const start = skill.indexOf(skillStart);
  const end = skill.indexOf(skillEnd);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(skill.slice(start, end + skillEnd.length)).toBe(skillBlock());
});
