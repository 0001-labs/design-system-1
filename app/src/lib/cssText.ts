function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function customPropertyPattern(name: string) {
  return new RegExp(`(${escapeRegExp(name)}\\s*:\\s*)([^;]+)(;)`);
}

export function matchingBrace(css: string, openIndex: number) {
  let depth = 0;
  let quote = "";

  for (let index = openIndex; index < css.length; index += 1) {
    const char = css[index];

    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "/" && css[index + 1] === "*") {
      const close = css.indexOf("*/", index + 2);
      if (close < 0) return -1;
      index = close + 1;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

export function rootBlockRange(css: string) {
  let depth = 0;
  let quote = "";
  let preludeStart = 0;

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];

    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === "/" && css[index + 1] === "*") {
      const close = css.indexOf("*/", index + 2);
      if (close < 0) return null;
      index = close + 1;
      continue;
    }

    if (char === "{") {
      if (depth === 0 && isRootPrelude(css.slice(preludeStart, index))) {
        const end = matchingBrace(css, index);
        return end < 0 ? null : { end, start: index + 1 };
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth = Math.max(0, depth - 1);
      if (depth === 0) preludeStart = index + 1;
      continue;
    }

    if (char === ";" && depth === 0) preludeStart = index + 1;
  }

  return null;
}

function isRootPrelude(prelude: string) {
  return /:root(?![\w-])/.test(prelude.replace(/\/\*[\s\S]*?\*\//g, ""));
}

export function replaceCustomProperty(css: string, name: string, value: string) {
  const pattern = customPropertyPattern(name);
  const rewrite = (text: string) =>
    text.replace(
      pattern,
      (_match, prefix: string, _previous: string, suffix: string) =>
        `${prefix}${value}${suffix}`,
    );

  const root = rootBlockRange(css);
  if (!root) return rewrite(css);

  const body = css.slice(root.start, root.end);
  return `${css.slice(0, root.start)}${rewrite(body)}${css.slice(root.end)}`;
}

export function readCustomProperty(css: string, name: string) {
  const root = rootBlockRange(css);
  const scope = root ? css.slice(root.start, root.end) : css;
  return scope.match(customPropertyPattern(name))?.[2]?.trim();
}
