/** The lab's example pages: the introduction is the default and fills the stage at every width; each example is editable in place, undoes and redoes, keeps its own draft while switching, shows its library, and fits a phone preview. Build first. */
import { contract, stubPages, labCanvas } from './harness.mjs';

const NAME = 'Example pages';
await contract({}, async ({ page, name, base }) => {
  await stubPages(page);
  const current = () => page.evaluate(() => document.querySelector('consistency-editor').readDocument());
  const select = page.locator('select[aria-label="Example page"]');
  const overflow = (label, width) => page.evaluate(() => document.documentElement.scrollWidth > innerWidth).then(over => { if (over) throw Error(`${width}px ${label}: the lab scrolls sideways`); });
  for (const width of [300, 390, 768, 1365, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/editor/`);
    await page.getByRole('button', { name: 'New page', exact: true }).click();
    const frame = await labCanvas(page);
    if (await select.inputValue() !== 'editor') throw Error('The editor introduction is not the default');
    // The introduction: editable writing, cards and a table, on the same blocks published pages use.
    if (!await frame.locator('[data-native-block="cards"]').count() || !await frame.locator('aa-editor .aa-block[data-kind="table"]').count()) throw Error('The introduction lost its cards or its table');
    const layout = await page.evaluate(() => {
      const stage = document.querySelector('.composition-work').getBoundingClientRect(), canvas = document.querySelector('consistency-page-editor:not([hidden]) iframe').getBoundingClientRect();
      const inspector = document.querySelector('.consistency-inspector');
      return { stage: [stage.width, stage.height], canvas: [canvas.width, canvas.height], obsolete: [...document.querySelectorAll('ds-button,button')].filter(button => ['Undo', 'Redo', 'Reset'].includes(button.textContent.trim())).length, preview: !![...inspector.querySelectorAll('ds-button')].find(button => button.textContent.trim() === 'Mobile preview') };
    });
    if (Math.abs(layout.stage[0] - layout.canvas[0]) > 1 || Math.abs(layout.stage[1] - layout.canvas[1]) > 1 || layout.obsolete || !layout.preview) throw Error(`${width}px: the canvas does not fill the stage, or the controls changed: ${JSON.stringify(layout)}`);
    await overflow('introduction', width);
    if (width === 1365) {
      await page.setViewportSize({ width: 1537, height: 1000 });
      await page.waitForFunction(() => { const stage = document.querySelector('.composition-work').getBoundingClientRect(), canvas = document.querySelector('consistency-page-editor:not([hidden]) iframe').getBoundingClientRect(); return innerWidth === 1537 && Math.abs(stage.width - canvas.width) <= 1; });
    }
    if (width !== 1440) { console.log(`${NAME} ${width}px: the introduction fills the stage with its controls, no sideways scrolling`); continue; }
    // Every example, at a desktop width: editable, its own draft, undo and redo, the library kept, a phone preview.
    await page.locator('select[aria-label="Library preset"]').selectOption('bold');
    const ids = await select.locator('option').evaluateAll(options => options.map(option => option.value).filter(id => id !== 'studio'));
    for (const id of ids) {
      await select.selectOption(id);
      let canvas = await labCanvas(page);
      await page.waitForFunction(id => document.querySelector('consistency-editor').readDocument().example === id, id);
      const writing = canvas.locator('[contenteditable]:not([contenteditable="false"]):visible').filter({ hasText: /\S/ }).first();
      // One insertion is one step; typed key by key, each key is a step of its own in a page's history.
      await writing.click(); await page.keyboard.press('End'); await page.keyboard.insertText(' Draft');
      const edited = JSON.stringify((await current()).page);
      if (!edited.includes(' Draft')) throw Error(`${id}: its writing is not editable`);
      await canvas.locator('body').evaluate(body => body.focus());
      await page.keyboard.press('Meta+z');
      if (JSON.stringify((await current()).page).includes(' Draft')) throw Error(`${id}: one undo did not take back the insertion`);
      await page.keyboard.press('Meta+Shift+z');
      if (JSON.stringify((await current()).page) !== edited) throw Error(`${id}: redo did not bring the insertion back`);
      // Each example keeps its own draft while another is shown (its history starts again when it is shown again).
      await select.selectOption('studio'); await labCanvas(page);
      await select.selectOption(id); canvas = await labCanvas(page);
      if (JSON.stringify((await current()).page) !== edited) throw Error(`${id}: its draft was lost on switching`);
      // The library control names the open page's library: the introduction keeps the one chosen, a template its own.
      const library = await page.locator('select[aria-label="Library preset"]').inputValue();
      if (library !== (await current()).library || (id === 'editor' && library !== 'bold')) throw Error(`${id}: the library shown is ${library}, the page's is ${(await current()).library}`);
      await page.getByRole('button', { name: 'Mobile preview', exact: true }).click();
      const phone = await labCanvas(page);
      // The phone stands inside the stage; the writing's columns stay readable in it.
      const mobile = await page.evaluate(() => { const stage = document.querySelector('.composition-work').getBoundingClientRect(), canvas = document.querySelector('consistency-page-editor:not([hidden]) iframe').getBoundingClientRect(); return { inside: canvas.left >= stage.left - 1 && canvas.right <= stage.right + 1, width: canvas.width }; });
      const columns = await phone.locator('body').evaluate(() => [...document.querySelectorAll('.aa-column')].map(column => column.getBoundingClientRect().width).filter(size => size > 0));
      if (!mobile.inside || mobile.width >= (await page.locator(".composition-work").evaluate(stage => stage.getBoundingClientRect().width)) || columns.some(size => size < 199)) throw Error(`${id} mobile: ${JSON.stringify({ ...mobile, columns })}`);
      await overflow(`${id} mobile preview`, width);
      await page.getByRole('button', { name: 'Desktop preview', exact: true }).click();
    }
    console.log(`${NAME} ${width}px: the introduction fills the stage; ${ids.length} examples editable, undone and redone, kept while switching, their library shown, held by a phone preview inside the stage`);
  }
  console.log(`${NAME} (${name}): passed`);
});
