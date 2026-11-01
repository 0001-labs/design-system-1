/** drag.one-movement: every top-level block moved to every place by keyboard; nothing moves again after release, and a forced second movement is reported. Build first. */
import { contract, openNativePage, pageOf, leftovers, settled, picture } from './harness.mjs';

const NAME = 'One movement';
await contract({}, async ({ page, name }) => {
  // Blocks the keyboard lifts: pictures of different heights and a section of words (a writing block's own Space types).
  const section = { id: 's', kind: 'flow', direction: 'column', gap: 20, padding: 20, children: [{ id: 's1', kind: 'content', source: 'Words in a section' }, { id: 's2', kind: 'content', source: 'More words' }] };
  const editor = await openNativePage(page, { document: pageOf([picture('a', 80), section, picture('c', 40), picture('d', 120)], { gap: 40 }) });
  const authored = (await editor.order()).join();
  const count = authored.split(',').length;
  let moves = 0;
  for (let from = 0; from < count; from++) for (let to = 0; to < count; to++) {
    if (from === to) continue;
    const id = (await editor.order())[from];
    // Space lifts, each arrow is one change of place, Space drops.
    await editor.lift(id);
    for (let step = 0; step < Math.abs(to - from); step++) await page.keyboard.press(to > from ? 'ArrowDown' : 'ArrowUp');
    await page.keyboard.press('Space'); await settled(editor.frame);
    // The engine compares every sibling a frame after the drop; wait past it before reading the ledger.
    await editor.frame.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
    const now = await editor.order();
    if (now.indexOf(id) !== to) throw Error(`${id}: dropped at ${now.indexOf(id)}, not ${to} (${now})`);
    if (editor.broken.length) throw Error(`${id} ${from}→${to}: ${editor.broken.join('; ')}`);
    const left = await leftovers(editor.frame);
    if (left.length) throw Error(`${id} ${from}→${to}: left behind ${left.join(', ')}`);
    moves++;
    // Undo the move, so each pair starts from the authored order.
    await page.keyboard.press('Meta+z');
    await editor.frame.waitForFunction(() => !document.querySelector('[data-drag-overlay]'));
    if ((await editor.order()).join() !== authored) throw Error(`Undo after ${id} ${from}→${to} left ${await editor.order()}`);
  }
  // Making room is real: a sibling takes a translate while a block is carried.
  const [first, second] = await editor.order();
  await editor.lift(first); await page.keyboard.press('ArrowDown');
  await editor.frame.waitForFunction(id => { const t = document.querySelector(`[data-native-block="${id}"]`).style.translate; return t && t !== 'none' && t !== '0px' && t !== '0px 0px'; }, second, { timeout: 2000 })
    .catch(() => { throw Error('No sibling made room while a block was carried'); });
  // The check is real: a page that draws a block somewhere other than where it made room breaks the constraint.
  await editor.frame.evaluate(() => document.addEventListener('keyup', event => { if (event.key === ' ') { const last = [...document.querySelectorAll('[data-c9y-native-root] > [data-native-block]')].at(-1); last.style.marginTop = '40px'; } }, { capture: true, once: true }));
  await page.keyboard.press('Space'); await settled(editor.frame);
  for (let n = 0; n < 50 && !editor.broken.some(text => text.includes('drag.one-movement')); n++) await editor.frame.evaluate(() => new Promise(done => requestAnimationFrame(done)));
  if (!editor.broken.some(text => text.includes('drag.one-movement'))) throw Error('A second movement went unreported');
  console.log(`${NAME} (${name}): ${moves} keyboard moves, each undone, nothing moved again after release; a sibling made room while carried; a forced second movement was reported`);
});
