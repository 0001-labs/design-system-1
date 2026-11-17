export interface PlanLimits { sites: number | null; customDomains: boolean }
export interface WorkspaceSummary {
  code: string;
  name: string;
  plan: string;
  role: 'owner' | 'admin' | 'editor';
  sites: number;
  siteCodes: string[];
  limits: PlanLimits;
}

const CODE = /^\d{2}[A-Za-z]{4}$/;
const ACTIVE_KEY = 'consistency-active-workspace';
const LIST_KEY = 'consistency-workspaces';

let active = (() => { try { const code = localStorage.getItem(ACTIVE_KEY) ?? ''; return CODE.test(code) ? code : ''; } catch { return ''; } })();

export const activeWorkspace = () => active;
export function setActiveWorkspace(code: string) {
  active = CODE.test(code) ? code : '';
  try { localStorage.setItem(ACTIVE_KEY, active); } catch {}
}
export const workspaceHeaders = (): Record<string, string> => (active ? { 'X-C9y-Workspace': active } : {});

const isSummary = (value: unknown): value is WorkspaceSummary => {
  const each = value as Partial<WorkspaceSummary> | null;
  return !!each && typeof each.code === 'string' && CODE.test(each.code) && typeof each.name === 'string' && Array.isArray(each.siteCodes) && !!each.limits;
};
export function storedWorkspaces(): WorkspaceSummary[] {
  try { const value = JSON.parse(localStorage.getItem(LIST_KEY) ?? '[]') as unknown; return Array.isArray(value) ? value.filter(isSummary) : []; } catch { return []; }
}
export function storeWorkspaces(list: WorkspaceSummary[]) { try { localStorage.setItem(LIST_KEY, JSON.stringify(list)); } catch {} }

export type ReadFailure = 'signed-out' | 'unavailable';
export type WorkspacesRead = { owner: boolean; workspaces: WorkspaceSummary[] } | { failed: ReadFailure };
export const readFailure = (response: Response | null): ReadFailure => response?.status === 401 || response?.status === 403 ? 'signed-out' : 'unavailable';

export async function readWorkspaces(): Promise<WorkspacesRead> {
  const response = await fetch('/api/consistency/workspaces', { cache: 'no-store' }).catch(() => null);
  const body = response?.ok ? await response.json().catch(() => null) as { owner?: unknown; workspaces?: unknown } | null : null;
  if (!Array.isArray(body?.workspaces)) return { failed: readFailure(response) };
  return { owner: body.owner === true, workspaces: body.workspaces.filter(isSummary) };
}

export const canManage = (workspace: WorkspaceSummary | undefined) => workspace?.role === 'owner' || workspace?.role === 'admin';

export function draftWords(workspace: WorkspaceSummary | undefined): string {
  const limit = workspace?.limits.sites;
  if (!workspace || limit === null || limit === undefined) return '';
  return `${workspace.sites} of ${limit} draft ${limit === 1 ? 'site' : 'sites'}`;
}
