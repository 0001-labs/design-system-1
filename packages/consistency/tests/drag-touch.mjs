/** drag.touch: a finger lifts a block only after holding still; a finger that moves at once scrolls and changes nothing. Build first. */
import { contract, openNativePage, pageOf, leftovers, landing } from './harness.mjs';

const NAME = 'A finger lifts a block after a hold and scrolls without one';
await contract({ browser: 'chromium', hasTouch: true }, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd']) });
  const before = JSON.stringify(await editor.read());
  await editor.dragTouch('a', await editor.point('c', 'bottom'), { holdMs: 90 });
  if (JSON.stringify(await editor.read()) !== before) throw Error('A finger that moved at once changed the page');
  let left = await leftovers(editor.frame);
  if (left.length) throw Error(`A moving finger left behind ${left.join(', ')}`);
  const lands = await landing(editor.frame, 'a', 1400);
  await editor.dragTouch('a', await editor.point('c', 'bottom'), { holdMs: 300 });
  await lands();
  if ((await editor.order()).join() !== 'b,c,a,d') throw Error(`A held finger did not reorder: ${await editor.order()}`);
  left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind ${left.join(', ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): moved within 90ms it left the page unchanged; held 300ms it reordered and landed within 1px, ledger clean`);
});
