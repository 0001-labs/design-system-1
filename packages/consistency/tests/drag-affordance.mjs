/** drag.target-shown: the list a carried block will land in is outlined, its reserved room shown, and a block over no list fades. Build first. */
import { contract, openNativePage, pageOf, leftovers, STAGE } from './harness.mjs';

const NAME = 'The list a carried block will land in is shown';
const column = (id, ids) => ({ id, kind: 'flow', direction: 'column', gap: 20, padding: 0, children: ids.map(child => ({ id: child, kind: 'content', source: `Block ${child}` })) });
const document = pageOf(['p1', { id: 'cols', kind: 'flow', direction: 'row', gap: 20, padding: 0, children: [column('colA', ['a1', 'a2']), column('colB', ['b1'])] }, 'p2']);
const look = (frame, id) => frame.evaluate(id => { const element = document.querySelector(`[data-native-block="${id}"]`), style = getComputedStyle(element); return { outline: style.outlineStyle === 'solid' && style.outlineWidth === '1px', padding: parseFloat(style.paddingBottom), height: element.getBoundingClientRect().height }; }, id);
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document });
  const before = await look(editor.frame, 'colB');
  if (before.outline) throw Error('A list is outlined before anything is carried');
  await editor.drag('a1', 'b1', { release: false });
  const over = await look(editor.frame, 'colB'), root = await editor.frame.evaluate(() => getComputedStyle(document.querySelector('[data-c9y-native-root]')).outlineStyle);
  if (!over.outline) throw Error('The list under the carried block is not outlined');
  if (root === 'solid') throw Error('The page itself is outlined');
  if (over.padding < 20) throw Error(`The entered list reserves no room: ${over.padding}px`);
  await editor.moveTo({ x: 300, y: STAGE.top / 2 }, { page: true });
  // The preview keeps its own appearance whole (drag.appearance), so the overlay that carries it fades.
  const faded = await editor.frame.evaluate(() => getComputedStyle(document.querySelector('[data-drag-overlay]')).opacity);
  if (Number(faded) !== 0.6) throw Error(`A block over no list does not fade: ${faded}`);
  await editor.moveTo(await editor.point('b1', 'bottom'));
  await editor.up();
  const after = await look(editor.frame, 'colB');
  if (after.outline || after.padding) throw Error(`The list stays marked after the drop: ${JSON.stringify(after)}`);
  const left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind: ${left.join(', ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): the entered list is outlined 1px with ${over.padding}px reserved, the page is never outlined, a block over no list is at 0.6, nothing is marked after the drop`);
});
