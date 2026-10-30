import { chromium, webkit } from 'playwright';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

const check = (ok, message) => { if (!ok) throw Error(message); };
const bundle = await build({ stdin: { contents: `import {EditorSurface} from './packages/consistency/src/editor-surface';window.surface=new EditorSurface(window.canvasRoot??document.querySelector('main'),{selection:()=>new Set(),select:()=>{},marquee:()=>false,reorder:()=>false});`, resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife' });
const styles = await readFile('packages/consistency/src/editor-surface.css', 'utf8');
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<style>${styles}body{margin:40px}p{margin:0 0 40px;font:20px/30px sans-serif}</style><main><p id="label">Canvas words are not a document selection.</p><p id="other">Another independent piece of the page.</p><p id="writing" contenteditable="true">Select words within this editor.</p><input value="A native field"></main><div id="guide" data-editor-chrome="">20</div>`);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const selection = () => page.evaluate(() => window.getSelection().toString());
    const box = await page.locator('#label').boundingBox();
    await page.mouse.move(box.x + 2, box.y + 15); await page.mouse.down();
    await page.mouse.move(box.x + 220, box.y + 85, { steps: 10 }); await page.mouse.up();
    check(!await selection(), 'Dragging over canvas words created a document text selection');
    await page.mouse.move(15, 15); await page.mouse.down();
    await page.mouse.move(box.x + 220, box.y + 85, { steps: 10 }); await page.mouse.up();
    check(!await selection(), 'Dragging from the page margin selected canvas text');
    await page.mouse.click(15, 15);
    const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
    await page.keyboard.press(selectAll);
    check(!await selection(), 'Select all outside writing selected the entire canvas');
    await page.evaluate(() => { document.activeElement?.blur();getSelection().selectAllChildren(document.querySelector('main')); });
    await page.waitForTimeout(30);
    check(!await selection(), 'A browser-created canvas range survived outside active writing');
    await page.locator('#writing').click(); await page.keyboard.press(selectAll);
    check((await selection()).trim() === 'Select words within this editor.', 'Select all escaped the active text editor');
    await page.keyboard.type('Changed words.');
    check(await page.locator('#writing').textContent() === 'Changed words.', 'Normal text replacement failed');
    await page.locator('input').click(); await page.keyboard.press(selectAll); await page.keyboard.type('Changed field');
    check(await page.locator('input').inputValue() === 'Changed field', 'Native field selection failed');
    await page.evaluate(() => {
      const host = document.createElement('div'); host.id = 'shadow'; document.querySelector('main').append(host);
      host.attachShadow({ mode: 'open' }).innerHTML = '<span contenteditable="true">Shadow words</span>';
    });
    const shadow = page.locator('#shadow [contenteditable]');
    await shadow.click(); await page.keyboard.press(selectAll); await page.keyboard.type('Changed shadow');
    check(await shadow.textContent() === 'Changed shadow', 'Shadow component text selection failed');
    await page.evaluate(() => { window.contextEvents=[];document.addEventListener('contextmenu',event=>window.contextEvents.push(event.defaultPrevented)); });
    for(const target of ['#label','#writing','input','#shadow [contenteditable]','#guide']) {
      await page.locator(target).click({button:'right'});
      check(await page.evaluate(()=>window.contextEvents.at(-1)===true), `Browser context menu was not suppressed on ${target}`);
    }
    await page.evaluate(()=>window.surface.destroy());
    await page.setContent('<p id="chrome">Editor chrome</p><iframe sandbox="allow-same-origin allow-scripts" style="width:900px;height:400px"></iframe>');
    await page.evaluate(styles=>{
      const doc=document.querySelector('iframe').contentDocument;
      doc.open();doc.write(`<style>${styles}#frameLabel{user-select:text!important;-webkit-user-select:text!important}</style><main><p id="frameLabel">Authored site words</p><p id="frameWriting" contenteditable="true">Write inside the frame</p></main>`);doc.close();
      window.canvasRoot=doc.querySelector('main');window.frameContexts=[];
      doc.addEventListener('contextmenu',event=>window.frameContexts.push(event.defaultPrevented));
    },styles);
    await page.addScriptTag({content:bundle.outputFiles[0].text});
    const frame=page.frameLocator('iframe');
    await frame.locator('#frameLabel').click({clickCount:3});
    await page.waitForTimeout(30);
    check(!await frame.locator('body').evaluate(el=>el.ownerDocument.getSelection().toString()),'Authored iframe CSS enabled browser text selection');
    await page.locator('#chrome').click();await page.keyboard.press(selectAll);await page.waitForTimeout(30);
    check(!await frame.locator('body').evaluate(el=>el.ownerDocument.getSelection().toString()),'Select all from the parent document selected the site canvas');
    check(!await page.evaluate(()=>getSelection().toString()),'Select all in the outer app selected the iframe as a browser document');
    await frame.locator('#frameWriting').click();await page.keyboard.press(selectAll);await page.keyboard.type('Frame writing works');
    check(await frame.locator('#frameWriting').textContent()==='Frame writing works','Shared iframe surface broke inline writing');
    await frame.locator('#frameLabel').click({button:'right'});
    check(await page.evaluate(()=>window.frameContexts.at(-1)===true),'Shared iframe surface allowed the browser context menu');
    await page.evaluate(()=>window.surface.destroy());
    await frame.locator('#frameLabel').click({button:'right'});
    check(await page.evaluate(()=>window.frameContexts.at(-1)===false),'Destroying the surface left context suppression installed');
    console.log(`${engine.name()}: Canvas selection stays within active writing; browser context menus stay suppressed, including the shared iframe surface`);
  } finally { await browser.close(); }
}
