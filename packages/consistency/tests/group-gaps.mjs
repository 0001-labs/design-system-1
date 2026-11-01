/** Between groups one editable gap spans the visible edges; it stays one gap after a block inside the group moves, at zero, and when the group stacks on a phone. Build first. */
import { contract, openNativePage, pageOf, picture } from './harness.mjs';

const NAME = 'Group gaps';
const products = { id: 'products', kind: 'flow', direction: 'row', gap: 20, padding: 0, children: [picture('p1', 80), picture('p2', 120)] };
await contract({}, async ({ page, name }) => {
  // A sheet page: its own gap between groups is edited on the page.
  const editor = await openNativePage(page, { document: pageOf([products, { id: 'markets', kind: 'content', source: 'Markets' }], { mode: undefined }) });
  const { frame } = editor;
  const check = async (label, expected) => {
    await frame.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
    const result = await frame.evaluate(() => {
      const group = document.querySelector('[data-native-block="products"]'), next = document.querySelector('[data-native-block="markets"]').getBoundingClientRect();
      const bottom = Math.max(...[...group.querySelectorAll('[data-native-block]')].map(block => block.getBoundingClientRect().bottom));
      const handles = [...document.querySelectorAll('[data-spacing-key^="page:gap:"]')], handle = handles[0]?.getBoundingClientRect();
      const keys = [...document.querySelectorAll('[data-spacing-key]')].map(node => node.dataset.spacingKey);
      return { gap: next.top - bottom, start: handle && handle.top - bottom, end: handle && next.top - handle.bottom, centre: handle && (handle.top + handle.bottom) / 2 - (bottom + next.top) / 2, handles: handles.length, value: Number(handles[0]?.getAttribute('aria-valuenow')), twice: keys.filter((key, index) => keys.indexOf(key) !== index) };
    });
    // A gap is drawn edge to edge; a zero gap as a line centred on the boundary, with room to press.
    const spans = expected ? Math.abs(result.start) <= 1 && Math.abs(result.end) <= 1 : Math.abs(result.centre) <= 1;
    if (Math.abs(result.gap - expected) > 1 || !spans || result.handles !== 1 || result.value !== expected || result.twice.length) throw Error(`${label}: the gap between groups is split, hidden or drawn twice: ${JSON.stringify(result)}`);
    return label;
  };
  const steps = [await check('as authored', 20)];
  // A block moved inside the group by the pointer leaves one gap below it.
  const p2 = await editor.rect('p2');
  await editor.drag('p1', { x: p2.left + p2.width * 0.7, y: p2.top + p2.height / 2 });
  const moved = (await editor.read()).blocks[0].children.map(block => block.id).join();
  if (moved !== 'p2,p1') throw Error(`The pointer did not move a block inside the group: ${moved}`);
  steps.push(await check('after a block moved', 20));
  await frame.locator('[data-spacing-key^="page:gap:"]').focus(); await page.keyboard.press('Home');
  await frame.waitForFunction(() => document.querySelector('[data-spacing-key^="page:gap:"]').getAttribute('aria-valuenow') === '0');
  steps.push(await check('at zero', 0));
  // On a phone the group's blocks stack, and the gap below it stays one zero gap.
  await page.evaluate(() => { document.querySelector('#c9y-stage').style.width = '390px'; });
  await frame.waitForFunction(() => { const [a, b] = ['p1', 'p2'].map(id => document.querySelector(`[data-native-block="${id}"]`).getBoundingClientRect()); return Math.abs(a.left - b.left) < 1; });
  steps.push(await check('stacked at zero', 0));
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): one gap spans the edges ${steps.join(', ')}`);
});
