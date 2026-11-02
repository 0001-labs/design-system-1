/** Top and side padding apart: the handle across the top of a page and a section moves only its top and bottom, the handle down its side only its sides, and the document records both. A card's two tokens are covered in consistency-components.test.ts. Build first. */
import { contract, openNativePage } from './harness.mjs';

const NAME = 'Spacing sides';
await contract({}, async ({ page }) => {
  const passed = [];
  const document = { schema: 1, kind: 'native-page', layout: { padding: 40, gap: 20 }, blocks: [
    { id: 's', kind: 'flow', direction: 'column', gap: 20, padding: 40, children: [{ id: 'w', kind: 'content', source: 'Words in a section' }] },
  ] };
  const editor = await openNativePage(page, { document });
  const { frame } = editor;
  const measure = css => ({ top: Number.parseFloat(css.paddingTop), bottom: Number.parseFloat(css.paddingBottom), left: Number.parseFloat(css.paddingLeft), right: Number.parseFloat(css.paddingRight) });
  const box = selector => frame.locator(selector).evaluate((element, measure) => new Function('css', `return (${measure})(css)`)(getComputedStyle(element)), measure.toString());
  const adjust = async (label, key, expected) => {
    await frame.getByRole('slider', { name: label, exact: true }).focus(); await page.keyboard.press(key);
    await frame.waitForFunction(([label, value]) => document.querySelector(`[aria-label="${label}"]`)?.getAttribute('aria-valuenow') === String(value), [label, expected]);
    await frame.waitForFunction(() => !document.querySelector('[data-spacing-active]'));
  };
  const near = (a, b) => Math.abs(a - b) <= 1;
  const subjects = [{ who: 'page', read: () => box('.c9y-native-page'), label: 'Page' }, { who: 'section', read: () => box('[data-native-block="s"]'), label: 'Section' }];
  for (const { who, read, label } of subjects) {
    const before = await read();
    await adjust(`${label} padding`, 'ArrowUp', before.top + 20);
    const topped = await read();
    if (!near(topped.left, before.left) || !near(topped.right, before.right)) throw Error(`${who}: the top handle moved the sides ${JSON.stringify({ before, topped })}`);
    if (!near(topped.top, before.top + 20) || !near(topped.bottom, before.bottom + 20)) throw Error(`${who}: the top handle did not move the top and bottom ${JSON.stringify({ before, topped })}`);
    await adjust(`${label} side padding`, 'ArrowLeft', before.left - 20);
    const sided = await read();
    if (!near(sided.top, topped.top) || !near(sided.bottom, topped.bottom)) throw Error(`${who}: the side handle moved the top ${JSON.stringify({ topped, sided })}`);
    if (!near(sided.left, before.left - 20) || !near(sided.right, before.right - 20)) throw Error(`${who}: the side handle did not move the sides ${JSON.stringify({ before, sided })}`);
    passed.push(`${who} top and side padding apart`);
  }
  const saved = await editor.read();
  const section = saved.blocks.find(block => block.id === 's');
  if (saved.layout.padding !== 60 || saved.layout.sidePadding !== 20) throw Error(`The page did not record both spaces: ${JSON.stringify(saved.layout)}`);
  if (section.padding !== 60 || section.sidePadding !== 20) throw Error(`The section did not record both spaces: ${JSON.stringify(section)}`);
  passed.push('the document records both');
  console.log(`${NAME}: ${passed.join(', ')} pass`);
});
