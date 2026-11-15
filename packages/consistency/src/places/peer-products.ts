import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-empty';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/3-unit/ds-select';
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
  editable?: boolean;
  revision: string;
  options?: { categories: string[]; conditions: string[]; maxPhotos: number };
}

type Selection = { product: Product; detail?: ProductDetail; error?: string };
type Page = { products: Product[]; next: string | null };
const status = { live: 'Live', draft: 'Draft', sold: 'Sold' };
const yen = new Intl.NumberFormat('en', { style: 'currency', currency: 'JPY' });

const fields = [
  ['title', 'Title', 80], ['description', 'Description', 2000], ['size', 'Size', 40],
  ['brand', 'Brand', 60], ['colour', 'Colour', 40],
] as const;
type Edit = Record<string, string>;
const label = (value: string) => value === 'tshirts' ? 'T-shirts' : value === 'like-new' ? 'Like new' : value ? value[0].toUpperCase() + value.slice(1) : 'Choose';
const imageData = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error);
  reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
  reader.readAsDataURL(file);
});

export class ConsistencyPlacePeerProducts extends LitElement {
  static properties = { page: { state: true }, error: { state: true }, loading: { state: true }, selected: { state: true }, edit: { state: true }, removed: { state: true }, busy: { state: true }, editError: { state: true } };
  private declare page: Page | null;
  private declare error: string;
  private declare loading: boolean;
  private declare selected: Selection | null;
  private declare edit: Edit | null;
  private declare removed: string[];
  private declare busy: boolean;
  private declare editError: string;
  private cursors = [''];
  private readonly current = new KeepCurrent(this, () => this.read());

  constructor(private readonly site: SiteSummary) {
    super();
    this.page = null;
    this.selected = null;
    this.edit = null;
    this.removed = [];
    this.busy = false;
    this.editError = '';
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
    if (this.edit) { this.editError = "Save or cancel your changes first."; return; }
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
    return html`<ds-overlay type="drawer" non-modal .holdScroll=${false} .blockOutside=${false} ?open=${!!selected} @ds-close-request=${() => this.close()}>
      <dialog class="place-drawer place-peer-product" aria-labelledby="place-peer-product-title">
        ${selected ? this.detail(selected) : nothing}
      </dialog>
    </ds-overlay>`;
  }

  private close() {
    if (this.busy) return;
    if (this.edit) { this.editError = 'Save or cancel your changes first.'; return; }
    this.selected = null;
  }

  private startEdit(detail: ProductDetail) {
    this.edit = Object.fromEntries(fields.map(([key]) => [key, detail[key] ?? '']));
    Object.assign(this.edit, { category: detail.category ?? '', condition: detail.condition ?? '', price: String(detail.price ?? '') });
    this.removed = [];
    this.editError = '';
  }

  private cancelEdit() {
    this.edit = null;
    this.removed = [];
    this.editError = '';
  }

  private async save(detail: ProductDetail, file?: File) {
    if (this.busy || !this.edit) return;
    this.busy = true;
    this.editError = '';
    const route = `peer-products/${encodeURIComponent(detail.id)}`;
    try {
      if (file && file.size > 10_000_000) { this.editError = 'Choose a photo smaller than 10 MB.'; return; }
      const next = file
        ? await siteApi<ProductDetail>(this.site.code, `${route}/photos`, { method: 'POST', json: { revision: detail.revision, image: await imageData(file) } })
        : await siteApi<ProductDetail>(this.site.code, route, { method: 'PUT', json: {
          ...this.edit, price: Number(this.edit.price), revision: detail.revision, photos: detail.photos.filter(id => !this.removed.includes(id)),
        } });
      this.selected = { product: next, detail: next };
      if (!file) this.cancelEdit();
      void this.current.run();
    } catch (error) {
      this.editError = error instanceof Error && 'code' in error && error.code === 'revision-conflict'
        ? 'This product changed. Copy any edits you want to keep, then cancel and reopen it.'
        : failed(error, file ? 'Could not add the photo' : 'Could not save the product');
    } finally {
      this.busy = false;
    }
  }

