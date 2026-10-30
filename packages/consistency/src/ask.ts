/**
 * Ask, in the editor: the shared on-page face, Enter to send, the answer landed on the page as a
 * draft the person keeps or discards. The face calls `/api/consistency/ai` with the page's own
 * context; no provider credential is here. The route checks the answer against the vocabulary, and
 * the editor checks it again with the renderer's validator before it lands. A refusal shows its words
 * with a retry on Enter; a slow or failed answer leaves the page as it was.
 */
import { checkAskAnswer, type AskBlock, type AskContext, type AskDocument, type AskIntent, type AskLevel } from '../../../shared/consistency-ask';
import { validateNativePage, type NativePageDocument, type NativeSection } from '../../../shared/consistency-native-page';
import { createSurfaceContext } from './surface-context';
import type { Context } from '../../../DS1/3-unit/ds-context';
import { showAskFace } from './ask-face';

/** The browser waits a little longer than the route's own generator time, so a route that answers late still lands. */
export const ASK_CLIENT_TIMEOUTS: Readonly<Record<AskLevel, number>> = { section: 50_000, page: 70_000 };
export const ASK_PLACEHOLDERS: Readonly<Record<AskLevel, string>> = { section: 'A hero with the Blue Raft photo and a Book button', page: 'A page about the floating shelter with prices and questions' };
const FAILED = 'Ask did not answer. Try again.';
export type AskAnswer = { level: 'section'; intent: AskIntent; block: NativeSection } | { level: 'page'; document: NativePageDocument };
export interface AskSiteContext { images: readonly string[]; collections: readonly string[]; runtimes: Readonly<Record<string, readonly string[]>>; site?: AskContext['site'] }
export interface AskSheetOptions {
  level: AskLevel;
  /** The page as it stands when the request is sent, and the block pressed at section level. */
  document: () => NativePageDocument; selected?: string;
  context: AskSiteContext;
  /** Lands the checked answer as a draft; the sheet closes once it has. */
  land: (answer: AskAnswer) => void;
  /** The transport, `fetch` unless a test gives another. */
  send?: (body: string, signal: AbortSignal) => Promise<Response>;
  timeout?: number;
}
const sendSameOrigin = (body: string, signal: AbortSignal) => fetch('/api/consistency/ai', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, signal, body });
const ids = (document: NativePageDocument) => { const found: string[] = []; const visit = (blocks: AskBlock[]) => { for (const block of blocks) { found.push(block.id); if (block.children) visit(block.children); } }; visit(document.blocks as unknown as AskBlock[]); return found; };

/** The route's answer read as a draft, checked once more here with the renderer; refused in words when it cannot land. */
export function readAskAnswer(body: unknown, level: AskLevel, document: NativePageDocument, context: AskSiteContext): AskAnswer | string {
  if (!body || typeof body !== 'object') return FAILED;
  const answer = body as { level?: unknown; intent?: unknown; block?: unknown; document?: unknown };
  const checkContext: AskContext = { ...context, ids: ids(document), layout: document.layout, validate: value => validateNativePage(value, { images: context.images, collections: context.collections, runtimes: context.runtimes, bindings: [] }) };
  const checked = checkAskAnswer(level === 'section' ? answer.block : answer.document, level, checkContext);
  if (!checked.ok) return `Ask could not use the answer: ${checked.refusal}`;
  if (checked.level === 'section') return { level: 'section', intent: answer.intent === 'replace' ? 'replace' : 'make', block: checked.block as unknown as NativeSection };
  return { level: 'page', document: checked.document as unknown as NativePageDocument };
}

/** The same checked generator serves the global Ask face and a component's Ask action. */
export async function requestAskAnswer(options:AskSheetOptions,prompt:string,signal:AbortSignal):Promise<AskAnswer> {
 const page=options.document(),level=options.level,send=options.send??sendSameOrigin;
 const response=await send(JSON.stringify({kind:level,prompt,document:page,...(level==='section'&&options.selected?{selected:options.selected}:{}),images:options.context.images,collections:options.context.collections,runtimes:options.context.runtimes,...(options.context.site?{site:options.context.site}:{})}),signal);
 const body:unknown=await response.json().catch(()=>null);
 if(!response.ok)throw Error(body&&typeof body==='object'&&typeof(body as {error?:unknown}).error==='string'?(body as {error:string}).error:FAILED);
 const result=readAskAnswer(body,level,page,options.context);if(typeof result==='string')throw Error(result);return result;
}
/** Context-menu Ask uses Link's shared face too; a checked answer still lands as a Keep/Discard draft. */
export function openAsk(options:AskSheetOptions):{close():void} {
 let closed=false,face:{close():void}|undefined;
 void showAskFace({placeholder:options.level==='page'?'Ask for the page':'Ask for a section',submit:async(prompt,signal)=>{
  const controller=new AbortController(),cancel=()=>controller.abort();signal.addEventListener('abort',cancel,{once:true});
  const timer=setTimeout(cancel,options.timeout??ASK_CLIENT_TIMEOUTS[options.level]);
  try{const answer=await requestAskAnswer(options,prompt,controller.signal);if(!closed&&!controller.signal.aborted)options.land(answer);else throw Error(FAILED);}
  catch(error){if(controller.signal.aborted&&!signal.aborted)throw Error(FAILED);throw error;}
  finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
 }}).then(handle=>{face=handle;if(closed)handle.close();});
 return{close(){closed=true;face?.close();}};
}

/** The bar over a landed draft: Keep leaves it as an edit, Discard takes it back; it follows the draft as the page moves and goes when the page changes under it. */
export function openDraftBar(options: { anchor: () => DOMRect | null; current: () => boolean; keep: () => void; discard: () => void }): { refresh(): void; remove(): void } {
  const bar = createSurfaceContext('Draft') as Context; bar.bar = true; bar.setAttribute('data-consistency-draft', '');
  const row = (text: string, run: () => void) => { const button = document.createElement('button'); button.type = 'button'; button.setAttribute('role', 'menuitem'); button.textContent = text; button.addEventListener('click', () => { run(); remove(); }); bar.append(button); return button; };
  row('Keep', options.keep); row('Discard', options.discard);
  let removed = false;
  const remove = () => { if (removed) return; removed = true; bar.remove(); };
  // A press elsewhere does not take the bar away: the draft stands until Keep or Discard, or until the page changes under it.
  bar.addEventListener('ds-menu-close', event => { const reason = (event as CustomEvent<{ reason: string }>).detail.reason; if (reason === 'outside') event.preventDefault(); else if (reason === 'escape') { options.keep(); remove(); } });
  const place = () => { if (removed) return; if (!options.current()) { options.keep(); remove(); return; } const rect = options.anchor(); if (!rect) return; bar.anchor = rect; bar.place(); };
  document.body.append(bar);
  const rect = options.anchor();
  if (rect) bar.openOver(rect);
  return { refresh: place, remove };
}
