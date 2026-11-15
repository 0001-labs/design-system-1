import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-text';
import type { SiteSummary } from '../site-editing';
import './places.css';

export class ConsistencySiteSettings extends LitElement {
  static properties = { confirming: { state: true }, code: { state: true }, busy: { state: true }, error: { state: true } };
  private declare confirming: boolean;
  private declare code: string;
  private declare busy: boolean;
  private declare error: string;

  constructor(private readonly site: SiteSummary) {
    super();
    this.confirming = !!site.deleting;
    this.code = '';
    this.busy = false;
    this.error = '';
  }

  protected createRenderRoot() { return this; }

  private async remove() {
    if (this.busy || this.code !== this.site.code) return;
    this.busy = true;
    this.error = '';
    try {
      const response = await fetch(`/api/consistency/sites/${encodeURIComponent(this.site.code)}/delete`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: this.code }),
      });
      const result = await response.json().catch(() => null);
      if (response.ok || result?.error === 'unknown-site') {
        this.dispatchEvent(new Event('consistency-site-deleted'));
      } else {
        this.error = result?.error === 'disconnect-custom-domains-first'
          ? 'Disconnect the custom domains in workspace Settings → Domains, then try again.'
          : response.status === 401 ? 'Sign in again before retrying.'
          : 'Could not finish deleting the site. Try again.';
      }
    } catch {
      this.error = 'Could not reach Consistency. Try again.';
    } finally {
      this.busy = false;
    }
  }

  protected render() {
    return html`<section class="place place-column" aria-label="Site settings">
      <ds-text class="place-title" role="heading" aria-level="1" literal size="display" text="Site settings"></ds-text>
      ${this.confirming ? html`<div class="place-section">
        <p>Delete <strong>${this.site.name}</strong> and its pages, builds and site data permanently.</p>
        <label>Type <code class="place-code">${this.site.code}</code> to confirm.
          <ds-input aria-label="Site code" autocomplete="off" ?disabled=${this.busy} .value=${this.code}
            @input-change=${(event: CustomEvent<{ value: string }>) => { this.code = event.detail.value; }}></ds-input>
        </label>
        ${this.error ? html`<ds-message danger role="alert">${this.error}</ds-message>` : nothing}
        <div>
          <ds-button secondary ?disabled=${this.busy} @click=${() => { this.confirming = false; this.code = ''; this.error = ''; }}>Cancel</ds-button>
          <ds-button danger ?disabled=${this.busy || this.code !== this.site.code} @click=${() => void this.remove()}>${this.busy ? 'Deleting…' : 'Delete site'}</ds-button>
        </div>
      </div>` : html`<div><ds-button secondary danger @click=${() => { this.confirming = true; }}>Delete site</ds-button></div>`}
    </section>`;
  }
}

if (!customElements.get('consistency-site-settings')) customElements.define('consistency-site-settings', ConsistencySiteSettings);
