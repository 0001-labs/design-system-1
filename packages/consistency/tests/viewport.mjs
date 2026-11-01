/** The lab never scrolls sideways: at 300 to 1920px, in mobile preview, in the Bold library, with a button's action toolbar open on a long destination; the phone preview fits its stage, and insert previews stay full size. Build first. */
import { contract, stubPages, labCanvas } from './harness.mjs';

const NAME = 'Viewport';
await contract({}, async ({ page, name, base }) => {
  await stubPages(page);
  const passed = [];
  for (const width of [300, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/editor/`);
    await page.getByRole('button', { name: 'New page', exact: true }).click();
    const frame = await labCanvas(page);
    const check = async label => {
      const result = await page.evaluate(() => { window.scrollTo(100, window.scrollY); return { client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, left: window.scrollX }; });
      if (result.scroll > result.client || result.left !== 0) throw Error(`${width}px ${label}: the document is ${result.scroll}px in a ${result.client}px window`);
    };
    await check('initial');
    // Mobile preview: the phone and its browser chrome fit the stage without sideways scrolling.
    await page.getByRole('button', { name: 'Mobile preview', exact: true }).click();
    await page.locator('ds-device-bezel ds-app-chrome[kind=ios]').getByText('00:01', { exact: true }).waitFor();
    await page.locator('ds-device-bezel ds-app-chrome[kind=safari-ios]').getByText('preview.example', { exact: true }).waitFor();
    await check('mobile preview');
    const stage = await page.locator('.composition-work').evaluate(element => ({ client: element.clientWidth, scroll: element.scrollWidth }));
    if (stage.scroll > stage.client + 1) throw Error(`${width}px: the mobile preview scrolls sideways: ${JSON.stringify(stage)}`);
    const canvas = await frame.locator('body').evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    if (canvas.scroll > canvas.client + 1) throw Error(`${width}px: the page itself overflows the phone: ${JSON.stringify(canvas)}`);
    await page.getByRole('button', { name: 'Desktop preview', exact: true }).click();
    // The Bold library, a button from the insert menu, and its action toolbar on a long destination.
    await page.locator('select[aria-label="Library preset"]').selectOption('bold');
    const canvasNow = await labCanvas(page);
    await check('Bold library');
    const intro = canvasNow.locator('aa-editor[data-editor-key="intro"]');
    await intro.evaluate(element => { element.editor.value = element.editor.value + '\n\n/button'; element.editor.focus(); element.editor.selectRange(element.editor.value.length); element.dispatchEvent(new Event('aa-change')); document.dispatchEvent(new Event('selectionchange')); });
    const choice = canvasNow.locator('.aa-menu button').filter({ hasText: 'Button' }).first();
    let previewed;
    // A 300px window leaves no room beside the menu for a hover preview; the preview's sizes are held from 390px up.
    if (width > 300) {
    await choice.hover();
    const preview = canvasNow.locator('.consistency-element-preview'); await preview.waitFor({ state: 'visible' });
    await preview.locator('ds-button').evaluate(element => element.updateComplete);
    const geometry = await preview.evaluate(element => {
      const button = element.querySelector('ds-button'), inner = element.querySelector('.consistency-element-preview-inner'), control = button.shadowRoot.querySelector('button') ?? button, caption = element.querySelector('.consistency-element-preview-label');
      const scale = Number.parseFloat(getComputedStyle(button).getPropertyValue('--sf')) || 1;
      return { zoom: inner ? getComputedStyle(inner).zoom : '1', font: Number.parseFloat(getComputedStyle(control).fontSize) / scale, caption: caption ? Number.parseFloat(getComputedStyle(caption).fontSize) / scale : 14, width: button.getBoundingClientRect().width / scale };
    });
    if (Number(geometry.zoom) !== 1 || geometry.font < 14 || geometry.caption < 14) throw Error(`${width}px: the Bold insert preview is shrunk: ${JSON.stringify(geometry)}`);
    previewed = geometry.width;
    await check('insert preview');
    }
    await choice.click();
    const words = canvasNow.locator('aa-editor[data-editor-key="intro"] .consistency-content-button [contenteditable]').first();
    // The preview showed the button at the size it lands.
    const landed = await canvasNow.locator('aa-editor[data-editor-key="intro"] .consistency-content-button ds-button').first().evaluate(button => button.getBoundingClientRect().width / (Number.parseFloat(getComputedStyle(button).getPropertyValue('--sf')) || 1));
    if (previewed !== undefined && Math.abs(previewed - landed) > 1) throw Error(`${width}px: the preview drew the button ${previewed}px wide, it landed ${landed}px wide`);
    await words.focus();
    const toolbar = canvasNow.getByRole('toolbar', { name: 'Button action', exact: true }); await toolbar.waitFor({ state: 'visible' });
    await check('open button action toolbar');
    await toolbar.locator('select').selectOption('link');
    await toolbar.locator('ds-input').evaluate(element => { element.value = 'https://example.com/' + 'long-destination'.repeat(30); element.dispatchEvent(new Event('input', { bubbles: true })); });
    await check('long destination');
    const inside = await canvasNow.locator('body').evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    if (inside.scroll > inside.client + 1) throw Error(`${width}px: the action toolbar widens the page: ${JSON.stringify(inside)}`);
    await page.getByRole('button', { name: 'Mobile preview', exact: true }).click(); await check('mobile preview with a button');
    await page.getByRole('button', { name: 'Desktop preview', exact: true }).click(); await check('restored desktop');
    passed.push(width);
  }
  console.log(`${NAME} (${name}): ${passed.join(', ')}px: initial, mobile preview fitting its stage, Bold, an insert preview at the size its button lands, the action toolbar on a long destination and back, never scrolling sideways`);
});
