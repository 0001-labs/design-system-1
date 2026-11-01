/** drag.no-self-nesting: a block that holds blocks is never dropped into itself or a descendant. Build first. */
import { contract, openNativePage, pageOf, leftovers, picture } from './harness.mjs';

const NAME = 'A block is never dropped into itself or what it holds';
const column = (id, ids) => ({ id, kind: 'flow', direction: 'column', gap: 20, padding: 0, children: ids.map(child => picture(child)) });
const document = pageOf(['p1', { id: 'cols', kind: 'flow', direction: 'row', gap: 20, padding: 0, children: [column('colA', ['a1', 'a2']), column('colB', ['b1'])] }, 'p2']);
const acyclic = blocks => { const seen = new Set(); const visit = list => list.every(block => !seen.has(block.id) && seen.add(block.id) && visit(block.children ?? [])); return visit(blocks); };
const parentOf = (blocks, id, parent = 'page') => { for (const block of blocks) { if (block.id === id) return parent; const found = block.children && parentOf(block.children, id, block.id); if (found) return found; } };
const find = (blocks, id) => { for (const block of blocks) { if (block.id === id) return block; const found = block.children && find(block.children, id); if (found) return found; } };
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document });
  const check = async (id, into, parent) => {
    const blocks = (await editor.read()).blocks;
    if (!acyclic(blocks)) throw Error(`${id} into ${into}: the document is no longer a tree`);
    if (parentOf(blocks, id) !== parent) throw Error(`${id} into ${into}: it moved inside ${parentOf(blocks, id)}`);
    if (JSON.stringify(find(blocks, id)) !== JSON.stringify(find(document.blocks, id))) throw Error(`${id} into ${into}: the block changed`);
    const left = await leftovers(editor.frame);
    if (left.length) throw Error(`${id} into ${into}: left behind ${left.join(', ')}`);
  };
  // A column, carried by the pointer after Select parent, over its own pictures.
  const selectColumn = async () => {
    const o = await editor.origin(), a1 = await editor.point('a1');
    await page.mouse.click(o.x + a1.x, o.y + a1.y, { button: 'right' });
    await page.getByText('Select parent').first().click();
    await editor.frame.waitForFunction(() => !document.querySelector('[data-native-block="a1"]').hasAttribute('data-drag-handle'));
  };
  for (const [target, into] of [[{ x: 200, y: 140 }, 'itself, below its last picture'], [{ x: 200, y: 100 }, 'itself, between its pictures']]) {
    await selectColumn();
    await editor.drag('a1', target, { release: false });
    const carried = await editor.frame.evaluate(() => document.querySelector('[data-drag-source]')?.dataset.nativeBlock);
    if (carried !== 'colA') throw Error(`Select parent did not carry the column: ${carried}`);
    await editor.up();
    await check('colA', into, 'cols');
  }
  // The columns block, lifted from the keyboard, tried in every direction towards its own columns.
  const tried = [];
  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
    await editor.lift('cols');
    await page.keyboard.press(key);
    tried.push(`${key}: ${await editor.frame.evaluate(() => document.querySelector('[data-drag-over]')?.dataset.nativeBlock ?? 'page')}`);
    await page.keyboard.press('Enter');
    await editor.frame.waitForFunction(() => !document.querySelector('[data-drag-overlay]'));
    await check('cols', key, 'page');
  }
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): a column carried over itself stays in its row; the columns block reaches only the page (${tried.join(', ')}); the tree stays acyclic and both blocks unchanged`);
});
