/** Spacing guides reveal only the hovered, keyboard-focused or actively adjusted space. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
const css=await readFile('packages/consistency/src/editor-surface.css','utf8');
for(const engine of [chromium,webkit]) {
 const browser=await engine.launch({headless:true});
 try {
  const page=await browser.newPage();
  for(const wrapper of ['consistency-shell','consistency-shell production-on','consistency-native-guides','consistency-text-bounds']) for(const kind of ['gap','padding']) for(const value of [0,20]) {
   await page.setContent(`<style>:root{--ds-pink:#ff80ab;--u:20px}body{margin:0}.fixture{position:relative;width:200px;height:80px;margin:80px}.ghost-surface{width:200px;height:40px}${css}</style><div class="fixture ${wrapper}"><div tabindex="0" class="ghost-surface ghost-surface--${kind}" aria-valuenow="${value}"><span class="ghost-measure">${value}</span></div></div>`);
   const handle=page.locator('.ghost-surface');
   const drawn=()=>handle.evaluate(el=>{const color=getComputedStyle(el).backgroundColor;return {measure:getComputedStyle(el.querySelector('.ghost-measure')).opacity,fill:!['transparent','rgba(0, 0, 0, 0)'].includes(color),before:getComputedStyle(el,'::before').content!=='none'&&getComputedStyle(el,'::before').opacity!=='0',after:getComputedStyle(el,'::after').content!=='none'&&getComputedStyle(el,'::after').opacity!=='0'};});
   const label=`${engine.name()} ${wrapper} ${kind} ${value}`;
   await page.mouse.move(700,500);
   const idle=await drawn();assert.ok(idle.measure==='0'&&!idle.fill&&!idle.before&&!idle.after,`${label}: spacing overlay visible while idle ${JSON.stringify(idle)}`);
   await handle.hover();let active=await drawn();assert.ok(active.measure==='1'&&(active.fill||active.before||active.after),`${label}: hover reveals guide`);
   await page.mouse.move(700,500);assert.deepEqual(await drawn(),idle,`${label}: pointer leave hides guide`);
   await page.keyboard.press('Tab');assert.ok(await handle.evaluate(el=>el.matches(':focus-visible')),`${label}: keyboard focus reaches spacing handle`);
   active=await drawn();assert.ok(active.measure==='1'&&(active.fill||active.before||active.after),`${label}: keyboard focus reveals guide`);
   await handle.evaluate(el=>{el.blur();el.setAttribute('data-spacing-active','');});active=await drawn();assert.ok(active.measure==='1'&&(active.fill||active.before||active.after),`${label}: adjustment retains guide away from pointer`);
   await handle.evaluate(el=>el.removeAttribute('data-spacing-active'));assert.deepEqual(await drawn(),idle,`${label}: ending adjustment hides guide`);
  }
  console.log(`${engine.name()}: hover-only spacing guides, zero lines, keyboard and active adjustment pass`);
 }finally{await browser.close();}
}
