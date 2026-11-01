/** drag.release-anywhere: a block carried out of the canvas and released over the app ends its drag. Build first. */
import { contract, openNativePage, pageOf, leftovers, STAGE } from './harness.mjs';

const NAME = 'Releasing a carried block outside the canvas ends the drag';
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd']) });
  await editor.drag('a', 'c', { release: false });
  if (!await editor.frame.$('[data-drag-preview]')) throw Error('The block did not lift');
  const made = await editor.frame.evaluate(() => [...document.querySelectorAll('[data-native-block]')].filter(e => e.style.translate && e.style.translate !== 'none').map(e => e.dataset.nativeBlock));
  await editor.moveTo({ x: 300, y: STAGE.top / 2 }, { page: true });
  await editor.up();
  const left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind after releasing over the app: ${left.join(', ')}`);
  const order = (await editor.order()).join();
  if (!['a,b,c,d', 'b,c,a,d'].includes(order)) throw Error(`Unexpected order ${order}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  await editor.select('d');
  const writing = await editor.frame.evaluate(() => document.activeElement?.closest('[data-native-block]')?.dataset.nativeBlock);
  if (writing !== 'd') throw Error(`A following press does not reach the page: the focus is in ${writing}`);
  console.log(`${NAME} (${name}): released over the app, ${order === 'a,b,c,d' ? 'the block went home' : 'the block took the last place it made room at'} (room made by ${made.join(', ') || 'none'}), nothing left behind, the next press writes in the page`);
});
