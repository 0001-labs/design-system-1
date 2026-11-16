import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

const source = readFileSync(new URL("../DS1/5-visual-kit/app-chrome.ts", import.meta.url), "utf8");
const compact = source.match(/\.compact \{([^}]+)\}/)![1]!;

test("the compact Mac bar is one square high, its hairline the grid's line under it", () => {
  expect(compact).toContain("height:calc(20px * var(--compact-scale))");
  expect(compact).toContain("box-shadow:0 1px var(--chrome-line)");
  expect(compact).not.toContain("border-bottom");
});
