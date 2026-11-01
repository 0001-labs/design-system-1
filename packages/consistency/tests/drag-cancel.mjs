/** drag.cancel-home: Escape, a lost window or a hidden page mid-drag sends the block home and leaves nothing behind. Build first. */
import { contract, openNativePage, pageOf, leftovers, landing } from './harness.mjs';

const NAME = 'Escape, a lost window and a hidden page send a carried block home';
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd']) });
  const before = JSON.stringify(await editor.read()), home = await editor.rect('a');
  for (const [how, cancel] of [
    ['Escape', () => page.keyboard.press('Escape')],
    ['blur', () => editor.frame.evaluate(() => window.dispatchEvent(new Event('blur')))],
    ['a hidden page', () => editor.frame.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); delete document.visibilityState; })],
  ]) {
    await editor.drag('a', 'c', { release: false });
    if (!await editor.frame.$('[data-drag-preview]')) throw Error(`${how}: the block did not lift`);
    await cancel();
    await editor.up();
    if (JSON.stringify(await editor.read()) !== before) throw Error(`${how}: the document changed`);
    const left = await leftovers(editor.frame);
    if (left.length) throw Error(`${how}: left behind ${left.join(', ')}`);
    const now = await editor.rect('a');
    if (Math.abs(now.top - home.top) > 1) throw Error(`${how}: the block is not home (${now.top} vs ${home.top})`);
    if (!(await editor.selection()).includes('a')) throw Error(`${how}: the selection was lost`);
  }
  await editor.drag('a', 'c', { release: false });
  const lands = await landing(editor.frame, 'a');
  await editor.up(); await lands();
  if ((await editor.order()).join() !== 'b,c,a,d') throw Error(`After cancelling, the block did not move again: ${await editor.order()}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): document unchanged, nothing left behind, selection kept, the block drags again and lands within 1px`);
});
