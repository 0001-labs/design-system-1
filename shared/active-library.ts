export const ACTIVE_LIBRARY_KEY = 'ds1:active-library:v1';
export const ACTIVE_LIBRARY_EVENT = 'ds1-active-library';
export const LIBRARY_STYLES_KEY = 'ds1:active-library-styles:v1';
export const BASE_LIBRARY = 'base';
export const BASE_LIBRARY_NAME = 'Design system 1';

export type ActiveLibrary = { id: string; name: string };

const ID = /^[a-zA-Z0-9_-]{1,64}$/;

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

export function writeActiveLibrary(value: ActiveLibrary | null, storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = safeStorage()): void {
  const next = parseActiveLibrary(value);
  const before = readActiveLibrary(storage);
  if (before?.id === next?.id && before?.name === next?.name) return;
  try {
    if (next) storage?.setItem(ACTIVE_LIBRARY_KEY, JSON.stringify(next));
    else storage?.removeItem(ACTIVE_LIBRARY_KEY);
  } catch {}
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(ACTIVE_LIBRARY_EVENT, { detail: { library: next } }));
}

export function activeLibraryHref(library: ActiveLibrary): string {
  return library.id === BASE_LIBRARY ? '/libraries/design-system-1/' : `/libraries/workspace/?${new URLSearchParams({ library: library.id })}`;
}

function safeStorage(): Storage | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}
