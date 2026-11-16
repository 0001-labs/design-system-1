import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-switch';
import '../../../../DS1/3-unit/ds-row';
import '../../../../DS1/2-core/ds-text';
import type { SiteSummary } from '../site-editing';
import './places.css';

export class ConsistencySiteSettings extends LitElement {
  static properties = { confirming: { state: true }, code: { state: true }, busy: { state: true }, error: { state: true }, badge: { state: true }, badgeError: { state: true } };
  /** Whether the site shows "Built with Consistency" on its own domain; a site without one always shows it. */
  private declare badge: boolean;
  private declare badgeError: string;
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
    this.badge = !!site.badge;
    this.badgeError = '';
  }

  /** Shows or hides the badge at once; the switch goes back if the platform did not take it. */
  private async showBadge(show: boolean) {
    const before = this.badge;
    this.badge = show;
    this.badgeError = '';
    try {
      const response = await fetch(`/api/consistency/sites/${encodeURIComponent(this.site.code)}/badge`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Sign in again before retrying.' : response.status === 403 ? 'Only an owner or admin of the workspace can change this.' : 'Could not change the badge. Try again.');
      this.site.badge = show;
    } catch (error) {
      this.badge = before;
      this.badgeError = error instanceof TypeError ? 'Could not reach Consistency. Try again.' : (error as Error).message;
    }
  }

  protected createRenderRoot() { return this; }

  private async deleteSite() {
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
      <div class="place-section">
        <ds-row class="place-flow__state">
          <ds-switch><button type="button" role="switch" aria-checked=${String(this.badge || !this.site.domain)} aria-label="Show the Consistency badge" ?disabled=${!this.site.domain} @click=${() => void this.showBadge(!this.badge)}></button></ds-switch>
          <span>Consistency badge</span>
        </ds-row>
        <ds-text literal tone="muted" wrap text=${this.site.domain ? 'Built with Consistency, in the bottom left corner of every page.' : 'A site on its colour address always shows Built with Consistency, in the bottom left corner of every page.'}></ds-text>
        ${this.badgeError ? html`<ds-message danger role="alert">${this.badgeError}</ds-message>` : nothing}
      </div>
      ${this.confirming ? html`<div class="place-section">
        <p>Delete <strong>${this.site.name}</strong> and its pages, builds and site data permanently.</p>
        <label>Type <code class="place-code">${this.site.code}</code> to confirm.
          <ds-input aria-label="Site code" autocomplete="off" ?disabled=${this.busy} .value=${this.code}
            @input-change=${(event: CustomEvent<{ value: string }>) => { this.code = event.detail.value; }}></ds-input>
        </label>
        ${this.error ? html`<ds-message danger role="alert">${this.error}</ds-message>` : nothing}
        <div>
          <ds-button secondary ?disabled=${this.busy} @click=${() => { this.confirming = false; this.code = ''; this.error = ''; }}>Cancel</ds-button>
          <ds-button danger ?disabled=${this.busy || this.code !== this.site.code} @click=${() => void this.deleteSite()}>${this.busy ? 'Deleting…' : 'Delete site'}</ds-button>
        </div>
      </div>` : html`<div><ds-button secondary danger @click=${() => { this.confirming = true; }}>Delete site</ds-button></div>`}
    </section>`;
  }
}

if (!customElements.get('consistency-site-settings')) customElements.define('consistency-site-settings', ConsistencySiteSettings);
