/** Product adapter for the same Ask face and speech input used by Link. */
import type {Ask,AskRow} from '../../../packages/app/src/2-core/ds-ask';
import type {Listening} from '../../../packages/app/src/0-face/ask-listen';
export type AskChoice=AskRow&{open:()=>void|Promise<void>;confirm?:boolean};
export interface AskFaceOptions {
 seed?:string; placeholder?:string; choices?:(query:string)=>AskChoice[];
 submit:(prompt:string,signal:AbortSignal)=>Promise<string|void>; timeout?:number;
}
export const ASK_OPEN='consistency-ask-open';
const EDITING='input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],aa-editor';
const SPACE_OWNER='button,a[href],summary,[role="button"],[role="tab"],[role="option"],[role="checkbox"],[role="switch"],[role="slider"],[tabindex]:not([tabindex="-1"])';
export const ownsAskKeys=(event:KeyboardEvent)=>event.isComposing||event.composedPath().some(node=>(node as Element)?.nodeType===1&&(node as Element).matches(EDITING));
export const asksQuestion=(text:string)=>/^(?:what|why|how|when|where|who|which|can|could|is|are|do|does|explain|tell me|hvad|hvordan|hvor|kan)\b/i.test(text.trim())||text.trim().endsWith('?');
let current:{close():void}|undefined;
let opening=0;
/** One face per window. Navigation and generation both cancel obsolete answers on dismissal. */
export async function showAskFace(options:AskFaceOptions):Promise<{close():void}> {
 const generation=++opening;current?.close();
 const [{Ask:Face},speech]=await Promise.all([import('../../../packages/app/src/2-core/ds-ask'),import('../../../packages/app/src/0-face/ask-listen')]);
 if(generation!==opening)return{close(){}};
 current?.close();
 const face=new Face() as Ask;face.className='consistency-ask-face';face.setAttribute('data-editor-chrome','');
 face.open=true;face.placeholder=options.placeholder??(speech.canListen()?'Ask or search, or press space to speak':'Ask or search');
 let text=options.seed??'',chosen:number|null=null,confirmed='',pending:AbortController|undefined,listening:Listening|null=null,closed=false;
 const focused=document.activeElement as HTMLElement|null;focused?.blur();
 document.documentElement.setAttribute('data-c9y-asking','');
 const choices=()=>options.choices?.(text)??[];
 const picked=()=>chosen??(asksQuestion(text)?-1:0);
 const draw=()=>{face.text=text;face.rows=choices().map(row=>({...row,...(confirmed===row.id?{caption:'Press again to open'}:{})}));face.chosen=picked();const row=face.rows[face.chosen];face.completion=row?.title.toLowerCase().startsWith(text.toLowerCase())?row.title.slice(text.length):'';};
 const write=(value:string)=>{pending?.abort();pending=undefined;text=value.slice(0,4000);chosen=null;confirmed='';face.state='writing';face.answer='';draw();};
 const close=()=>{if(closed)return;closed=true;pending?.abort();listening?.abort();face.remove();document.documentElement.removeAttribute('data-c9y-asking');for(const doc of docs) {doc.removeEventListener('keydown',key,true);doc.removeEventListener('paste',paste,true);}document.removeEventListener('page-ready',ready);removeEventListener('popstate',close);if(focused?.isConnected)focused.focus({preventScroll:true});if(current?.close===close)current=undefined;};
 const choose=async(index=picked())=>{
  const row=choices()[index];if(row){if(row.confirm&&confirmed!==row.id){chosen=index;confirmed=row.id;draw();return;}close();await row.open();return;}
  if(!text.trim()||pending)return;
  const controller=pending=new AbortController();let timedOut=false;const timer=setTimeout(()=>{timedOut=true;controller.abort();},options.timeout??75000);face.state='thinking';face.rows=[];
  try{const answer=await options.submit(text.trim(),controller.signal);if(closed||controller.signal.aborted||pending!==controller)return;if(answer===undefined){close();return;}face.answer=answer;face.state='answered';}
  catch(error){if(closed||pending!==controller)return;face.answer=timedOut?'Ask did not answer. Try again.':(error as Error).message||'No answer came this time. Try again.';face.state='failed';}
  finally{clearTimeout(timer);if(pending===controller)pending=undefined;}
 };
 const listen=()=>{face.state='listening';listening=speech.listen({lang:document.documentElement.lang||navigator.language||'en',heard:words=>{text=words;draw();},end:failure=>{listening=null;if(closed)return;if(failure){face.answer=failure;face.state='failed';}else{face.state='writing';void choose();}}});if(!listening)face.state='writing';};
 const key=(event:KeyboardEvent)=>{
  if(closed||event.defaultPrevented||event.isComposing)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return;}
  if(ownsAskKeys(event))return;
  if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){void face.copyLink(picked());}
  else if(event.key==='Enter'){if(!event.repeat){if(listening)listening.stop();else if(face.state==='answered')close();else if(face.state!=='thinking')void choose();}}
  else if(face.state==='thinking'||face.state==='listening')return;
  else if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key)){const count=choices().length;if(count){const step=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;chosen=picked()<0?(step>0?0:count-1):(picked()+step+count)%count;draw();}}
  else if(event.key==='Backspace'){const next=event.metaKey||event.altKey?text.replace(/\S*\s*$/,''):text.slice(0,-1);if(next)write(next);else close();}
  else if(event.key===' '&&!text&&speech.canListen())listen();
  else if(event.key.length===1&&!event.metaKey&&!event.ctrlKey&&!event.altKey)write((face.state==='writing'?text:'')+event.key);
  else return;
  event.preventDefault();event.stopImmediatePropagation();
 };
 const paste=(event:ClipboardEvent)=>{if(face.state!=='writing')return;const value=event.clipboardData?.getData('text/plain');if(value){event.preventDefault();write(text+value.replace(/\s+/g,' '));}};
 const docs=new Set<Document>();
 const bind=(doc:Document)=>{if(docs.has(doc))return;docs.add(doc);doc.addEventListener('keydown',key,true);doc.addEventListener('paste',paste,true);};
 const ready=(event:Event)=>{const frame=(event as CustomEvent<{frame?:HTMLIFrameElement}>).detail?.frame;if(frame?.contentDocument)bind(frame.contentDocument);};
 bind(document);for(const frame of document.querySelectorAll<HTMLIFrameElement>('consistency-page-editor iframe'))if(frame.contentDocument)bind(frame.contentDocument);
 document.addEventListener('page-ready',ready);addEventListener('popstate',close);
 face.addEventListener('ask-dismiss',close);face.addEventListener('ask-choose',event=>{void choose((event as CustomEvent<{index:number}>).detail.index);});
 document.body.append(face);draw();current={close};return current;
}
/** Only navigation surfaces call this; text fields and gesture controls retain their keys. */
export function isAskShortcut(event:KeyboardEvent):boolean {
 if(event.defaultPrevented||event.repeat||ownsAskKeys(event))return false;
 if((event.metaKey||event.ctrlKey)&&!event.altKey&&event.key.toLowerCase()==='k')return true;
 return event.key===' '&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.composedPath().some(node=>(node as Element)?.nodeType===1&&(node as Element).matches(SPACE_OWNER));
}
