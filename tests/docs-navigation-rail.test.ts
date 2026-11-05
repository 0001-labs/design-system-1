import { expect, it } from 'vite-plus/test';
import { readFileSync } from 'node:fs';

it('uses the same navigation on desktop and in the phone drawer', () => {
  const layout = readFileSync('website/src/layouts/Layout.astro', 'utf8');
  const sidebar = readFileSync('website/src/components/MySidebar.astro', 'utf8');
  expect(layout).not.toContain('NavigationRail');
  expect(layout).not.toContain('data-sidebar-collapsed');
  expect(layout).toContain('resize-key="ds1-sidebar-width"');
  expect(layout).toMatch(/<ds-page[^>]*resizable[^>]*drawer>/);
  expect(sidebar.match(/<ds-sidebar\b/g)).toHaveLength(1);
  expect(sidebar).toContain('narrow');
});
