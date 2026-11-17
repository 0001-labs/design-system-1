// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, test } from 'vite-plus/test';
import { ACTIVE_LIBRARY_KEY, LIBRARY_STYLES_KEY, activeLibraryHref, parseActiveLibrary, readActiveLibrary } from '../shared/active-library';
import { defaultLibraryComponent } from '../shared/library-navigation';
import {
  backLink, bootScript, crumbScript, defaultActiveLibrary, shellSpace, drawCrumbs, forgetShell, frontDoor, hereKey, holdsSessionToken,
  readShellBoot, readShellSnapshot, rememberShell, settleActiveLibrary, shellCrumbs, SHELL_KEY, type Here,
} from '../website/src/lib/shell';

const header = readFileSync('website/src/components/MyHeader.astro', 'utf8');
const barEnd = header.indexOf('</a>', header.indexOf('id="shell-account"')) + '</a>'.length;
const markup = header.slice(header.indexOf('<a slot="brand"'), barEnd).replace(/\{[^{}]*\}/g, match => match === '{WORKSPACE_HREF}' ? '"/libraries/workspace/"' : '""');

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.body.replaceChildren();
  for (const name of ['data-signed-in', 'data-ds-owner', 'data-shell-space']) document.documentElement.removeAttribute(name);
});

const arrive: Here = { pathname: '/', search: '', hash: '', referrer: '', origin: 'https://designsystem1.com', navigation: 'navigate', session: true };
const boot = (active: unknown, owner = false) => readShellBoot(JSON.stringify({ owner, company: 'Studio', here: null }), JSON.stringify(active));

test('the boot reads the active design system exactly as the shared contract does', () => {
  const values = [null, 'x', {}, { id: 'base' }, { id: 'base', name: 'Anything' }, { id: 'lib_1', name: '  Studio  ' }, { id: 'lib 1', name: 'Bad' },
    { id: 'lib1', name: ' ' }, { id: 'lib1', name: 'x'.repeat(120) }, { id: 'a'.repeat(65), name: 'Long' }, { id: 7, name: 'Number' }];
  for (const value of values) expect(boot(value)?.library, JSON.stringify(value)).toEqual(parseActiveLibrary(value));
  expect(readShellBoot(null, JSON.stringify({ id: 'base' }))).toBeNull();
  expect(readShellBoot('not json', null)).toBeNull();
  expect(readShellBoot(JSON.stringify({ owner: true, company: ' Acme ', here: { at: 'base:', label: 'Button' } }), null))
    .toEqual({ owner: true, company: 'Acme', here: { at: 'base:', label: 'Button' }, library: null });
});

test('a signed-in arrival at the front page lands in the active design system', () => {
  for (const active of [{ id: 'base', name: 'Design system 1' }, { id: 'lib1', name: 'Studio' }]) {
    expect(frontDoor(boot(active), arrive)).toBe(activeLibraryHref(active));
    expect(frontDoor(boot(active), { ...arrive, referrer: 'https://www.example.com/search?q=ds1' })).toBe(activeLibraryHref(active));
  }
});

test('inside the site, on a reload or back, signed out or with no design system, the front page is the documentation', () => {
  const active = { id: 'lib1', name: 'Studio' };
  expect(frontDoor(boot(active), { ...arrive, referrer: 'https://designsystem1.com/2-core/button/' })).toBeNull();
  expect(frontDoor(boot(active), { ...arrive, navigation: 'reload' })).toBeNull();
  expect(frontDoor(boot(active), { ...arrive, navigation: 'back_forward' })).toBeNull();
  expect(frontDoor(boot(active), { ...arrive, pathname: '/2-core/button/' })).toBeNull();
  expect(frontDoor(null, arrive)).toBeNull();
  expect(frontDoor(boot(null), arrive)).toBeNull();
});

test('an expired session, or an address with a query or a fragment, is never sent on', () => {
  const active = { id: 'lib1', name: 'Studio' };
  expect(frontDoor(boot(active), { ...arrive, session: false })).toBeNull();
  expect(frontDoor(boot(active), { ...arrive, search: '?ref=mail' })).toBeNull();
  expect(frontDoor(boot(active), { ...arrive, hash: '#install' })).toBeNull();
});

