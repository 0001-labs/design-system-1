import {afterEach,expect,it,vi} from 'vite-plus/test';
import {consistencyAsk,consistencyAskGateway,type ConsistencyAskEnv} from '../src/consistency-ask';
const origin='https://consistency.site';
function setup(){
 let owner=true;
 const run=vi.fn(async()=>({response:'Flowers and objects.'}));
 const env={REPORTS_OWNER_ID:crypto.randomUUID(),REPORTS_AUTH_URL:'https://example.convex.cloud',AI:{run}} as unknown as ConsistencyAskEnv;
 const send=vi.fn(async()=>Response.json({status:'success',value:{_id:owner?env.REPORTS_OWNER_ID:'other',email:'jaa90@icloud.com',emailVerified:true}}));
 return{env,run,send,revoke(){owner=false;}};
}
const body={prompt:'What is on this page?',catalogue:[{id:'intro',kind:'section',title:'Flowers',detail:'Home'}],page:'Flowers and objects.'};
const request=(value:unknown=body,extra:Record<string,string>={})=>new Request(origin+'/api/consistency/ask',{method:'POST',headers:{origin,'content-type':'application/json',cookie:'__Host-ds1-dashboard=valid-token',...extra},body:JSON.stringify(value)});
afterEach(()=>vi.useRealTimers());
it('answers from context, rechecks access, and keeps inference failures private',async()=>{
 const x=setup(),response=await consistencyAsk(request(),x.env,x.send);
 expect(await response.json()).toEqual({answer:'Flowers and objects.'});expect(x.send).toHaveBeenCalledTimes(2);
 const prompt=x.run.mock.calls[0] as unknown as [string,{messages:{content:string}[]}];expect(JSON.parse(prompt[1].messages[1]!.content)).toEqual({question:body.prompt,catalogue:body.catalogue,page:body.page});
 expect(response.headers.get('cache-control')).toBe('private, no-store');x.run.mockRejectedValueOnce(Error('private provider detail'));expect(await(await consistencyAsk(request(),x.env,x.send)).text()).not.toContain('private provider');
});
it('enforces owner, origin, host and bounded context before inference',async()=>{
 const x=setup();x.revoke();expect((await consistencyAsk(request(),x.env,x.send)).status).toBe(403);expect(x.run).not.toHaveBeenCalled();
 const z=setup();for(const [req,status]of [[request(body,{cookie:''}),401],[request(body,{origin:'https://other.example'}),403],[new Request('https://example.com/api/consistency/ask',request()),404],[request({...body,catalogue:[{id:'no'}]}),400],[request({...body,page:'x'.repeat(33000)}),413],[request({...body,page:{}}),400]] as const)expect((await consistencyAsk(req,z.env,z.send)).status).toBe(status);expect(z.run).not.toHaveBeenCalled();
});
it('withholds answers after permission revocation or cancellation',async()=>{
 for(const change of ['owner','cancel']){const x=setup(),abort=new AbortController();x.run.mockImplementation(async()=>{if(change==='owner')x.revoke();if(change==='cancel')abort.abort();return{response:'Hidden answer'};});const response=await consistencyAsk(new Request(request(),{signal:abort.signal}),x.env,x.send);expect(response.status).toBe(change==='cancel'?408:403);expect(await response.text()).not.toContain('Hidden answer');}
});
it('bounds hung inference and rate limits repeated questions',async()=>{
 const x=setup();x.run.mockImplementation(()=>new Promise(()=>{}));vi.useFakeTimers();const pending=consistencyAsk(request(),x.env,x.send);await vi.advanceTimersByTimeAsync(30001);expect((await pending).status).toBe(502);vi.useRealTimers();
 const y=setup();for(let i=0;i<12;i++)expect((await consistencyAsk(request(),y.env,y.send)).status).toBe(200);expect((await consistencyAsk(request(),y.env,y.send)).status).toBe(429);
});
it('gateway checks membership and scopes site context before inference',async()=>{
 const x=setup();const fetcher=vi.fn(async(request:Request)=>{const path=new URL(request.url).pathname;return Response.json(path.endsWith('/workspaces')?{workspaces:[{code:'01STDO'}]}:path.endsWith('/sites')?{sites:[{code:'10VNDG',name:'Flowers',url:'https://flowers.example'}]}:{document:{title:'Flowers',blocks:[{source:'Current catalogue.'}]}});});
 x.env.CONSISTENCY_WORKSPACE={fetch:fetcher} as unknown as Fetcher;
 const ask=(site='10VNDG',actor='owner')=>new Request(origin+'/api/consistency/workspaces/01STDO/ask',{method:'POST',headers:{'X-C9y-Actor':actor},body:JSON.stringify({prompt:'What is here?',site,path:'/'})});
 expect((await consistencyAskGateway(ask('10VNDG','other'),x.env)).status).toBe(403);expect(fetcher).not.toHaveBeenCalled();expect((await consistencyAskGateway(ask('99AAAA'),x.env)).status).toBe(403);expect(x.run).not.toHaveBeenCalled();
 expect((await consistencyAskGateway(ask(),x.env)).status).toBe(200);const sent=JSON.parse((x.run.mock.calls[0] as unknown as [string,{messages:{content:string}[]}])[1].messages[1]!.content);expect(sent.page).toContain('Current catalogue.');expect(sent.catalogue).toHaveLength(1);
 fetcher.mockResolvedValueOnce(Response.json({workspaces:[]}));expect((await consistencyAskGateway(ask(),x.env)).status).toBe(403);
});

