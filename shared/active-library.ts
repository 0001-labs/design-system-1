/**
 * The design system a signed-in person is working in: the one they last opened in the workspace.
 * The header names it, the sidebar leads back to it, and the documentation's examples are drawn
 * with it. It is a presentation choice kept in this browser; it grants no access, and every
 * private read still authorizes on the server. Signed out, there is none.
 */
export const ACTIVE_LIBRARY_KEY = 'ds1:active-library:v1';
export const ACTIVE_LIBRARY_EVENT = 'ds1-active-library';
/** The active library's draft stylesheet, kept per tab (sessionStorage) for the documentation's examples; forgotten on signing out. */
export const LIBRARY_STYLES_KEY = 'ds1:active-library-styles:v1';
/** Design system 1 itself, the base system, which only its owner opens. */
export const BASE_LIBRARY = 'base';
export const BASE_LIBRARY_NAME = 'Design system 1';

export type ActiveLibrary = { id: string; name: string };

const ID = /^[a-zA-Z0-9_-]{1,64}$/;

/** A stored or reported value, or null when it is not an active library. */
export function parseActiveLibrary(value: unknown): ActiveLibrary | null {
  if (!value || typeof value !== 'object') return null;
  const { id, name } = value as Record<string, unknown>;
  if (typeof id !== 'string' || !ID.test(id)) return null;
  if (id === BASE_LIBRARY) return { id, name: BASE_LIBRARY_NAME };
  if (typeof name !== 'string' || !name.trim()) return null;
  return { id, name: name.trim().slice(0, 80) };
}

export function readActiveLibrary(storage: Pick<Storage, 'getItem'> | null = safeStorage()): ActiveLibrary | null {
  try { return parseActiveLibrary(JSON.parse(storage?.getItem(ACTIVE_LIBRARY_KEY) ?? 'null')); } catch { return null; }
}

/** Keeps the choice (null takes it away) and tells this document; other tabs hear `storage`. */
export function writeActiveLibrary(value: ActiveLibrary | null, storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = safeStorage()): void {
  const next = parseActiveLibrary(value);
  const before = readActiveLibrary(storage);
  if (before?.id === next?.id && before?.name === next?.name) return;
  try {
    if (next) storage?.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify(next));
    else storage?.removeItem(ACTIVE_LIBRARY_KEY);
  } catch { /* Storage is optional: the choice then lasts for this document. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(ACTIVE_LIBRARY_EVENT, { detail: { library: next } }));
}

/** Where the active design system opens in the documentation's shell. */
export function activeLibraryHref(library: ActiveLibrary): string {
  return library.id === BASE_LIBRARY ? '/libraries/design-system-1/' : `/libraries/workspace/?${new URLSearchParams({ library: library.id })}`;
}

function safeStorage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}
