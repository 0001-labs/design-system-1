/**
 * The behaviour panel (Joachim, 16 November 2026): what a block does on a published page, set in a panel at the
 * work's right edge. It is an inspector twelve squares wide, in the room the app's sidebar gives up while it is open
 * (`SidebarEdge.giveWay`), so the page keeps its width. A block's menu opens it with Behaviour and holds none of
 * these members itself.
 *
 * Nothing here is a table of the editor's own: the rows are the members the vocabulary marks `group: 'behaviour'`.
 * A whole number is the Number control, a choice a Select, an on or off a switch, and turns a list of records with
 * a field for each of their members. Every change goes through the page's own history and saves as any other edit;
 * words are written a moment after the last key and at once when the field is left.
 */
import { LitElement, html, nothing, type TemplateResult } from 'lit';
import '../../../DS1/2-core/ds-button';
import '../../../DS1/2-core/ds-icon';
import '../../../DS1/2-core/ds-input';
import '../../../DS1/2-core/ds-number';
import '../../../DS1/2-core/ds-switch';
import '../../../DS1/2-core/ds-text';
import '../../../DS1/3-unit/ds-select';
import type { NativePicture, NativeSection } from '../../../shared/consistency-native-page';
import { isSlot, type FieldDefinition, type MemberDefinition, type SlotDefinition } from '../../../shared/consistency-vocabulary';
import { sectionLabel, sectionValue } from './native-page-model';
import { addTurn, behaviourMembers, moveTurn, removeTurn, turnsOf, writeTurn, type BehaviourTarget } from './behaviour';
export { PANEL_EVENT, hasBehaviour, type BehaviourTarget } from './behaviour';
import { choiceWords, fieldWords } from './native-section-menu';
import './behaviour-panel.css';

const fileName = (src: string) => decodeURIComponent(src.split('/').pop() ?? src);
/** How long words wait after the last key before they are written, in ms. */
const WRITE_MS = 500;

