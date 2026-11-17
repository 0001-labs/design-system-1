import * as csstree from "css-tree";

import { LIBRARY_BUTTON_LINK, LIBRARY_BUTTON_LINK_BASE, LIBRARY_REVISION, LIBRARY_SELECTORS, LIBRARY_TOKENS, libraryStamp } from "../../../DS1/1-root/library-tokens";

export interface PreparedLibrary {
  css: string;
  revision: string;
  transform: string;
}

type Edit = { start: number; end: number; text: string };

const byLibraryToken = new Map<string, string[]>();
for (const [component, library] of LIBRARY_TOKENS) byLibraryToken.set(library, [...(byLibraryToken.get(library) ?? []), component]);

const replacements = Object.fromEntries(
  Object.entries(LIBRARY_SELECTORS).map(([name, text]) => [name, csstree.parse(text, { context: "selector" }) as csstree.Selector]),
) as Record<keyof typeof LIBRARY_SELECTORS, csstree.Selector>;

const earlierStamp = /^((?:@charset "[^"]*";\s*)?)\/\* Design system 1 library, revision sha256:[0-9a-f]{12} \*\/\n/;

function withoutEarlier(draft: string): string {
  let source = (draft.charCodeAt(0) === 0xfeff ? draft.slice(1) : draft).replace(earlierStamp, "$1");
  const base = source.indexOf(LIBRARY_BUTTON_LINK_BASE);
  if (base >= 0) source = source.slice(0, base) + source.slice(base + LIBRARY_BUTTON_LINK_BASE.length).replace(/^\n/, "");
  return source;
}

export function prepareLibrary(draft: string): PreparedLibrary {
  const source = withoutEarlier(draft);
  const edits: Edit[] = [];
  let ast: csstree.StyleSheet | undefined;
  try {
    ast = csstree.parse(source, { positions: true, parseValue: false, parseCustomProperty: false, parseAtrulePrelude: false, onParseError() {} }) as csstree.StyleSheet;
  } catch {
    ast = undefined;
  }
  const leading = new Map<number, number>();
  for (const node of ast?.children.toArray() ?? []) {
    if (node.type === "Atrule" && /^(?:charset|import)$/i.test(node.name) && !node.block && node.loc) leading.set(node.loc.start.offset, node.loc.end.offset);
  }
  let lead = 0;
  for (let at = 0; ; ) {
    while (at < source.length && /\s/.test(source[at]!)) at++;
    const end = source.startsWith("/*", at) ? source.indexOf("*/", at + 2) + 2 : leading.get(at);
    if (!end || end < 2) break;
    at = lead = end;
  }
  edits.push({ start: lead, end: lead, text: lead ? `\n${LIBRARY_BUTTON_LINK_BASE}` : `${LIBRARY_BUTTON_LINK_BASE}\n` });
  if (ast) {
    csstree.walk(ast, {
      enter(this: csstree.WalkContext, node: csstree.CssNode) {
        const inKeyframes = Boolean(this.atrule && /keyframes$/i.test(this.atrule.name));
        if (node.type === "Rule" && !inKeyframes) {
          const edit = selectorEdit(source, node);
          if (edit) edits.push(edit);
        }
        if (node.type === "Block" && !inKeyframes) edits.push(...tokenEdits(source, node));
      },
    });
  }
  const ordered = edits.map((edit, index) => ({ edit, index })).sort((a, b) => b.edit.start - a.edit.start || b.index - a.index);
  let css = source;
  for (const { edit } of ordered) css = css.slice(0, edit.start) + edit.text + css.slice(edit.end);
  const charset = /^@charset "[^"]*";\s*/.exec(css)?.[0] ?? "";
  css = `${charset}${libraryStamp()}\n${css.slice(charset.length)}`;
  return { css, revision: LIBRARY_REVISION, transform: `ds1-library@${LIBRARY_REVISION}` };
}

function selectorEdit(source: string, rule: csstree.Rule): Edit | undefined {
  const prelude = rule.prelude;
  if (prelude.type !== "SelectorList" || !prelude.loc) return undefined;
  const start = prelude.loc.start.offset, end = prelude.loc.end.offset;
  if (source.slice(start, end).includes(LIBRARY_BUTTON_LINK)) return undefined;
  const copy = csstree.clone(prelude) as csstree.SelectorList;
  const found: { item: csstree.ListItem<csstree.CssNode>; list: csstree.List<csstree.CssNode>; name: keyof typeof LIBRARY_SELECTORS }[] = [];
  csstree.walk(copy, {
    enter(node: csstree.CssNode, item: csstree.ListItem<csstree.CssNode>, list: csstree.List<csstree.CssNode>) {
      if (!item || !list) return;
      if (node.type === "TypeSelector" && !node.name.includes("|")) {
        const name = node.name.toLowerCase();
        if (name === "button" || name === "a") found.push({ item, list, name });
      }
      const other = list.toArray().some(sibling => sibling.type === "TypeSelector" && !["button", "*"].includes(sibling.name.toLowerCase()));
      if (node.type === "PseudoClassSelector" && node.name.toLowerCase() === "disabled" && !node.children && !other) found.push({ item, list, name: ":disabled" });
    },
  });
  if (!found.length) return undefined;
  for (const { item, list, name } of found) list.replace(item, (csstree.clone(replacements[name]) as csstree.Selector).children);
  return { start, end, text: csstree.generate(copy) };
}

function tokenEdits(source: string, block: csstree.Block): Edit[] {
  const declarations = block.children.toArray().filter((node): node is csstree.Declaration => node.type === "Declaration");
  const declared = new Set(declarations.map(declaration => declaration.property));
  const edits: Edit[] = [];
  for (const declaration of declarations) {
    const components = byLibraryToken.get(declaration.property);
    if (!components || !declaration.loc) continue;
    const end = declaration.loc.end.offset;
    const lineStart = source.lastIndexOf("\n", declaration.loc.start.offset - 1) + 1;
    const lead = source.slice(lineStart, declaration.loc.start.offset);
    const indent = /^[ \t]*$/.test(lead) ? `\n${lead}` : " ";
    const important = declaration.important ? " !important" : "";
    const added = components.filter(component => !declared.has(component));
    if (!added.length) continue;
    edits.push({ start: end, end, text: added.map(component => `;${indent}${component}: var(${declaration.property})${important}`).join("") });
  }
  return edits;
}
