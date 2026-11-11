/** drag.edge-intent: a block lifted beside the canvas's edge scrolls nothing until the pointer goes on towards that edge. Build first. */
import { contract, openNativePage, pageOf, leftovers } from './harness.mjs';

const NAME = 'A block lifted at the foot of the canvas stays put until it is carried on down';
const ids = Array.from({ length: 70 }, (_, index) => `b${index}`);
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(ids) });
  const height = await editor.frame.evaluate(() => innerHeight);
  // A block standing in the band at the foot of the canvas, where edge scrolling begins.
  const foot = await editor.frame.evaluate(height => { const element = [...document.querySelectorAll('[data-native-block]')].find(element => { const box = element.getBoundingClientRect(); return box.top > height - 55 && box.bottom < height - 12; }); const box = element?.getBoundingClientRect(); return element && { id: element.dataset.nativeBlock, y: box.top + box.height / 2 }; }, height);
  if (!foot) throw Error('No block stands in the foot of the canvas');
  await editor.drag(foot.id, { x: 100, y: foot.y - 8 }, { release: false, press: { x: 60, y: foot.y } });
  if (!await editor.frame.$('[data-drag-preview]')) throw Error('The block did not lift');
  await page.waitForTimeout(600);
  const resting = await editor.frame.evaluate(() => scrollY);
  if (resting) throw Error(`The page ran ${resting}px under a block that was only picked up`);
  // Carried on towards the edge, it scrolls as any carried block does.
  await editor.moveTo({ x: 100, y: Math.min(height - 4, foot.y + 16) });
  await editor.frame.waitForFunction(() => scrollY > 0, null, { timeout: 1500 }).catch(() => { throw Error('The page did not scroll once the block was carried on towards the edge'); });
  await page.keyboard.press('Escape'); await editor.up();
  const left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind ${left.join(', ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): lifted ${Math.round(height - foot.y)}px from the foot and held 0.6s without scrolling; carried on, the page scrolled`);
});
