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
const WRITE_MS = 500;

export class ConsistencyBehaviourPanel extends LitElement {
  static properties = { target: { attribute: false } };
  target?: BehaviourTarget;
  private pending?: { timer: number; write: () => void };

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this.setAttribute('role', 'complementary'); this.tabIndex = -1; this.addEventListener('keydown', this.onKey); }
  disconnectedCallback() { super.disconnectedCallback(); this.flush(); this.removeEventListener('keydown', this.onKey); }

  refresh() { this.requestUpdate(); }
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
      case 'text': case 'address':
        return html`<ds-input label=${label} aria-label=${label} maxlength=${definition.max ?? 1000} .value=${String(value ?? '')}
          @input=${(event: Event) => { const next = (event.target as HTMLElement & { value: string }).value; if (definition.required && !next.trim()) return; this.later(() => this.set(name, next)); }} @change=${() => this.flush()}></ds-input>`;
      case 'boolean':
        return html`<div class="consistency-behaviour-switch"><span class="consistency-behaviour-label">${label}</span><ds-switch compact monochrome><button type="button" role="switch" aria-checked=${String(value === true)} aria-label=${label} @click=${() => this.set(name, value !== true)}></button></ds-switch></div>`;
      default: return nothing;
    }
  }

  private turns(section: NativeSection, slot: string, definition: SlotDefinition): TemplateResult {
    const turns = turnsOf(section, slot), members = Object.entries(definition.item ?? {}), images = this.target?.images() ?? [];
    const first = definition.type === 'turns' ? 2 : 1, noun = definition.type === 'turns' ? 'turn' : 'field';
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
      ${definition.type === 'turns' ? html`<ds-text literal tone="muted" wrap text="The block as written on the page is the first."></ds-text>` : nothing}
      ${turns.map((turn, index) => html`<fieldset class="consistency-behaviour-turn" aria-label=${`${fieldWords(noun)} ${index + first}`}>
        <div class="consistency-behaviour-turn-head"><ds-text literal tone="muted" text=${String(index + first)}></ds-text>
          <span class="consistency-behaviour-turn-moves">
            <ds-button icon secondary label=${`Move ${noun} ${index + first} up`} ?disabled=${index === 0} @click=${() => this.commit(current => moveTurn(current, slot, index, index - 1))}><ds-icon type="chevron-up"></ds-icon></ds-button>
            <ds-button icon secondary label=${`Move ${noun} ${index + first} down`} ?disabled=${index >= turns.length - 1} @click=${() => this.commit(current => moveTurn(current, slot, index, index + 1))}><ds-icon type="chevron-down"></ds-icon></ds-button>
            <ds-button icon secondary label=${`Remove ${noun} ${index + first}`} ?disabled=${turns.length <= (definition.min ?? 0)} @click=${() => { this.flush(); this.commit(current => removeTurn(current, slot, index)); }}><ds-icon type="delete"></ds-icon></ds-button>
          </span></div>
        ${members.map(([name, member]) => isSlot(member)
          ? member.type === 'picture' ? picture(index, name, member, turn[name] as NativePicture | undefined) : nothing
          : member.type === 'choice' ? html`<label class="consistency-behaviour-field"><span class="consistency-behaviour-label">${fieldWords(name)}</span><ds-select><select aria-label=${`${fieldWords(name)} of ${noun} ${index + first}`} @change=${(event: Event) => { const value = (event.target as HTMLSelectElement).value; write(index, name, value === member.default ? undefined : value, member.required); }}>
              ${(member.choices ?? []).map(choice => html`<option value=${choice} ?selected=${choice === (turn[name] ?? member.default)}>${choiceWords(choice)}</option>`)}</select></ds-select></label>`
          : member.type === 'boolean' ? html`<div class="consistency-behaviour-switch"><span class="consistency-behaviour-label">${fieldWords(name)}</span><ds-switch compact monochrome><button type="button" role="switch" aria-checked=${String(turn[name] === true)} aria-label=${`${fieldWords(name)} of ${noun} ${index + first}`} @click=${() => write(index, name, turn[name] === true ? undefined : true)}></button></ds-switch></div>`
          : html`<ds-input ?multiline=${((member as FieldDefinition).max ?? 0) >= 2000} auto-grow label=${fieldWords(name)} aria-label=${`${fieldWords(name)} of ${noun} ${index + first}`} maxlength=${(member as FieldDefinition).max ?? 1000} .value=${String(turn[name] ?? '')}
              @input=${(event: Event) => { const value = (event.target as HTMLElement & { value: string }).value; if (member.required && !value.trim()) return; this.later(() => write(index, name, value, member.required)); }} @change=${() => this.flush()}></ds-input>`)}
      </fieldset>`)}
      <ds-button secondary ?disabled=${turns.length >= max} @click=${() => { this.flush(); this.commit(current => addTurn(current, slot, definition)); }}>Add ${noun}</ds-button>
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
        ${behaviourMembers(section.kind).map(([name, member]) => isSlot(member) ? member.type === 'turns' || member.type === 'items' ? this.turns(section, name, member) : nothing : this.field(section, name, member))}
      </div>`;
  }
}
customElements.define('consistency-behaviour-panel', ConsistencyBehaviourPanel);
declare global { interface HTMLElementTagNameMap { 'consistency-behaviour-panel': ConsistencyBehaviourPanel } }
