import { ACTIVE_LIBRARY_KEY, BASE_LIBRARY, BASE_LIBRARY_NAME, LIBRARY_STYLES_KEY, activeLibraryHref, readActiveLibrary, writeActiveLibrary, type ActiveLibrary } from '../../../shared/active-library';

export const SHELL_KEY = 'ds1:shell:v1';
export const WORKSPACE_HREF = '/libraries/workspace/';

export type ShellSnapshot = { owner: boolean; company: string; here: { at: string; label: string } | null };
export type ShellBoot = ShellSnapshot & { library: ActiveLibrary | null };
export type Here = { pathname: string; search: string; hash: string; referrer: string; origin: string; navigation: string; session: boolean };
export type Crumb = { label: string; href: string | null };
export type Crumbs = { company: string; space: Crumb; page: string };
export type CrumbInput = { pathname: string; search: string; company: string; library: ActiveLibrary | null; page: string };

export type ShellSpace = 'base' | 'library' | 'list' | 'documentation';

export function shellSpace(pathname: string, search: string): ShellSpace {
  const path = pathname.replace(/\/$/, '');
  const query = new URLSearchParams(search);
  if (path === '/libraries/design-system-1') return 'base';
  if (path === '/libraries/workspace' && query.has('library')) return 'library';
  if ((path === '/libraries/workspace' && !query.has('internal')) || path === '/account') return 'list';
  return 'documentation';
}

export function backLink(space: ShellSpace, active: ActiveLibrary | null): { label: string; href: string } {
  if (space !== 'documentation') return { label: 'Back to documentation', href: '/' };
  return active ? { label: active.name, href: activeLibraryHref(active) } : { label: 'My libraries', href: WORKSPACE_HREF };
}

export function readShellBoot(snapshotJson: string | null, activeJson: string | null): ShellBoot | null {
  const parse = (raw: string | null) => { try { return JSON.parse(raw || 'null'); } catch { return null; } };
  const snapshot = parse(snapshotJson);
  if (!snapshot || typeof snapshot !== 'object') return null;
  const words = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 80) : '';
  const here = snapshot.here && typeof snapshot.here.at === 'string' && words(snapshot.here.label)
    ? { at: snapshot.here.at, label: words(snapshot.here.label) } : null;
  const active = parse(activeJson);
  const id = active && typeof active === 'object' && typeof active.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(active.id) ? active.id : null;
  const library = id === 'base' ? { id, name: 'Design system 1' } : id && words(active.name) ? { id, name: words(active.name) } : null;
  return { owner: snapshot.owner === true, company: words(snapshot.company), here, library };
}

export function frontDoor(boot: ShellBoot | null, here: Here): string | null {
  if (!boot || !boot.library || !here.session || here.pathname !== '/' || here.search || here.hash) return null;
  if (here.navigation === 'reload' || here.navigation === 'back_forward') return null;
  let from = '';
  try { from = here.referrer ? new URL(here.referrer).origin : ''; } catch { from = ''; }
  if (from === here.origin) return null;
  return boot.library.id === 'base' ? '/libraries/design-system-1/' : `/libraries/workspace/?${new URLSearchParams({ library: boot.library.id })}`;
}

export function hereKey(pathname: string, search: string): string | null {
  const path = pathname.replace(/\/$/, '');
  const query = new URLSearchParams(search);
  if (path === '/libraries/design-system-1') return `base:${query.get('view') || query.get('component') || ''}`;
  if (path !== '/libraries/workspace') return null;
  if (query.get('internal')) return `internal:${query.get('internal')}`;
  if (query.get('library')) return `library:${query.get('library')}:${query.get('view') === 'overview' ? 'overview' : query.get('component') || '/2-core/button/'}`;
  return null;
}

export function shellCrumbs({ pathname, search, company, library, page }: CrumbInput): Crumbs {
  const path = pathname.replace(/\/$/, '') || '/';
  const query = new URLSearchParams(search);
  const workspace = company.trim() || 'My company';
  if (path === '/libraries/design-system-1') return { company: workspace, space: { label: 'Design system 1', href: '/libraries/design-system-1/' }, page };
  if (path === '/libraries/workspace' && query.get('library')) {
    const open = library && library.id === query.get('library') ? library : null;
    return { company: workspace, space: open ? { label: open.name, href: `/libraries/workspace/?${new URLSearchParams({ library: open.id })}` } : { label: '', href: null }, page };
  }
  if (path === '/libraries/workspace' && !query.get('internal')) return { company: workspace, space: { label: 'Libraries', href: null }, page: '' };
  if (path === '/account') return { company: workspace, space: { label: 'Account', href: null }, page: '' };
  return { company: workspace, space: { label: 'Documentation', href: '/' }, page };
}

export function drawCrumbs(root: Document, crumbs: Crumbs): void {
  const text = (id: string, words: string) => {
    const element = root.getElementById(id);
    if (element && element.textContent !== words) element.textContent = words;
    return element;
  };
  text('shell-company', crumbs.company);
  const avatar = root.getElementById('shell-avatar');
  avatar?.setAttribute('initial', (Array.from(crumbs.company)[0] || '?').toLocaleUpperCase());
  const space = text('shell-space', crumbs.space.label);
  if (space) {
    if (crumbs.space.href) space.setAttribute('href', crumbs.space.href); else space.removeAttribute('href');
    if (crumbs.space.href || crumbs.page) space.removeAttribute('aria-current'); else space.setAttribute('aria-current', 'page');
    space.parentElement?.toggleAttribute('hidden', !crumbs.space.label);
  }
  text('shell-page', crumbs.page)?.parentElement?.toggleAttribute('hidden', !crumbs.page);
}

