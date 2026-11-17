export type EditorView = 'history' | 'tokens' | null;
export interface EditorNavigation { components: { id: string; name: string }[]; component: string; view: EditorView }
export interface EditorSidebarItem { id: string; label: string; href: string; current: boolean }

const COMPONENT_PREFIX = 'editor:component:';
const ID = /^[a-z0-9-]{1,40}$/;

export const readEditorView = (value: unknown): EditorView => value === 'history' || value === 'tokens' ? value : null;

export function readEditorNavigation(value: unknown): EditorNavigation | null {
  if (!value || typeof value !== 'object') return null;
  const { components, component } = value as Record<string, unknown>;
  if (!Array.isArray(components) || typeof component !== 'string' || !ID.test(component)) return null;
  const list = components.flatMap(entry => {
    const { id, name } = (entry ?? {}) as Record<string, unknown>;
    return typeof id === 'string' && ID.test(id) && typeof name === 'string' && name.trim() ? [{ id, name: name.slice(0, 80) }] : [];
  });
  return list.length ? { components: list, component, view: readEditorView((value as Record<string, unknown>).view) } : null;
}

export function editorSearch(component: string | null, chosen: EditorView, from: URLSearchParams = new URLSearchParams()): URLSearchParams {
  const search = new URLSearchParams(from);
  search.delete('component'); search.delete('view');
  if (chosen) search.set('view', chosen);
  else if (component) search.set('component', component);
  return search;
}

export function editorSidebarItems(navigation: EditorNavigation, pathname: string): { components: EditorSidebarItem[]; views: EditorSidebarItem[] } {
  const link = (component: string | null, chosen: EditorView) => `${pathname}?${editorSearch(component, chosen)}`;
  return {
    components: navigation.components.map(entry => ({
      id: `${COMPONENT_PREFIX}${entry.id}`, label: entry.name, href: link(entry.id, null), current: !navigation.view && entry.id === navigation.component,
    })),
    views: [
      { id: 'editor:history', label: 'History', href: link(null, 'history'), current: navigation.view === 'history' },
      { id: 'editor:tokens', label: 'All tokens', href: link(null, 'tokens'), current: navigation.view === 'tokens' },
    ],
  };
}

export function editorPage(navigation: EditorNavigation): string {
  if (navigation.view === 'history') return 'History';
  if (navigation.view === 'tokens') return 'All tokens';
  return navigation.components.find(entry => entry.id === navigation.component)?.name ?? '';
}

export function editorChoice(id: string): { component: string | null; view: EditorView } | null {
  if (id === 'editor:history') return { component: null, view: 'history' };
  if (id === 'editor:tokens') return { component: null, view: 'tokens' };
  if (id.startsWith(COMPONENT_PREFIX) && ID.test(id.slice(COMPONENT_PREFIX.length))) return { component: id.slice(COMPONENT_PREFIX.length), view: null };
  return null;
}
