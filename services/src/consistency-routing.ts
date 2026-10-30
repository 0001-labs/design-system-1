import { FEATURE_FLAGS } from '../../shared/feature-flags';
import { resolveFlag } from '../../shared/feature-flags-runtime/index';
import { applyComponentDecision, componentContext, componentState, componentQuestions, COMPONENT_ROUTING_FLAG, COMPONENT_ROUTING_MODEL, COMPONENT_ROUTING_TIMEOUT, type ComponentRequest } from '../../shared/consistency-routing';
import type { ReportsEnv } from './reports';

export interface ComponentRoutingEnv extends ReportsEnv { TYPESAFE_API_KEY?: string }

/** Caller must have completed the existing verified owner authorization. */
export async function routeComponentEdit(input: ComponentRequest, env: ComponentRoutingEnv, send: typeof fetch, signal: AbortSignal) {
  const context = componentContext(input);
  if (!context || !env.TYPESAFE_API_KEY || signal.aborted) return null;
  const abort = new AbortController();
  const cancel = () => abort.abort();
  signal.addEventListener('abort', cancel, { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const work = async () => {
    const object = await env.LIBRARIES.get(`feature-flags/${COMPONENT_ROUTING_FLAG}.json`);
    const rules = object ? { [COMPONENT_ROUTING_FLAG]: await object.json() } : {};
    if (!resolveFlag(FEATURE_FLAGS, COMPONENT_ROUTING_FLAG, rules, { accountId: env.REPORTS_OWNER_ID, isOwner: true }) || abort.signal.aborted) return null;
    const response = await send('https://api.typesafe.ai/v1/systemone', {
      method: 'POST', headers: { authorization: `Bearer ${env.TYPESAFE_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: COMPONENT_ROUTING_MODEL, state: componentState(context), questions: componentQuestions(context) }),
      signal: abort.signal, redirect: 'error',
    });
    if (!response.ok || abort.signal.aborted) return null;
    const body: unknown = await response.json();
    return abort.signal.aborted ? null : applyComponentDecision(context, body);
  };
  try {
    return await Promise.race([work(), new Promise<null>(resolve => {
      timer = setTimeout(() => { cancel(); resolve(null); }, COMPONENT_ROUTING_TIMEOUT);
    })]);
  } catch { return null; }
  finally { clearTimeout(timer); signal.removeEventListener('abort', cancel); }
}

/** A typed request judgment, without page text that could masquerade as permission to edit. */
export async function routePageRequest(prompt:string,env:ComponentRoutingEnv,send:typeof fetch,signal:AbortSignal):Promise<'edit'|'answer'> {
 if(!env.TYPESAFE_API_KEY||signal.aborted)throw Error('Request routing is unavailable.');
 const abort=new AbortController(),cancel=()=>abort.abort();signal.addEventListener('abort',cancel,{once:true});
 const timer=setTimeout(cancel,COMPONENT_ROUTING_TIMEOUT);
 try{
  const response=await send('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{authorization:`Bearer ${env.TYPESAFE_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:COMPONENT_ROUTING_MODEL,state:{request:prompt},questions:{intent:{type:'choice',instructions:'Does the person explicitly request a current-page change, or information? Understand conversational prefixes, polite phrasing and typos. For example, “but aput an extra section below with three buttons” and “could you add a section?” request an edit. “How do I add a section?” asks for information. Quoted, hypothetical, ambiguous or negated requests are not permission to edit. Publishing, sending, permissions and business-record changes are outside page editing.',criteria:{edit:'An explicit request to add, change, remove or move content or design on the current page.',answer:'Information, explanation, ambiguity, quoted or negated changes, or an operation outside page editing.'}}}}),signal:abort.signal,redirect:'error'});
  if(!response.ok||abort.signal.aborted)throw Error('Request routing failed.');
  const body=await response.json() as {answers?:{intent?:{type?:unknown;choice?:unknown;confidence?:unknown;probabilities?:{edit?:unknown;answer?:unknown}}}};
  const decision=body?.answers?.intent,probabilities=decision?.probabilities;
  if(decision?.type!=='choice'||!['edit','answer'].includes(String(decision.choice))||typeof decision.confidence!=='number'||!Number.isFinite(decision.confidence)||decision.confidence<0||decision.confidence>1||typeof probabilities?.edit!=='number'||typeof probabilities.answer!=='number'||!Number.isFinite(probabilities.edit)||!Number.isFinite(probabilities.answer)||probabilities.edit<0||probabilities.edit>1||probabilities.answer<0||probabilities.answer>1||Math.abs(probabilities.edit+probabilities.answer-1)>0.01)throw Error('Invalid request judgment.');
  if(decision.choice==='edit'){if(decision.confidence<0.9||probabilities.edit<0.9)throw Error('Uncertain page edit.');return 'edit';}return 'answer';
 }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}
