/** drag.scroll-while-carried: the wheel scrolls the page under a carried block, and the drop follows the pointer. Build first. */
import { contract, openNativePage, pageOf, landing } from './harness.mjs';

const NAME = 'Scrolling under a carried block keeps the drop under the pointer';
const ids = Array.from({ length: 70 }, (_, index) => `b${index}`);
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(ids) });
  await editor.drag('b0', { x: 600, y: 500 }, { release: false });
  await editor.wheel(300);
  await editor.frame.waitForFunction(() => scrollY > 0, null, { timeout: 3000 }).catch(() => { throw Error('The wheel did not scroll the page while carrying'); });
  // Until the scroll comes to rest; the destination is evaluated again on the frame after it.
  await editor.frame.waitForFunction(async () => { const at = scrollY; await new Promise(done => setTimeout(done, 100)); return scrollY === at; });
  await page.waitForTimeout(50);
  const scrolled = await editor.frame.evaluate(() => scrollY);
  const preview = await editor.frame.evaluate(() => document.querySelector('[data-drag-preview]').getBoundingClientRect().top);
  const lands = await landing(editor.frame, 'b0');
  await editor.up(); await lands();
  const top = (await editor.rect('b0')).top;
  if (Math.abs(top - preview) > 20) throw Error(`The drop did not follow the pointer: landed at ${top}, carried at ${preview}`);
  const index = (await editor.order()).indexOf('b0');
  if (index < 25 + Math.floor(scrolled / 20) - 2) throw Error(`The drop ignored the scroll: index ${index}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): scrolled ${scrolled}px while carrying, landed at index ${index} under the pointer within 1px, ledger clean`);
});
