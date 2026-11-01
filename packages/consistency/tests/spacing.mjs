/** Spacing inside a page's writing: inserted elements and nested column blocks space independently, column gaps follow the pointer, undo, reach zero, stack and hug their units, and selection paints no outline. Build first. */
import { contract, openNativePage, pageOf } from './harness.mjs';

const NAME = 'Spacing';
const button = label => '```c9y-button\n' + JSON.stringify({ label, secondary: false }) + '\n```';
const card = (label, size = {}) => '```c9y-card\n' + JSON.stringify({ label, title: `${label} title`, body: 'Independent words.', ...size }) + '\n```';
const columns = (...items) => `<columns>\n${items.map(item => `<column>\n${item}\n</column>`).join('\n')}\n</columns>`;
const writing = (source, gaps) => pageOf([{ id: 'w', kind: 'content', source, ...(gaps ? { gaps } : {}) }, 'x']);
await contract({}, async ({ page, name }) => {
  const passed = [];
  const frames = (frame, count = 2) => frame.evaluate(count => new Promise(done => { const next = left => left ? requestAnimationFrame(() => next(left - 1)) : done(); next(count); }), count);

  // Inserted elements and the blocks inside a column each own their gap.
  let editor = await openNativePage(page, { document: writing(['# Newly inserted elements', button('New button'), card('New card'), columns('## First column\n\nFirst paragraph\n\n' + button('Inside'), '## Second column\n\nSecond paragraph')].join('\n\n')) });
  let { frame } = editor;
  const top = frame.locator('[aria-label="Adjust w block gap 1"]'), nested = frame.locator('[aria-label="Adjust w nested 1 block gap 1"]');
  const original = Number(await top.getAttribute('aria-valuenow'));
  await top.focus(); await page.keyboard.press('ArrowUp');
  await frame.waitForFunction(value => Number(document.querySelector('[aria-label="Adjust w block gap 1"]').getAttribute('aria-valuenow')) === value, original + 20);
  const nestedBefore = Number(await nested.getAttribute('aria-valuenow'));
  await nested.focus(); await page.keyboard.press('ArrowUp');
  await frame.waitForFunction(value => Number(document.querySelector('[aria-label="Adjust w nested 1 block gap 1"]').getAttribute('aria-valuenow')) === value, nestedBefore + 20);
  if (Number(await top.getAttribute('aria-valuenow')) !== original + 20) throw Error('A nested gap changed another gap');
  const gaps = (await editor.read()).blocks[0].gaps ?? {};
  if (Object.keys(gaps).length !== 2) throw Error(`Two edited gaps saved as ${JSON.stringify(gaps)}`);
  passed.push('inserted and nested gaps');

  // A gap between two cards in columns.
  const size = { width: 240, height: 160 };
  editor = await openNativePage(page, { document: writing(columns(card('One', size), card('Two', size))) });
  ({ frame } = editor);
  const gap = frame.locator('[aria-label="Adjust w column gap 1.1"]');
  const separation = () => frame.locator('aa-editor ds-card').evaluateAll(cards => { const a = cards[0].getBoundingClientRect(), b = cards[1].getBoundingClientRect(); return { horizontal: b.left - a.right, vertical: b.top - a.bottom }; });
  const initial = Number(await gap.getAttribute('aria-valuenow'));
  if (Math.abs((await separation()).horizontal - initial) > 1) throw Error(`The columns add space the gap does not show: ${JSON.stringify(await separation())}`);
  const press = async () => { const box = await gap.boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; };
  let at = await press();
  await page.mouse.move(at.x, at.y); await frames(frame); await page.mouse.down(); await page.mouse.move(at.x + 20, at.y, { steps: 5 }); await frames(frame);
  const live = await press();
  if (Math.abs(live.x - at.x - 20) > 1) throw Error(`The gap's middle did not follow the pointer: ${JSON.stringify({ at, live })}`);
  await page.mouse.up();
  await frame.waitForFunction(() => !document.querySelector('[data-spacing-active]'));
  if (Math.abs((await separation()).horizontal - initial - 40) > 1) throw Error(`The dragged gap did not commit: ${JSON.stringify(await separation())}`);
  // Away from it, its measure goes quiet.
  await page.mouse.move(1180, 950);
  await gap.locator('.ghost-measure').evaluate(measure => new Promise(done => { const check = () => Number(getComputedStyle(measure).opacity) === 0 ? done() : requestAnimationFrame(check); check(); }));
  await frame.locator('body').evaluate(body => body.focus());
  await page.keyboard.press('Meta+z');
  await frame.waitForFunction(value => { const cards = [...document.querySelectorAll('aa-editor ds-card')].map(card => card.getBoundingClientRect()); return Math.abs(cards[1].left - cards[0].right - value) <= 1; }, initial);
  // Zero is reachable and drawn as a single line.
  await gap.focus(); await page.keyboard.press('Home');
  await frame.waitForFunction(() => document.querySelector('[aria-label="Adjust w column gap 1.1"]').getAttribute('aria-valuenow') === '0');
  if (Math.abs((await separation()).horizontal) > 1) throw Error('A zero gap leaves space');
  const zero = await gap.evaluate(element => ({ fill: getComputedStyle(element).backgroundColor, width: getComputedStyle(element, '::after').width, height: getComputedStyle(element, '::after').height }));
  if (zero.fill !== 'rgba(0, 0, 0, 0)' || zero.width !== '1px' || Number.parseFloat(zero.height) < 20) throw Error(`A zero horizontal gap must show only a vertical line: ${JSON.stringify(zero)}`);
  await frame.locator('body').evaluate(body => body.focus()); await page.keyboard.press('Meta+z');
  await frame.waitForFunction(value => document.querySelector('[aria-label="Adjust w column gap 1.1"]').getAttribute('aria-valuenow') === String(value), initial);
  // A drag far past the room keeps its axis, and Escape gives it back.
  at = await press();
  await page.mouse.move(at.x, at.y); await page.mouse.down(); await page.mouse.move(Math.min(1190, at.x + 900), at.y, { steps: 8 }); await frames(frame);
  if (await gap.getAttribute('aria-orientation') !== 'horizontal') throw Error('A horizontal gap changed axis during a constrained drag');
  await page.keyboard.press('Escape'); await page.mouse.up();
  await frame.waitForFunction(() => !document.querySelector('[data-spacing-active]'));
  if (Math.abs((await separation()).horizontal - initial) > 1) throw Error('Escape did not give the gap back');
  passed.push('column gap: pointer, quiet measure, undo, zero, constrained axis, Escape');

  // A gap too large for the row stacks the columns, readably.
  editor = await openNativePage(page, { document: writing(columns(card('One', size), card('Two', size)), { 'columns:w:0:0': 1000 }) });
  ({ frame } = editor);
  if (await frame.locator('[aria-label="Adjust w column gap 1.1"]').getAttribute('aria-orientation') !== 'vertical' || Math.abs((await frame.locator('aa-editor ds-card').evaluateAll(cards => cards[1].getBoundingClientRect().top - cards[0].getBoundingClientRect().bottom)) - 1000) > 1) throw Error('A large column gap did not stack its columns');
  // On a phone the columns stack and the gap becomes vertical.
  editor = await openNativePage(page, { document: writing(columns(card('One', size), card('Two', size))) });
  ({ frame } = editor);
  await page.evaluate(() => { document.querySelector('#c9y-stage').style.width = '390px'; });
  await frame.waitForFunction(() => document.querySelector('[aria-label="Adjust w column gap 1.1"]')?.getAttribute('aria-orientation') === 'vertical');
  const stacked = frame.locator('[aria-label="Adjust w column gap 1.1"]'), before = Number(await stacked.getAttribute('aria-valuenow'));
  await stacked.focus(); await page.keyboard.press('ArrowUp');
  await frame.waitForFunction(value => { const cards = [...document.querySelectorAll('aa-editor ds-card')].map(card => card.getBoundingClientRect()); return Math.abs(cards[1].top - cards[0].bottom - value) <= 1; }, before + 20);
  passed.push('large and phone gaps stack');

  // Button columns hug their buttons.
  editor = await openNativePage(page, { document: writing(columns(button('One'), button('Two'))) });
  ({ frame } = editor);
  await frame.locator('aa-editor ds-button').first().waitFor();
  const buttons = await frame.locator('aa-editor .aa-column').evaluateAll(nodes => nodes.map(column => ({ column: column.getBoundingClientRect().width, button: column.querySelector('ds-button').getBoundingClientRect().width })));
  if (buttons.some(width => width.column > width.button + 1 || width.column >= 200)) throw Error(`Button columns do not hug: ${JSON.stringify(buttons)}`);
  passed.push('button columns hug');

  // Selection paints no outline, and the marquee is grey without a border.
  editor = await openNativePage(page, { document: pageOf([{ id: 'w', kind: 'content', source: ['First paragraph', card('Chosen'), 'Last paragraph'].join('\n\n') }, 'x'], { overrides: ['padding'], padding: 40 }) });
  ({ frame } = editor);
  const o = await editor.origin(), w = await editor.rect('w');
  const from = { x: o.x + 15, y: o.y + w.top + 2 }, to = { x: o.x + 400, y: o.y + w.bottom - 2 };
  await editor.mouse.move(from.x, from.y, 0); await editor.mouse.down(from.x, from.y);
  for (let n = 1; n <= 8; n++) await editor.mouse.move(from.x + (to.x - from.x) * n / 8, from.y + (to.y - from.y) * n / 8, 1);
  await frames(frame);
  const marquee = await frame.locator('.consistency-marquee').evaluate(element => { const style = getComputedStyle(element), canvas = document.createElement('canvas'); canvas.width = canvas.height = 1; const context = canvas.getContext('2d'); context.fillStyle = style.backgroundColor; context.fillRect(0, 0, 1, 1); const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data; return { border: style.borderStyle, grey: a > 0 && Math.abs(r - g) < 3 && Math.abs(g - b) < 3 }; });
  await editor.mouse.up(to.x, to.y);
  const outlines = await frame.locator('[data-composition-selected],[data-selected]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).outlineStyle));
  if (marquee.border !== 'none' || !marquee.grey || !outlines.length || outlines.some(outline => outline !== 'none')) throw Error(`Selection feedback: ${JSON.stringify({ marquee, outlines })}`);
  passed.push('selection without outlines, grey marquee');
  if (editor.broken.length) throw Error(editor.broken.join('\n'));
  console.log(`${NAME} (${name}): ${passed.join('; ')}`);
});
