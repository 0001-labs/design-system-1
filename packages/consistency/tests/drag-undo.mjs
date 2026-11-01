/** drag.undo-redo: a pointer reorder is one undoable step, undone and redone whole, each saved once. Build first. */
import { contract, openNativePage, pageOf, landing } from './harness.mjs';

const NAME = 'A pointer reorder undoes and redoes as one saved step';
const ids = ['a', 'b', 'c', 'd'];
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(ids) });
  const geometry = async () => JSON.stringify(await Promise.all(ids.map(id => editor.rect(id).then(box => [id, box.top, box.left]))));
  const initial = await geometry();
  await editor.drag('a', 'c', { release: false });
  const lands = await landing(editor.frame, 'a');
  await editor.up(); await lands();
  if ((await editor.order()).join() !== 'b,c,a,d') throw Error(`Unexpected order ${await editor.order()}`);
  const moved = await geometry();
  const saves = [await editor.savesSettled()];
  const step = async (key, order, expected) => {
    await page.keyboard.press(key);
    await editor.frame.waitForFunction(() => !document.querySelector('[data-drag-overlay]'));
    if ((await editor.order()).join() !== order) throw Error(`${key}: order ${await editor.order()}, not ${order}`);
    await page.waitForTimeout(50);
    if (await geometry() !== expected) throw Error(`${key}: the blocks do not stand where that order draws them`);
    saves.push(await editor.savesSettled());
  };
  await step('Meta+z', 'a,b,c,d', initial);
  await step('Meta+Shift+z', 'b,c,a,d', moved);
  if (saves.join() !== '1,2,3') throw Error(`Expected one save per settled step, counted ${saves.join(', ')}`);
  if (editor.api.api) throw Error(`The editor wrote to the API ${editor.api.api} times`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): reorder, undo and redo each restore order and geometry and save once (${saves.join(', ')}), ledger clean`);
});
