/** motion.reduced, in the browser: with reduced motion a drop lands at once, with nothing animating after it. Build first. */
import { contract, openNativePage, pageOf, leftovers } from './harness.mjs';

const NAME = 'With reduced motion a drop lands at once';
await contract({ reducedMotion: 'reduce' }, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd']) });
  await editor.drag('a', 'c', { release: false });
  await editor.up();
  // At once: by the next frame the overlay is gone and nothing in the page animates.
  const after = await editor.frame.evaluate(() => new Promise(done => requestAnimationFrame(() => done({ overlay: !!document.querySelector('[data-drag-overlay]'), animations: document.getAnimations().map(a => a.effect?.target?.dataset?.nativeBlock ?? a.effect?.target?.className ?? 'animation') }))));
  if (after.overlay) throw Error('The preview is still landing');
  if (after.animations.length) throw Error(`Still animating after the drop: ${after.animations.join(', ')}`);
  if ((await editor.order()).join() !== 'b,c,a,d') throw Error(`Unexpected order ${await editor.order()}`);
  for (const [id, top] of [['b', 0], ['c', 20], ['a', 40], ['d', 60]]) { const box = await editor.rect(id); if (Math.abs(box.top - top) > 0.5) throw Error(`${id} stands at ${box.top}, not ${top}`); }
  const left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind: ${left.join(', ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): no landing motion, no animations after the drop, every block at its committed place`);
});
