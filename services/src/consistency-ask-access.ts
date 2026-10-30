import {FEATURE_FLAGS} from '../../shared/feature-flags';
import {resolveFlag} from '../../shared/feature-flags-runtime/index';
import type {ReportsEnv} from './reports';
export const CONSISTENCY_ASK_FLAG='consistency-ask';
/** Read on every request and again after inference: Off is a hard stop. */
export async function consistencyAskEnabled(env:Pick<ReportsEnv,'LIBRARIES'|'REPORTS_OWNER_ID'>):Promise<boolean> {
 const object=await env.LIBRARIES.get(`feature-flags/${CONSISTENCY_ASK_FLAG}.json`);
 return resolveFlag(FEATURE_FLAGS,CONSISTENCY_ASK_FLAG,object?{[CONSISTENCY_ASK_FLAG]:await object.json()}:{},{accountId:env.REPORTS_OWNER_ID,isOwner:true});
}