it('uses typed intent for conversational and misspelled page requests without generating an answer',async()=>{
 for(const prompt of ['but aput an extra section below with three buttons','Could you add a section?']){
  const x=setup();x.env.SYSTEM_AI_TOKEN='fixture-key';
  const typed=vi.fn(async()=>Response.json({answers:{intent:{type:'choice',choice:'edit',confidence:0.99,probabilities:{edit:0.99,answer:0.01}}}}));
  const send:typeof fetch=vi.fn(async(url)=>String(url).startsWith('https://system.0001.dev/api/ai/typesafe/')?typed():x.send());
  const response=await consistencyAsk(request({...body,prompt,allowPageEdits:true}),x.env,send);expect(await response.json()).toEqual({intent:'edit'});expect(x.run).not.toHaveBeenCalled();expect(typed).toHaveBeenCalledOnce();
 }
});
it('answers informational requests and refuses uncertain or unavailable edit decisions',async()=>{
 const x=setup();x.env.SYSTEM_AI_TOKEN='fixture-key';let choice='answer',confidence=1;
 const send:typeof fetch=vi.fn(async(url)=>String(url).startsWith('https://system.0001.dev/api/ai/typesafe/')?Response.json({answers:{intent:{type:'choice',choice,confidence,probabilities:{edit:choice==='edit'?confidence:0,answer:choice==='edit'?1-confidence:1}}}}):x.send());
 const req=()=>request({...body,prompt:'How do I add a section?',allowPageEdits:true});
 expect(await(await consistencyAsk(req(),x.env,send)).json()).toEqual({answer:'Flowers and objects.'});expect(x.run).toHaveBeenCalledOnce();
 choice='edit';confidence=0.6;expect((await consistencyAsk(req(),x.env,send)).status).toBe(502);expect(x.run).toHaveBeenCalledOnce();
 delete x.env.SYSTEM_AI_TOKEN;expect((await consistencyAsk(req(),x.env,send)).status).toBe(502);
});
it('does not return edit intent after owner access is revoked during judgment',async()=>{
 const x=setup();x.env.SYSTEM_AI_TOKEN='fixture-key';
 const send:typeof fetch=vi.fn(async(url)=>{if(String(url).startsWith('https://system.0001.dev/api/ai/typesafe/')){x.revoke();return Response.json({answers:{intent:{type:'choice',choice:'edit',confidence:1,probabilities:{edit:1,answer:0}}}});}return x.send();});
 expect((await consistencyAsk(request({...body,allowPageEdits:true}),x.env,send)).status).toBe(403);expect(x.run).not.toHaveBeenCalled();
});
