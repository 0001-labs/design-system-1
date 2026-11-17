/**
 * The email flow designer, the Flows tab of a site's Emails place (System's Emails part: where a site has flows, it
 * has a clear designer beside them). Every flow the site has, each a group naming what starts it, its emails in
 * order with when each goes and its subject in the language chosen; Add a flow offers the kinds it has not got,
 * started with their first words. Pressing an email opens it in the place's non-modal drawer: when it goes (a
 * number, a unit and, for a kind with several, the event it waits on), its subject and message, the fields it may
 * use, and a preview with made up people. The whole document saves by itself a moment after each change, on its
 * revision; a refused save keeps the edits and says so.
 *
 * Each flow has a switch: on, it sends (the platform's `email-sending.ts`), each email at its time after what starts
 * it, and the group says what it has sent, has waiting and could not send. An email waiting on an event the platform
 * does not raise yet is marked Not sent yet; one whose words use a field its event does not fill is named in the
 * drawer, since it would not be sent. The site's offer, what `{{offer}}` stands for, is written above the flows, and
 * Welcome names the site's signup page.
 *
 * The owner's alone; the Emails place shows the tab only when the flows answer.
 */
import { LitElement, html, nothing } from 'lit';
import '../../../../DS1/3-unit/ds-list';
import '../../../../DS1/3-unit/ds-row';
import '../../../../DS1/3-unit/ds-select';
import '../../../../DS1/2-core/ds-button';
import '../../../../DS1/2-core/ds-input';
import '../../../../DS1/2-core/ds-tag';
import '../../../../DS1/2-core/ds-text';
import '../../../../DS1/2-core/ds-message';
import '../../../../DS1/2-core/ds-empty';
import '../../../../DS1/2-core/ds-switch';
import { DocumentState } from '../document-state';
import { siteApi } from './api';
import { emailDocument, templatePreview } from './emails-view';
import { DELAY_UNITS, MAX_FLOW_STEPS, blockers, firstWordsLanguage, flowOf, inOrder, replaceFlow, statsName, whenName, withEmail, wordsOf, type DelayUnit, type Flow, type FlowKind, type FlowsAnswer, type FlowsDocument, type FlowsSnapshot, type FlowStep } from './email-flows-view';

/** The email the drawer shows: its flow's kind and its place in the flow. */
export interface ShownFlowEmail { kind: string; index: number }

export class ConsistencyEmailFlows extends LitElement {
  site = '';
  lang = '';
  answer!: FlowsAnswer;
  /** The email open in the place's drawer, which the place draws with `drawerBody`. */
  shown: ShownFlowEmail | null = null;
  private state?: DocumentState<FlowsDocument, FlowsSnapshot>;
  private removed: string | null = null;
  protected createRenderRoot() { return this; }

  /** Takes the flows as read; edits not yet saved are kept over a newer read. */
  use(answer: FlowsAnswer) {
    this.answer = answer;
    if (this.state && (this.state.dirty || this.state.busy || this.state.snapshot.revision >= answer.flows.revision)) { this.requestUpdate(); return; }
    this.state?.destroy();
    this.state = new DocumentState(answer.flows, async value => {
      const saved = await siteApi<FlowsAnswer>(this.site, 'emails/flows', { method: 'PUT', json: value });
      this.answer = { ...this.answer, flows: saved.flows, sending: saved.sending };
      return saved.flows;
    }, () => { this.requestUpdate(); this.changed(); });
    this.requestUpdate();
  }
  disconnectedCallback() { super.disconnectedCallback(); void this.state?.flush(); }
  async flush() { return await this.state?.flush() !== false; }
  private changed() { this.dispatchEvent(new CustomEvent('email-flows-changed', { bubbles: true })); }

  private get document() { return this.state?.document ?? { flows: [] }; }
  private kindOf(kind: string): FlowKind | undefined { return this.answer.kinds.find(each => each.kind === kind); }
  private flow(kind: string) { return this.document.flows.find(each => each.kind === kind); }
  private commit(document: FlowsDocument) { this.removed = null; this.state?.commit(document); }
  private setFlow(flow: Flow) { this.commit(replaceFlow(this.document, flow.kind, flow)); }
  private setStep(kind: string, index: number, change: (step: FlowStep) => FlowStep) {
    const flow = this.flow(kind);
    if (flow?.steps[index]) this.setFlow({ ...flow, steps: flow.steps.map((step, at) => (at === index ? change(step) : step)) });
  }
  /** A change of when an email goes: the flow kept in order, the email still open where it moved to. */
  private setTiming(kind: string, index: number, change: (step: FlowStep) => FlowStep) {
    const flow = this.flow(kind);
    if (!flow?.steps[index]) return;
    const sorted = inOrder({ ...flow, steps: flow.steps.map((step, at) => (at === index ? change(step) : step)) }, this.kindOf(kind), index);
    this.setFlow(sorted.flow);
    if (this.shown?.kind === kind && this.shown.index === index) this.open({ kind, index: sorted.index });
  }

