import { afterAll, beforeAll, expect, test } from 'vite-plus/test';
import { build } from 'esbuild';
import { chromium, webkit, type Browser } from 'playwright';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
const root = join(import.meta.dirname, '..');
const css = (path: string): string => readFileSync(path, 'utf8').replace(/@import\s+["']([^"']+)["'];/g, (_, imported) => css(resolve(dirname(path), imported)));
let browsers: Browser[] = [], bundle: string;
beforeAll(async () => {
  browsers = await Promise.all([chromium.launch({ headless: true }), webkit.launch({ headless: true })]);
  bundle = (await build({ stdin: { contents: "import './DS1/2-core/ds-button'; import './DS1/3-unit/ds-tabs'; export {inspectConstraints} from './DS1/0-face/constraints';", resolveDir: root, loader: 'ts' }, bundle: true, format: 'iife', globalName: 'ChoiceCheck', write: false, plugins: [{ name: 'inline-styles', setup(build) {
    build.onResolve({ filter: /\.css\?inline$/ }, args => ({ path: resolve(args.resolveDir, args.path.replace('?inline', '')), namespace: 'inline-styles' }));
    build.onLoad({ filter: /.*/, namespace: 'inline-styles' }, args => ({ contents: `export default ${JSON.stringify(css(args.path))}`, loader: 'js' }));
  } }] })).outputFiles[0]!.text;
});
afterAll(async () => { await Promise.all(browsers.map(browser => browser.close())); });

test('joined selections keep 4.5:1 contrast on blue, light, dark and translucent accents in both themes', async () => {
  for (const browser of browsers) {
    const page = await browser.newPage();
    try {
      const accents = ['#5555ff', '#f8fadb', '#181818', '#ffffff', '#888888', 'rgba(85,85,255,.7)'];
      await page.setContent(`<style>${css(join(root, 'DS1/1-root/component-tokens.css'))}body{margin:0;background:white}section{background:white;color:black;padding:20px;color-scheme:light}.dark{background:#2a2a2a;color:white;color-scheme:dark}ds-tabs{margin-top:20px}</style>` + ['light', 'dark'].map(theme => accents.map(accent => `<section class="${theme}" style="--ds-accent-color:${accent};--ds-button-text-color-on-accent:#2a2a2a"><ds-button split literal options="calendar:Calendar,swimlane:Swimlane,earnings:Earnings" value="calendar"></ds-button><ds-tabs split><ds-button role="tab" active literal>Calendar</ds-button><ds-button role="tab" literal>Swimlane</ds-button></ds-tabs></section>`).join('')).join(''));
      await page.addScriptTag({ content: bundle });
      await page.evaluate(async () => { await customElements.whenDefined('ds-button'); await Promise.all([...document.querySelectorAll('ds-button,ds-tabs')].map(node => (node as any).updateComplete)); });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
      const findings = () => page.evaluate(() => (window as any).ChoiceCheck.inspectConstraints(document).filter((finding: any) => finding.constraint.code === 'color.text-contrast').map((finding: any) => finding.message));
      expect(await findings()).toEqual([]);
      await page.evaluate(() => { for (const section of document.querySelectorAll('section')) { (section as HTMLElement).style.setProperty('--ds-accent-color', '#ffff00'); section.classList.toggle('dark'); } });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      expect(await findings()).toEqual([]);
      expect(await page.locator('ds-button[split]').first().evaluate(node => getComputedStyle(node.shadowRoot!.querySelector('button')!).color)).toBe('rgb(42, 42, 42)');
    } finally { await page.close(); }
  }
});
