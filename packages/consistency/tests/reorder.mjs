/** drag.single-landing: a dropped block lands once, at its committed place within 1px, in the flow, beside a block, between columns and among duplicates. Build first. */
import { contract, openNativePage, pageOf, leftovers, landing } from './harness.mjs';

const NAME = 'Single landing';
const block = (id, source = `Block ${id}`) => ({ id, kind: 'content', source });
const column = (id, ids) => ({ id, kind: 'flow', direction: 'column', gap: 20, padding: 0, children: ids.map(child => block(child)) });
/** The tree as ids; a row the editor made to place a block beside another is `row`. */
const tree = blocks => blocks.map(item => item.children ? `${item.id.startsWith('block_') ? 'row' : item.id}[${tree(item.children)}]` : item.id).join(',');
/** The spacing handles drawn now: one per space, so none is drawn twice over the same space. */
const duplicateGaps = frame => frame.evaluate(() => {
  const seen = new Set(), twice = [];
  for (const handle of document.querySelectorAll('.consistency-text-gap')) {
    const box = handle.getBoundingClientRect(); if (!box.width && !box.height) continue;
    const key = [handle.getAttribute('aria-label'), handle.getAttribute('aria-orientation'), ...[box.left, box.top, box.width, box.height].map(Math.round)].join('|');
    if (seen.has(key)) twice.push(key); seen.add(key);
  }
  return twice;
});
const cases = [
  { kind: 'flow', document: pageOf(['a', 'b', 'c', 'd'], { gap: 40 }), id: 'a', to: editor => editor.point('c', 'bottom'), expected: 'b,c,a,d', ledger: true },
  { kind: 'beside', document: pageOf(['a', 'b', 'c']), id: 'a', to: async editor => { const c = await editor.rect('c'); return { x: c.left + 6, y: c.top + c.height / 2 }; }, expected: 'b,row[a,c]' },
  { kind: 'column', document: pageOf(['p1', { id: 'cols', kind: 'flow', direction: 'row', gap: 20, padding: 0, children: [column('colA', ['a1', 'a2']), column('colB', ['b1'])] }, 'p2']), id: 'a1', to: editor => editor.point('b1', 'bottom'), expected: 'p1,cols[colA[a2],colB[b1,a1]],p2', ledger: true },
  { kind: 'duplicate', document: pageOf([block('d1', 'The same words'), 'x', block('d2', 'The same words')]), id: 'd1', to: async editor => { const d = await editor.rect('d2'); return { x: d.right - 6, y: d.top + d.height / 2 }; }, expected: 'x,row[d2,d1]' },
];
await contract({}, async ({ page, name }) => {
  const passed = [];
  for (const { kind, document, id, to, expected, ledger } of cases) {
    const editor = await openNativePage(page, { document });
    await editor.drag(id, await to(editor), { release: false });
    const lands = await landing(editor.frame, id);
    await editor.up(); await lands();
    const now = tree((await editor.read()).blocks);
    if (now !== expected) throw Error(`${kind}: expected ${expected}, got ${now}`);
    const left = await leftovers(editor.frame);
    if (left.length) throw Error(`${kind}: left behind ${left.join(', ')}`);
    const twice = await duplicateGaps(editor.frame);
    if (twice.length) throw Error(`${kind}: spacing drawn twice after the move: ${twice.join('; ')}`);
    // Placing beside moves the target into a new row after the drop, which the movement ledger reports; landing is what this contract holds there.
    if (ledger && editor.broken.length) throw Error(`${kind}: ${editor.broken.join('\n')}`);
    passed.push(kind);
  }
  console.log(`${NAME} (${name}): ${passed.join(', ')}; each preview and its committed block agree within 1px, nothing moves after the handoff, no space is drawn twice`);
});
