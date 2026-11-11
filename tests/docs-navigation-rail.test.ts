import { expect, it } from 'vite-plus/test';
import { existsSync, readFileSync } from 'node:fs';

it('uses the same navigation on desktop and in the phone drawer', () => {
  const layout = readFileSync('website/src/layouts/Layout.astro', 'utf8');
  const sidebar = readFileSync('website/src/components/MySidebar.astro', 'utf8');
  expect(existsSync('website/src/components/NavigationRail.astro')).toBe(false);
  expect(layout).not.toContain('NavigationRail');
  expect(layout).not.toContain('data-sidebar-collapsed');
  expect(layout).toContain('resize-key="ds1-sidebar-width"');
  expect(layout).toMatch(/<ds-page[^>]*resizable[^>]*drawer>/);
  expect(sidebar.match(/<ds-sidebar\b/g)).toHaveLength(1);
  expect(sidebar).toContain('narrow');
});

it('Design system 1 opens the component editor in the documentation shell, kept out of the sitemap', () => {
  const layout = readFileSync('website/src/layouts/Layout.astro', 'utf8');
  const workspace = readFileSync('website/src/components/LibraryWorkspace.astro', 'utf8');
  const config = readFileSync('website/astro.config.mjs', 'utf8');
  expect(layout).toMatch(/'\/libraries\/design-system-1' \? 'base'/);
  expect(workspace).toMatch(/mode === 'base' \? '\/app\/base'/);
  expect(config).toMatch(/libraries\\\/design-system-1/);
});

it('signed in, the sidebar holds one space at a time: the design system\'s components or the documentation', () => {
  const sidebar = readFileSync('website/src/components/MySidebar.astro', 'utf8');
  // The design system: the way back, its components, its own views; nothing else.
  expect(sidebar).toContain(`['Back to documentation', '/']`);
  expect(sidebar).toMatch(/<a slot="header" id="shell-back"[^>]*hidden>/);
  expect(sidebar).toMatch(/if \(design\) \{ navigation\.items = placeAppNavigation\(navigation, designItems\(\), \[\]\); return; \}/);
  // The documentation: the way back into the active design system, then every group a signed-out reader has.
  expect(sidebar).toMatch(/activeLibraryHref\(active\)/);
  expect(sidebar).not.toMatch(/Start Here' \|\||hideSignedInLibraryEntry|ownerLibraryItems|workspace-name|data-account-avatar/);
  // App rows and System stay the owner's.
  expect(sidebar).toMatch(/if \(owner\) navigation\.items = \[\.\.\.navigation\.items, \{ id: 'system'/);
});
