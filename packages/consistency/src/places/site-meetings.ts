import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-checkbox';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-switch';
import '../../../../DS1/2-core/ds-text';
import '../../../../DS1/3-unit/ds-row';
import '../../../../DS1/3-unit/ds-select';
import type { SiteSummary } from '../site-editing';
import { SiteApiError, siteApi } from './api';
import { takeGoogleReturn } from './google-return';
import { AHEAD, DAYS, HALF_HOURS, NOTICES, clock, meetingWords, ownZone, returnWords, when, zones } from './meetings-view';
import './places.css';

export interface MeetingSettings { on: boolean; title: string; timeZone: string; minutes: number; days: number[]; from: number; to: number; notice: number; ahead: number }
interface Meeting { id: string; start: number; end: number; name: string; email: string; note: string; link: string | null }
export interface MeetingsStatus {
  available: boolean; connection: { email: string; status: 'active' | 'needs-reconnect'; since: number } | null;
  revision: number; settings: MeetingSettings; open: boolean; page: string; upcoming: Meeting[];
}

export class ConsistencySiteMeetings extends LitElement {
  static properties = { status: { state: true }, busy: { state: true }, error: { state: true } };
  site!: SiteSummary;
  private declare status: MeetingsStatus | null;
  private declare busy: boolean;
  private declare error: string;
  private writing?: string;
  constructor() { super(); this.status = null; this.busy = false; this.error = ''; }
  protected createRenderRoot() { return this; }

  connectedCallback() { super.connectedCallback(); if (!this.status) void this.open(); }

  private ask<T = MeetingsStatus>(route: string, init: RequestInit & { json?: unknown } = {}) { return siteApi<T>(this.site.code, route, init); }
  private take(status: MeetingsStatus) { this.status = status.revision ? status : { ...status, settings: { ...status.settings, timeZone: ownZone() } }; }

  private async open() {
    const returned = takeGoogleReturn(this.site.code);
    try { this.take(await this.ask('meetings')); } catch (error) { if (!(error instanceof SiteApiError && error.status === 404)) this.error = meetingWords(error); return; }
    if (returned?.error) this.error = returnWords(returned.error);
    else if (returned) await this.run(() => this.ask('meetings/google/callback', { method: 'POST', json: { code: returned.code, state: returned.state } }));
  }
  private async run(call: () => Promise<MeetingsStatus>) {
    if (this.busy) return;
    this.busy = true; this.error = '';
    try { this.take(await call()); } catch (error) { this.error = meetingWords(error); } finally { this.busy = false; }
  }

  private async connect() {
    if (this.busy) return;
    this.busy = true; this.error = '';
    try {
      const { url } = await this.ask<{ url: string }>('meetings/google', { method: 'POST', json: {} });
      if (!url.startsWith('https://accounts.google.com/')) throw new Error('unexpected');
      location.assign(url);
    } catch (error) { this.error = meetingWords(error); this.busy = false; }
  }
  private disconnect() { return this.run(() => this.ask('meetings/google', { method: 'DELETE', json: {} })); }

  private async change(patch: Partial<MeetingSettings>) {
    const status = this.status;
    if (!status || this.busy) return;
    const settings = { ...status.settings, ...patch };
    this.status = { ...status, settings };
    this.busy = true; this.error = '';
    try { this.take(await this.ask('meetings', { method: 'PUT', json: { revision: status.revision, settings } })); }
    catch (error) {
      this.error = meetingWords(error);
      try { this.take(await this.ask('meetings')); } catch { this.status = status; }
    } finally { this.busy = false; }
  }

  private select(label: string, value: number | string, options: [number | string, string][], set: (value: string) => void) {
    return html`<ds-row><span class="ds-row__name">${label}</span><span class="ds-row__value"><ds-select><select aria-label=${label} ?disabled=${this.busy} .value=${String(value)} @change=${(event: Event) => set((event.target as HTMLSelectElement).value)}>
      ${options.map(([option, words]) => html`<option value=${String(option)} ?selected=${String(option) === String(value)}>${words}</option>`)}
    </select></ds-select></span></ds-row>`;
  }

