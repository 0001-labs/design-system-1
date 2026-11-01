/** editing.gesture-ownership: a marquee owns its pointer, keeps spacing available, writes no history, cancels to the previous selection and follows scrolling. Build first. */
import { contract, openNativePage, pageOf, picture } from './harness.mjs';

const NAME = 'Interaction ownership';
const list = { id: 'list', kind: 'flow', direction: 'column', gap: 20, padding: 0, children: [{ id: 'w1', kind: 'content', source: 'First words' }, { id: 'w2', kind: 'content', source: 'Second words' }] };
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf([{ id: 'l', kind: 'link', href: '/about/', text: 'About us' }, ...['a', 'b', 'c', 'd'].map(id => picture(id, 200)), list, picture('e', 200)], { overrides: ['padding'], padding: 40 }) });
  const { frame, mouse } = editor;
  const o = await editor.origin();
  const history = () => page.evaluate(() => document.querySelector('#c9y-stage consistency-workspace-page').pageEditor.controller.state.past.length);
  const json = async () => JSON.stringify(await editor.read());
  const sweep = async (from, to, steps = 10) => { for (let n = 1; n <= steps; n++) await mouse.move(from.x + (to.x - from.x) * n / steps, from.y + (to.y - from.y) * n / steps, 1); };
  const frames = (count = 2) => frame.evaluate(count => new Promise(done => { const next = left => left ? requestAnimationFrame(() => next(left - 1)) : done(); next(count); }), count);
  const before = await json(), saves = await editor.saves();
  if (await history()) throw Error('The page opened with history');

  // Count rebuilds of the editor and layout reads of stable content, not machine-dependent timings.
  await page.evaluate(() => {
    const controller = document.querySelector('#c9y-stage consistency-workspace-page').pageEditor.controller;
    window.interactionMetrics = { rebuilds: 0, reads: 0 };
    const reconcile = controller.reconcile; controller.reconcile = function (...args) { window.interactionMetrics.rebuilds++; return reconcile.apply(this, args); };
  });
  await frame.evaluate(() => {
    const rect = Object.getOwnPropertyDescriptor(Element.prototype, 'getBoundingClientRect').value;
    Element.prototype.getBoundingClientRect = function () { if (this.matches('[data-selectable]')) parent.interactionMetrics.reads++; return Reflect.apply(rect, this, []); };
  });

  // A marquee from the page's margin across the link and two pictures. Hovered on its own, the link offers Edit.
  const l = await editor.rect('l'), b = await editor.rect('b');
  await mouse.move(o.x + l.left + 10, o.y + l.top + l.height / 2, 0);
  await page.waitForFunction(() => !document.querySelector('.consistency-control-edit').hidden);
  await mouse.move(o.x + 20, o.y + l.top + 2, 0);
  await page.waitForFunction(() => document.querySelector('.consistency-control-edit').hidden);
  const start = { x: o.x + 20, y: o.y + l.top + 2 }, end = { x: o.x + 600, y: o.y + b.top + 20 };
  await mouse.move(start.x, start.y, 0); await mouse.down(start.x, start.y);
  await mouse.move(start.x + 10, start.y + 10, 1); await frames();
  // The counters are live: the marquee measured its candidates once as it began.
  if (!(await page.evaluate(() => window.interactionMetrics.reads))) throw Error('The layout reads are not being counted');
  await page.evaluate(() => { window.interactionMetrics.rebuilds = 0; window.interactionMetrics.reads = 0; });
  await sweep({ x: start.x + 10, y: start.y + 10 }, end, 15); await frames();
  if (await frame.locator('.consistency-marquee').count() !== 1) throw Error('No marquee was drawn');
  if (!await page.locator('.consistency-control-edit').evaluate(action => action.hidden)) throw Error('A passive hover took over the marquee: the link’s Edit opened');
  const guides = await frame.evaluate(() => ({ paused: !!document.querySelector('.consistency-native-guides.context-active'), handles: document.querySelectorAll('[data-spacing-key]').length }));
  if (guides.paused || !guides.handles) throw Error(`The marquee took spacing away: ${JSON.stringify(guides)}`);
  const metrics = await page.evaluate(() => window.interactionMetrics);
  if (metrics.rebuilds || metrics.reads) throw Error(`The marquee rebuilt the editor or measured stable content again while it moved: ${JSON.stringify(metrics)}`);
  await mouse.up(end.x, end.y);
  await frame.waitForFunction(() => !document.querySelector('.consistency-marquee'));
  const selected = (await editor.selection()).join();
  if (selected !== 'l,a,b') throw Error(`The marquee chose ${selected}`);
  if (await json() !== before || await history() || await editor.savesSettled() !== saves) throw Error('Selecting wrote to the page or its history');

  // Spacing with a selection keeps the selection and is one step to undo.
  const handle = frame.locator('[data-spacing-key^="list:gap:"]').first();
  const box = await handle.boundingBox(), at = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await mouse.move(at.x, at.y, 0); await frames(); await mouse.down(at.x, at.y);
  await sweep(at, { x: at.x, y: at.y + 40 }, 5); await mouse.up(at.x, at.y + 40);
  await frame.waitForFunction(() => !document.querySelector('[data-spacing-active]'));
  const spaced = await editor.read();
  if (spaced.blocks.find(block => block.id === 'list').gap === 20) throw Error('The spacing handle did not change the gap');
  if (!(await page.evaluate(() => window.interactionMetrics.rebuilds))) throw Error('The editor’s rebuilds are not being counted');
  if ((await editor.selection()).join() !== selected) throw Error(`Spacing changed the selection to ${await editor.selection()}`);
  if (await history() !== 1) throw Error(`Spacing wrote ${await history()} steps of history, not one`);
  await page.keyboard.press('Meta+z');
  if (await json() !== before) throw Error('One undo did not restore the page before spacing');

  // A new marquee cancelled by a lost window gives back the previous selection, not an empty one.
  const d = await editor.rect('d');
  const again = { x: o.x + 20, y: o.y + d.top + 10 };
  await mouse.move(again.x, again.y, 0); await mouse.down(again.x, again.y);
  await sweep(again, { x: again.x + 500, y: again.y + 60 }, 5); await frames();
  await frame.evaluate(() => window.dispatchEvent(new Event('blur')));
  await mouse.up(again.x + 500, again.y + 60);
  if ((await editor.selection()).join() !== selected) throw Error(`A cancelled marquee left ${await editor.selection()}, not ${selected}`);

  // Shift gives the marquee priority over reordering, on a block that would otherwise lift.
  const c = await editor.rect('c');
  const press = { x: o.x + c.left + c.width / 2, y: o.y + c.top + c.height / 2 };
  const shift = (type, point, buttons) => editor.cdp.send('Input.dispatchMouseEvent', { type, ...point, button: type === 'mouseMoved' && !buttons ? 'none' : 'left', buttons, clickCount: type === 'mouseMoved' ? 0 : 1, modifiers: 8 });
  await page.keyboard.down('Shift');
  await shift('mouseMoved', press, 0); await shift('mousePressed', press, 1);
  const corner = { x: press.x - 80, y: press.y - 60 };
  for (let n = 1; n <= 5; n++) await shift('mouseMoved', { x: press.x + (corner.x - press.x) * n / 5, y: press.y + (corner.y - press.y) * n / 5 }, 1);
  await frames();
  if (await frame.locator('.consistency-marquee').count() !== 1 || await frame.locator('[data-drag-preview]').count()) throw Error('Reordering took the pointer from a Shift marquee');
  // The marquee's origin follows the content when it scrolls; its anchored corner is the lower right one here.
  const scrolled = await frame.evaluate(() => { const top = scrollY; scrollBy(0, 60); return scrollY - top; });
  await frames(3);
  const bottom = await frame.locator('.consistency-marquee').evaluate(element => element.getBoundingClientRect().bottom);
  if (!scrolled || Math.abs(bottom - (press.y - o.y - scrolled)) > 1) throw Error(`The marquee’s origin did not follow the scrolled content: ${JSON.stringify({ scrolled, bottom, expected: press.y - o.y - scrolled })}`);
  await shift('mouseReleased', corner, 0); await page.keyboard.up('Shift');
  if (await json() !== before) throw Error('A Shift marquee reordered the page');
  const added = await editor.selection();
  if (selected.split(',').some(id => !added.includes(id))) throw Error(`A Shift marquee dropped the existing selection: ${added}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): the marquee kept spacing and the link’s Edit closed, rebuilt nothing and measured no stable content while moving, wrote no history; spacing kept the selection as one undo step; a cancelled marquee restored the selection; Shift took the pointer from reordering and its origin followed scrolling`);
});