test('every address belongs to one space, and the way back leads to the other', () => {
  expect(shellSpace('/libraries/design-system-1/', '?view=tokens')).toBe('base');
  expect(shellSpace('/libraries/workspace/', '?library=lib1&component=%2F2-core%2Fbutton%2F')).toBe('library');
  expect(shellSpace('/libraries/workspace/', '')).toBe('list');
  expect(shellSpace('/account/', '')).toBe('list');
  expect(shellSpace('/libraries/workspace/', '?internal=indexeddb')).toBe('documentation');
  expect(shellSpace('/', '')).toBe('documentation');
  expect(shellSpace('/2-core/button/', '')).toBe('documentation');
  expect(shellSpace('/libraries/playground/', '')).toBe('documentation');
  for (const space of ['base', 'library', 'list'] as const) expect(backLink(space, { id: 'lib1', name: 'Acme' })).toEqual({ label: 'Back to documentation', href: '/' });
  expect(backLink('documentation', { id: 'base', name: 'Design system 1' })).toEqual({ label: 'Design system 1', href: '/libraries/design-system-1/' });
  expect(backLink('documentation', { id: 'lib1', name: 'Acme' })).toEqual({ label: 'Acme', href: '/libraries/workspace/?library=lib1' });
  expect(backLink('documentation', null)).toEqual({ label: 'My libraries', href: '/libraries/workspace/' });
});

test('the inline head script is the same decision, and sets the signed-in state before paint', () => {
  const run = (snapshot: unknown, active: unknown, { referrer = '', token = true, pathname = '/', search = '', hash = '' } = {}) => {
    for (const name of ['data-signed-in', 'data-ds-owner', 'data-shell-space']) document.documentElement.removeAttribute(name);
    localStorage.clear();
    if (snapshot) localStorage.setItem(SHELL_KEY, JSON.stringify(snapshot));
    if (active) localStorage.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify(active));
    if (token) localStorage.setItem('__convexAuthJWT_abc', 'token');
    let replaced: string | null = null;
    const location = { pathname, search, hash, origin: 'https://designsystem1.com', replace: (href: string) => { replaced = href; } };
    const perf = { getEntriesByType: () => [{ type: 'navigate' }] };
    new Function('location', 'performance', 'document', 'localStorage', bootScript())(location, perf, { documentElement: document.documentElement, referrer }, localStorage);
    const root = document.documentElement;
    return { replaced, signedIn: root.hasAttribute('data-signed-in'), owner: root.hasAttribute('data-ds-owner'), space: root.getAttribute('data-shell-space') };
  };
  const signedIn = { owner: true, company: 'Studio', here: null };
  expect(run(signedIn, { id: 'base' })).toEqual({ replaced: '/libraries/design-system-1/', signedIn: true, owner: false, space: 'documentation' });
  expect(run({ ...signedIn, owner: false }, { id: 'lib1', name: 'Shop' })).toEqual({ replaced: '/libraries/workspace/?library=lib1', signedIn: true, owner: false, space: 'documentation' });
  expect(run(signedIn, { id: 'base' }, { referrer: 'https://designsystem1.com/colours/' }).replaced).toBeNull();
  expect(run(signedIn, { id: 'base' }, { token: false })).toEqual({ replaced: null, signedIn: false, owner: false, space: 'documentation' });
  expect(run(signedIn, { id: 'base' }, { search: '?q=1' }).replaced).toBeNull();
  expect(run(signedIn, { id: 'base' }, { hash: '#top' }).replaced).toBeNull();
  expect(run(null, { id: 'base' })).toEqual({ replaced: null, signedIn: false, owner: false, space: 'documentation' });
  for (const [pathname, search] of [['/libraries/design-system-1/', ''], ['/libraries/workspace/', '?library=lib1'], ['/libraries/workspace/', ''], ['/account/', ''], ['/libraries/workspace/', '?internal=indexeddb']]) {
    expect(run(null, null, { pathname, search }).space).toBe(shellSpace(pathname, search));
    expect(run(signedIn, null, { pathname, search }).space).toBe(shellSpace(pathname, search));
  }
});

