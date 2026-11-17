import {LitElement,html,nothing} from 'lit';
import '../../../DS1/2-core/ds-button';
export type {AskChoice} from './ask-face';
import {isAskShortcut,showAskFace,type AskChoice} from './ask-face';
export interface PageAskTarget {
 frame:HTMLIFrameElement;
 choices:()=>AskChoice[];
 text:()=>string;
 generate:(prompt:string,signal:AbortSignal)=>Promise<void>;
}
const pages=new Set<PageAskTarget>();
const navigation=new Map<HTMLElement,()=>AskChoice[]>();
let installed=false,enabled=false,checked:Promise<boolean>|undefined;
const AVAILABILITY='consistency-ask-availability';
export const isAskAvailable=()=>enabled;
export const registerPageAsk=(target:PageAskTarget)=>{pages.add(target);return()=>pages.delete(target);};
export const registerAskNavigation=(host:HTMLElement,choices:()=>AskChoice[])=>{navigation.set(host,choices);return()=>navigation.delete(host);};
const activePage=()=>[...pages].find(page=>page.frame.isConnected&&page.frame.getClientRects().length>0&&page.frame.getBoundingClientRect().width>0);
const catalogue=()=>[...[...navigation].filter(([host])=>host.isConnected).flatMap(([,read])=>read()),...(activePage()?.choices()??[])];
const allowed=()=>checked??=fetch('/api/consistency/ask',{credentials:'same-origin',cache:'no-store'}).then(async response=>{enabled=response.ok&&(await response.json()).enabled===true;dispatchEvent(new Event(AVAILABILITY));return enabled;}).catch(()=>false);
export async function openGlobalAsk(seed='') {
 if(!await allowed())return;
 const started=activePage();
 await showAskFace({seed,timeout:105000,choices:query=>{
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return catalogue().filter(row=>words.every(word=>`${row.title} ${row.detail} ${row.label??''}`.toLowerCase().includes(word))).slice(0,24);
 },submit:async(prompt,signal)=>{
  const page=activePage();
  const rows=catalogue().slice(0,100).map(({id,title,detail,kind})=>({id,title,detail,kind}));
  const response=await fetch('/api/consistency/ask',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({prompt,catalogue:rows,page:page?.text().slice(0,12000)??'',allowPageEdits:true})});
  const answer=await response.json();if(!response.ok){if(response.status===401||response.status===403){enabled=false;checked=undefined;dispatchEvent(new Event(AVAILABILITY));}throw Error(answer.error??'No answer came this time. Try again.');}
  if(activePage()!==started)throw Error('The page changed. Open Ask again.');if(answer.intent==='edit'){if(!page)throw Error('Open a page to ask for an edit.');await page.generate(prompt,signal);return;}return String(answer.answer);
 }});
}
export function installGlobalAsk(){
 if(installed)return;installed=true;
 const bound=new WeakMap<Document,AbortController>();
 const bind=(doc:Document,frame?:HTMLIFrameElement)=>{
  if(bound.has(doc))return;const controller=new AbortController();bound.set(doc,controller);
  doc.addEventListener('keydown',event=>{if(frame&&(!frame.isConnected||!frame.getClientRects().length))return;if(!enabled||document.documentElement.hasAttribute('data-c9y-asking')||doc.documentElement.hasAttribute('data-drag-active')||doc.querySelector('[data-resizing],[data-resize-active],[data-spacing-active]')||!isAskShortcut(event))return;if(document.querySelector('dialog[open],ds-context[open],ds-select[open]'))return;event.preventDefault();event.stopImmediatePropagation();void openGlobalAsk();},{capture:true,signal:controller.signal});
 };
 bind(document);document.addEventListener('page-ready',event=>{const frame=(event as CustomEvent<{frame?:HTMLIFrameElement}>).detail?.frame;if(frame?.contentDocument)bind(frame.contentDocument,frame);});
}
export class AskLauncher extends LitElement {
 static properties={available:{state:true}};private available=enabled;
 createRenderRoot(){return this;}
 private change=()=>{this.available=enabled;this.hidden=!enabled;};
 connectedCallback(){super.connectedCallback();this.hidden=!enabled;installGlobalAsk();addEventListener(AVAILABILITY,this.change);void allowed().then(this.change);}
 disconnectedCallback(){removeEventListener(AVAILABILITY,this.change);super.disconnectedCallback();}
 render() {
  if (!this.available) return nothing;
  if (this.hasAttribute('hint')) {
   return html`<button type="button" class="ds-text ds-text--muted" aria-keyshortcuts="Space" @click=${() => void openGlobalAsk()}>Space to Ask</button>`;
  }
  return html`<ds-button label="Ask" @click=${() => void openGlobalAsk()}>Ask</ds-button>`;
 }
}
if(!customElements.get('consistency-ask-launcher'))customElements.define('consistency-ask-launcher',AskLauncher);
