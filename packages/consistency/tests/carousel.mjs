/** A carousel inserted into a page's writing: empty from the insert menu, slides added by address, navigated, described, reordered, resized on the grid, fitted and removed, each undoable; pictures come from the site, and a phone holds it. Build first. */
import { contract, openNativePage, pageOf } from './harness.mjs';

const NAME = 'Carousel';
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+c7S8AAAAASUVORK5CYII=', 'base64');
await contract({}, async ({ page, name, base }) => {
  const failures = []; page.on('pageerror', error => failures.push(error.message));
  const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: '/carousel' }, 'x']) });
  const { frame } = editor, host = frame.locator('aa-editor[data-editor-key="w"]');
  await host.evaluate(element => { element.editor.focus(); element.editor.selectRange(element.editor.value.length); element.dispatchEvent(new Event('aa-change')); document.dispatchEvent(new Event('selectionchange')); });
  await frame.locator('.aa-menu button[aria-label="Carousel"]').click();
  await frame.locator('.consistency-carousel-frame').waitFor();
  const source = () => host.evaluate(element => element.editor.value);
  const model = async () => JSON.parse((await source()).match(/```c9y-carousel\n([^]*?)\n```/)[1]);
  const undo = async () => { await frame.locator('body').evaluate(body => body.focus()); await page.keyboard.press('Meta+z'); };
  if ((await model()).slides.length !== 0 || await frame.locator('.consistency-carousel-frame img').count()) throw Error('The carousel was not inserted empty');
  const carousel = frame.locator('.consistency-content-carousel'), tools = frame.locator('.consistency-carousel-tools');
  const visibility = () => tools.evaluate(element => getComputedStyle(element).visibility);
  const slides = async count => frame.waitForFunction(count => { const value = document.querySelector('aa-editor[data-editor-key="w"]').editor.value.match(/```c9y-carousel\n([^]*?)\n```/); return value && JSON.parse(value[1]).slides.length === count; }, count);
  const add = async file => { await carousel.hover(); await tools.locator('ds-input[aria-label="Image address"] input').fill(`${base}/${file}.png`); await tools.getByRole('button', { name: 'Add address', exact: true }).click(); };
  // A press outside dismisses a focused toolbar; a fresh pointer brings it back.
  await carousel.hover();
  const address = tools.locator('ds-input[aria-label="Image address"] input'); await address.focus();
  if (!await address.evaluate(element => element === element.getRootNode().activeElement)) throw Error('The address field was not focused');
  const kept = await source();
  await frame.locator('body').dispatchEvent('pointerdown');
  if (await visibility() !== 'hidden') throw Error('An outside press kept the focused carousel toolbar');
  if (await source() !== kept) throw Error('Dismissing the toolbar changed the source');
  await page.mouse.move(1190, 990); await carousel.hover();
  if (await visibility() !== 'visible') throw Error('A fresh pointer did not bring the toolbar back');
  await add('one'); await slides(1); await add('two'); await slides(2);
  // Navigate, describe, reorder.
  await carousel.hover(); await tools.getByRole('button', { name: 'Previous', exact: true }).click();
  if (await frame.locator('ds-carousel').evaluate(face => face.current) !== 0) throw Error('Previous did not show the first image');
  await tools.getByRole('button', { name: 'Next', exact: true }).click();
  const alt = tools.locator('ds-input[aria-label="Image description"] input'); await alt.fill('Second image description'); await alt.press('Tab');
  await frame.waitForFunction(() => document.querySelector('aa-editor[data-editor-key="w"]').editor.value.includes('Second image description'));
  if ((await model()).slides[1].alt !== 'Second image description') throw Error('The description was not kept on its image');
  await carousel.hover(); await tools.getByRole('button', { name: 'Move left', exact: true }).click();
  await frame.waitForFunction(() => JSON.parse(document.querySelector('aa-editor[data-editor-key="w"]').editor.value.match(/```c9y-carousel\n([^]*?)\n```/)[1]).slides[0].alt === 'Second image description');
  // A diagonal resize snaps to whole squares on release, matches what is drawn, and undoes and redoes.
  const shell = frame.locator('.consistency-carousel-frame'); await shell.scrollIntoViewIfNeeded();
  const box = await shell.boundingBox(), grip = await frame.locator('[aria-label="Carousel size"]').boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2); await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2 - 77, grip.y + grip.height / 2 + 33, { steps: 12 }); await page.mouse.up();
  await frame.waitForFunction(() => JSON.parse(document.querySelector('aa-editor[data-editor-key="w"]').editor.value.match(/```c9y-carousel\n([^]*?)\n```/)[1]).width !== undefined);
  const resized = await model(), drawn = await shell.boundingBox();
  if (!resized.width || resized.width % 20 || resized.height % 20 || resized.width >= box.width || resized.height <= box.height) throw Error(`The diagonal resize did not snap and keep: ${JSON.stringify({ box, resized })}`);
  if (Math.abs(drawn.width - resized.width) > 1 || Math.abs(drawn.height - resized.height) > 1) throw Error(`The kept size is not the one drawn: ${JSON.stringify({ drawn, resized })}`);
  await undo();
  await frame.waitForFunction(() => JSON.parse(document.querySelector('aa-editor[data-editor-key="w"]').editor.value.match(/```c9y-carousel\n([^]*?)\n```/)[1]).width === undefined);
  if ((await model()).height !== 280) throw Error('Undo did not give back the carousel’s size');
  await frame.locator('body').evaluate(body => body.focus()); await page.keyboard.press('Meta+Shift+z');
  await frame.waitForFunction(width => JSON.parse(document.querySelector('aa-editor[data-editor-key="w"]').editor.value.match(/```c9y-carousel\n([^]*?)\n```/)[1]).width === width, resized.width);
  // Fit, then pictures from the site: the file system is not offered, and Choose image lists the site's own.
  await carousel.hover(); await tools.locator('select[aria-label="Image fit"]').selectOption('contain');
  await frame.waitForFunction(() => { const value = JSON.parse(document.querySelector('aa-editor[data-editor-key="w"]').editor.value.match(/```c9y-carousel\n([^]*?)\n```/)[1]); return value.slides[value.current ?? 0].fit === 'contain'; });
  await tools.locator('input[type="file"]').setInputFiles({ name: 'local-image.png', mimeType: 'image/png', buffer: pixel });
  await frame.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  if ((await model()).slides.length !== 2) throw Error('A file from the computer was added to a site’s carousel');
  await carousel.hover(); await tools.getByRole('button', { name: 'Choose image', exact: true }).click();
  await page.locator('ds-context[data-consistency-context][aria-label="Choose an image"][open]').getByText('This site has no images yet.', { exact: true }).waitFor();
  await page.locator('#c9y-chrome').click({ position: { x: 600, y: 50 } });
  await page.locator('ds-context[data-consistency-context][aria-label="Choose an image"]').waitFor({ state: 'detached' });
  // Removing an image undoes.
  await carousel.hover(); await tools.getByRole('button', { name: 'Remove image', exact: true }).click(); await slides(1);
  await undo(); await slides(2);
  // A phone holds it inside the page.
  await page.evaluate(() => { document.querySelector('#c9y-stage').style.width = '390px'; });
  await frame.waitForFunction(() => innerWidth === 390);
  const geometry = await frame.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth, frame: document.querySelector('.consistency-carousel-frame').getBoundingClientRect().width, block: document.querySelector('.consistency-content-carousel').getBoundingClientRect().width }));
  if (geometry.scroll > geometry.viewport || geometry.frame > geometry.block + 1) throw Error(`The carousel widens a phone: ${JSON.stringify(geometry)}`);
  if (failures.length) throw Error(`Browser errors: ${failures.join('; ')}`);
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): inserted empty, toolbar dismissed and restored, two images by address, navigated, described, reordered, resized on the grid with undo and redo, fitted; no computer files, the site's own images offered; removal undone; held on a phone`);
});
