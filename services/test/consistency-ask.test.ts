import {afterEach,expect,it,vi} from 'vite-plus/test';
import {consistencyAsk,consistencyAskGateway,type ConsistencyAskEnv} from '../src/consistency-ask';
const origin='https://consistency.site';
function setup(){
 let enabled=true,owner=true;
 const run=vi.fn(async()=>({response:'Flowers and objects.'}));
 const get=vi.fn(async()=>({json:async()=>({enabled,audience:'owner'})}));
 const env={REPORTS_OWNER_ID:crypto.randomUUID(),REPORTS_AUTH_URL:'https://example.convex.cloud',LIBRARIES:{get},AI:{run}} as unknown as ConsistencyAskEnv;
 const send=vi.fn(async()=>Response.json({status:'success',value:{_id:owner?env.REPORTS_OWNER_ID:'other',email:'jaa90@icloud.com',emailVerified:true}}));
 return{env,run,send,get,off(){enabled=false;},revoke(){owner=false;}};
}
const body={prompt:'What is on this page?',catalogue:[{id:'intro',kind:'section',title:'Flowers',detail:'Home'}],page:'Flowers and objects.'};
const request=(value:unknown=body,extra:Record<string,string>={})=>new Request(origin+'/api/consistency/ask',{method:'POST',headers:{origin,'content-type':'application/json',cookie:'__Host-ds1-dashboard=valid-token',...extra},body:JSON.stringify(value)});
afterEach(()=>vi.useRealTimers());
it('answers from context, rechecks access, and keeps inference failures private',async()=>{
 const x=setup(),response=await consistencyAsk(request(),x.env,x.send);
 expect(await response.json()).toEqual({answer:'Flowers and objects.'});expect(x.send).toHaveBeenCalledTimes(2);expect(x.get).toHaveBeenCalledTimes(2);
 const prompt=x.run.mock.calls[0] as unknown as [string,{messages:{content:string}[]}];expect(JSON.parse(prompt[1].messages[1]!.content)).toEqual({question:body.prompt,catalogue:body.catalogue,page:body.page});
 expect(response.headers.get('cache-control')).toBe('private, no-store');x.run.mockRejectedValueOnce(Error('private provider detail'));expect(await(await consistencyAsk(request(),x.env,x.send)).text()).not.toContain('private provider');
});
it('enforces owner, origin, host, flag and bounded context before inference',async()=>{
 const x=setup();x.revoke();expect((await consistencyAsk(request(),x.env,x.send)).status).toBe(403);expect(x.run).not.toHaveBeenCalled();
 const y=setup();y.off();expect((await consistencyAsk(request(),y.env,y.send)).status).toBe(403);expect(y.run).not.toHaveBeenCalled();
 const z=setup();for(const [req,status]of [[request(body,{cookie:''}),401],[request(body,{origin:'https://other.example'}),403],[new Request('https://example.com/api/consistency/ask',request()),404],[request({...body,catalogue:[{id:'no'}]}),400],[request({...body,page:'x'.repeat(33000)}),413],[request({...body,page:{}}),400]] as const)expect((await consistencyAsk(req,z.env,z.send)).status).toBe(status);expect(z.run).not.toHaveBeenCalled();
});
it('withholds answers after permission revocation, flag off or cancellation',async()=>{
 for(const change of ['owner','flag','cancel']){const x=setup(),abort=new AbortController();x.run.mockImplementation(async()=>{if(change==='owner')x.revoke();if(change==='flag')x.off();if(change==='cancel')abort.abort();return{response:'Hidden answer'};});const response=await consistencyAsk(new Request(request(),{signal:abort.signal}),x.env,x.send);expect(response.status).toBe(change==='cancel'?408:403);expect(await response.text()).not.toContain('Hidden answer');}
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
