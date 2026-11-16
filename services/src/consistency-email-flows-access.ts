import type {ReportsEnv} from './reports';
import {consistencyOwnerFlag} from './consistency-owner-flag';
export const CONSISTENCY_EMAIL_FLOWS_FLAG='consistency-email-flows';
/** Read on every flows request, for the owner: Off is a hard stop, and a missing store reads as Off. */
export const consistencyEmailFlowsEnabled=(env:Partial<Pick<ReportsEnv,'LIBRARIES'|'REPORTS_OWNER_ID'>>)=>consistencyOwnerFlag(env,CONSISTENCY_EMAIL_FLOWS_FLAG);
