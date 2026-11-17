import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-icon';
import '../../../../DS1/2-core/ds-switch';
import '../../../../DS1/2-core/ds-tag';
import '../../../../DS1/2-core/ds-text';
import type { SiteSummary } from '../site-editing';
import { siteConnections, type SiteConnection, type SiteConnections } from './api';
import { KeepCurrent, failed, toneStyle } from './place';
import './places.css';
import './connections.css';

type GroupId = SiteConnections['groups'][number]['id'];
const STEPS: readonly GroupId[] = ['visitors', 'features', 'services', 'storage'];
const STEP_MS = 520;
const REST_MS = 1400;

function iconOf(group: GroupId, id: string): string {
  if (group === 'visitors') return 'globe';
  const icons: Record<string, string> = {
    pages: 'page', emails: 'email', analytics: 'eye', bookings: 'calendar', giftcards: 'gift', orders: 'bag',
    stripe: 'card', mail: 'email', notion_token: 'app-notion', c9y_identity: 'sign-in', images: 'image', changes: 'history',
    flags: 'bolt', 'flag-secrets': 'bolt', 'service-link': 'link', database: 'table', build: 'cloud', snapshots: 'dot-transfer',
  };
  return icons[id] ?? (id.startsWith('place-') ? 'store' : 'key');
}

export class ConsistencyPlaceConnections extends LitElement {
  static properties = { answer: { state: true }, error: { state: true }, step: { state: true }, loop: { state: true }, chosen: { state: true } };
  private declare answer: SiteConnections | null;
  private declare error: string;
  private declare step: number;
  private declare loop: boolean;
  private declare chosen: { group: GroupId; node: SiteConnection } | null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private played = false;
  private readonly still = matchMedia('(prefers-reduced-motion: reduce)');

  constructor(private readonly site: SiteSummary) {
    super();
    this.answer = null;
    this.error = '';
    this.step = STEPS.length;
    this.loop = false;
    this.chosen = null;
    new KeepCurrent(this, async () => {
      try {
        const answer = await siteConnections(site.code);
        const first = !this.answer;
        this.answer = answer;
        this.error = '';
        if (first && !this.played) { this.played = true; this.play(); }
        return true;
      } catch (error) {
        this.error = failed(error, 'Connections');
        return false;
      }
    });
  }

  protected createRenderRoot() { return this; }

  disconnectedCallback() { super.disconnectedCallback(); clearTimeout(this.timer); }

  private play() {
    clearTimeout(this.timer);
    if (this.still.matches) { this.step = STEPS.length; return; }
    this.step = 0;
    const next = () => {
      if (this.step < STEPS.length) { this.step += 1; this.timer = setTimeout(next, STEP_MS); }
      else if (this.loop) this.timer = setTimeout(() => this.play(), REST_MS);
    };
    this.timer = setTimeout(next, STEP_MS / 2);
  }

  private toggleLoop() {
    this.loop = !this.loop;
    if (this.loop && this.step >= STEPS.length) this.play();
  }

  private choose(group: GroupId, node: SiteConnection) {
    this.chosen = this.chosen?.node.id === node.id ? null : { group, node };
  }

  private arm(group: SiteConnections['groups'][number]) {
    const index = STEPS.indexOf(group.id);
    const drawn = this.step > index;
    const drawing = this.step === index + 1;
    return html`
      <div class="connections-line connections-line--${group.id}" ?data-drawn=${drawn} ?data-drawing=${drawing} aria-hidden="true">
        <span class="connections-line__pill">${group.label}</span>
      </div>
      <div class="connections-group connections-group--${group.id}" ?data-drawn=${drawn} role="group" aria-label=${group.label}>
        ${group.nodes.length ? group.nodes.map(node => html`<button type="button" class="connections-node" data-state=${node.state}
          aria-pressed=${String(this.chosen?.node.id === node.id)} title=${node.detail} @click=${() => this.choose(group.id, node)}>
          <ds-icon type=${iconOf(group.id, node.id)}></ds-icon><span class="connections-node__label">${node.label}</span>
        </button>`) : html`<span class="connections-empty">None</span>`}
      </div>`;
  }

  render() {
    const answer = this.answer;
    const waiting = answer?.groups.flatMap(group => group.nodes).filter(node => node.state === 'waiting').length ?? 0;
    return html`<section class="place place-connections" aria-label="Connections">
      <div class="place-head">
        <ds-text class="place-title" role="heading" aria-level="1" literal size="display" text="Connections"></ds-text>
        ${answer ? html`<ds-tag>${answer.site.runtime}</ds-tag>` : nothing}
        ${waiting ? html`<ds-tag style=${toneStyle('warning')}>${waiting} waiting</ds-tag>` : nothing}
      </div>
      <ds-text tone="muted" wrap literal text=${answer ? `${answer.site.detail}. Worked out from the code that runs ${answer.site.name}.` : 'How the site is connected, worked out from the code that runs it.'}></ds-text>
      ${this.error ? html`<ds-text tone="danger" literal text=${this.error}></ds-text>` : nothing}
      ${answer ? html`
        <div class="connections-stage" data-step=${this.step}>
          ${answer.groups.map(group => this.arm(group))}
          <div class="connections-site">
            <ds-icon type="box"></ds-icon>
            <span class="connections-site__name">${answer.site.name}</span>
            <span class="connections-site__runtime">${answer.site.runtime}</span>
          </div>
        </div>
        <div class="connections-controls">
          <ds-button @click=${() => this.play()}><ds-icon type="play-alt"></ds-icon><span>${this.step >= STEPS.length ? 'Replay' : 'Play'}</span></ds-button>
          <span class="connections-loop">
            <ds-text literal text="Loop"></ds-text>
            <ds-switch><button type="button" role="switch" aria-checked=${String(this.loop)} aria-label="Play the chart again and again" @click=${() => this.toggleLoop()}></button></ds-switch>
          </span>
        </div>
        <div class="connections-detail" aria-live="polite">
          ${this.chosen ? html`<ds-text literal text=${this.chosen.node.label}></ds-text><ds-text tone="muted" literal text=${this.chosen.node.detail}></ds-text>
            ${this.chosen.node.state === 'waiting' ? html`<ds-tag style=${toneStyle('warning')}>Waiting</ds-tag>` : nothing}`
            : html`<ds-text tone="muted" literal text="Press a connection to see what it does."></ds-text>`}
        </div>` : nothing}
    </section>`;
  }
}

if (!customElements.get('consistency-place-connections')) customElements.define('consistency-place-connections', ConsistencyPlaceConnections);