export class ConsistencyBehaviourPanel extends LitElement {
  static properties = { target: { attribute: false } };
  target?: BehaviourTarget;
  /** Words on their way to the page: written after a pause, or at once when the field is left or the panel closes. */
  private pending?: { timer: number; write: () => void };

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this.setAttribute('role', 'complementary'); this.addEventListener('keydown', this.onKey); }
  disconnectedCallback() { super.disconnectedCallback(); this.flush(); this.removeEventListener('keydown', this.onKey); }

  /** The page changed (an edit here, an undo, another hand): draw the block as it stands. */
  refresh() { this.requestUpdate(); }
  /** Writes words still waiting. */
  flush() { const pending = this.pending; if (!pending) return; clearTimeout(pending.timer); this.pending = undefined; pending.write(); }
  private close() { this.flush(); this.dispatchEvent(new CustomEvent('behaviour-close', { bubbles: true })); }
  private readonly onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); this.close(); } };

  private commit(update: (section: NativeSection) => NativeSection) { this.target?.commit(update); }
  private later(write: () => void) { this.flush(); this.pending = { write, timer: window.setTimeout(() => this.flush(), WRITE_MS) }; }
  private set(name: string, value: unknown) { this.commit(section => ({ ...section, [name]: value }) as NativeSection); }

  private field(section: NativeSection, name: string, definition: FieldDefinition): TemplateResult | typeof nothing {
    const label = fieldWords(name), value = sectionValue<unknown>(section, name);
    switch (definition.type) {
      case 'integer': case 'squares':
        return html`<ds-number class="consistency-behaviour-number" label=${label} aria-label=${label} .value=${Number(value ?? definition.min ?? 0)} .step=${definition.step ?? 1} .min=${definition.min} .max=${definition.max} .defaultValue=${typeof definition.default === 'number' ? definition.default : undefined} .width=${10} unit=${definition.type === 'squares' ? 'sq' : name.endsWith('Every') ? 's' : ''}
          @change=${(event: Event) => this.set(name, Number((event.target as HTMLElement & { value: number }).value))}></ds-number>`;
      case 'choice':
        return html`<label class="consistency-behaviour-field"><span class="consistency-behaviour-label">${label}</span><ds-select><select aria-label=${label} .value=${String(value)} @change=${(event: Event) => this.set(name, (event.target as HTMLSelectElement).value)}>
          ${(definition.choices ?? []).map(choice => html`<option value=${choice} ?selected=${choice === value}>${choiceWords(choice)}</option>`)}</select></ds-select></label>`;
      case 'boolean':
        return html`<div class="consistency-behaviour-switch"><span class="consistency-behaviour-label">${label}</span><ds-switch compact monochrome><button type="button" role="switch" aria-checked=${String(value === true)} aria-label=${label} @click=${() => this.set(name, value !== true)}></button></ds-switch></div>`;
      default: return nothing;
    }
  }

  private turns(section: NativeSection, slot: string, definition: SlotDefinition): TemplateResult {
    const turns = turnsOf(section, slot), members = Object.entries(definition.item ?? {}), images = this.target?.images() ?? [];
    const write = (index: number, name: string, value: unknown, required?: boolean) => this.commit(current => writeTurn(current, slot, index, name, value, required));
    const picture = (index: number, name: string, member: MemberDefinition, current: NativePicture | undefined) => {
      const label = fieldWords(name), listed = current && !images.includes(current.src) ? [current.src, ...images] : images;
      return html`<label class="consistency-behaviour-field"><span class="consistency-behaviour-label">${label}</span><ds-select><select aria-label=${`${label} of turn ${index + 2}`} .value=${current?.src ?? ''}
        @change=${(event: Event) => { const src = (event.target as HTMLSelectElement).value; write(index, name, src ? { ...current, src, alt: current?.src === src ? current.alt : '' } : undefined, member.required); }}>
        ${member.required ? nothing : html`<option value="" ?selected=${!current}>As written</option>`}
        ${listed.map(src => html`<option value=${src} ?selected=${src === current?.src}>${fileName(src)}</option>`)}</select></ds-select></label>
        ${current ? html`<ds-input label="Alt" aria-label=${`What the picture of turn ${index + 2} shows`} maxlength="1000" .value=${current.alt ?? ''}
          @input=${(event: Event) => { const alt = (event.target as HTMLElement & { value: string }).value; this.later(() => write(index, name, { ...current, alt }, true)); }} @change=${() => this.flush()}></ds-input>` : nothing}`;
    };
    const max = definition.max ?? 100;
    return html`<section class="consistency-behaviour-turns" aria-label=${fieldWords(slot)}>
      <ds-text literal strong text=${fieldWords(slot)}></ds-text>
      <ds-text literal tone="muted" wrap text="The block as written on the page is the first."></ds-text>
      ${turns.map((turn, index) => html`<fieldset class="consistency-behaviour-turn" aria-label=${`Turn ${index + 2}`}>
        <div class="consistency-behaviour-turn-head"><ds-text literal tone="muted" text=${String(index + 2)}></ds-text>
          <span class="consistency-behaviour-turn-moves">
            <ds-button icon secondary label=${`Move turn ${index + 2} up`} ?disabled=${index === 0} @click=${() => this.commit(current => moveTurn(current, slot, index, index - 1))}><ds-icon type="chevron-up"></ds-icon></ds-button>
            <ds-button icon secondary label=${`Move turn ${index + 2} down`} ?disabled=${index >= turns.length - 1} @click=${() => this.commit(current => moveTurn(current, slot, index, index + 1))}><ds-icon type="chevron-down"></ds-icon></ds-button>
            <ds-button icon secondary label=${`Remove turn ${index + 2}`} @click=${() => { this.flush(); this.commit(current => removeTurn(current, slot, index)); }}><ds-icon type="delete"></ds-icon></ds-button>
          </span></div>
        ${members.map(([name, member]) => isSlot(member)
          ? member.type === 'picture' ? picture(index, name, member, turn[name] as NativePicture | undefined) : nothing
          : html`<ds-input label=${fieldWords(name)} aria-label=${`${fieldWords(name)} of turn ${index + 2}`} maxlength=${(member as FieldDefinition).max ?? 1000} .value=${String(turn[name] ?? '')}
              @input=${(event: Event) => { const value = (event.target as HTMLElement & { value: string }).value; if (member.required && !value.trim()) return; this.later(() => write(index, name, value, member.required)); }} @change=${() => this.flush()}></ds-input>`)}
      </fieldset>`)}
      <ds-button secondary ?disabled=${turns.length >= max} @click=${() => { this.flush(); this.commit(current => addTurn(current, slot, definition)); }}>Add turn</ds-button>
    </section>`;
  }

  render() {
    const section = this.target?.read();
    if (!section) return nothing;
    const heading = `${sectionLabel(section.kind)} behaviour`;
    this.setAttribute('aria-label', heading);
    return html`<header class="consistency-behaviour-head"><ds-text literal strong text=${heading}></ds-text>
        <ds-button icon label="Close" @click=${() => this.close()}><ds-icon type="close"></ds-icon></ds-button></header>
      <div class="consistency-behaviour-body">
        ${behaviourMembers(section.kind).map(([name, member]) => isSlot(member) ? member.type === 'turns' ? this.turns(section, name, member) : nothing : this.field(section, name, member))}
      </div>`;
  }
}
customElements.define('consistency-behaviour-panel', ConsistencyBehaviourPanel);
declare global { interface HTMLElementTagNameMap { 'consistency-behaviour-panel': ConsistencyBehaviourPanel } }
