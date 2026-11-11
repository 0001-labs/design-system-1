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
 * - `:root` becomes `:host`, the specimen's root (`:root.x` becomes `:host(.x)`; the canvas puts
 *   the document's theme classes on each specimen, so theme selectors match as on the page). A
 *   rule whose `:root` cannot be said as a `:host` (inside `:is()`/`:has()`, after a type such as
 *   `html:root`, or followed by `:has()`) is left out whole rather than written broken.
 * - `@font-face` cannot work in a shadow root (Chromium ignores it there), so the faces go to the
 *   document, each family under a private name the rules are rewritten to, so a library's face can
 *   never replace one the workbench itself draws with. A face inside `@media`, `@supports` or
 *   `@layer` goes with its conditions around it.
 * - `@import` cannot stand in a constructed stylesheet, and an imported font stylesheet would
 *   declare its families under their own names in the document, where they could replace the
 *   workbench's faces. So every import is left out of the specimens: imported faces show in the
 *   examples below the canvas, whose frames take the whole sheet, and not on the canvas.
 *
 * What does nothing inside a specimen, silently: `html` and `body` selectors (there is no such
 * element in it), `@property` (registered only from the document), and a relative `url()`, which
 * resolves against the app's page rather than the library's address.
 */
export interface ScopedLibrary {
  /** The rules for the specimens' shadow roots. */
  rules: string;
  /** The faces for the document. */
  faces: string;
}

const PRIVATE = "ds1-library ";
const CONDITIONS = /^@(media|supports|layer|container)\b/i;

export function scopeLibrary(css: string): ScopedLibrary {
  const faces: string[] = [];
  const rules = scopeBlock(css, faces, []);
  const families = [...new Set(faces.map(face => /font-family\s*:\s*(["']?)([^;"'}]+)\1/i.exec(face)?.[2]?.trim()).filter((name): name is string => !!name))];
  const rename = (text: string) => families.reduce((result, family) => {
    const name = family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return result
      .replace(new RegExp(`(["'])${name}\\1`, "g"), `"${PRIVATE}${family}"`)
      .replace(new RegExp(`(^|[:,]\\s*)${name}(?=\\s*(?:[,;!}]|$))`, "gm"), `$1"${PRIVATE}${family}"`);
  }, text);
  return { rules: rename(rules), faces: faces.map(rename).join("\n") };
}

/** One block's statements, scoped: faces collected with their conditions, imports left out, `:root` rules mapped. */
function scopeBlock(css: string, faces: string[], conditions: string[]): string {
  let out = "";
  let from = 0;
  for (const statement of statements(css)) {
    out += css.slice(from, statement.start);
    from = statement.end;
    const { text } = statement;
    if (/^@import\b/i.test(text)) continue;
    if (/^@font-face\b/i.test(text)) { faces.push(conditions.reduceRight((inner, condition) => `${condition} { ${inner} }`, text)); continue; }
    const brace = openBrace(text);
    if (brace < 0) { out += text; continue; }
    const prelude = text.slice(0, brace).trim();
    const body = text.slice(brace + 1, -1);
    if (CONDITIONS.test(prelude)) out += `${prelude} {${scopeBlock(body, faces, [...conditions, prelude])}}`;
    else if (prelude.startsWith("@")) out += text;
    else {
      const selector = hostSelector(prelude);
      if (selector !== null) out += `${selector} {${body}}`;
    }
  }
  return out + css.slice(from);
}

/** A selector list with each `:root` as the specimen's `:host`, or null when one cannot be said faithfully. */
export function hostSelector(list: string): string | null {
  if (!/:root\b/i.test(list)) return list;
  const mapped = split(list).map(mapSelector);
  return mapped.includes(null) ? null : mapped.join(",");
}

function mapSelector(selector: string): string | null {
  let out = "";
  let at = 0;
  for (let index = selector.indexOf(":root"); index >= 0; index = selector.indexOf(":root", at)) {
    if (/[\w-]/.test(selector[index + 5] ?? "")) { out += selector.slice(at, index + 5); at = index + 5; continue; }
    // Inside parentheses or brackets, or after a type or class in the same compound: not a :host.
    if (depth(selector, index) > 0 || /[^\s>+~(,]$/.test(selector.slice(0, index))) return null;
    let end = index + 5;
    for (;;) {
      const char = selector[end];
      if (char === "." || char === "#") end = ident(selector, end + 1);
      else if (char === "[") end = close(selector, end, "[", "]");
      else if (char === ":" && selector[end + 1] !== ":") {
        end = ident(selector, end + 1);
        if (selector[end] === "(") end = close(selector, end, "(", ")");
      } else break;
      if (end < 0) return null;
    }
    const rest = selector.slice(index + 5, end);
    if (/:(has|host|root)\b/i.test(rest)) return null;
    out += selector.slice(at, index) + (rest ? `:host(${rest})` : ":host");
    at = end;
  }
  return out + selector.slice(at);
}

const ident = (text: string, from: number) => { let end = from; while (/[\w-]/.test(text[end] ?? "")) end += 1; return end; };

/** The index after the bracket that closes the one at `from`, or -1. */
function close(text: string, from: number, open: string, shut: string) {
  let level = 0;
  for (let index = from; index < text.length; index += 1) {
    if (text[index] === open) level += 1;
    else if (text[index] === shut && --level === 0) return index + 1;
  }
  return -1;
}

function depth(text: string, until: number) {
  let level = 0;
  for (let index = 0; index < until; index += 1) {
    if (text[index] === "(" || text[index] === "[") level += 1;
    else if (text[index] === ")" || text[index] === "]") level -= 1;
  }
  return level;
}

/** A selector list's selectors, split on the commas outside brackets. */
function split(list: string) {
  const parts: string[] = [];
  let start = 0;
  for (let index = 0; index < list.length; index += 1) if (list[index] === "," && depth(list, index) === 0) { parts.push(list.slice(start, index)); start = index + 1; }
  return [...parts, list.slice(start)];
}

/** Where a statement's block opens, outside strings, or -1 for a statement without one. */
function openBrace(text: string) {
  let quote = "";
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (quote) { if (char === "\\") index += 1; else if (char === quote) quote = ""; }
    else if (char === '"' || char === "'") quote = char;
    else if (char === "{") return index;
  }
  return -1;
}

/** Each top-level statement or block, comment- and string-aware: its text and where it stands. */
function statements(css: string) {
  const found: { start: number; end: number; text: string }[] = [];
  let level = 0;
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
      const end = css.indexOf("*/", index + 2);
      index = end < 0 ? css.length : end + 1;
      continue;
    }
    if (level === 0 && start < 0 && !/\s/.test(char)) start = index;
    if (char === '"' || char === "'") quote = char;
    else if (char === "{") level += 1;
    else if (char === "}" || (char === ";" && level === 0)) {
      if (char === "}") level = Math.max(0, level - 1);
      if (level === 0 && start >= 0) {
        found.push({ start, end: index + 1, text: css.slice(start, index + 1) });
        start = -1;
      }
    }
  }
  return found;
}
