import '../../../../DS1/3-unit/ds-list';
import '../../../../DS1/3-unit/ds-row';
import '../../../../DS1/3-unit/ds-tabs';
import '../../../../DS1/3-unit/ds-select';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-checkbox';
import '../../../../DS1/2-core/ds-empty';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-tag';
import '../../../../DS1/2-core/ds-text';
import '../../../../DS1/4-page/ds-overlay';
import type { SiteSummary } from '../site-editing';
import { FLAVO_PAGE_SOURCES, FLAVO_PLACES, type FlavoPlaceContext } from '../sites/flavo/index';
import { siteApi } from './api';
import { PAGE_SOURCES } from './pages';
import { say } from './place';
import './places.css';
import '../sites/flavo/places.css';

const originOf = (url: string) => { try { return new URL(url).origin; } catch { return ''; } };

export function flavoContext(site: SiteSummary): FlavoPlaceContext {
  return {
    async transport(operation, args = {}) {
      const answer = await siteApi<{ value?: unknown }>(site.code, 'business', { method: 'POST', json: { operation, args } });
      return answer?.value ?? null;
    },
    origin: originOf(site.url),
    say,
  };
}

export const flavoPlaces = Object.entries(FLAVO_PLACES).map(([id, make]) => [id, (site: SiteSummary) => make(flavoContext(site))] as const);

for (const [name, source] of Object.entries(FLAVO_PAGE_SOURCES)) PAGE_SOURCES.set(name, site => source(flavoContext(site)));