test('the breadcrumb: workspace, then the design system or Documentation, then the page', () => {
  const base = { pathname: '/libraries/design-system-1/', search: '', company: 'Studio', library: null, page: 'Button' };
  expect(shellCrumbs(base)).toEqual({ company: 'Studio', space: { label: 'Design system 1', href: '/libraries/design-system-1/' }, page: 'Button' });
  const shop = { id: 'lib1', name: 'Shop' };
  expect(shellCrumbs({ ...base, pathname: '/libraries/workspace/', search: '?library=lib1&view=overview', library: shop, page: 'Overview' }))
    .toEqual({ company: 'Studio', space: { label: 'Shop', href: activeLibraryHref(shop) }, page: 'Overview' });
  expect(shellCrumbs({ ...base, pathname: '/libraries/workspace/', search: '?library=lib2', library: shop }).space).toEqual({ label: '', href: null });
  expect(shellCrumbs({ ...base, pathname: '/libraries/workspace/', page: 'Ignored' })).toEqual({ company: 'Studio', space: { label: 'Libraries', href: null }, page: '' });
  expect(shellCrumbs({ ...base, pathname: '/account/' }).space).toEqual({ label: 'Account', href: null });
  expect(shellCrumbs({ ...base, pathname: '/2-core/button/', company: ' ', page: 'Button' })).toEqual({ company: 'My company', space: { label: 'Documentation', href: '/' }, page: 'Button' });
  expect(shellCrumbs({ ...base, pathname: '/libraries/workspace/', search: '?internal=indexeddb', page: 'IndexedDB' }).space.label).toBe('Documentation');
});

test('a crumb only the frame knows is remembered under the address that shows it', () => {
  expect(hereKey('/libraries/design-system-1/', '')).toBe('base:');
  expect(hereKey('/libraries/design-system-1/', '?view=tokens')).toBe('base:tokens');
  expect(hereKey('/libraries/design-system-1/', '?component=input')).toBe('base:input');
  expect(hereKey('/libraries/workspace/', '?library=a')).toBe(hereKey('/libraries/workspace/', `?library=a&component=${encodeURIComponent(defaultLibraryComponent)}`));
  expect(hereKey('/libraries/workspace/', '?library=a&view=overview')).toBe('library:a:overview');
  expect(hereKey('/libraries/workspace/', '?internal=indexeddb')).toBe('internal:indexeddb');
  expect(hereKey('/libraries/workspace/', '')).toBeNull();
  expect(hereKey('/2-core/button/', '')).toBeNull();
});

test('the header draws the crumbs: links where they lead somewhere, the page current, empty crumbs gone', () => {
  document.body.innerHTML = markup;
  drawCrumbs(document, { company: 'Studio', space: { label: 'Documentation', href: '/' }, page: 'Button' });
  const space = document.getElementById('shell-space')!;
  expect(document.getElementById('shell-company')!.textContent).toBe('Studio');
  expect(document.getElementById('shell-avatar')!.getAttribute('initial')).toBe('S');
  expect(space.getAttribute('href')).toBe('/');
  expect(space.hasAttribute('aria-current')).toBe(false);
  expect(document.getElementById('shell-page')!.getAttribute('aria-current')).toBe('page');
  expect(document.getElementById('shell-page')!.parentElement!.hidden).toBe(false);
  drawCrumbs(document, { company: 'Studio', space: { label: 'Libraries', href: null }, page: '' });
  expect(space.hasAttribute('href')).toBe(false);
  expect(space.getAttribute('aria-current')).toBe('page');
  expect(document.getElementById('shell-page')!.parentElement!.hidden).toBe(true);
  expect(document.getElementById('shell-account')!.getAttribute('aria-label')).toBe('Account');
});

test('the inline header script fills the crumbs from the snapshot before first paint', () => {
  document.body.innerHTML = markup;
  document.getElementById('shell-header')!.dataset.pageTitle = 'Colours';
  localStorage.setItem(SHELL_KEY, JSON.stringify({ owner: false, company: 'Studio', here: { at: 'library:lib1:/2-core/input/', label: 'Input' } }));
  localStorage.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify({ id: 'lib1', name: 'Shop' }));
  const run = (pathname: string, search: string) => new Function('location', crumbScript())({ pathname, search });
  run('/colours/', '');
  expect([...document.querySelectorAll('.shell-words')].map(words => words.textContent)).toEqual(['Studio', 'Documentation', 'Colours']);
  run('/libraries/workspace/', '?library=lib1&component=%2F2-core%2Finput%2F');
  expect([...document.querySelectorAll('.shell-words')].map(words => words.textContent)).toEqual(['Studio', 'Shop', 'Input']);
  expect(document.getElementById('shell-space')!.getAttribute('href')).toBe('/libraries/workspace/?library=lib1');
});

