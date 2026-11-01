/** Contexts in a page: the formatting toolbar keeps its footprint and stays open for its choices, an outside press closes it at once, spacing pauses while any context is open, and typing in a table stays in its cell. Build first. */
import { contract, openNativePage, pageOf, picture } from './harness.mjs';

const NAME = 'Context';
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: 'Words to format here\n\nA second paragraph' }, { id: 't', kind: 'content', source: '| Name | Value |\n| --- | --- |\n| Milk | 2 |' }, picture('x', 60)]) });
  const { frame, mouse } = editor;
  const paused = () => frame.evaluate(() => !!document.querySelector('.consistency-native-guides.context-active'));
  const frames = (count = 2) => frame.evaluate(count => new Promise(done => { const next = left => left ? requestAnimationFrame(() => next(left - 1)) : done(); next(count); }), count);
  await frame.evaluate(() => { const host = document.querySelector('aa-editor[data-editor-key="w"]'); host.editor.focus(); host.editor.selectRange(2, 12); document.dispatchEvent(new Event('selectionchange')); });
  const toolbar = frame.locator('.aa-toolbar:not([hidden])');
  await toolbar.waitFor();
  const before = await toolbar.boundingBox();
  // Writing a prompt fills the toolbar's own rows and makes the covered buttons inert.
  const prompt = toolbar.getByRole('textbox', { name: 'Ask AI about the selected words' });
  await prompt.click();
  await toolbar.locator('button').first().evaluate(button => new Promise(done => { const check = () => button.inert ? done() : requestAnimationFrame(check); check(); }));
  await toolbar.evaluate(element => Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished)));
  const after = await toolbar.boundingBox(), writing = await prompt.boundingBox();
  if (Math.abs(before.width - after.width) > 0.1 || Math.abs(before.height - after.height) > 0.1 || Math.abs(writing.y - after.y) > 0.1 || Math.abs(writing.height - after.height) > 0.1) throw Error(`Writing a prompt changed the toolbar’s footprint or did not fill its rows: ${JSON.stringify({ before, after, writing })}`);
  if (!await toolbar.locator('button').evaluateAll(buttons => buttons.every(button => button.inert))) throw Error('Covered formatting buttons stay interactive');
  await prompt.evaluate(field => field.blur());
  await toolbar.locator('button').first().evaluate(button => new Promise(done => { const check = () => !button.inert ? done() : requestAnimationFrame(check); check(); }));
  if (!await paused()) throw Error('Spacing stayed live while the formatting toolbar was open');
  await toolbar.locator('[data-action="bold"]').click();
  if (!await toolbar.isVisible() || !await paused()) throw Error('A formatting choice closed the toolbar or gave spacing back');
  // A press outside the writing, on the page's margin, closes it at once, with no reopening on the same words.
  const o = await editor.origin(), x = await editor.rect('x');
  const margin = { x: o.x + 15, y: o.y + x.top + 5 };
  await mouse.move(margin.x, margin.y, 0); await mouse.down(margin.x, margin.y); await mouse.up(margin.x, margin.y);
  await frame.waitForFunction(() => !document.querySelector('.consistency-native-guides.context-active'));
  await frames(10);
  if (await frame.locator('.aa-toolbar:not([hidden])').count()) throw Error('The formatting toolbar opened again after an outside press');
  // A block's menu pauses spacing too, and closes on a press outside it.
  await page.mouse.click(o.x + x.left + 20, o.y + x.top + 20, { button: 'right' });
  await page.locator('ds-context[data-consistency-context][open]').waitFor();
  await frame.waitForFunction(() => !!document.querySelector('.consistency-native-guides.context-active'));
  await mouse.down(margin.x, margin.y); await mouse.up(margin.x, margin.y);
  await page.locator('ds-context[data-consistency-context][open]').waitFor({ state: 'detached' });
  await frame.waitForFunction(() => !document.querySelector('.consistency-native-guides.context-active'));
  // Typing spaces in a table cell keeps the caret in that cell.
  await frame.locator('aa-editor[data-editor-key="t"] [data-cell="1:0"]').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' and another year for this');
  const table = (await editor.read()).blocks.find(block => block.id === 't').source;
  if (!table.includes('| Milk and another year for this | 2 |') || !table.startsWith('| Name | Value |')) throw Error(`Typing spaces moved the caret out of the table cell: ${table}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): the prompt fills the toolbar’s rows and covers its buttons, Bold keeps it open, an outside press closes it for good; spacing pauses for the toolbar and a block’s menu and returns; table typing stays in its cell`);
});
