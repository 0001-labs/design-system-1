/** A card's own gaps in a page's writing: dragged, a card's label and title gaps preview on that card alone, write no history until release, cancel whole with Escape, and commit on whole squares as one undo step. Build first. */
import { contract, openNativePage, pageOf } from './harness.mjs';

const NAME = 'Card spacing';
const card = (label, body) => '```c9y-card\n' + JSON.stringify({ label, title: `${label} title`, body, width: 280, height: 300 }) + '\n```';
await contract({}, async ({ page, name }) => {
  const editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: card('First', 'Short words.') + '\n\n' + card('Second', 'Independent words that wrap onto several lines and must keep enough room while spacing changes.') }, 'x']) });
  const { frame } = editor, cards = frame.locator('aa-editor ds-card');
  const json = async () => JSON.stringify(await editor.read());
  const history = () => page.evaluate(() => document.querySelector('#c9y-stage consistency-workspace-page').pageEditor.controller.state.past.length);
  const read = () => cards.evaluateAll(nodes => nodes.map(card => ({
    gaps: ['label', 'title'].map(key => Number.parseFloat(getComputedStyle(card.shadowRoot.querySelector(`.ds-card__${key}`)).marginBottom)),
    height: card.getBoundingClientRect().height,
    text: [...card.querySelectorAll('[slot="label"],[slot="title"],p')].map(node => node.textContent),
  })));
  const passed = [];
  for (const [index, key] of [[0, 'label'], [1, 'title']]) {
    const handle = cards.first().locator(`[aria-label="Card ${key} gap"]`);
    const values = () => cards.locator(`[aria-label="Card ${key} gap"]`).evaluateAll(handles => handles.map(handle => Number(handle.getAttribute('aria-valuenow'))));
    const before = await read(), state = await json(), steps = await history(), original = await values();
    const drag = async () => { const box = await handle.boundingBox(), x = box.x + box.width / 2, y = box.y + box.height / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x, y + 37, { steps: 4 }); return { x, y: y + 37 }; };
    // A press on a handle does not take the keyboard into the canvas: it has it already, as when working in the page.
    await editor.host.evaluate(canvas => canvas.contentWindow.focus());
    // While dragged, only that card previews the gap, and nothing is written.
    await drag();
    await frame.waitForFunction(({ key, value }) => Number(document.querySelector(`aa-editor ds-card [aria-label="Card ${key} gap"]`).getAttribute('aria-valuenow')) === value, { key, value: original[0] + 74 });
    const during = await read(), live = await values();
    if (live[1] !== original[1] || Math.abs(during[1].gaps[index] - before[1].gaps[index]) > 1 || Math.abs(during[1].height - before[1].height) > 1) throw Error(`${key}: the other card changed with it: ${JSON.stringify({ live, before, during })}`);
    if (Math.abs(during[0].gaps[index] - before[0].gaps[index] - 74) > 1) throw Error(`${key}: the dragged card does not preview its gap: ${JSON.stringify({ before, during })}`);
    if (await json() !== state || await history() !== steps) throw Error(`${key}: the preview wrote to the page`);
    if (JSON.stringify(during.map(card => card.text)) !== JSON.stringify(before.map(card => card.text))) throw Error(`${key}: the preview changed a card's words`);
    // Escape gives everything back.
    await page.keyboard.press('Escape'); await page.mouse.up();
    await frame.waitForFunction(() => !document.querySelector('[data-spacing-active]'));
    const cancelled = await read();
    if (cancelled.some((card, at) => Math.abs(card.height - before[at].height) > 1 || Math.abs(card.gaps[index] - before[at].gaps[index]) > 1)) throw Error(`${key}: Escape did not restore the cards`);
    if (await json() !== state) throw Error(`${key}: Escape wrote to the page`);
    // Released, it commits on whole squares, once.
    await drag(); await page.mouse.up();
    await frame.waitForFunction(({ key, value }) => Number(document.querySelector(`aa-editor ds-card [aria-label="Card ${key} gap"]`).getAttribute('aria-valuenow')) === value, { key, value: original[0] + 80 });
    const gaps = JSON.parse((await editor.read()).blocks[0].source.match(/```c9y-card\n([^]*?)\n```/)[1]).gaps;
    if (gaps?.[key] !== original[0] + 80) throw Error(`${key}: the card kept ${JSON.stringify(gaps)}`);
    if (await history() !== steps + 1) throw Error(`${key}: the release wrote ${await history() - steps} steps of history, not one`);
    if ((await values())[1] !== original[1]) throw Error(`${key}: the other card's gap changed`);
    // One undo takes it all back.
    await frame.locator('body').evaluate(body => body.focus()); await page.keyboard.press('Meta+z');
    if (await json() !== state) throw Error(`${key}: one undo did not restore the page`);
    passed.push(key);
  }
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): ${passed.join(' and ')} gaps preview on their card alone, write nothing until release, cancel whole with Escape, commit on whole squares as one undo step`);
});
