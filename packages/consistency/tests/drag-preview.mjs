/**
 * drag.preview-as-drawn and drag.one-carrier: the carried preview is the block as the page draws it, components and
 * all, with none of the editor's marks, and one press lifts it in one engine. Build first.
 */
import { contract, openNativePage, pageOf, leftovers, settled } from './harness.mjs';

const NAME = 'A carried section looks as it did before the lift', ONE = 'One press lifts one preview';
await contract({}, async ({ page, name }) => {
  // A section of components on a dark band: buttons, icons and words drawn by their own trees.
  let editor = await openNativePage(page, { template: 'agency' });
  const band = await editor.frame.evaluate(() => {
    const band = [...document.querySelectorAll('[data-drag-handle]')].find(element => element.matches('.studio-band') && element.querySelector('ds-button') && element.querySelector('ds-icon'));
    if (!band) return null;
    band.scrollIntoView({ block: 'start' }); scrollBy(0, -200);
    const box = band.getBoundingClientRect(), points = [];
    for (let y = box.top + 25; y < Math.min(box.bottom, innerHeight - 100); y += 20) for (let x = box.right - 35; x > box.left + 20; x -= 40) points.push({ x, y });
    return { id: band.dataset.nativeBlock, points };
  });
  if (!band) throw Error('The agency template has no band of components to carry');
  // A point of the band's own, with the pointer resting on it: a press there lifts the band, not a block inside it nor a spacing handle hover reveals.
  const o = await editor.origin();
  let section = null;
  for (const point of band.points) {
    await editor.mouse.move(o.x + point.x, o.y + point.y, 0); await page.waitForTimeout(40);
    const own = await editor.frame.evaluate(({ id, x, y }) => { const hit = document.elementFromPoint(x, y); return !!hit && !hit.closest('[data-editor-chrome]') && hit.closest('[data-drag-handle]')?.dataset.nativeBlock === id; }, { id: band.id, ...point });
    if (own) { section = { id: band.id, ...point }; break; }
  }
  if (!section) throw Error('No point of the band lifts the band itself');
  const at = { x: o.x + section.x, y: o.y + section.y };
  await editor.mouse.move(at.x, at.y, 0); await editor.mouse.down(at.x, at.y);
  await page.waitForTimeout(470);
  for (let n = 1; n <= 6; n++) await editor.mouse.move(at.x, at.y + n, 1);
  await page.waitForTimeout(150);
  const seen = await editor.frame.evaluate(id => {
    const source = document.querySelector(`[data-drag-source][data-native-block="${id}"]`), preview = document.querySelector('[data-drag-preview]');
    if (!source || !preview) return { lifted: false };
    const all = root => [root, ...root.querySelectorAll('*')], a = all(source), b = all(preview);
    const marks = ['data-selectable', 'data-selected', 'data-composition-selected', 'data-selection-face'];
    const from = source.getBoundingClientRect(), to = preview.getBoundingClientRect(), moved = [], undrawn = [];
    a.forEach((element, index) => {
      const copy = b[index], x = element.getBoundingClientRect(), y = copy?.getBoundingClientRect();
      if (!copy || copy.localName !== element.localName) { moved.push(`${element.localName}: no copy`); return; }
      if (Math.abs(x.width - y.width) > 1 || Math.abs(x.height - y.height) > 1 || Math.abs((x.left - from.left) - (y.left - to.left)) > 1 || Math.abs((x.top - from.top) - (y.top - to.top)) > 1) moved.push(`${element.localName} ${Math.round(x.width)}x${Math.round(x.height)} drawn ${Math.round(y.width)}x${Math.round(y.height)}`);
      if (element.shadowRoot && copy.shadowRoot?.childElementCount !== element.shadowRoot.childElementCount) undrawn.push(element.localName);
    });
    return {
      lifted: true, count: [a.length, b.length], moved, undrawn: [...new Set(undrawn)], components: a.filter(element => element.shadowRoot).length,
      marked: b.filter(element => marks.some(mark => element.hasAttribute(mark))).length,
      washes: b.filter(element => { const face = getComputedStyle(element, '::after'); return face.content !== 'none' && face.position === 'absolute' && face.backgroundColor !== 'rgba(0, 0, 0, 0)'; }).length,
      selected: source.hasAttribute('data-selected'), overlays: document.querySelectorAll('[data-drag-overlay]').length,
    };
  }, section.id);
  await page.keyboard.press('Escape'); await editor.mouse.up(at.x, at.y + 6); await settled(editor.frame);
  if (!seen.lifted) throw Error('The band did not lift: ' + JSON.stringify({ section, seen, source: await editor.frame.evaluate(() => document.querySelector('[data-drag-source]')?.dataset.nativeBlock ?? null) }));
  if (!seen.selected) throw Error('The carried band is not the selection');
  if (seen.marked || seen.washes) throw Error(`The preview wears the editor's marks: ${seen.marked} marked, ${seen.washes} washed`);
  if (!seen.components || seen.undrawn.length) throw Error(`Components are not drawn in the preview: ${seen.undrawn.join(', ') || 'the band has none'}`);
  if (seen.count[0] !== seen.count[1] || seen.moved.length) throw Error(`The preview is laid out differently: ${seen.moved.slice(0, 5).join('; ') || seen.count}`);
  let left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind ${left.join(', ')}`);
  console.log(`${NAME} (${name}): ${seen.count[0]} elements stand where they stood, ${seen.components} components drawn, no selection mark or wash on it`);

  // Writing: the page carries the block, and its own editor does not carry it as well.
  editor = await openNativePage(page, { document: pageOf(['a', 'b', 'c', 'd']) });
  await editor.drag('a', 'c', { release: false });
  const overlays = await editor.frame.evaluate(() => document.querySelectorAll('[data-drag-overlay]').length);
  await editor.up();
  if (overlays !== 1) throw Error(`A press on writing lifted ${overlays} previews`);
  if ((await editor.order()).join() !== 'b,c,a,d') throw Error(`The block did not move: ${await editor.order()}`);
  const held = await editor.frame.evaluate(() => [...document.querySelectorAll('aa-editor')].filter(host => host.editor && !host.editor.placing).length);
  if (held) throw Error(`${held} writing regions were left unable to place their own blocks`);
  left = await leftovers(editor.frame);
  if (left.length) throw Error(`Left behind ${left.join(', ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${ONE} (${name}): writing carried by the page alone, its editor's own movement given back after the drop`);
});