  private add(kind: string) {
    const found = this.kindOf(kind);
    if (!found || this.flow(kind)) return;
    this.commit({ flows: [...this.document.flows, flowOf(found, firstWordsLanguage(this.answer.languages))] });
    this.open({ kind, index: 0 });
  }
  private removeFlow(kind: string) {
    this.state?.commit(replaceFlow(this.document, kind, null));
    this.removed = kind;
    if (this.shown?.kind === kind) this.open(null);
  }
  private undo() { this.state?.undo(); this.removed = null; }
  private addEmail(kind: string) {
    const flow = this.flow(kind);
    if (!flow || flow.steps.length >= MAX_FLOW_STEPS) return;
    this.setFlow(withEmail(flow));
    this.open({ kind, index: flow.steps.length });
  }
  private removeEmail(kind: string, index: number) {
    const flow = this.flow(kind);
    if (!flow || flow.steps.length < 2) return;
    this.setFlow({ ...flow, steps: flow.steps.filter((_, at) => at !== index) });
    this.open(null);
  }
  open(shown: ShownFlowEmail | null) { this.shown = shown; this.requestUpdate(); this.changed(); }

  render() {
    if (!this.state) return nothing;
    const state = this.state, flows = this.document.flows, missing = this.answer.kinds.filter(kind => !this.flow(kind.kind));
    const removedName = this.removed ? this.kindOf(this.removed)?.name ?? this.removed : '';
    return html`<div class="place-flows">
      <ds-message literal tone="neutral" heading="A flow sends once it is on" text="Each email goes at its time after what starts it, with a link to stop them. An email marked Not sent yet waits for something the site cannot raise yet."></ds-message>
      ${this.failures()}
      <ds-input class="place-flows__offer" literal label="Your offer" aria-label="Your offer" autocomplete="off" maxlength="200" .value=${this.document.offer?.[this.lang] ?? ''}
        @input-change=${(event: CustomEvent<{ value: string }>) => this.setOffer(event.detail.value)} @focusout=${() => void this.flush()}></ds-input>
      <ds-text literal wrap tone="muted" text="What {{offer}} stands for in this language, such as 10% off your first order. An email that uses it is not sent while it is empty."></ds-text>
      ${state.error ? html`<ds-message role="alert" tone="danger" literal heading="The flows could not be saved" text=${state.error}></ds-message>
        <div class="place-email-editor__actions"><ds-button secondary @click=${() => void this.flush()}>Try again</ds-button><ds-button secondary @click=${() => void this.reload()}>Use saved version</ds-button></div>` : nothing}
      ${this.removed ? html`<div class="place-flows__removed"><ds-text literal text=${`${removedName} was taken away.`}></ds-text><ds-button secondary @click=${() => this.undo()}>Undo</ds-button></div>` : nothing}
      ${missing.length ? html`<ds-select class="place-flows__add"><select aria-label="Add a flow" @change=${(event: Event) => { const select = event.target as HTMLSelectElement; this.add(select.value); select.value = ''; }}>
        <option value="" selected>Add a flow…</option>
        ${missing.map(kind => html`<option value=${kind.kind}>${kind.name}</option>`)}
      </select></ds-select>` : nothing}
      ${!flows.length ? html`<ds-empty literal heading="No flows yet" text="Add a flow to start: Welcome, Cart left and After a purchase are the ones to build first."></ds-empty>`
        : flows.map(flow => this.group(flow))}
    </div>`;
  }

  private setOffer(words: string) {
    const offer = { ...this.document.offer };
    if (words.trim()) offer[this.lang] = words.replace(/[\r\n{}]+/g, ' ').slice(0, 200); else delete offer[this.lang];
    this.commit({ ...this.document, offer });
  }
  private toggle(flow: Flow) { this.setFlow({ ...flow, on: !flow.on }); }
  private get hasOffer() { return Boolean((this.document.offer?.[this.lang] ?? Object.values(this.document.offer ?? {}).find(words => words.trim()) ?? '').trim()); }

