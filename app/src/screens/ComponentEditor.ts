import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import "../../../DS1/3-unit/ds-sidebar";
import type { SidebarItem } from "../../../DS1/3-unit/ds-sidebar";
import "../../../DS1/4-page/ds-page";
import { COMPONENTS, componentSpec, type ComponentSpec } from "../component-specs";
import { BaseDraft } from "../lib/baseDraft";
import { AppElement, defineElement } from "../lib/element";
import { PropertyEditing } from "../lib/propertyEditing";
import { accordion, accordionId, loading } from "../lib/ui";
import { currentLocation, href, navigate } from "../router";
import { draftHistory, draftNotices } from "./BaseEditor";
import "./ComponentCanvas";
import "./component-editor.css";
import { propertyGroups } from "./PropertyGroups";

export class ComponentEditor extends AppElement {
  static override box = true;
  static properties = {
    cssOpen: { state: true },
    collapsed: { state: true },
  };
  declare cssOpen: boolean;
  declare collapsed: boolean;
  readonly draft = new BaseDraft(this);
  readonly editing = new PropertyEditing(this.draft);
  #cssId = accordionId();

  constructor() {
    super();
    this.cssOpen = false;
    this.collapsed = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add("component-editor");
    this.dataset.testid = "component-editor";
  }

  #link(query: Record<string, string>) {
    const search = new URLSearchParams(currentLocation.get().search);
    for (const key of ["component", "view"]) search.delete(key);
    for (const [key, value] of Object.entries(query)) search.set(key, value);
    return `/base${search.size ? `?${search}` : ""}`;
  }

  #navigation(spec: ComponentSpec, view: string | null): TemplateResult {
    const items: SidebarItem[] = [
      { id: "components", label: "Components", depth: 0, expanded: !this.collapsed },
      ...(this.collapsed ? [] : COMPONENTS.map(component => ({ id: `component:${component.id}`, label: component.name, depth: 1, href: href(this.#link({ component: component.id })), current: !view && component.id === spec.id }))),
      { id: "history", label: "History", depth: 0, href: href(this.#link({ view: "history" })), current: view === "history" },
      { id: "tokens", label: "All tokens", depth: 0, href: href(this.#link({ view: "tokens" })) },
    ];
    const activate = (event: CustomEvent<{ id: string }>) => {
      const id = event.detail.id;
      const to = id === "history" ? this.#link({ view: "history" }) : id === "tokens" ? this.#link({ view: "tokens" }) : id.startsWith("component:") ? this.#link({ component: id.slice("component:".length) }) : null;
      if (!to) return;
      event.preventDefault();
      navigate(to);
    };
    return html`<aside slot="nav" class="component-editor-navigation" data-ds-area="Components">
      <ds-sidebar label="Design system 1" disclosure-position="start" expand-icon="chevron-down" collapse-icon="chevron-up" .items=${items}
        @sidebar-activate=${activate}
        @sidebar-toggle=${(event: CustomEvent<{ id: string; expanded: boolean }>) => { if (event.detail.id === "components") this.collapsed = !event.detail.expanded; }}></ds-sidebar>
    </aside>`;
  }

  #inspector(spec: ComponentSpec): TemplateResult {
    const embedded = document.documentElement.hasAttribute("data-docs-embed");
    const own = this.draft.overrides.filter(([token]) => spec.properties.some(property => property.token === token));
    const css = own.length ? `:root {\n${own.map(([token, value]) => `  ${token}: ${value};`).join("\n")}\n}` : "No changes yet.";
    return html`<aside slot="aside" class="component-editor-inspector" data-ds-area="Properties" aria-label=${`${spec.name} properties`}>
      <div class="component-editor-inspector-heading">
        <h2 class="ds-text">${spec.name}</h2>
        <a class="component-editor-link" href=${spec.href} target=${embedded ? "_top" : "_blank"} rel=${ifDefined(embedded ? undefined : "noreferrer")}>Documentation</a>
      </div>
      ${propertyGroups(this.editing, spec)}
      ${accordion(this.#cssId, "CSS", html`<pre class="component-editor-css" data-testid="component-css"><code>${css}</code></pre>`, this.cssOpen, open => { this.cssOpen = open; }, "component-editor-code")}
    </aside>`;
  }

  override render() {
    const draft = this.draft;
    if (draft.failure && draft.base === undefined) return html`<main class="route-splash"><p class="ds-text" role="alert">${draft.failure}</p></main>`;
    if (draft.base === undefined) return html`<main class="route-splash">${loading("Loading Design system 1")}</main>`;
    const { search } = currentLocation.get();
    const view = search.get("view") === "history" ? "history" : null;
    const spec = componentSpec(search.get("component"));
    const embedded = document.documentElement.hasAttribute("data-docs-embed");
    return html`<ds-page class="component-editor-page" layout="inspector" nav-width="8" aside-width="12" resizable resize-key="ds1-component-editor-panes" divided fill drawer>
      ${embedded ? nothing : this.#navigation(spec, view)}
      <main class="component-editor-stage">
        ${draftNotices(draft)}
        ${view === "history" ? html`<section class="component-editor-history" aria-label="History">
          <h1 class="ds-text">History</h1>
          ${draft.history.length ? draftHistory(draft) : html`<p class="ds-text ds-text--muted">Not edited yet</p>`}
        </section>` : html`<ds1-component-canvas .spec=${spec} .editing=${this.editing} .tokens=${Object.fromEntries(draft.overrides)}></ds1-component-canvas>`}
      </main>
      ${view === "history" ? nothing : this.#inspector(spec)}</ds-page>`;
  }
}
defineElement("ds1-component-editor", ComponentEditor);
