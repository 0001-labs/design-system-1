/** The approved insertions in a page's writing: each lands as its own source from the slash menu, edits in place and undoes; the context picker offers exactly them. Build first. */
import { contract, openNativePage, pageOf } from './harness.mjs';
import { PAGE_INSERTIONS } from '../../../shared/consistency-insertions.ts';

const NAME = 'Insertions';
await contract({}, async ({ page, name }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const done = [];
  for (const entry of PAGE_INSERTIONS) {
    const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: '/' + entry.label }, 'x']) });
    const { frame } = editor, host = frame.locator('aa-editor[data-editor-key="w"]');
    const value = () => host.evaluate(element => element.editor.value);
    const undo = () => host.evaluate(element => element.editor.undo());
    await host.evaluate(element => { element.editor.focus(); element.editor.selectRange(element.editor.value.length); element.dispatchEvent(new Event('aa-change')); document.dispatchEvent(new Event('selectionchange')); });
    await frame.locator(`.aa-menu button[aria-label="${entry.label}"]`).click();
    if (await value() !== entry.source) throw Error(`${entry.label}: inserted ${JSON.stringify(await value())}, not its source`);
    if (await frame.locator('dialog[open]').count() + await page.locator('dialog[open]').count() || /Edit (list|tabs|table|carousel|image|link|icon)/i.test(await host.innerText())) throw Error(`${entry.label}: a separate edit control opened`);
    if ((await editor.read()).blocks[0].source !== entry.source) throw Error(`${entry.label}: the page did not keep the inserted source`);
    if (entry.id === 'table') {
      await host.locator('[data-cell]').last().click(); await page.keyboard.press('End'); await page.keyboard.press('Enter');
      await host.locator('[data-cell]').nth(5).waitFor();
      if (await host.locator('[data-cell]').count() !== 6) throw Error(`Enter added no table row: ${await host.locator('[data-cell]').count()} cells`);
      await page.keyboard.type('B');
      if ((await host.locator('[data-cell]').nth(4).innerText()).trim().replace(/^\|\s*/, '') !== 'B') throw Error(`The new row did not take the caret: ${await value()}`);
      if ((await host.innerText()).includes('|')) throw Error('The table shows its source syntax');
      await undo(); await undo();
      if (await value() !== entry.source) throw Error(`Undoing the table row left ${JSON.stringify(await value())}`);
    }
    if (entry.id === 'image') {
      // A page's pictures come from its site: the placeholder opens the site's own images, never the file system.
      let chose = false; const listen = () => { chose = true; }; page.on('filechooser', listen);
      await host.locator('.consistency-image-placeholder').click();
      await page.locator('ds-context[data-consistency-context][aria-label="Choose an image"][open]').getByText('This site has no images yet.', { exact: true }).waitFor();
      page.off('filechooser', listen);
      if (chose) throw Error('The image placeholder opened the file system');
      await page.locator('#c9y-chrome').click({ position: { x: 600, y: 50 } });
      await page.locator('ds-context[data-consistency-context][aria-label="Choose an image"]').waitFor({ state: 'detached' });
      if (await value() !== entry.source) throw Error(`Closing the image chooser changed the source: ${await value()}`);
    }
    if (entry.id === 'icon') {
      await host.locator('.aa-atom').focus(); await page.keyboard.press('Enter');
      await host.getByRole('textbox', { name: 'Icon name', exact: true }).fill('check'); await page.keyboard.press('Enter');
      if (await value() !== ':icon[check]') throw Error(`The icon did not change in place: ${await value()}`);
      await undo();
    }
    await undo();
    if (await value() !== '/' + entry.label) throw Error(`${entry.label}: undo left ${JSON.stringify(await value())}`);
    if (editor.broken.length) throw Error(editor.broken.join('\n'));
    done.push(entry.label);
  }
  // The context picker offers every approved insertion and nothing else.
  const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: 'Words' }]) });
  await editor.frame.locator('aa-editor[data-editor-key="w"]').evaluate(element => { element.editor.focus(); element.editor.selectRange(0); });
  await page.keyboard.press('Meta+/');
  for (const entry of PAGE_INSERTIONS) if (await editor.frame.locator(`.aa-menu button[aria-label="${entry.label}"]`).count() !== 1) throw Error(`${entry.label}: not offered once by the context picker`);
  if (await editor.frame.locator('.aa-menu button[aria-label="Context"],.aa-menu button[aria-label="Form"]').count()) throw Error('The context picker offers unapproved components');
  if (errors.length) throw Error(errors.join('\n'));
  console.log(`${NAME} (${name}): ${done.join(', ')} each land as their source, edit in place (a table row without its syntax, an icon, a picture chosen from the site) and undo; the context picker offers exactly these`);
});
