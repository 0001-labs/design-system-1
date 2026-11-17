import {createHash} from 'node:crypto';
import { Window } from 'happy-dom';
import { Script, createContext } from 'node:vm';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { initialComposition } from '../packages/consistency/src/model';
import { studioMarkup } from '../shared/consistency-studio';
import { importComponentPage } from '../shared/consistency-import';
import { SITE_TEMPLATES } from '../packages/consistency/src/template-catalogue';
import { reconcileTemplateRegistry, type TemplateRegistry } from './consistency-template-registry';
const update = process.argv.includes('--refresh');
if (process.argv.some(arg => arg.startsWith('--') && arg !== '--refresh')) throw Error('Usage: vp exec tsx scripts/consistency-templates.ts [--refresh]. Default checks the committed registry; --refresh explicitly updates it while retaining history.');
const properties = ['items', 'data', 'columns', 'values', 'value', 'figure', 'caption', 'label', 'segments', 'series', 'nodes', 'edges'];
const previous = JSON.parse(await readFile('shared/consistency-template-pages.json', 'utf8').catch(() => { throw Error('Missing template registry. Restore shared/consistency-template-pages.json from Git; do not rebuild without its history.'); })) as TemplateRegistry;
function pinPresentations(id:string,imported:ReturnType<typeof importComponentPage>){const components={...previous[id]?.components},names=new Map<string,string>();for(const[name,definition]of Object.entries(imported.components)){const pin=`${id.replaceAll('-','_')}_${createHash('sha256').update(JSON.stringify(definition)).digest('hex').slice(0,20)}`;if (components[pin] && JSON.stringify(components[pin]) !== JSON.stringify(definition)) throw Error(`Immutable template presentation collision: ${pin}`);components[pin]=definition;names.set(name,pin);}const walk=(blocks:typeof imported.document.blocks)=>{for(const block of blocks){if(block.kind==='component')block.name=names.get(block.name)!;if('children'in block)walk(block.children);}};walk(imported.document.blocks);imported.components=components;return imported;}
const snapshots: Record<string, unknown> = {};
const pages: Record<string, unknown> = {};
for (const template of SITE_TEMPLATES) {
  const window = new Window({ url: 'https://example.invalid/' });
  window.document.body.innerHTML = template.html;
  const document = window.document;
  document.querySelectorAll('ds-input,ds-select,ds-calendar').forEach(element => {
    (element as unknown as { value: string }).value = element.getAttribute('value') ?? '';
  });
  const sandbox = createContext({ ResizeObserver: class { observe() {} disconnect() {} }, getComputedStyle: window.getComputedStyle.bind(window), document, window: { document }, customElements: { whenDefined: async () => undefined }, console, setTimeout: () => 0, clearTimeout: () => {}, requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} });
  if (template.script) await new Script(`(async () => { ${template.script}\n })()`, { filename: `template-${template.id}` }).runInContext(sandbox, { timeout: 2000 });
  const components: Record<string, Record<string, unknown>> = {};
  let index = 0;
  document.body.querySelectorAll('*').forEach(element => {
    element.setAttribute('data-template-node', `n${index++}`);
    const data: Record<string, unknown> = {};
    if (element.localName.startsWith('ds-')) for (const key of properties) {
      const value = (element as unknown as Record<string, unknown>)[key];
      if (value !== undefined && typeof value !== 'function') {
        try { data[key] = JSON.parse(JSON.stringify(value)); } catch {}
      }
    }
    if (Object.keys(data).length) components[element.getAttribute('data-template-node')!] = data;
  });
  const library = template.library ? template.library.href.startsWith('https:') ? await fetch(template.library.href).then(response => { if (!response.ok) throw new Error('Template library unavailable'); return response.text(); }) : await readFile(`website/public${template.library.href}`, 'utf8') : '';
  const imported=pinPresentations(template.id,importComponentPage(document.body as never,{namespace:`template_${template.id.replaceAll('-','_')}`,properties:components,origin:'https://designsystem1.com',...('seo'in template&&template.seo?{title:template.seo.title,description:template.seo.description,lang:template.seo.lang}:{})}));
  const bookingKeys:string[]=[];
  if(template.id==='booking'){
    const textIds=new Map<Node,string>();let index=0;const walker=document.createTreeWalker(document.body,window.NodeFilter.SHOW_TEXT);while(walker.nextNode()){const node=walker.currentNode;if(node.textContent?.trim()&&!node.parentElement?.closest('style,script,svg,option,textarea'))textIds.set(node,imported.textKeys[`template:page:${index++}`]);}
    const visit=(element:Element)=>{if(element.matches('ds-text:not(:empty),span[slot="title"],span[slot="label"]'))bookingKeys.push(imported.sourceIds[element.getAttribute('data-template-node')!]);for(const child of element.childNodes){if(child.nodeType===1)visit(child as Element);else if(element.localName==='ds-button'&&child.nodeType===3&&child.textContent?.trim())bookingKeys.push(textIds.get(child)!);}};visit(document.body);
  }
  pages[template.id] = {id:template.id,label:template.label,description:template.description,href:template.href,...imported,bookingKeys,library,...('seo'in template&&template.seo?{structuredData:template.seo.structuredData}:{})};
  snapshots[template.id] = { id: template.id, label: template.label, description: template.description, href: template.href, html: document.body.innerHTML, components, library };
  await window.happyDOM.close();
}
const studioWindow=new Window();studioWindow.document.body.innerHTML=studioMarkup;const studio=pinPresentations('studio',importComponentPage(studioWindow.document.body as never,{namespace:'studio'}));pages.studio={...studio,seed:initialComposition,library:await readFile('packages/consistency/src/style.css','utf8')};await studioWindow.happyDOM.close();
const registry = reconcileTemplateRegistry(previous, pages as TemplateRegistry, update);
await mkdir('packages/consistency/generated', { recursive: true });
await writeFile('packages/consistency/generated/templates.json', JSON.stringify(snapshots));
if (update && registry !== previous) await writeFile('shared/consistency-template-pages.json', JSON.stringify(registry));
console.log(`${update ? 'Refreshed' : 'Checked'} ${SITE_TEMPLATES.length} editable site templates against the retained DS1 registry.`);