test('the snapshot follows the summary: kept signed in, forgotten with the active design system when signed out', () => {
  rememberShell({ owner: true, companyName: '  Acme  ' });
  expect(readShellSnapshot()).toEqual({ owner: true, company: 'Acme', here: null, library: null });
  rememberShell({ owner: true, companyName: 'Acme' }, { at: 'base:', label: 'Button' });
  rememberShell({ owner: true, companyName: 'Acme 2' });
  expect(readShellSnapshot()?.here).toEqual({ at: 'base:', label: 'Button' });
  rememberShell({ owner: true, companyName: 'Acme' }, { at: 'internal:indexeddb', label: 'IndexedDB' });
  expect(readShellSnapshot()?.here).toBeNull();
  localStorage.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify({ id: 'base' }));
  sessionStorage.setItem(LIBRARY_STYLES_KEY, JSON.stringify({ id: 'lib1', name: 'Acme', css: ':root{}' }));
  forgetShell();
  expect(readShellSnapshot()).toBeNull();
  expect(readActiveLibrary()).toBeNull();
  expect(sessionStorage.getItem(LIBRARY_STYLES_KEY)).toBeNull();
});

test('signed in with none stored: the owner starts in the base, anyone else in their latest library', () => {
  expect(defaultActiveLibrary({ owner: true, libraries: [{ id: 'a', name: 'A' }] })).toEqual({ id: 'base', name: 'Design system 1' });
  expect(defaultActiveLibrary({ owner: false, libraries: [{ id: '', name: 'Bad' }, { id: 'b', name: 'Latest' }, { id: 'c', name: 'Older' }] })).toEqual({ id: 'b', name: 'Latest' });
  expect(defaultActiveLibrary({ owner: false, libraries: [] })).toBeNull();
  settleActiveLibrary({ owner: false, libraries: [{ id: 'b', name: 'Latest' }], librariesLoaded: false });
  expect(readActiveLibrary()).toBeNull();
  settleActiveLibrary({ owner: true, libraries: [], librariesLoaded: false });
  expect(readActiveLibrary()).toEqual({ id: 'base', name: 'Design system 1' });
  localStorage.clear();
  settleActiveLibrary({ owner: false, libraries: [{ id: 'b', name: 'Latest' }], librariesLoaded: true });
  expect(readActiveLibrary()).toEqual({ id: 'b', name: 'Latest' });
});

test('the stored design system stays true to the account once its libraries have loaded', () => {
  const store = (value: unknown) => localStorage.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify(value));
  const mine = { owner: false, librariesLoaded: true, libraries: [{ id: 'b', name: 'Latest' }, { id: 'c', name: 'Older' }] };
  store({ id: 'c', name: 'Older' });
  settleActiveLibrary(mine);
  expect(readActiveLibrary()).toEqual({ id: 'c', name: 'Older' });
  settleActiveLibrary({ ...mine, libraries: [{ id: 'b', name: 'Latest' }, { id: 'c', name: 'Older, renamed' }] });
  expect(readActiveLibrary()).toEqual({ id: 'c', name: 'Older, renamed' });
  store({ id: 'someone-else', name: 'Theirs' });
  settleActiveLibrary(mine);
  expect(readActiveLibrary()).toEqual({ id: 'b', name: 'Latest' });
  store({ id: 'gone', name: 'Gone' });
  settleActiveLibrary({ ...mine, libraries: [] });
  expect(readActiveLibrary()).toBeNull();
  store({ id: 'base' });
  settleActiveLibrary(mine);
  expect(readActiveLibrary()).toEqual({ id: 'b', name: 'Latest' });
  store({ id: 'base' });
  settleActiveLibrary({ ...mine, owner: true });
  expect(readActiveLibrary()).toEqual({ id: 'base', name: 'Design system 1' });
  store({ id: 'gone', name: 'Gone' });
  settleActiveLibrary({ ...mine, owner: true });
  expect(readActiveLibrary()).toEqual({ id: 'base', name: 'Design system 1' });
  store({ id: 'someone-else', name: 'Theirs' });
  settleActiveLibrary({ ...mine, librariesLoaded: false, libraries: [] });
  expect(readActiveLibrary()).toEqual({ id: 'someone-else', name: 'Theirs' });
});

test('signed out is confirmed only once the browser holds no session token', () => {
  expect(holdsSessionToken()).toBe(false);
  localStorage.setItem('__convexAuthJWT_abc', 'token');
  expect(holdsSessionToken()).toBe(true);
});

test('the boot script runs first in the head, the crumb script right after the bar', () => {
  const head = readFileSync('website/src/components/MyHead.astro', 'utf8');
  expect(head.indexOf('set:html={bootScript()}')).toBeGreaterThan(-1);
  expect(head.indexOf('set:html={bootScript()}')).toBeLessThan(head.indexOf('<Default>'));
  expect(header.indexOf('set:html={crumbScript()}')).toBeGreaterThan(barEnd);
  expect(header.indexOf('set:html={crumbScript()}')).toBeLessThan(header.indexOf('<script>'));
});
