import type { SiteSummary } from '../site-editing';
import type { SitePlace } from './api';
import { ConsistencyPlaceBookings } from './bookings';
import { ConsistencyPlaceGiftCards } from './giftcards';
import { ConsistencyPlacePages } from './pages';
import { ConsistencyPlaceEmails } from './emails';
import { ConsistencyPlaceDesign } from './design';
import { ConsistencyPlaceOrders } from './orders';
import { ConsistencyPlacePeerProducts } from './peer-products';
import { ConsistencySiteSettings } from './site-settings';
import { ConsistencyPlaceConnections } from './connections';
import { flavoPlaces } from './flavo';

export { SiteApiError, siteApi, sitePlaces, type SitePlace } from './api';

export type PlaceFactory = (site: SiteSummary) => HTMLElement;

export const PLACES = new Map<string, PlaceFactory>();
PLACES.set('pages', site => new ConsistencyPlacePages(site));
PLACES.set('emails', site => new ConsistencyPlaceEmails(site));
PLACES.set('settings', site => new ConsistencySiteSettings(site));
PLACES.set('design', site => new ConsistencyPlaceDesign(site));
PLACES.set('peer-products', site => new ConsistencyPlacePeerProducts(site));
PLACES.set('connections', site => new ConsistencyPlaceConnections(site));

export const shownPlaces = (places: readonly SitePlace[]) => places.filter(place => PLACES.has(place.id));

PLACES.set('bookings', site => Object.assign(new ConsistencyPlaceBookings(), { site }));
PLACES.set('giftcards', site => Object.assign(new ConsistencyPlaceGiftCards(), { site }));
PLACES.set('orders', site => Object.assign(new ConsistencyPlaceOrders(), { site }));
for (const [id, make] of flavoPlaces) PLACES.set(id, make);
