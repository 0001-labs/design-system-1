/** Cards keep their words a full square inside their surface in every library preset: narrow, resized, on a phone and in the insert menu's preview; full-bleed media reaches the foot and the end. Build first. */
import { contract, openNativePage, pageOf } from './harness.mjs';

const NAME = 'Card inset';
const card = label => '```c9y-card\n' + JSON.stringify({ label, title: 'Title words', body: 'A short independent paragraph.', width: 240, height: 80 }) + '\n```';
/** Every field of every card stands at least a square (less half a pixel) inside its surface. */
const verify = async (scope, selector, label) => {
  const failures = await scope.locator(selector).evaluateAll(cards => cards.flatMap(card => {
    const scale = Number.parseFloat(getComputedStyle(card).getPropertyValue('--sf')) || 1;
    const surface = card.shadowRoot?.querySelector('.ds-card'); if (!surface) return ['A card has no surface'];
    const bounds = surface.getBoundingClientRect(), found = [];
    for (const field of card.querySelectorAll('[slot="label"],[slot="title"],p,ds-tag')) {
      const rect = field.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
      const sides = [rect.left - bounds.left, bounds.right - rect.right, rect.top - bounds.top, bounds.bottom - rect.bottom].map(value => value / scale);
      if (sides.some(value => value < 19.5)) found.push(`${field.tagName} ${sides.map(Math.round).join(',')}`);
    }
    return found;
  }));
  if (!await scope.locator(selector).count()) throw Error(`${label}: no cards to measure`);
  if (failures.length) throw Error(`${label}: ${failures.join('; ')}`);
};
await contract({}, async ({ page, name }) => {
  const passed = [];
  for (const library of ['original', 'blue', 'ink', 'soft', 'bold', 'editorial']) {
    let editor = await openNativePage(page, { library, document: pageOf([{ id: 'w', kind: 'content', source: card('One') + '\n\n' + card('Two') }, 'x']) });
    await editor.frame.locator('aa-editor ds-card').first().evaluate(element => element.updateComplete);
    await verify(editor.frame, 'aa-editor ds-card', `${library} narrow cards`);
    // Resized from its edge, a card keeps its words inside.
    const first = editor.frame.locator('aa-editor ds-card').first(), before = await first.boundingBox();
    await first.locator('[aria-label="Card width"]').focus(); await page.keyboard.press('ArrowRight');
    await editor.frame.waitForFunction(width => document.querySelector('aa-editor ds-card').getBoundingClientRect().width > width + 1, before.width);
    await verify(editor.frame, 'aa-editor ds-card', `${library} widened card`);
    await first.locator('[aria-label="Card width"]').focus(); await page.keyboard.press('ArrowLeft');
    await editor.frame.waitForFunction(width => Math.abs(document.querySelector('aa-editor ds-card').getBoundingClientRect().width - width) <= 1, before.width);
    await verify(editor.frame, 'aa-editor ds-card', `${library} narrowed card`);
    if (library === 'original') {
      // A large card shrunk diagonally by its corner keeps its words inside while dragged and once committed.
      editor = await openNativePage(page, { library, document: pageOf([{ id: 'w', kind: 'content', source: card('One').replace('"width":240,"height":80', '"width":400,"height":320') }, 'x']) });
      const corner = await editor.frame.locator('aa-editor ds-card [aria-label="Card size"]').first().boundingBox(), x = corner.x + corner.width / 2, y = corner.y + corner.height / 2;
      await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 300, y - 220, { steps: 10 });
      await editor.frame.waitForFunction(() => document.querySelector('aa-editor ds-card').getBoundingClientRect().width < 400);
      await verify(editor.frame, 'aa-editor ds-card', 'original card while shrinking diagonally');
      await page.mouse.up();
      await editor.frame.waitForFunction(() => !/"width":400/.test(document.querySelector('aa-editor').editor.value));
      await verify(editor.frame, 'aa-editor ds-card', 'original card shrunk diagonally');
      editor = await openNativePage(page, { library, document: pageOf([{ id: 'w', kind: 'content', source: card('One') + '\n\n' + card('Two') }, 'x']) });
    }
    await page.evaluate(() => { document.querySelector('#c9y-stage').style.width = '390px'; });
    await editor.frame.waitForFunction(() => innerWidth === 390);
    await verify(editor.frame, 'aa-editor ds-card', `${library} cards on a phone`);
    // The insert menu's preview of a card.
    editor = await openNativePage(page, { library, document: pageOf([{ id: 'w', kind: 'content', source: '/card' }, 'x']) });
    await editor.frame.locator('aa-editor[data-editor-key="w"]').evaluate(element => { element.editor.focus(); element.editor.selectRange(5); element.dispatchEvent(new Event('aa-change')); document.dispatchEvent(new Event('selectionchange')); });
    await editor.frame.locator('.aa-menu button').filter({ hasText: 'Card' }).first().hover();
    await editor.frame.locator('.consistency-element-preview ds-card').waitFor({ state: 'visible' });
    await verify(editor.frame, '.consistency-element-preview ds-card', `${library} insert preview`);
    await page.keyboard.press('Escape');
    passed.push(library);
  }
  // Full-bleed media keeps the words inset and reaches the card's foot and end.
  const editor = await openNativePage(page, { document: pageOf(['x']) });
  await editor.frame.evaluate(async () => {
    // DS1's elements are registered in the editor's realm and adopted into the canvas, as the editor does.
    const card = document.adoptNode(parent.document.createElement('ds-card')); card.dataset.testCardMedia = ''; card.media = 'bleed'; card.width = 14; card.height = 12;
    card.innerHTML = '<span slot="label">A picture</span><span slot="title">Words stay inside</span><p>A little writing.</p><div slot="media" style="height:40px;width:100%;background:red"></div>';
    document.body.append(card); await card.updateComplete;
  });
  await verify(editor.frame, '[data-test-card-media]', 'full-bleed media words');
  const media = await editor.frame.locator('[data-test-card-media]').evaluate(card => { const surface = card.shadowRoot.querySelector('.ds-card').getBoundingClientRect(), picture = card.querySelector('[slot="media"]').getBoundingClientRect(); return { foot: surface.bottom - picture.bottom, end: surface.right - picture.right }; });
  if (Math.abs(media.foot) > 1 || Math.abs(media.end) > 1) throw Error(`The media lost its full bleed: ${JSON.stringify(media)}`);
  console.log(`${NAME} (${name}): ${passed.join(', ')}: narrow, resized (by edge, and diagonally while dragged and committed), phone and insert preview cards keep a square inside; full-bleed media reaches the foot and end`);
});
