/**
 * drag.edge-intent: a block lifted beside the canvas's edge scrolls nothing until the pointer goes on towards that edge.
 * Held for the page's own blocks and for a block of writing, which Aa carries on its own copy of Drag. Build first.
 */
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

// Writing of several blocks is carried by Aa, on the Drag engine in its own bundle.
const WRITING = 'A block of writing lifted at the foot of the canvas stays put until it is carried on down';
const source = ids.map((_, index) => `Line ${index}`).join('\n\n');
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source }]) });
  const height = await editor.frame.evaluate(() => innerHeight);
  const foot = await editor.frame.evaluate(height => { const element = [...document.querySelectorAll('[data-native-block="w"] .aa-block')].find(element => { const box = element.getBoundingClientRect(); return box.top > height - 55 && box.bottom < height - 12; }); const box = element?.getBoundingClientRect(); return element && { words: element.textContent, y: box.top + box.height / 2 }; }, height);
  if (!foot) throw Error('No block of writing stands in the foot of the canvas');
  // Aa brings its dragging once a pointer reaches the writing.
  const origin = await editor.origin();
  await editor.mouse.move(origin.x + 60, origin.y + foot.y, 0); await page.waitForTimeout(400);
  await editor.drag('w', { x: 100, y: foot.y - 8 }, { release: false, press: { x: 60, y: foot.y } });
  const carried = await editor.frame.evaluate(() => document.querySelector('.aa-block[data-drag-preview]')?.textContent);
  if (carried !== foot.words) throw Error(`The block of writing did not lift (${carried})`);
  await page.waitForTimeout(600);
  const resting = await editor.frame.evaluate(() => scrollY);
  if (resting) throw Error(`The page ran ${resting}px under a block of writing that was only picked up`);
  await editor.moveTo({ x: 100, y: Math.min(height - 4, foot.y + 16) });
  await editor.frame.waitForFunction(() => scrollY > 0, null, { timeout: 1500 }).catch(() => { throw Error('The page did not scroll once the block of writing was carried on towards the edge'); });
  await editor.up();
  const left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind ${left.join(', ')}`);
  if ((await editor.read()).blocks[0].source.split('\n\n').sort().join() !== source.split('\n\n').sort().join()) throw Error('The drop lost or changed words');
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${WRITING} (${name}): lifted ${Math.round(height - foot.y)}px from the foot and held 0.6s without scrolling; carried on, the page scrolled`);
});
