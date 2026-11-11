/**
 * A library's stylesheet made fit for the specimens' shadow roots on the component canvas
 * (`ComponentCanvas.ts`): the rules go into each specimen's own shadow root, so they reach the
 * specimens and nothing around them, and nothing around them reaches in.
 *
 * Shadow roots rather than `@scope`: a scoped sheet would keep the library's rules on the
 * specimens, but the workbench's own element rules would still reach them. In a shadow root the
 * specimens stand only on what they inherit, the packaged defaults the app document loads
 * (`one.css`; the app never links the live base sheet), plus the library; and one constructed
 * sheet, shared by every specimen, works in current Chromium, Safari and Firefox.
 *
 * - `:root` becomes `:host`, the specimen's root (`:root.x` becomes `:host(.x)`).
 * - `@font-face` cannot work in a shadow root (Chromium ignores it there), so the faces go to the
 *   document, each family under a private name the rules are rewritten to, so a library's face can
 *   never replace one the workbench itself draws with.
 * - `@import` cannot stand in a constructed stylesheet. A font stylesheet (`fonts.googleapis.com`,
 *   which serves nothing but `@font-face`) goes to the document with the faces; any other import
 *   is left out of the specimens, which a library's own published sheet still carries.
 */
export interface ScopedLibrary {
  /** The rules for the specimens' shadow roots. */
  rules: string;
  /** The faces (and font stylesheets) for the document. */
  faces: string;
}

const FONT_STYLESHEETS = /^(?:url\()?\s*["']?https:\/\/fonts\.googleapis\.com\//i;
const PRIVATE = "ds1-library ";

export function scopeLibrary(css: string): ScopedLibrary {
  const imports: string[] = [];
  const faces: string[] = [];
  let rules = "";
  let from = 0;
  for (const statement of statements(css)) {
    if (!/^@(import|font-face)\b/i.test(statement.text)) continue;
    rules += css.slice(from, statement.start);
    from = statement.end;
    if (/^@import/i.test(statement.text)) {
      if (FONT_STYLESHEETS.test(statement.text.slice("@import".length).trim())) imports.push(statement.text);
    } else faces.push(statement.text);
  }
  rules += css.slice(from);
  const families = [...new Set(faces.map(face => /font-family\s*:\s*(["']?)([^;"'}]+)\1/i.exec(face)?.[2]?.trim()).filter((name): name is string => !!name))];
  const rename = (text: string) => families.reduce((result, family) => {
    const name = family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return result
      .replace(new RegExp(`(["'])${name}\\1`, "g"), `"${PRIVATE}${family}"`)
      .replace(new RegExp(`(^|[:,]\\s*)${name}(?=\\s*(?:[,;!}]|$))`, "gm"), `$1"${PRIVATE}${family}"`);
  }, text);
  return {
    rules: rename(rules).replace(/:root\b((?:\.[\w-]+|\[[^\]]*\]|:(?!root\b)[\w-]+(?:\([^()]*\))?)*)/g, (_, rest: string) => (rest ? `:host(${rest})` : ":host")),
    faces: [...imports, ...faces.map(rename)].join("\n"),
  };
}

/** Each top-level statement or block, comment- and string-aware: its text and where it stands. */
function statements(css: string) {
  const found: { start: number; end: number; text: string }[] = [];
  let depth = 0;
  let start = -1;
  let quote = "";
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index]!;
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && css[index + 1] === "*") {
      const close = css.indexOf("*/", index + 2);
      index = close < 0 ? css.length : close + 1;
      continue;
    }
    if (depth === 0 && start < 0 && !/\s/.test(char)) start = index;
    if (char === '"' || char === "'") quote = char;
    else if (char === "{") depth += 1;
    else if (char === "}" || (char === ";" && depth === 0)) {
      if (char === "}") depth = Math.max(0, depth - 1);
      if (depth === 0 && start >= 0) {
        found.push({ start, end: index + 1, text: css.slice(start, index + 1) });
        start = -1;
      }
    }
  }
  return found;
}
