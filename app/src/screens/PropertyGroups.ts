import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import "../../../DS1/2-core/ds-button";
import "../../../DS1/2-core/ds-icon";
import "../../../DS1/2-core/ds-number";
import type { NumberField } from "../../../DS1/2-core/ds-number";
import "../../../DS1/3-unit/ds-select";
import "../../../DS1/3-unit/ds-tabs";
import { COLOURS, SQUARE, TEXT_SIZES, readLength, readWidth, tokenValue, type ComponentProperty, type ComponentSpec, type WidthMode } from "../component-specs";
import type { PropertyEditing } from "../lib/propertyEditing";
import "./component-editor.css";

const GROUPS = ["Layout", "Shape", "Text", "Colour"] as const;
const WIDTH_LABELS: Record<WidthMode, string> = { hug: "Hug", fill: "Fill", fixed: "Fixed" };

/**
 * A component's properties in their groups (Layout, Shape, Text, Colour), each in whole squares as
 * a design tool sets them, with a reset while it is set. They show a drag's preview and write
 * through `editing`, as the canvas's handles do. A `locked` property (something else draws it)
 * shows its value without a control.
 */
export function propertyGroups(editing: PropertyEditing, spec: ComponentSpec, locked: ReadonlyMap<string, string> = new Map()): TemplateResult[] {
  return GROUPS.flatMap(group => {
    const properties = spec.properties.filter(property => property.group === group);
    return properties.length ? [html`<section class="component-editor-group" aria-label=${group}>
      <h3 class="ds-text ds-text--muted">${group}</h3>
      ${properties.map(property => {
        const pinned = locked.get(property.token);
        return html`<div class="component-editor-property" data-property=${property.token} data-kind=${property.kind}>
          <span class="component-editor-label">${property.label}</span>
          ${pinned === undefined ? html`${control(editing, property)}${reset(editing, property)}`
            : html`<span class="component-editor-pinned" data-token=${property.token}>${/^[\d.]+px$/.test(pinned) ? `${readLength(property, pinned)} px` : "Auto"}</span>`}
        </div>`;
      })}
    </section>`] : [];
  });
}

function reset(editing: PropertyEditing, property: ComponentProperty) {
  return editing.draft.value(property.token) === undefined ? nothing
    : html`<ds-button icon class="component-editor-reset" aria-label=${`Reset ${property.label.toLowerCase()}`} data-testid=${`reset${property.token}`}
      @click=${() => editing.draft.remove(property.token)}><ds-icon type="undo"></ds-icon></ds-button>`;
}

function number(property: ComponentProperty, value: number, options: { step: number; bigStep: number; min: number; max: number; default: number }, onValue: (value: number) => void) {
  const take = (event: Event) => onValue((event.currentTarget as NumberField).value);
  return html`<ds-number label=${ifDefined(property.lead)} aria-label=${property.label} unit="px" width="4"
    .value=${live(value)} step=${options.step} big-step=${options.bigStep} min=${options.min} max=${options.max} default=${options.default}
    data-token=${property.token} @input=${take} @change=${take}></ds-number>`;
}

function control(editing: PropertyEditing, property: ComponentProperty): TemplateResult {
  const written = editing.written(property.token);
  const edit = (value: string) => editing.edit(property.token, value);
  switch (property.kind) {
    case "width": {
      const { mode, squares } = readWidth(property, written);
      const set = (next: { mode: WidthMode; squares: number }) => edit(tokenValue(property, next));
      return html`<div class="component-editor-width">
        <ds-tabs role="group" aria-label=${property.label} data-token=${property.token}>
          ${property.modes!.map(option => html`<ds-button control="host" ?active=${option === mode} aria-pressed=${String(option === mode)} @click=${() => set({ mode: option, squares })}>${WIDTH_LABELS[option]}</ds-button>`)}
        </ds-tabs>
        ${mode === "fixed" ? number(property, squares * SQUARE,
          { step: SQUARE, bigStep: 4 * SQUARE, min: property.min! * SQUARE, max: property.max! * SQUARE, default: Number(property.default) * SQUARE },
          px => set({ mode: "fixed", squares: Math.round(px / SQUARE) })) : nothing}
      </div>`;
    }
    case "text": {
      const value = String(readLength(property, written));
      return html`<ds-select><select aria-label=${property.label} data-token=${property.token}
        @change=${(event: Event) => edit(tokenValue(property, Number((event.currentTarget as HTMLSelectElement).value)))}>
        ${TEXT_SIZES.map(size => html`<option value=${size.value} ?selected=${String(size.value) === value} data-details=${`${size.value}`}>${size.label}</option>`)}
      </select></ds-select>`;
    }
    case "colour": {
      const value = written ?? "";
      return html`<ds-select swatch=${ifDefined(value || undefined)}><select aria-label=${property.label} data-token=${property.token}
        @change=${(event: Event) => edit((event.currentTarget as HTMLSelectElement).value)}>
        <option value="" ?selected=${!value}>Default</option>
        ${COLOURS.map(colour => html`<option value=${colour.value} ?selected=${colour.value === value}>${colour.label}</option>`)}
      </select></ds-select>`;
    }
    default: {
      const value = readLength(property, written);
      return number(property, value,
        { step: property.step!, bigStep: property.bigStep ?? property.step!, min: property.min!, max: property.max!, default: Number(property.default) },
        px => edit(tokenValue(property, px)));
    }
  }
}