export function bootScript(): string {
  return `(function (read, door, space) {
  var root = document.documentElement;
  // The space is the address's alone, signed in or not; the styles draw it only for a signed-in person.
  root.setAttribute('data-shell-space', space(location.pathname, location.search));
  try {
    var boot = read(localStorage.getItem(${JSON.stringify(SHELL_KEY)}), localStorage.getItem(${JSON.stringify(ACTIVE_LIBRARY_KEY)}));
    var session = false;
    for (var index = 0; index < localStorage.length; index++) if ((localStorage.key(index) || '').indexOf('__convexAuthJWT_') === 0) session = true;
    // Presentation only: data-ds-owner waits for the server's answer (the live summary). Without a
    // session token signed out is already certain, so a snapshot left behind never draws.
    root.toggleAttribute('data-signed-in', !!boot && session);
    var entry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var target = door(boot, { pathname: location.pathname, search: location.search, hash: location.hash, referrer: document.referrer, origin: location.origin, navigation: entry ? entry.type : 'navigate', session: session });
    if (target) location.replace(target);
  } catch (error) { /* Storage is optional: the live summary draws the shell. */ }
})(${readShellBoot}, ${frontDoor}, ${shellSpace});`;
}

export function crumbScript(): string {
  return `(function (read, key, crumbs, draw) {
  try {
    var boot = read(localStorage.getItem(${JSON.stringify(SHELL_KEY)}), localStorage.getItem(${JSON.stringify(ACTIVE_LIBRARY_KEY)}));
    if (!boot) return;
    var at = key(location.pathname, location.search);
    var header = document.getElementById('shell-header');
    var page = at === null ? (header && header.dataset.pageTitle) || '' : boot.here && boot.here.at === at ? boot.here.label : '';
    draw(document, crumbs({ pathname: location.pathname, search: location.search, company: boot.company, library: boot.library, page: page }));
  } catch (error) { /* The live summary draws the crumbs. */ }
})(${readShellBoot}, ${hereKey}, ${shellCrumbs}, ${drawCrumbs});`;
}

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;
const safeStorage = (): globalThis.Storage | null => { try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; } };
const safeSession = (): globalThis.Storage | null => { try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; } };

export function readShellSnapshot(storage: Storage | null = safeStorage()): ShellSnapshot | null {
  try { return readShellBoot(storage?.getItem(SHELL_KEY) ?? null, null); } catch { return null; }
}

export function rememberShell(summary: { owner?: unknown; companyName?: unknown }, here?: ShellSnapshot['here'], storage: Storage | null = safeStorage()): void {
  const before = readShellSnapshot(storage);
  const kept = here === undefined ? before?.here ?? null : here;
  const next: ShellSnapshot = {
    owner: summary.owner === true,
    company: typeof summary.companyName === 'string' ? summary.companyName.trim().slice(0, 80) : '',
    here: kept && !kept.at.startsWith('internal:') ? kept : null,
  };
  try { storage?.setItem(SHELL_KEY, JSON.stringify(next)); } catch {}
}

export function forgetShell(storage: Storage | null = safeStorage(), session: Pick<globalThis.Storage, 'removeItem'> | null = safeSession()): void {
  try { storage?.removeItem(SHELL_KEY); } catch {}
  try { session?.removeItem(LIBRARY_STYLES_KEY); } catch {}
  writeActiveLibrary(null, storage);
}

export function readLibraries(value: unknown): ActiveLibrary[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(entry => {
    const { id, name } = (entry ?? {}) as Record<string, unknown>;
    return typeof id === 'string' && id && typeof name === 'string' && name.trim() ? [{ id, name: name.trim() }] : [];
  });
}

export function defaultActiveLibrary(summary: { owner?: unknown; libraries?: unknown }): ActiveLibrary | null {
  if (summary.owner === true) return { id: BASE_LIBRARY, name: BASE_LIBRARY_NAME };
  return readLibraries(summary.libraries)[0] ?? null;
}

export function settleActiveLibrary(summary: { owner?: unknown; libraries?: unknown; librariesLoaded?: unknown }, storage: Storage | null = safeStorage()): void {
  const stored = readActiveLibrary(storage);
  const owner = summary.owner === true;
  if (summary.librariesLoaded !== true) {
    if (!stored && owner) writeActiveLibrary(defaultActiveLibrary(summary), storage);
    return;
  }
  if (stored?.id === BASE_LIBRARY && owner) return;
  const match = stored ? readLibraries(summary.libraries).find(library => library.id === stored.id) : undefined;
  writeActiveLibrary(match ?? defaultActiveLibrary(summary), storage);
}

export function holdsSessionToken(storage: Pick<globalThis.Storage, 'length' | 'key'> | null = safeStorage()): boolean {
  try {
    for (let index = 0; index < (storage?.length ?? 0); index++) if (storage!.key(index)?.startsWith('__convexAuthJWT_')) return true;
  } catch { return false; }
  return false;
}
