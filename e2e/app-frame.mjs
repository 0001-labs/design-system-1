/**
 * The app frame (`ds-app`) in headless Chrome, on the fixture `e2e/fixtures/app-frame.html`:
 * Desktop aligned at several window sizes (the bar two squares and the leftover high, the panes on
 * whole squares down to the window's bottom edge), the dividers by pointer and keyboard and the
 * widths they remember, empty areas taking no room, a phone's drawer and one scrolling document,
 * and an overlay and a toast above the frame. `vp run e2e:app-frame`.
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import puppeteer, { KnownDevices } from 'puppeteer-core';
import { createServer } from 'vite';

/** Layout is in 1/64px steps and a scaled square is rarely a whole pixel: a tenth of a pixel is on the line. */
const STEP = 0.1;
const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({ root, configFile: false, logLevel: 'error', server: { host: '127.0.0.1', port: 0 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
const failures = [];

async function check(name, run) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await run(page);
    assert.deepEqual(errors, [], 'no page errors');
    console.log(`ok    ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL  ${name}\n      ${String(error.message).split('\n').join('\n      ')}`);
  } finally {
    await page.close();
  }
}

async function open(page, width, height, query = '') {
  await page.setViewport({ width, height });
  await page.goto(`${base}e2e/fixtures/app-frame.html${query}`);
  await page.evaluate(() => window.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

/** The frame's parts, in squares from the window's top-left corner under the leftover. */
const frame = page => page.evaluate(() => {
  const style = getComputedStyle(document.documentElement);
  const unit = 20 * Number(style.getPropertyValue('--sf'));
  const top = parseFloat(style.getPropertyValue('--ds-grid-top')) || 0;
  const app = document.querySelector('ds-app');
  const shadow = app.shadowRoot;
  const inner = app.page.shadowRoot;
  const box = node => { const r = node.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const area = name => inner.querySelector(`[part="${name}"]`);
  const shown = name => !area(name).hasAttribute('data-empty') && getComputedStyle(area(name)).display !== 'none';
  return {
    unit, top, width: document.documentElement.clientWidth, height: window.innerHeight,
    aligned: document.documentElement.hasAttribute('data-desktop-aligned'),
    managed: document.documentElement.hasAttribute('data-ds-scaling-managed'),
    componentScale: Number(getComputedStyle(app).getPropertyValue('--ds-sf')),
    app: box(app), bar: box(shadow.querySelector('.bar')), page: box(app.page),
    barLine: getComputedStyle(shadow.querySelector('.bar')).boxShadow,
    areas: Object.fromEntries(['nav', 'header', 'main', 'aside', 'footer'].map(name => [name, shown(name) ? box(area(name)) : null])),
    toggle: getComputedStyle(inner.querySelector('[part="drawer-toggle"]')).display !== 'none' && inner.querySelector('.bar').checkVisibility(),
    menu: !!shadow.querySelector('[part="menu"]') && shadow.querySelector('[part="menu"]').checkVisibility(),
    scrollWidth: document.documentElement.scrollWidth, pageScrollWidth: app.page.scrollWidth, pageClientWidth: app.page.clientWidth,
    navWidth: app.page.navWidth, asideWidth: app.page.asideWidth,
    sidebar: shown('nav') ? box(app.querySelector('[slot="nav"]')) : null, inspector: shown('aside') ? box(app.querySelector('[slot="aside"]')) : null,
  };
});
const off = (m, value) => Math.abs(value / m.unit - Math.round(value / m.unit)) * m.unit > STEP;
const near = (a, b) => Math.abs(a - b) <= STEP;

for (const [width, height] of [[1280, 800], [1366, 768], [1440, 900], [1447, 900], [1453, 910], [1920, 1013]]) {
  await check(`${width} × ${height}: the bar is two squares and the leftover, the panes end on whole squares at the bottom edge`, async page => {
    await open(page, width, height);
    const m = await frame(page);
    assert.ok(m.aligned, 'Desktop aligned');
    assert.ok(m.managed, 'the app scale tells the device module it manages --sf');
    assert.ok(Math.abs(m.componentScale * 20 - m.unit) < 1e-6, 'the components follow the scale');
    assert.ok(near(m.bar.height, 2 * m.unit + m.top), `bar ${m.bar.height} is 2 × ${m.unit} + ${m.top}`);
    assert.match(m.barLine, / 0px 1px 0px/, `the bar's hairline is the pixel under its edge, where the grid's line is (${m.barLine})`);
    assert.ok(!m.barLine.includes('inset'), 'the hairline is not inside the bar');
    for (const edge of ['left', 'top']) assert.ok(near(m.app[edge], 0), `the frame's ${edge} edge is the window's`);
    assert.ok(near(m.app.right, m.width) && near(m.app.bottom, m.height), "the frame's right and bottom edges are the window's");
    assert.ok(near(m.page.bottom, m.height), 'the panes reach the bottom edge');
    const edges = Object.entries(m.areas).filter(([, box]) => box).flatMap(([name, box]) => [['left', box.left], ['right', box.right], ['top', box.top - m.top], ['bottom', box.bottom - m.top]].map(([side, value]) => [name, side, value]));
    const loose = edges.filter(([, , value]) => off(m, value)).map(([name, side, value]) => `${name} ${side} at ${(value / m.unit).toFixed(3)}`);
    assert.deepEqual(loose, [], 'every pane edge on a whole square');
    assert.ok(near(m.sidebar.width, m.navWidth * m.unit), `the navigation is its width in squares (${m.sidebar.width / m.unit})`);
    assert.ok(near(m.inspector.width, m.asideWidth * m.unit), `the inspector is its width in squares (${m.inspector.width / m.unit})`);
    assert.equal(m.toggle, false, 'no menu button on a computer');
  });
}

await check('the dividers drag and step in whole squares and the widths are remembered', async page => {
  await open(page, 1447, 900);
  await page.evaluate(() => localStorage.removeItem('fixture-app'));
  await open(page, 1447, 900);
  const before = await frame(page);
  assert.equal(Math.round(before.sidebar.width / before.unit), 12);
  const handle = await page.evaluateHandle(() => document.querySelector('ds-app').page.shadowRoot.querySelector('.resize-nav'));
  const grip = await handle.boundingBox();
  const x = grip.x + grip.width / 2, y = grip.y + grip.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 3.3 * before.unit, y, { steps: 8 });
  await page.mouse.up();
  await page.evaluate(() => document.querySelector('ds-app').page.updateComplete);
  const dragged = await frame(page);
  assert.equal(dragged.navWidth, 15, 'the drag snaps to fifteen squares');
  assert.ok(near(dragged.sidebar.width, 15 * dragged.unit), `the navigation stands on whole squares after the drag (${dragged.sidebar.width / dragged.unit})`);
  await page.mouse.move(x + 20 * before.unit, y + 10 * before.unit);
  const line = await page.evaluate(divider => {
    const color = getComputedStyle(divider, '::before').backgroundColor;
    const probe = document.createElement('i');
    probe.style.color = 'var(--ds-text-color)';
    divider.getRootNode().host.shadowRoot.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.remove();
    return { color, ink, focused: divider.getRootNode().activeElement === divider };
  }, handle);
  assert.equal(line.focused, false, 'a released divider keeps no focus');
  assert.notEqual(line.color, line.ink, `the divider goes back to its light line once the pointer leaves (${line.color})`);
  await handle.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.down('Shift'); await page.keyboard.press('ArrowLeft'); await page.keyboard.up('Shift');
  const aside = await page.evaluateHandle(() => document.querySelector('ds-app').page.shadowRoot.querySelector('.resize-aside'));
  await aside.focus();
  await page.keyboard.press('ArrowLeft');
  await page.evaluate(() => document.querySelector('ds-app').page.updateComplete);
  const stepped = await frame(page);
  assert.equal(stepped.navWidth, 9, 'arrow keys move one square, five with Shift');
  assert.equal(stepped.asideWidth, 13, "the inspector's divider grows it leftward");
  await open(page, 1447, 900);
  const again = await frame(page);
  assert.deepEqual([again.navWidth, again.asideWidth], [9, 13], 'the widths are remembered');
  assert.ok(near(again.sidebar.width, 9 * again.unit) && near(again.inspector.width, 13 * again.unit), 'and drawn again at those widths');
  const reset = await page.evaluateHandle(() => document.querySelector('ds-app').page.shadowRoot.querySelector('.resize-nav'));
  await reset.focus();
  await page.keyboard.press('Enter');
  await page.evaluate(() => document.querySelector('ds-app').page.updateComplete);
  assert.equal((await frame(page)).navWidth, 12, "Enter goes back to the width the page was given, not the remembered one");
});

await check('an area with nothing in it takes no room', async page => {
  await open(page, 1447, 900, '?nav=0&aside=0&header=0&footer=0');
  const m = await frame(page);
  for (const name of ['nav', 'aside', 'header', 'footer']) assert.equal(m.areas[name], null, `${name} is empty`);
  assert.ok(near(m.areas.main.left, m.unit) && near(m.areas.main.right, m.width - m.unit), 'the work takes the window, a square in from each side');
  const resizers = await page.evaluate(() => [...document.querySelector('ds-app').page.shadowRoot.querySelectorAll('.resize')].map(handle => getComputedStyle(handle).display));
  assert.deepEqual(resizers, ['none', 'none'], 'no divider beside an empty pane');
});

await check('a phone: the menu in the bar opens the navigation, the page scrolls under the bar, nothing scrolls sideways', async page => {
  await page.emulate(KnownDevices['iPhone 13']);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  await page.goto(`${base}e2e/fixtures/app-frame.html`);
  await page.evaluate(() => window.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const m = await frame(page);
  assert.equal(m.aligned, false, 'a phone keeps its own scale');
  assert.ok(near(m.bar.height, 2 * m.unit), 'the bar is two squares');
  assert.equal(m.areas.nav, null, 'the navigation is folded away');
  assert.ok(m.menu, 'the menu button stands in the bar');
  assert.equal(m.toggle, false, 'no second menu row under the bar');
  assert.equal(await page.evaluate(() => document.getElementById('action').checkVisibility()), false, 'the actions are folded away with the navigation');
  assert.ok(m.scrollWidth <= m.width && m.pageScrollWidth <= m.pageClientWidth, `nothing scrolls sideways (${m.scrollWidth}, ${m.pageScrollWidth} > ${m.pageClientWidth})`);
  const scrolled = await page.evaluate(() => {
    const page = document.querySelector('ds-app').page;
    page.scrollTop = 400;
    return { scrollTop: page.scrollTop, bar: document.querySelector('ds-app').shadowRoot.querySelector('.bar').getBoundingClientRect().top, aside: !!page.shadowRoot.querySelector('[part="aside"]').getBoundingClientRect().height };
  });
  assert.ok(scrolled.scrollTop > 0 && near(scrolled.bar, 0), 'the page scrolls under a bar that stays');
  assert.ok(scrolled.aside, 'the inspector stands under the work');
  const menu = await page.evaluateHandle(() => document.querySelector('ds-app').shadowRoot.querySelector('[part="menu"]'));
  assert.equal(await menu.evaluate(button => button.getAttribute('aria-expanded')), 'false');
  await menu.tap();
  await page.waitForFunction(() => document.querySelector('ds-app').page.drawerOpen);
  // The panel settles half a square as it arrives.
  await page.evaluate(() => Promise.all(document.querySelector('ds-app').page.shadowRoot.querySelector('[part="drawer"]').getAnimations().map(animation => animation.finished)));
  const opened = await page.evaluate(() => {
    const app = document.querySelector('ds-app');
    const drawer = app.page.shadowRoot.querySelector('[part="drawer"]');
    const box = node => { const r = node.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(value => Math.round(value * 10) / 10); };
    return {
      expanded: app.shadowRoot.querySelector('[part="menu"]').getAttribute('aria-expanded'), modal: drawer.matches(':modal'), rows: drawer.querySelectorAll('slot').length,
      menu: box(app.shadowRoot.querySelector('[part="menu"]')), close: box(drawer.querySelector('[part="drawer-close"]')),
      bar: Math.round(app.shadowRoot.querySelector('.bar').getBoundingClientRect().bottom * 10) / 10, navigation: Math.round(app.querySelector('[slot="nav"]').getBoundingClientRect().top * 10) / 10,
      action: document.getElementById('action').checkVisibility(), below: document.getElementById('action').getBoundingClientRect().top >= app.querySelector('[slot="nav"]').getBoundingClientRect().bottom,
    };
  });
  assert.deepEqual([opened.expanded, opened.modal, opened.rows], ['true', true, 1], 'the drawer is a modal holding the navigation');
  assert.deepEqual(opened.close, opened.menu, 'the close button stands where the menu button stood');
  assert.equal(opened.navigation, opened.bar, 'the navigation starts on the square under the bar');
  assert.deepEqual([opened.action, opened.below], [true, true], 'the actions stand in the drawer, under the navigation');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('ds-app').page.drawerOpen);
  assert.equal(await menu.evaluate(button => button.getAttribute('aria-expanded')), 'false', 'Escape closes it');
});

for (const [query, menu] of [['?nav=0', true], ['?nav=0&actions=0', false]]) {
  await check(`a phone without navigation${menu ? '' : ' or actions'}: ${menu ? 'the menu holds the actions' : 'no menu button'}`, async page => {
    await page.emulate(KnownDevices['iPhone 13']);
    await page.goto(`${base}e2e/fixtures/app-frame.html${query}`);
    await page.evaluate(() => window.ready);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const m = await frame(page);
    assert.equal(m.menu, menu);
    assert.equal(m.toggle, false);
    assert.ok(near(m.areas.main.left, m.unit), 'the work starts a square in');
  });
}

await check('flush: the work runs to the hairlines, the bar and the bottom edge; the panes keep their room and widths', async page => {
  await open(page, 1447, 900, '?flush&header=0&footer=0');
  const m = await frame(page);
  assert.ok(near(m.areas.main.left, m.areas.nav.right) && near(m.areas.main.right, m.areas.aside.left), 'between the hairlines');
  assert.ok(near(m.areas.main.top, m.bar.bottom) && near(m.areas.main.bottom, m.height), 'from the bar to the bottom edge');
  assert.ok(near(m.sidebar.width, m.navWidth * m.unit) && near(m.inspector.width, m.asideWidth * m.unit), 'the panes keep their widths');
  assert.ok(near(m.sidebar.left, m.unit), 'the navigation keeps its square of room');
  await open(page, 1447, 900, '?flush&nav=0&aside=0&header=0&footer=0');
  const alone = await frame(page);
  assert.ok(near(alone.areas.main.left, 0) && near(alone.areas.main.right, alone.width), 'alone, edge to edge');
});

await check('flow: the window scrolls the page, the bar stays at the top with its hairline, and scrollToStart is the window\'s', async page => {
  await open(page, 1447, 900, '?flow&nav=0&aside=0&header=0&footer=0');
  const result = await page.evaluate(async () => {
    const app = document.querySelector('ds-app');
    const main = app.page.shadowRoot.querySelector('[part="main"]');
    main.style.minHeight = '3000px';
    await new Promise(resolve => requestAnimationFrame(resolve));
    const bar = () => app.shadowRoot.querySelector('[part="bar"]').getBoundingClientRect();
    const tall = document.documentElement.scrollHeight > window.innerHeight;
    window.scrollTo(0, 800);
    await new Promise(resolve => requestAnimationFrame(resolve));
    const scrolled = window.scrollY;
    const stuck = bar().top;
    const line = getComputedStyle(app.shadowRoot.querySelector('[part="bar"]')).boxShadow;
    app.scrollToStart();
    return { tall, scrolled, stuck, line, after: window.scrollY, position: getComputedStyle(app).position };
  });
  assert.ok(result.tall && result.scrolled > 0, 'the document is what scrolls');
  assert.equal(result.position, 'relative');
  assert.ok(near(result.stuck, 0), `the bar stays at the top (${result.stuck})`);
  assert.match(result.line, /0px 1px 0px/);
  assert.equal(result.after, 0);
});

await check('scrollToStart takes the work back to its top, on a computer and on a phone', async page => {
  await open(page, 1447, 900);
  const desktop = await page.evaluate(() => {
    const app = document.querySelector('ds-app');
    const main = app.page.shadowRoot.querySelector('[part="main"]');
    main.scrollTop = 600;
    const before = main.scrollTop;
    app.scrollToStart();
    return [before > 0, main.scrollTop];
  });
  assert.deepEqual(desktop, [true, 0]);
  await page.emulate(KnownDevices['iPhone 13']);
  await page.goto(`${base}e2e/fixtures/app-frame.html`);
  await page.evaluate(() => window.ready);
  const phone = await page.evaluate(() => {
    const app = document.querySelector('ds-app');
    app.page.scrollTop = 600;
    const before = app.page.scrollTop;
    app.scrollToStart();
    return [before > 0, app.page.scrollTop];
  });
  assert.deepEqual(phone, [true, 0]);
});

await check('an inspector closed with hidden takes no room, and comes back when it opens', async page => {
  await open(page, 1447, 900);
  const before = await frame(page);
  await page.evaluate(() => { document.querySelector('[slot="aside"]').hidden = true; });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const closed = await frame(page);
  assert.equal(closed.areas.aside, null, 'the inspector takes no room');
  assert.ok(near(closed.areas.main.right, closed.width - closed.unit), 'the work takes its place');
  await page.evaluate(() => { document.querySelector('[slot="aside"]').hidden = false; });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.ok(near((await frame(page)).areas.main.right, before.areas.main.right), 'opened again, as it was');
});

await check('a long label is cut inside its row, before its meta', async page => {
  await open(page, 1447, 900);
  const row = await page.evaluate(() => {
    const sidebar = document.querySelector('ds-sidebar');
    const row = sidebar.shadowRoot.querySelector('.row');
    const link = row.querySelector('a').getBoundingClientRect(), meta = row.querySelector('.meta').getBoundingClientRect();
    return { link: link.right, meta: meta.left, column: sidebar.getBoundingClientRect().right, cut: row.querySelector('.name').dataset.cut };
  });
  assert.ok(row.link <= row.meta && row.meta < row.column, `the link ends at ${row.link}, before the meta at ${row.meta}`);
  assert.equal(row.cut, 'end', 'the words fade where they are cut');
});

await check('apps: hovering the name lists the apps under the bar, the open one marked; leaving and Escape close it', async page => {
  await open(page, 1447, 900);
  await page.evaluate(() => {
    const app = document.querySelector('ds-app');
    app.apps = [{ name: 'Here', href: location.origin + '/' }, { name: 'Elsewhere', href: 'https://example.com/' }];
    return app.updateComplete;
  });
  const state = () => page.evaluate(() => {
    const root = document.querySelector('ds-app').shadowRoot;
    const menu = root.querySelector('[part="apps"]'), bar = root.querySelector('.bar').getBoundingClientRect();
    const box = menu.getBoundingClientRect();
    return { open: !menu.hidden && box.height > 0, top: box.top, barBottom: bar.bottom, links: [...menu.querySelectorAll('a')].map(a => [a.textContent, a.getAttribute('aria-current')]), expanded: root.querySelector('[part="brand"]').getAttribute('aria-expanded') };
  });
  assert.equal((await state()).open, false, 'closed at first');
  const brand = await page.evaluateHandle(() => document.querySelector('ds-app').shadowRoot.querySelector('[part="brand"]'));
  const b = await brand.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  let m = await state();
  assert.ok(m.open, 'a hover opens it');
  assert.equal(m.expanded, 'true');
  assert.ok(Math.abs(m.top - m.barBottom) < 0.5, `it hangs from the bar's edge (${m.top} / ${m.barBottom})`);
  assert.deepEqual(m.links, [['Here', 'page'], ['Elsewhere', null]], 'every app, the open one marked');
  const menu = await page.evaluateHandle(() => document.querySelector('ds-app').shadowRoot.querySelector('[part="apps"] a:last-child'));
  const l = await menu.boundingBox();
  await page.mouse.move(l.x + l.width / 2, l.y + l.height / 2, { steps: 6 });
  assert.ok((await state()).open, 'it stays open on the way into the menu');
  await page.mouse.move(b.x + 40 * 20, b.y + 20 * 20);
  await new Promise(resolve => setTimeout(resolve, 300));
  assert.equal((await state()).open, false, 'leaving closes it');
  await brand.focus();
  assert.ok((await state()).open, 'a keyboard focus opens it');
  await page.keyboard.press('Escape');
  assert.equal((await state()).open, false, 'Escape closes it');
});

await check('an overlay and a toast stand above the frame', async page => {
  await open(page, 1447, 900);
  await page.evaluate(() => document.getElementById('dialog').show());
  const dialog = await page.evaluate(() => {
    const panel = document.querySelector('#dialog > dialog');
    const box = panel.getBoundingClientRect();
    const at = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return { modal: panel.matches(':modal'), above: panel.contains(at) };
  });
  assert.deepEqual(dialog, { modal: true, above: true }, 'the overlay is on top');
  await page.evaluate(() => document.getElementById('dialog').close());
  await page.evaluate(() => window.toast('Saved'));
  const toast = await page.waitForFunction(() => {
    const item = [...(document.querySelector('ds-toast')?.shadowRoot?.querySelectorAll('li') ?? [])].find(node => node.textContent?.includes('Saved'));
    if (!item) return null;
    const box = item.getBoundingClientRect();
    const at = item.getRootNode().elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return item.contains(at) ? 'toast' : at?.localName ?? 'nothing';
  });
  assert.equal(await toast.jsonValue(), 'toast', 'the toast is on top');
});

await browser.close();
await server.close();
if (failures.length) { console.log(`\n${failures.length} failed`); process.exit(1); }
console.log('\napp frame: all checks passed');
