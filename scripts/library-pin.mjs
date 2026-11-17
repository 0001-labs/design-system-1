import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export const LIBRARY_ORIGIN = 'https://designsystem1.com/ds1';
const PUBLIC_ID = /^[0-9a-hjkmnp-tv-z]{20}$/;
const STAMP = /^(?:@charset "[^"]*";\s*)?\/\* Design system 1 library, revision (sha256:[0-9a-f]{12}) \*\//;

const sha256 = (content) => createHash('sha256').update(content).digest('hex');

export const libraryCache = () => process.env.DS1_LIBRARY_CACHE ?? join(homedir(), '.cache', 'design-system-1', 'libraries');

export function libraryPin(options) {
  const { id, version, sha256: hash } = options;
  if (id === undefined && version === undefined) return undefined;
  if (typeof id !== 'string' || !PUBLIC_ID.test(id)) throw new Error(`Name the library by its public ID, as in its address: "id": "${typeof id === 'string' ? id : '…'}" is not one`);
  if (!Number.isSafeInteger(version) || version < 1) throw new Error('Pin a published version by its number: "version": 3. latest.css changes with every publish and cannot be pinned');
  if (hash !== undefined && (typeof hash !== 'string' || !/^[0-9a-f]{64}$/.test(hash))) throw new Error('"sha256" is the version\'s content hash, 64 hex digits');
  return { id, version, sha256: hash, url: `${LIBRARY_ORIGIN}/${id}/v/${version}.css`, file: `${id}/v/${version}.css` };
}

export async function pinnedLibrary(pin, { fetch = globalThis.fetch, cache = libraryCache() } = {}) {
  const cached = join(cache, pin.file);
  let css;
  if (existsSync(cached)) css = readFileSync(cached, 'utf8');
  else {
    const response = await fetch(pin.url, { redirect: 'error' });
    if (!response.ok) throw new Error(`${pin.url} answered ${response.status}: is v${pin.version} of library ${pin.id} published?`);
    if (!/^text\/css\b/.test(response.headers.get('content-type') ?? '')) throw new Error(`${pin.url} is not a stylesheet`);
    css = await response.text();
    const served = response.headers.get('ds1-version');
    if (served && served !== String(pin.version)) throw new Error(`${pin.url} answered with version ${served}`);
    const recorded = response.headers.get('ds1-content-hash');
    if (recorded && recorded !== sha256(css)) throw new Error(`${pin.url} arrived with other bytes than the publish recorded (${recorded})`);
    verify(pin, css);
    mkdirSync(dirname(cached), { recursive: true });
    writeFileSync(cached, css);
  }
  return verify(pin, css);
}

function verify(pin, css) {
  const hash = sha256(css);
  if (pin.sha256 && pin.sha256 !== hash) throw new Error(`v${pin.version} of library ${pin.id} hashes to ${hash}, not the "sha256" sync.json names`);
  const revision = STAMP.exec(css)?.[1];
  if (!revision) throw new Error(`v${pin.version} of library ${pin.id} was published before Design system 1 prepared and stamped libraries. Publish it again and pin the new version`);
  return { css, sha256: hash, revision };
}

export function pinnedFiles(pin, library) {
  const manifest = { source: 'Design system 1', library: pin.id, version: pin.version, url: pin.url, file: pin.file, revision: library.revision, sha256: library.sha256 };
  return {
    [`ds1-library/${pin.file}`]: library.css,
    'ds1-library/library-manifest.json': JSON.stringify(manifest, null, 2) + '\n',
  };
}
