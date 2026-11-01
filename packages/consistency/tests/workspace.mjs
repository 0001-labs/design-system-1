/** The lab's workspace: empty, a new page, the editor's name, mobile preview, renaming and writing that save and reopen, a conflict kept as a copy, and no sideways scrolling at any width. Build first. */
import { contract, stubPages, labCanvas } from './harness.mjs';

const NAME = 'Workspace';
await contract({}, async ({ page, name, base }) => {
  const store = await stubPages(page);
  await page.goto(`${base}/editor/`);
  await page.getByText('Create a page to begin.', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'New page', exact: true }).click();
  let frame = await labCanvas(page);
  await page.locator('.consistency-editor-brand').getByText('Editor', { exact: true }).waitFor();
  // Mobile preview frames the page as a phone, and back.
  const frameless = () => page.locator('ds-device-bezel.consistency-shared-device').evaluate(bezel => bezel.frameless);
  await page.getByRole('button', { name: 'Mobile preview', exact: true }).click();
  await page.getByRole('button', { name: 'Desktop preview', exact: true }).waitFor();
  if (await frameless()) throw Error('Mobile preview did not frame the page');
  await page.getByRole('button', { name: 'Desktop preview', exact: true }).click();
  if (!await frameless()) throw Error('Desktop preview kept the phone frame');
  const saved = () => page.getByRole('status').filter({ hasText: /^Saved$/ }).waitFor();
  // A name and words written on the page are saved and reopen.
  await page.getByLabel('Page name', { exact: true }).fill('My page'); await saved();
  await frame.locator('aa-editor[data-editor-key="intro"] .aa-block').nth(1).click();
  await page.keyboard.press('End'); await page.keyboard.type(' Durable words.');
  await page.waitForFunction(() => document.querySelector('.composition-status')?.textContent === 'Unsaved');
  await saved();
  await page.reload(); frame = await labCanvas(page);
  if (await page.getByLabel('Page name', { exact: true }).inputValue() !== 'My page') throw Error('The page name did not reopen');
  const intro = await page.evaluate(() => document.querySelector('consistency-workspace-page').readDocument().page.blocks[0].children.find(block => block.id === 'intro').source);
  if (!intro.includes('Durable words.')) throw Error(`The written words did not reopen: ${intro}`);
  // A conflicting save says so and keeps the work as a copy.
  store.refuse = true; await page.getByLabel('Page name', { exact: true }).fill('Conflict');
  await page.getByText('This page changed in another tab.', { exact: false }).waitFor();
  store.refuse = false; await page.getByRole('button', { name: 'Save a copy', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.composition-status')?.textContent === 'Saved');
  if (store.drafts.size !== 2) throw Error(`The conflict left ${store.drafts.size} pages, not the page and its copy`);
  for (const width of [300, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForFunction(width => innerWidth === width, width);
    if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw Error(`The workspace scrolls sideways at ${width}px`);
  }
  console.log(`${NAME} (${name}): empty state, new page, the editor's name, mobile preview, a name and words saved and reopened, a conflict kept as a copy, no sideways scrolling at 300, 390, 768 and 1440px`);
});
