import {FEATURE_FLAGS} from '../../shared/feature-flags';
import {resolveFlag} from '../../shared/feature-flags-runtime/index';
import type {ReportsEnv} from './reports';
/** A flag of Consistency's read for the owner on every request: Off is a hard stop, and a missing store reads as Off. */
export async function consistencyOwnerFlag(env:Partial<Pick<ReportsEnv,'LIBRARIES'|'REPORTS_OWNER_ID'>>,flag:string):Promise<boolean> {
 if(!env.LIBRARIES)return false;
 const object=await env.LIBRARIES.get(`feature-flags/${flag}.json`);
 return resolveFlag(FEATURE_FLAGS,flag,object?{[flag]:await object.json()}:{},{accountId:env.REPORTS_OWNER_ID,isOwner:true});
}
/** A site's meetings (Site settings, and the platform's `meetings` routes): the owner's alone while new. */
export const CONSISTENCY_MEETINGS_FLAG='consistency-meetings';
