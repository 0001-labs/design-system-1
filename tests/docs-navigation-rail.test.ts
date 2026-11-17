import { expect, it } from 'vite-plus/test';
import { existsSync, readFileSync } from 'node:fs';

it('uses the same navigation on desktop and in the phone drawer', () => {
  const layout = readFileSync('website/src/layouts/Layout.astro', 'utf8');
  const sidebar = readFileSync('website/src/components/MySidebar.astro', 'utf8');
  expect(existsSync('website/src/components/NavigationRail.astro')).toBe(false);
  expect(layout).not.toContain('NavigationRail');
  expect(layout).not.toContain('data-sidebar-collapsed');
  expect(layout).toMatch(/<ds-app[^>]*resize-key="ds1-sidebar-width"/);
  expect(layout).toMatch(/<aside slot="nav"[^>]*><MySidebar \/><\/aside>/);
  expect(layout).not.toContain('<ds-page');
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
