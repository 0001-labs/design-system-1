/** drag.across-containers: blocks move between columns and out to the page; a column's single block carries its column. Build first. */
import { contract, openNativePage, pageOf, leftovers, landing } from './harness.mjs';

const NAME = 'Blocks move between columns and out to the page';
const column = (id, ids) => ({ id, kind: 'flow', direction: 'column', gap: 20, padding: 0, children: ids.map(child => ({ id: child, kind: 'content', source: `Block ${child}` })) });
const columns = (a, b) => pageOf(['p1', { id: 'cols', kind: 'flow', direction: 'row', gap: 20, padding: 0, children: [column('colA', a), column('colB', b)] }, 'p2']);
const tree = blocks => blocks.map(block => block.children ? `${block.id}[${tree(block.children)}]` : block.id).join(',');
await contract({}, async ({ page, name }) => {
  const steps = [];
  const move = async (editor, id, to, expected, how) => {
    await editor.drag(id, to, { release: false });
    const lands = await landing(editor.frame, id);
    await editor.up(); await lands();
    const now = tree((await editor.read()).blocks);
    if (now !== expected) throw Error(`${how}: expected ${expected}, got ${now}`);
    const left = await leftovers(editor.frame);
    if (left.length) throw Error(`${how}: left behind ${left.join(', ')}`);
    if (editor.broken.length) throw Error(`${how}: ${editor.broken.join('\n')}`);
    steps.push(how);
  };
  let editor = await openNativePage(page, { document: columns(['a1', 'a2'], ['b1']) });
  await move(editor, 'a1', 'b1', 'p1,cols[colA[a2],colB[b1,a1]],p2', 'a block into the other column');
  await move(editor, 'a2', 'p2', 'p1,cols[colB[b1,a1]],a2,p2', 'a column’s single block out to the page, its column with it');
  editor = await openNativePage(page, { document: columns(['a1'], ['b1']) });
  await move(editor, 'a1', 'b1', 'p1,cols[colB[b1,a1]],p2', 'a column’s single block into the other column, its column with it');
  console.log(`${NAME} (${name}): ${steps.join('; ')}; each lands within 1px, no empty column is left, the ledger stays clean`);
});
