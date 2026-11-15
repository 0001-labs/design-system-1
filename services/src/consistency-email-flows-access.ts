import {FEATURE_FLAGS} from '../../shared/feature-flags';
import {resolveFlag} from '../../shared/feature-flags-runtime/index';
import type {ReportsEnv} from './reports';
export const CONSISTENCY_EMAIL_FLOWS_FLAG='consistency-email-flows';
/** Read on every flows request, for the owner: Off is a hard stop, and a missing store reads as Off. */
export async function consistencyEmailFlowsEnabled(env:Partial<Pick<ReportsEnv,'LIBRARIES'|'REPORTS_OWNER_ID'>>):Promise<boolean> {
 if(!env.LIBRARIES)return false;
 const object=await env.LIBRARIES.get(`feature-flags/${CONSISTENCY_EMAIL_FLOWS_FLAG}.json`);
 return resolveFlag(FEATURE_FLAGS,CONSISTENCY_EMAIL_FLOWS_FLAG,object?{[CONSISTENCY_EMAIL_FLOWS_FLAG]:await object.json()}:{},{accountId:env.REPORTS_OWNER_ID,isOwner:true});
}