  private editor(detail: ProductDetail, edit: Edit) {
    const options = detail.options;
    if (!options) return nothing;
    const set = (key: string, value: string) => { this.edit = { ...this.edit, [key]: value }; };
    const select = (key: string, title: string, options: string[]) => html`<label>${title}
      <ds-select><select aria-label=${title} ?disabled=${this.busy}
        @change=${(event: Event) => set(key, (event.target as HTMLSelectElement).value)}>
        ${options.map(value => html`<option value=${value} ?selected=${value === edit[key]}>${key === 'condition' && !value ? 'Unspecified' : label(value)}</option>`)}
      </select></ds-select>
    </label>`;
    return html`<div class="place-section place-peer-product__form">
      ${fields.map(([key, title, max]) => html`<label>${title}
        <ds-input aria-label=${title} maxlength=${max} ?multiline=${key === 'description'} ?disabled=${this.busy}
          .value=${edit[key]} @input-change=${(event: CustomEvent<{ value: string }>) => set(key, event.detail.value)}></ds-input>
      </label>`)}
      ${select('category', 'Category', ['', ...options.categories])}
      ${select('condition', 'Condition', options.conditions)}
      <label>Seller price (¥)<ds-input aria-label="Seller price (yen)" type="number" min="0" max="10000000"
        ?disabled=${this.busy} .value=${edit.price} @input-change=${(event: CustomEvent<{ value: string }>) => set('price', event.detail.value)}></ds-input></label>
      <label>Add photo now <input type="file" aria-label="Add photo" accept="image/jpeg,image/png,image/webp,image/avif"
        ?disabled=${this.busy || detail.photos.length >= options.maxPhotos}
        @change=${(event: Event) => {
          const input = event.target as HTMLInputElement;
          const file = input.files?.[0];
          input.value = '';
          if (file) void this.save(detail, file);
        }}></label>
      ${this.editError ? html`<ds-message danger>${this.editError}</ds-message>` : nothing}
      <div data-ds-overlay="footer">
        <ds-button secondary ?disabled=${this.busy} @click=${() => this.cancelEdit()}>Cancel</ds-button>
        <ds-button ?disabled=${this.busy || !edit.category} @click=${() => void this.save(detail)}>Save changes</ds-button>
      </div>
    </div>`;
  }

  private detail({ product, detail, error }: Selection) {
    const title = detail?.title || product.title || 'Untitled product';
    const values = detail ? [
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
        ${detail.photos.map((photo, index) => html`<div ?hidden=${this.removed.includes(photo)}><img
          src=${siteApiUrl(this.site.code, `peer-products/${encodeURIComponent(product.id)}/photos/${encodeURIComponent(photo)}`)}
          alt=${`${title}, photo ${index + 1}`} loading="lazy" decoding="async">
          ${this.edit ? html`<ds-button secondary aria-label=${`Remove photo ${index + 1}`}
            ?disabled=${this.busy || detail.photos.length - this.removed.length <= 1}
            @click=${() => { this.removed = [...this.removed, photo]; }}>Remove</ds-button>` : nothing}
        </div>`)}
      </div>` : html`<p class="place-muted">No photos</p>`}
      ${this.edit ? this.editor(detail, this.edit) : html`
      <ds-list heading="Details">
        ${values.filter(([, value]) => value).map(([label, value]) => html`<ds-row>
          <span class="ds-row__name">${label}</span><span class="ds-row__value">${value}</span>
        </ds-row>`)}
      </ds-list>
      ${detail.description ? html`<div class="place-section">
        <ds-text role="heading" aria-level="3" literal text="Description"></ds-text>
        <p class="place-peer-product__description">${detail.description}</p>
      </div>` : nothing}
      ${detail.editable ? html`<div data-ds-overlay="footer"><ds-button @click=${() => this.startEdit(detail)}>Edit</ds-button></div>` : nothing}
      `}
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
