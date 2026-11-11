import { expect, test } from 'vite-plus/test';
import { editorChoice, editorPage, editorSearch, editorSidebarItems, readEditorNavigation } from './editor-navigation';

const reported = { components: [{ id: 'button', name: 'Button' }, { id: 'input', name: 'Input' }], component: 'input', view: null };

test('reads only what an editor frame reports', () => {
  expect(readEditorNavigation(reported)).toEqual(reported);
  expect(readEditorNavigation({ ...reported, view: 'history' })?.view).toBe('history');
  expect(readEditorNavigation({ ...reported, view: 'elsewhere' })?.view).toBeNull();
  for (const bad of [null, 'button', { ...reported, component: '<b>' }, { ...reported, components: [] }, { ...reported, components: [{ id: 'Bad id', name: 'x' }] }]) {
    expect(readEditorNavigation(bad)).toBeNull();
  }
});

test('the docs sidebar lists only the components, flat, then History and All tokens, marking what is open', () => {
  const { components, views } = editorSidebarItems(reported, '/libraries/design-system-1/');
  expect(components.map(item => item.label)).toEqual(['Button', 'Input']);
  expect(views.map(item => item.label)).toEqual(['History', 'All tokens']);
  expect([...components, ...views].find(item => item.current)?.label).toBe('Input');
  expect(components[1]!.href).toBe('/libraries/design-system-1/?component=input');
  const tokens = editorSidebarItems({ ...reported, view: 'tokens' }, '/x/');
  expect([...tokens.components, ...tokens.views].filter(item => item.current).map(item => item.label)).toEqual(['All tokens']);
});

test('the breadcrumb names the open component or view', () => {
  expect(editorPage(reported)).toBe('Input');
  expect(editorPage({ ...reported, view: 'history' })).toBe('History');
  expect(editorPage({ ...reported, view: 'tokens' })).toBe('All tokens');
  expect(editorPage({ ...reported, component: 'missing' })).toBe('');
});

test('a row becomes what the frame opens, and an address names one component or one view', () => {
  expect(editorChoice('editor:component:button')).toEqual({ component: 'button', view: null });
  expect(editorChoice('editor:history')).toEqual({ component: null, view: 'history' });
  expect(editorChoice('editor:tokens')).toEqual({ component: null, view: 'tokens' });
  expect(editorChoice('/2-core/button/')).toBeNull();
  expect(String(editorSearch('tag', null, new URLSearchParams('embed=docs&view=history')))).toBe('embed=docs&component=tag');
  expect(String(editorSearch('tag', 'tokens'))).toBe('view=tokens');
});
