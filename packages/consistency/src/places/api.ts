import { failureWords } from '../site-editing';

export interface SitePlace { id: string; label: string; sources?: string[] }

export class SiteApiError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(status: number, code?: string) { super(failureWords(status, code)); this.status = status; this.code = code; }
}

const base = (code: string) => `/api/consistency/sites/${encodeURIComponent(code)}`;

async function answer<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && init.body !== null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...init, headers }).catch(() => null);
  if (!response) throw new SiteApiError(0);
  let body: unknown = null;
  try { body = await response.json(); } catch {}
  if (!response.ok) throw new SiteApiError(response.status, body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error : undefined);
  return body as T;
}

export const siteApiUrl = (code: string, route: string) => `${base(code)}/api/${route.replace(/^\/+/, '')}`;

export function siteApi<T>(code: string, route: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  return answer<T>(siteApiUrl(code, route), json === undefined ? rest : { ...rest, body: JSON.stringify(json) });
}

export async function sitePlaces(code: string): Promise<SitePlace[]> {
  const { places } = await answer<{ places?: unknown }>(`${base(code)}/places`);
  return Array.isArray(places) ? places.filter((place): place is SitePlace => !!place && typeof place.id === 'string' && typeof place.label === 'string')
    .map(place => (Array.isArray(place.sources) ? { ...place, sources: place.sources.filter((name: unknown) => typeof name === 'string') } : { id: place.id, label: place.label })) : [];
}

export interface SiteConnection { id: string; label: string; detail: string; state: 'on' | 'waiting' }
export interface SiteConnections {
  site: { name: string; runtime: string; detail: string };
  groups: { id: 'visitors' | 'features' | 'services' | 'storage'; label: string; nodes: SiteConnection[] }[];
}

export const siteConnections = (code: string) => answer<SiteConnections>(`${base(code)}/connections`);
