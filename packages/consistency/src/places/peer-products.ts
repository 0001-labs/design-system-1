import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-empty';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-text';
import '../../../../DS1/3-unit/ds-list';
import '../../../../DS1/3-unit/ds-row';
import type { SiteSummary } from '../site-editing';
import { siteApi } from './api';
import { failed, KeepCurrent } from './place';
import './places.css';

interface Product {
  id: string;
  code: string | null;
  title: string;
  status: 'live' | 'draft' | 'sold' | null;
  price: number | null;
}

type Page = { products: Product[]; next: string | null };
const status = { live: 'Live', draft: 'Draft', sold: 'Sold' };
const yen = new Intl.NumberFormat('en', { style: 'currency', currency: 'JPY' });

export class ConsistencyPlacePeerProducts extends LitElement {
  static properties = { page: { state: true }, error: { state: true }, loading: { state: true } };
  private declare page: Page | null;
  private declare error: string;
  private declare loading: boolean;
  private cursors = [''];
  private readonly current = new KeepCurrent(this, () => this.read());

  constructor(private readonly site: SiteSummary) {
    super();
    this.page = null;
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

  protected render() {
    return html`<section class="place place-column" aria-label="Products" aria-busy=${this.loading}>
      <ds-text class="place-title" role="heading" aria-level="1" literal size="display" text="Products"></ds-text>
      ${this.error ? html`<ds-message danger>${this.error}</ds-message>` : nothing}
      ${this.page?.products.length ? html`<ds-list>
        ${this.page.products.map(product => html`<ds-row>
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
    </section>`;
  }
}

if (!customElements.get('consistency-place-peer-products')) customElements.define('consistency-place-peer-products', ConsistencyPlacePeerProducts);