  protected render() {
    const status = this.status;
    if (!status) return this.error ? html`<div class="place-section"><ds-message danger role="alert">${this.error}</ds-message></div>` : nothing;
    const { connection, settings } = status;
    const heading = html`<ds-text role="heading" aria-level="2" literal strong text="Meetings"></ds-text>`;
    const problem = this.error ? html`<ds-message danger role="alert">${this.error}</ds-message>` : nothing;
    if (!status.available) return html`<div class="place-section">${heading}<ds-text literal tone="muted" wrap text="Visitors book a meeting with you on the site. This needs Consistency's own Google connection, which is not set up yet."></ds-text>${problem}</div>`;
    if (!connection) return html`<div class="place-section">${heading}
      <ds-text literal tone="muted" wrap text="Visitors book a meeting with you on the site. Connect the Google account whose calendar takes the meetings: Consistency reads when it is busy and adds what is booked, and Google sends the invitations. It never reads mail."></ds-text>
      ${problem}<div><ds-button ?disabled=${this.busy} @click=${() => void this.connect()}>Connect Google</ds-button></div></div>`;
    const zoneList = zones(), listed = zoneList.includes(settings.timeZone) ? zoneList : [settings.timeZone, ...zoneList];
    return html`<div class="place-section">${heading}
      <ds-row><span class="ds-row__name">Google</span><span class="ds-row__value">${connection.email}</span>
        <ds-button secondary ?disabled=${this.busy} @click=${() => void this.disconnect()}>Disconnect</ds-button></ds-row>
      ${connection.status === 'needs-reconnect' ? html`<ds-message danger role="alert">Google no longer lets Consistency use this calendar, so no meetings can be booked. Connect it again.</ds-message>
        <div><ds-button ?disabled=${this.busy} @click=${() => void this.connect()}>Connect Google again</ds-button></div>` : html`
      <ds-row class="place-flow__state">
        <ds-switch><button type="button" role="switch" aria-checked=${String(settings.on)} aria-label="Take bookings" ?disabled=${this.busy} @click=${() => void this.change({ on: !settings.on })}></button></ds-switch>
        <span>Take bookings</span>
      </ds-row>
      <ds-row><span class="ds-row__name">Called</span><span class="ds-row__value"><ds-input class="place-meetings__name" aria-label="What the meeting is called" autocomplete="off" maxlength="80" ?disabled=${this.busy} .value=${this.writing ?? settings.title}
        @input-change=${(event: CustomEvent<{ value: string }>) => { this.writing = event.detail.value; }}
        @focusout=${() => { const title = this.writing?.trim(); this.writing = undefined; if (title && title !== settings.title) void this.change({ title }); }}></ds-input></span></ds-row>
      ${this.select('Length', settings.minutes, [15, 30, 45, 60].map(minutes => [minutes, `${minutes} minutes`]), value => void this.change({ minutes: Number(value) }))}
      <ds-row role="group" aria-label="Days"><span class="ds-row__name">Days</span><span class="ds-row__value place-meetings__days">${DAYS.map(([day, name]) => html`<label class="place-check"><ds-checkbox><input type="checkbox" .checked=${settings.days.includes(day)} ?disabled=${this.busy}
        @change=${(event: Event) => void this.change({ days: (event.target as HTMLInputElement).checked ? [...settings.days, day] : settings.days.filter(each => each !== day) })}></ds-checkbox>${name}</label>`)}</span></ds-row>
      ${this.select('From', settings.from, HALF_HOURS.filter(minutes => minutes + settings.minutes <= settings.to).map(minutes => [minutes, clock(minutes)]), value => void this.change({ from: Number(value) }))}
      ${this.select('To', settings.to, HALF_HOURS.filter(minutes => minutes - settings.minutes >= settings.from).map(minutes => [minutes, clock(minutes)]), value => void this.change({ to: Number(value) }))}
      ${this.select('Time zone', settings.timeZone, listed.map(zone => [zone, zone.replaceAll('_', ' ')]), value => void this.change({ timeZone: value }))}
      ${this.select('Notice', settings.notice, NOTICES.some(([hours]) => hours === settings.notice) ? NOTICES : [[settings.notice, `${settings.notice} hours`], ...NOTICES], value => void this.change({ notice: Number(value) }))}
      ${this.select('Up to', settings.ahead, (AHEAD.includes(settings.ahead) ? AHEAD : [settings.ahead, ...AHEAD]).map(days => [days, `${days} days ahead`]), value => void this.change({ ahead: Number(value) }))}
      ${problem}
      <ds-text literal tone="muted" wrap text=${status.open ? 'Visitors book at this address. Link a button on your pages to it.' : 'Once bookings are on, visitors book at this address.'}></ds-text>
      <a class="place-address" href=${status.page} target="_blank" rel="noopener">${status.page.replace(/^https:\/\//, '')}</a>
      ${status.upcoming.length ? html`<ds-text role="heading" aria-level="3" literal strong text="Booked"></ds-text>
        ${status.upcoming.map(meeting => html`<ds-row><span class="ds-row__name">${when(meeting.start, settings.timeZone)}</span><span class="ds-row__value">${meeting.name}, ${meeting.email}</span>
          ${meeting.link ? html`<a href=${meeting.link} target="_blank" rel="noopener">Open in Google Calendar</a>` : nothing}</ds-row>`)}` : nothing}`}
    </div>`;
  }
}

if (!customElements.get('consistency-site-meetings')) customElements.define('consistency-site-meetings', ConsistencySiteMeetings);