  /** The latest emails that could not go, by flow and why. */
  private failures() {
    const failed = this.answer.sending?.failures ?? [];
    if (!failed.length) return nothing;
    return html`<ds-message role="status" tone="warning" literal heading="Some emails were not sent" text=${failed.map(each => `${this.kindOf(each.kind)?.name ?? each.kind}, to ${each.email}: ${each.error}`).join(' ')}></ds-message>`;
  }

  private group(flow: Flow) {
    const kind = this.kindOf(flow.kind), name = kind?.name ?? flow.kind, signup = flow.kind === 'welcome' ? this.answer.sending?.signup : undefined;
    return html`<div class="place-flow">
      <ds-list class="place-emails__list" heading=${name}>
        <ds-row class="place-flow__state">
          <ds-switch><button type="button" role="switch" aria-checked=${String(!!flow.on)} aria-label=${`${name} is on`} @click=${() => this.toggle(flow)}></button></ds-switch>
          <span>${flow.on ? 'On' : 'Off'}</span>
          <span class="ds-row__name place-muted">${statsName(this.answer.sending?.stats[flow.kind])}</span>
        </ds-row>
        <ds-row><span class="ds-row__name place-muted">${kind?.trigger ?? ''}</span></ds-row>
        ${signup ? html`<ds-row><span class="ds-row__name">Signup page: <a class="ds-link" href=${signup} target="_blank" rel="noopener">${signup.replace(/^https:\/\//, '')}</a></span></ds-row>` : nothing}
        ${flow.steps.map((step, index) => {
          const { words, from } = wordsOf(step, this.lang, this.answer.languages);
          const subject = templatePreview(words, this.answer.values).subject;
          return html`<ds-row interactive class="place-email" label=${`${whenName(step, kind)}: ${subject || 'No subject yet'}`}
            ?current=${this.shown?.kind === flow.kind && this.shown.index === index} @click=${() => this.open({ kind: flow.kind, index })}>
            <span class="place-flow__when">${whenName(step, kind)}</span>
            ${!blockers(words, step, kind, this.hasOffer).live ? html`<ds-tag class="place-email__kind" data-tone="muted">Not sent yet</ds-tag>`
              : from !== this.lang ? html`<ds-tag class="place-email__kind" data-tone="muted">${from ? 'Not written' : 'Empty'}</ds-tag>` : nothing}
            <span class="ds-row__name place-email__subject ${subject ? '' : 'place-muted'}">${subject || 'No subject yet'}</span>
          </ds-row>`;
        })}
      </ds-list>
      <div class="place-flow__actions">
        ${flow.steps.length < MAX_FLOW_STEPS ? html`<ds-button secondary @click=${() => this.addEmail(flow.kind)}>Add an email</ds-button>` : nothing}
        <ds-button secondary @click=${() => this.removeFlow(flow.kind)}>Take the flow away</ds-button>
      </div>
    </div>`;
  }

  private async reload() {
    try {
      const answer = await siteApi<FlowsAnswer>(this.site, 'emails/flows');
      this.state?.discard(); this.state?.destroy(); this.state = undefined; this.use(answer);
    } catch (error) { if (this.state) { this.state.error = (error as Error).message; this.requestUpdate(); } }
  }

  /** Why this email would not be sent, when it would not. */
  private blocked(words: { subject: string; text: string }, step: FlowStep, kind: FlowKind | undefined) {
    const { live, missing } = blockers(words, step, kind, this.hasOffer);
    if (!live) return html`<ds-message literal tone="neutral" heading="Not sent yet" text="Nothing on the site raises what this email waits for yet. It sends once something does."></ds-message>`;
    return missing.length ? html`<ds-message role="status" literal tone="warning" heading="This email would not be sent" text=${`${missing.map(field => `{{${field}}}`).join(', ')} ${missing.length > 1 ? 'have' : 'has'} no value when it goes. Take ${missing.length > 1 ? 'them' : 'it'} out${missing.includes('offer') ? ', or write your offer above' : ''}.`}></ds-message>` : nothing;
  }

  /** The drawer's title and description for the email shown. */
  drawerHead(): { title: string; description: string } | null {
    const flow = this.shown && this.flow(this.shown.kind), step = flow?.steps[this.shown!.index];
    if (!flow || !step) return null;
    const kind = this.kindOf(flow.kind), { words } = wordsOf(step, this.lang, this.answer.languages);
    return { title: templatePreview(words, this.answer.values).subject || 'No subject yet', description: `${kind?.name ?? flow.kind} · ${whenName(step, kind)}. Previewed with made up people.` };
  }

  /** The email shown, to edit: when it goes, its words in the language chosen, and its preview. */
  drawerBody() {
    const shown = this.shown, flow = shown && this.flow(shown.kind), step = flow?.steps[shown!.index];
    if (!shown || !flow || !step) return nothing;
    const kind = this.kindOf(flow.kind), index = shown.index;
    const own = step.emails[this.lang] ?? { subject: '', text: '' }, { words, from } = wordsOf(step, this.lang, this.answer.languages);
    const fromName = this.answer.languages.find(language => language.code === from)?.name ?? from;
    const write = (field: 'subject' | 'text', value: string) => this.setStep(flow.kind, index, each => ({ ...each, emails: { ...each.emails, [this.lang]: { ...(each.emails[this.lang] ?? { subject: '', text: '' }), [field]: value } } }));
    const offer = this.document.offer?.[this.lang] ?? Object.values(this.document.offer ?? {}).find(each => each.trim());
    const preview = templatePreview(own.subject || own.text ? own : words, { ...this.answer.values, ...(offer?.trim() ? { offer: offer.trim() } : {}) });
    return html`<div class="place-email-editor">
      <div class="place-flow__timing">
        <ds-input literal label="When" aria-label="How long after" type="number" inputmode="numeric" .value=${String(step.delay.amount)}
          @input-change=${(event: CustomEvent<{ value: string }>) => { const amount = Math.max(0, Math.min(365, Math.round(Number(event.detail.value)))); if (Number.isFinite(amount)) this.setTiming(flow.kind, index, each => ({ ...each, delay: { ...each.delay, amount } })); }}></ds-input>
        <ds-select><select aria-label="Unit" @change=${(event: Event) => this.setTiming(flow.kind, index, each => ({ ...each, delay: { ...each.delay, unit: (event.target as HTMLSelectElement).value as DelayUnit } }))}>
          ${DELAY_UNITS.map(unit => html`<option value=${unit} ?selected=${unit === step.delay.unit}>${unit}</option>`)}
        </select></ds-select>
        ${kind && kind.events.length > 1 ? html`<ds-select><select aria-label="After" @change=${(event: Event) => this.setTiming(flow.kind, index, each => ({ ...each, event: (event.target as HTMLSelectElement).value }))}>
          ${kind.events.map(event => html`<option value=${event.id} ?selected=${event.id === step.event}>after ${event.name}</option>`)}
        </select></ds-select>` : html`<ds-text literal tone="muted" text=${`after ${kind?.events[0]?.name ?? step.event}`}></ds-text>`}
      </div>
      ${from && from !== this.lang ? html`<ds-text literal wrap tone="muted" text=${`Not written in this language yet. The preview shows the ${fromName} words.`}></ds-text>` : nothing}
      ${this.blocked(own.subject || own.text ? own : words, step, kind)}
      <ds-input literal label="Subject" aria-label="Email subject" autocomplete="off" maxlength="200" .value=${own.subject} placeholder=${from !== this.lang ? words.subject : ''}
        @input-change=${(event: CustomEvent<{ value: string }>) => write('subject', event.detail.value.replace(/[\r\n]+/g, ' '))} @focusout=${() => void this.flush()}></ds-input>
      <ds-input literal multiline rows="8" max-rows="20" label="Message" aria-label="Email message" maxlength="8000" .value=${own.text} placeholder=${from !== this.lang ? words.text : ''}
        @input-change=${(event: CustomEvent<{ value: string }>) => write('text', event.detail.value)} @focusout=${() => void this.flush()}></ds-input>
      <ds-text literal wrap tone="muted" text=${`Fields: ${(kind?.fields ?? []).map(field => `{{${field}}}`).join(', ')}.`}></ds-text>
      <ds-text literal text="Preview"></ds-text>
      <iframe class="place-email__frame" title=${`Preview: ${preview.subject}`} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer" .srcdoc=${emailDocument(preview.html)}></iframe>
      ${flow.steps.length > 1 ? html`<div class="place-email-editor__actions"><ds-button secondary @click=${() => this.removeEmail(flow.kind, index)}>Take this email away</ds-button></div>` : nothing}
    </div>`;
  }
}
if (!customElements.get('consistency-email-flows')) customElements.define('consistency-email-flows', ConsistencyEmailFlows);
