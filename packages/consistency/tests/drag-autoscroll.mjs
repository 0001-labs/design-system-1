/** drag.auto-scroll: a block held near the canvas's bottom edge scrolls the page and lands past the last block. Build first. */
import { contract, openNativePage, pageOf, landing } from './harness.mjs';

const NAME = 'A block held at the bottom edge scrolls the page and lands last';
const ids = Array.from({ length: 70 }, (_, index) => `b${index}`);
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(ids) });
  const height = await editor.frame.evaluate(() => innerHeight);
  if (await editor.frame.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight)) throw Error('The page does not overflow its frame');
  await editor.drag('b0', { x: 600, y: height - 15 }, { release: false });
  const start = Date.now();
  await editor.frame.waitForFunction(() => scrollY > 0, null, { timeout: 1000 }).catch(() => { throw Error('The frame did not scroll within 1s'); });
  const first = Date.now() - start;
  await editor.frame.waitForFunction(() => scrollY >= document.scrollingElement.scrollHeight - innerHeight - 1, null, { timeout: 10000 });
  const last = await editor.rect(ids.at(-1));
  await editor.moveTo({ x: 600, y: last.bottom - 4 });
  await page.waitForTimeout(120);
  const lands = await landing(editor.frame, 'b0');
  await editor.up(); await lands();
  const order = await editor.order();
  if (order.at(-1) !== 'b0') throw Error(`b0 is not last: ${order.slice(-3)}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): scrolled after ${first}ms, landed last within 1px, ledger clean`);
});
