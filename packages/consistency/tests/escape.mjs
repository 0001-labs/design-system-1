/** Escape in a page's writing clears the caret and the formatting toolbar and gives spacing back; typing resumes only deliberately. The guide fits phone and desktop. Build first. */
import { contract, openNativePage, pageOf } from './harness.mjs';

const NAME = 'Escape';
await contract({}, async ({ page, name, base }) => {
  const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: 'Keep these words\n\nA second paragraph' }, 'x']) });
  const { frame } = editor;
  const words = async () => (await editor.read()).blocks.find(block => block.id === 'w').source;
  const paused = () => frame.evaluate(() => !!document.querySelector('.consistency-native-guides.context-active'));
  for (const selected of [false, true]) {
    await frame.evaluate(selected => { const host = document.querySelector('aa-editor[data-editor-key="w"]'); host.editor.focus(); host.editor.selectRange(2, selected ? 12 : 2); document.dispatchEvent(new Event('selectionchange')); }, selected);
    if (selected) { await frame.locator('.aa-toolbar:not([hidden])').waitFor(); if (!await paused()) throw Error('The formatting toolbar did not pause spacing'); }
    await page.keyboard.press('Escape');
    await frame.locator('.aa-toolbar:not([hidden])').waitFor({ state: 'detached' });
    await frame.waitForFunction(() => !document.querySelector('.consistency-native-guides.context-active'));
    const left = await frame.evaluate(() => ({ focused: document.querySelector('aa-editor[data-editor-key="w"]').contains(document.activeElement), ranges: getSelection().rangeCount }));
    if (left.focused || left.ranges) throw Error(`Escape ${selected ? 'with selected words' : 'at a caret'} kept the caret: ${JSON.stringify(left)}`);
  }
  await page.keyboard.type('Ignored');
  if (!(await words()).startsWith('Keep these words\n')) throw Error(`Dismissed writing still took typing: ${await words()}`);
  // Writing resumes with a deliberate press.
  await frame.locator('aa-editor[data-editor-key="w"] .aa-block').first().click();
  await page.keyboard.press('End'); await page.keyboard.type('!');
  if (!(await words()).startsWith('Keep these words!')) throw Error(`Writing did not resume after Escape: ${await words()}`);
  // The guide opens on its own page and fits every width.
  await page.goto(`${base}/editor/guide.html`);
  await page.getByRole('heading', { name: 'Aa edits text. Consistency builds sites.', exact: true }).waitFor();
  for (const width of [300, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error(`The guide overflows at ${width}px`);
  }
  console.log(`${NAME} (${name}): a caret and selected words both clear on Escape, the toolbar closes and spacing returns; typing is ignored until a press resumes writing; the guide fits 300, 390 and 1440px`);
});
