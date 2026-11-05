/**
 * Marks where each block of a documentation page begins, so `scripts/docs-pages.mjs` can pair a block's Markdown with
 * the HTML the build drew for it. The markers are empty templates; that script takes every one out of the built page
 * again, so what a reader receives is exactly what the build would have drawn without them.
 */
const ATTRIBUTE = 'data-doc-block';
const encode = text => Buffer.from(text, 'utf8').toString('base64url');
const ATOMS = new Set(['mdxJsxFlowElement', 'mdxFlowExpression', 'html']);
/** A paragraph of nothing but tags, such as an anchor or a component on a line of its own in plain Markdown. */
const onlyMarkup = node => node.type === 'paragraph' && node.children.every(child => child.type === 'html' || child.type === 'mdxJsxTextElement' || child.type === 'text' && !child.value.trim() || child.type === 'break');

function marker(mdx, name, value) {
  return mdx
    ? { type: 'mdxJsxFlowElement', name: 'template', attributes: [{ type: 'mdxJsxAttribute', name, value }], children: [] }
    : { type: 'html', value: `<template ${name}="${value}"></template>` };
}

export function remarkDocBlocks() {
  return (tree, file) => {
    if (!/\/src\/content\/docs\//.test(file.path ?? '')) return;
    const mdx = /\.mdx$/.test(file.path), source = String(file.value), children = [];
    for (const node of tree.children) {
      const from = node.position?.start.offset, to = node.position?.end.offset;
      if (node.type === 'definition' || from === undefined || to === undefined) { children.push(node); continue; }
      const kind = node.type === 'mdxjsEsm' ? 'esm' : ATOMS.has(node.type) || onlyMarkup(node) ? 'atom' : 'text';
      children.push(marker(mdx, ATTRIBUTE, `${kind}.${encode(source.slice(from, to))}`), node);
    }
    children.push(marker(mdx, `${ATTRIBUTE}-end`, encode(file.path.replace(/^.*\/src\/content\/docs\//, ''))));
    tree.children = children;
  };
}
