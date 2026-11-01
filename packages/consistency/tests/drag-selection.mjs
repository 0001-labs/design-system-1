/** drag.selection-together: selected sibling blocks are carried, cancelled and moved by the keyboard together. Build first. */
import { contract, openNativePage, pageOf, leftovers, landing, picture } from './harness.mjs';

const NAME = 'Selected blocks move together';
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd', 'e'].map(id => picture(id, 40)), { overrides: ['padding'], padding: 40 }) });
  const o = await editor.origin(), b = await editor.rect('b'), c = await editor.rect('c');
  // A marquee from the page's own margin across b and c.
  const from = { x: o.x + 20, y: o.y + b.top + 5 }, to = { x: o.x + 600, y: o.y + c.bottom - 5 };
  await editor.mouse.move(from.x, from.y, 0); await editor.mouse.down(from.x, from.y);
  for (let n = 1; n <= 10; n++) await editor.mouse.move(from.x + (to.x - from.x) * n / 10, from.y + (to.y - from.y) * n / 10, 1);
  await editor.mouse.up(to.x, to.y);
  await editor.frame.waitForFunction(() => document.querySelectorAll('[data-selectable][data-selected]').length === 2);
  if ((await editor.selection()).join() !== 'b,c') throw Error(`The marquee chose ${await editor.selection()}`);
  const clean = async how => {
    const left = await leftovers(editor.frame);
    if (await editor.frame.$('[data-drag-group]')) left.push('the folded selection');
    if (left.length) throw Error(`${how}: left behind ${left.join(', ')}`);
    if ((await editor.selection()).join() !== 'b,c') throw Error(`${how}: the selection is ${await editor.selection()}`);
    if (editor.broken.length) throw Error(`${how}: ${editor.broken.join('\n')}`);
  };
  // Escape sends both home.
  const before = JSON.stringify(await editor.read());
  await editor.drag('b', 'e', { release: false });
  const count = await editor.frame.evaluate(() => document.querySelector('[data-drag-preview] .c9y-drag-count')?.textContent);
  if (count !== '2') throw Error(`The carried selection is not counted: ${count}`);
  await page.keyboard.press('Escape'); await editor.up();
  if (JSON.stringify(await editor.read()) !== before) throw Error('Escape changed the page');
  for (const [id, box] of [['b', b], ['c', c]]) if (Math.abs((await editor.rect(id)).top - box.top) > 1) throw Error(`Escape left ${id} away from home`);
  await clean('Escape');
  // Carried by one of them, both land together in their order.
  await editor.drag('c', 'e', { release: false });
  const lands = await landing(editor.frame, 'b');
  await editor.up(); await lands();
  if ((await editor.order()).join() !== 'a,d,e,b,c') throw Error(`Dropped: ${await editor.order()}`);
  const gap = (await editor.rect('c')).top - (await editor.rect('b')).bottom;
  if (Math.abs(gap - (c.top - b.bottom)) > 1) throw Error(`They landed ${gap}px apart, not as they stood`);
  await clean('Dropped');
  // Alt+Arrows move the whole selection a place.
  await page.keyboard.press('Alt+ArrowUp');
  if ((await editor.order()).join() !== 'a,d,b,c,e') throw Error(`Alt+ArrowUp: ${await editor.order()}`);
  await page.keyboard.press('Alt+ArrowDown');
  if ((await editor.order()).join() !== 'a,d,e,b,c') throw Error(`Alt+ArrowDown: ${await editor.order()}`);
  await clean('Alt+Arrows');
  console.log(`${NAME} (${name}): a marquee chose two, the carried pair is counted, Escape sent both home, dropped they landed together in order within 1px, Alt+arrows moved both, ledger clean`);
});
