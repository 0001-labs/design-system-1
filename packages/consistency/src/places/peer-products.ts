import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-empty';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-text';
import '../../../../DS1/3-unit/ds-list';
import '../../../../DS1/3-unit/ds-row';
import '../../../../DS1/4-page/ds-overlay';
import type { SiteSummary } from '../site-editing';
import { siteApi, siteApiUrl } from './api';
import { failed, KeepCurrent } from './place';
import './places.css';

interface Product {
  id: string;
  code: string | null;
  title: string;
  status: 'live' | 'draft' | 'sold' | null;
  price: number | null;
}

interface ProductDetail extends Product {
  description?: string;
  category?: string;
  condition?: string;
  size?: string;
  brand?: string;
  colour?: string;
  photos: string[];
}

type Selection = { product: Product; detail?: ProductDetail; error?: string };
type Page = { products: Product[]; next: string | null };
const status = { live: 'Live', draft: 'Draft', sold: 'Sold' };
const yen = new Intl.NumberFormat('en', { style: 'currency', currency: 'JPY' });

export class ConsistencyPlacePeerProducts extends LitElement {
  static properties = { page: { state: true }, error: { state: true }, loading: { state: true }, selected: { state: true } };
  private declare page: Page | null;
  private declare error: string;
  private declare loading: boolean;
  private declare selected: Selection | null;
  private cursors = [''];
  private readonly current = new KeepCurrent(this, () => this.read());

  constructor(private readonly site: SiteSummary) {
    super();
    this.page = null;
    this.selected = null;
    this.error = '';
    this.loading = false;
  }

  protected createRenderRoot() { return this; }

  private async read() {
    this.loading = true;
    try {
      const query = new URLSearchParams({ after: this.cursors.at(-1)! });
      this.page = await siteApi<Page>(this.site.code, `peer-products?${query}`);
      this.error = '';
      return true;
    } catch (error) {
      this.error = failed(error, 'Could not load products');
      return false;
    } finally {
      this.loading = false;
    }
  }

  private previous() {
    if (this.loading || this.cursors.length === 1) return;
    this.page = null;
    this.cursors.pop();
    void this.current.run();
  }

  private next() {
    if (this.loading || !this.page?.next) return;
    this.cursors.push(this.page.next);
    this.page = null;
    void this.current.run();
  }

  private async open(product: Product) {
    const pending = { product };
    this.selected = pending;
    try {
      const detail = await siteApi<ProductDetail>(this.site.code, `peer-products/${encodeURIComponent(product.id)}`);
      if (this.selected === pending) this.selected = { product, detail };
    } catch (error) {
      if (this.selected === pending) this.selected = { product, error: failed(error, 'Could not load product details') };
    }
  }

  private drawer() {
    const selected = this.selected;
    return html`<ds-overlay type="drawer" non-modal .holdScroll=${false} .blockOutside=${false} ?open=${!!selected} @ds-close-request=${() => { this.selected = null; }}>
      <dialog class="place-drawer place-peer-product" aria-labelledby="place-peer-product-title">
        ${selected ? this.detail(selected) : nothing}
      </dialog>
    </ds-overlay>`;
  }

  private detail({ product, detail, error }: Selection) {
    const title = detail?.title || product.title || 'Untitled product';
    const fields = detail ? [
      ['Code', detail.code],
      ['Status', detail.status && (status[detail.status] ?? detail.status)],
      ['Seller price', detail.price == null ? null : yen.format(detail.price)],
      ['Category', detail.category],
      ['Condition', detail.condition],
      ['Size', detail.size],
      ['Brand', detail.brand],
      ['Colour', detail.colour],
    ] : [];
    return html`<div data-ds-overlay="header">
      <h2 data-ds-overlay="title" id="place-peer-product-title">${title}</h2>
    </div>
    ${error ? html`<ds-message danger>${error}</ds-message>
      <ds-button secondary @click=${() => void this.open(product)}>Retry</ds-button>` : nothing}
    ${!detail && !error ? html`<p class="place-muted" role="status">Loading product…</p>` : nothing}
    ${detail ? html`
      ${detail.photos.length ? html`<div class="place-peer-product__photos">
        ${detail.photos.map((photo, index) => html`<img
          src=${siteApiUrl(this.site.code, `peer-products/${encodeURIComponent(product.id)}/photos/${encodeURIComponent(photo)}`)}
          alt=${`${title}, photo ${index + 1}`} loading="lazy" decoding="async">`)}
      </div>` : html`<p class="place-muted">No photos</p>`}
      <ds-list heading="Details">
        ${fields.filter(([, value]) => value).map(([label, value]) => html`<ds-row>
          <span class="ds-row__name">${label}</span><span class="ds-row__value">${value}</span>
        </ds-row>`)}
      </ds-list>
      ${detail.description ? html`<div class="place-section">
        <ds-text role="heading" aria-level="3" literal text="Description"></ds-text>
        <p class="place-peer-product__description">${detail.description}</p>
      </div>` : nothing}
    ` : nothing}`;
  }

  protected render() {
    return html`<section class="place place-column" aria-label="Products" aria-busy=${this.loading}>
      <ds-text class="place-title" role="heading" aria-level="1" literal size="display" text="Products"></ds-text>
      ${this.error ? html`<ds-message danger>${this.error}</ds-message>` : nothing}
      ${this.page?.products.length ? html`<ds-list>
        ${this.page.products.map(product => html`<ds-row interactive ?open=${this.selected?.product.id === product.id} @ds-row-press=${() => void this.open(product)}>
          <span class="ds-row__name">${product.title || 'Untitled product'}</span>
          ${product.code ? html`<span class="place-code">${product.code}</span>` : nothing}
          <span class="place-muted">${product.status ? status[product.status] ?? product.status : ''}</span>
          ${product.price === null ? nothing : html`<span class="ds-row__value">${yen.format(product.price)}</span>`}
        </ds-row>`)}
      </ds-list>` : this.page && !this.loading ? html`<ds-empty literal heading="No products to show"></ds-empty>` : nothing}
      ${this.cursors.length > 1 || this.page?.next ? html`<div>
        <ds-button secondary ?disabled=${this.loading || this.cursors.length === 1} @click=${this.previous}>Previous</ds-button>
        <ds-button secondary ?disabled=${this.loading || !!this.error || !this.page?.next} @click=${this.next}>Next</ds-button>
      </div>` : nothing}
      ${this.drawer()}
    </section>`;
  }
}

if (!customElements.get('consistency-place-peer-products')) customElements.define('consistency-place-peer-products', ConsistencyPlacePeerProducts);
