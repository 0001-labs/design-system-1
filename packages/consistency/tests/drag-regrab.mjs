/** drag.regrab: a press while the last drop is still landing lands it at once and is itself carried. Build first. */
import { contract, openNativePage, pageOf, leftovers } from './harness.mjs';

const NAME = 'A block pressed while the last drop lands is carried at once';
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) });
  // Where the first block is let go, read before its neighbours make room.
  const o = await editor.origin(), drop = await editor.point('c', 'bottom');
  await editor.drag('a', drop, { release: false });
  await editor.mouse.up(o.x + drop.x, o.y + drop.y);
  // Sixty milliseconds on: the dropped block is still on its way.
  await page.waitForTimeout(60);
  const next = await editor.point('f');
  await editor.mouse.move(o.x + next.x, o.y + next.y, 0); await editor.mouse.down(o.x + next.x, o.y + next.y);
  if ((await editor.order()).slice(0, 3).join() !== 'b,c,a') throw Error(`The first drop was not committed: ${await editor.order()}`);
  await page.waitForTimeout(460);
  const target = await editor.point('h', 'bottom');
  // Down the middle of the page, to below the last block: a drop under it, not beside it.
  for (let n = 1; n <= 10; n++) await editor.mouse.move(o.x + next.x + (target.x - next.x) * n / 10, o.y + next.y + (target.y - next.y) * n / 10, 1);
  await page.waitForTimeout(100);
  const carried = await editor.frame.evaluate(() => document.querySelector('[data-drag-source]')?.dataset.nativeBlock ?? null);
  await editor.mouse.up(o.x + target.x, o.y + target.y);
  await editor.frame.waitForFunction(() => !document.querySelector('[data-drag-overlay]'), null, { timeout: 5000 });
  if (carried !== 'f') throw Error(`The press during the landing carried ${carried ?? 'nothing'}`);
  if ((await editor.order()).join() !== 'b,c,a,d,e,g,h,f') throw Error(`The second block did not land: ${await editor.order()}`);
  const left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind ${left.join(', ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): pressed 60ms after a release, the first drop was in place and the second block was carried and landed, ledger clean`);
});
