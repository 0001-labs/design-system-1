import { html, render } from 'lit';
import '../../../DS1/2-core/ds-input';
import './database-view.css';

type State = 'shared' | 'local' | 'waiting';
type Cell = { state: State; place?: boolean; label?: string; tables?: string[]; detail?: string };
type Capability = { id: string; label: string; group: string; tables: string[]; detail?: string };
type Label = { label: string; revision: number };
type Site = {
  id: string; code: string | null; name: string; status: string; build: string | null;
  cells: Record<string, Cell> | null; labels: Record<string, Label>;
};
type Matrix = { capabilities: Capability[]; sites: Site[] };
type Selection = { capability: Capability; site?: Site };
const states = { shared: 'Shared', local: 'Site-owned', waiting: 'Needs setup' };

export function mountDatabaseMatrix(root: HTMLElement) {
  document.title = 'Database matrix | Consistency';
  let data: Matrix | undefined;
  let selection: Selection | undefined;
  let nextSelection: Selection | undefined;
  let error = '';
  let draft = '';
  let saving = false;
  let saveError = '';
  let saved = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function select(capability: Capability, site?: Site) {
    if (saving || saveError || (selection?.site && draft.trim() !== (selection.site.labels[selection.capability.id]?.label ?? ''))) {
      nextSelection = { capability, site };
      if (!saveError) void save();
      return;
    }
    nextSelection = undefined;
    selection = { capability, site };
    draft = site?.labels[capability.id]?.label ?? '';
    saved = false;
    draw();
  }

  async function save() {
    clearTimeout(timer);
    const { site, capability } = selection ?? {};
    if (!site?.code || !capability || saving) return;
    const label = draft.trim();
    const before = site.labels[capability.id];
    if (label === (before?.label ?? '')) {
      saveError = '';
      draw();
      return;
    }
    saving = true;
    saved = false;
    saveError = '';
    draw();
    try {
      const response = await fetch(`/api/consistency/sites/${encodeURIComponent(site.code)}/capability-labels/${capability.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, revision: before?.revision ?? 0 }),
      });
      if (response.status === 409) {
        const latest = await fetch('/api/consistency/database-matrix');
        if (!latest.ok) throw new Error('The current name could not be read.');
        const row = ((await latest.json()) as Matrix).sites.find(item => item.id === site.id);
        if (!row) throw new Error('The site is no longer available.');
        site.labels = row.labels;
        saveError = 'The name changed elsewhere. Review the current name and retry.';
      } else if (!response.ok) {
        saveError = response.status === 400 ? 'Use a name of up to 60 characters.' : 'The name could not be saved.';
      } else {
        site.labels[capability.id] = await response.json() as Label;
        saved = true;
      }
    } catch {
      saveError = 'The name could not be saved.';
    } finally {
      saving = false;
      draw();
      if (!saveError && draft.trim() !== label) void save();
      else if (!saveError && nextSelection) select(nextSelection.capability, nextSelection.site);
    }
  }

  function displayed(site: Site, capability: Capability) {
    return site.labels[capability.id]?.label || site.cells?.[capability.id]?.label || capability.label;
  }

  function matrix(model: Matrix) {
    const groups = new Map<string, number>();
    for (const { group } of model.capabilities) groups.set(group, (groups.get(group) ?? 0) + 1);
    return html`
      <div class="c9y-matrix-frame database-matrix-frame" tabindex="0" aria-label="Site capability grid">
        <table class="c9y-matrix database-matrix" aria-label="Database capabilities by site">
          <thead>
            <tr><th scope="col" rowspan="2" class="c9y-matrix-corner">Site</th>
              ${[...groups].map(([group, count]) => html`<th scope="colgroup" colspan=${count} class="c9y-matrix-group">${group}</th>`)}</tr>
            <tr>${model.capabilities.map(capability => html`<th class="c9y-matrix-column" scope="col">
              <button type="button" class="c9y-link" @click=${() => select(capability)}>${capability.label}</button>
            </th>`)}</tr>
          </thead>
          <tbody>${model.sites.map(site => html`<tr>
            <th scope="row" class="c9y-matrix-row" title=${site.name}>${site.name}
              ${site.status === 'paused' ? html`<small class="c9y-none">Paused</small>` : ''}
            </th>
            ${model.capabilities.map(capability => {
              const cell = site.cells?.[capability.id];
              const state = cell?.state ?? (!site.cells && site.build ? 'unknown' : 'unused');
              const name = displayed(site, capability);
              const status = cell ? states[cell.state] : state === 'unknown' ? 'Configuration unavailable' : site.build ? 'No configuration found' : 'Unpublished';
              const selected = selection?.capability.id === capability.id && selection.site?.id === site.id;
              return html`<td data-state=${state} ?data-selected=${selected}>
                <button class="database-cell" type="button" title=${`${name} · ${status}`}
                  aria-label=${`${site.name}, ${capability.label}, ${name}, ${status}`} aria-pressed=${selected}
                  @click=${() => select(capability, site)}><i aria-hidden="true"></i></button>
              </td>`;
            })}
          </tr>`)}</tbody>
        </table>
      </div>
      <ul class="c9y-matrix-key database-key" aria-label="Legend">
        ${Object.entries(states).map(([state, label]) => html`<li data-state=${state}><i aria-hidden="true"></i>${label}</li>`)}
        <li data-state="unknown"><i aria-hidden="true"></i>Unknown</li>
        <li data-state="unused"><i aria-hidden="true"></i>No configuration found</li>
      </ul>`;
  }

  function details({ capability, site }: Selection) {
    const cell = site?.cells?.[capability.id];
    const tables = cell?.tables ?? capability.tables;
    const fieldName = cell?.place ? 'Name in the app' : 'Display name';
    return html`
      <div class="c9y-detail-body">
        <h2>${site ? `${site.name} · ${capability.label}` : capability.label}</h2>
        ${cell ? html`<p>${states[cell.state]}</p>` : site ? html`<p>${site.build ? site.cells ? 'No configuration found' : 'Configuration unavailable' : 'Unpublished'}</p>` : ''}
        ${cell?.detail || capability.detail ? html`<p>${cell?.detail ?? capability.detail}</p>` : ''}
        ${tables.length ? html`<div><h3>${site && !cell ? 'Shared tables when used' : 'Tables'}</h3>
          <ul>${tables.map(table => html`<li><code>${table}</code></li>`)}</ul></div>` : ''}
        ${site?.code && cell ? html`
          <ds-input literal label=${fieldName} aria-label=${fieldName} maxlength="60"
            placeholder=${cell.label ?? capability.label} .value=${draft}
            @input-change=${(event: CustomEvent<{ value: string }>) => {
              draft = event.detail.value;
              if (saveError) return;
              clearTimeout(timer);
              timer = setTimeout(() => void save(), 450);
            }}
            @focusout=${() => { if (!saveError) void save(); }}
            @keydown=${(event: KeyboardEvent) => {
              if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); void save(); }
            }}></ds-input>
          ${saveError ? html`<p role="alert">${saveError} Current name: ${displayed(site, capability)}.</p>
            <ds-button @click=${() => void save()}>Retry</ds-button>
            <ds-button @click=${() => { draft = site.labels[capability.id]?.label ?? ''; saveError = ''; if (nextSelection) select(nextSelection.capability, nextSelection.site); else draw(); }}>Use current name</ds-button>` :
            html`<p class="c9y-none" role="status">${saving ? 'Saving…' : saved ? 'Saved' : ''}</p>`}
        ` : ''}
      </div>`;
  }

  function draw() {
    render(html`<div class="c9y-system">
      <header class="c9y-head"><h1>Database matrix</h1></header>
      <main class="c9y-main">${data ? matrix(data) : html`<p role="status">${error || 'Loading sites…'}</p>`}</main>
      <aside class="c9y-detail" aria-label="Capability details" ?hidden=${!selection}>${selection ? details(selection) : ''}</aside>
    </div>`, root);
  }

  draw();
  void fetch('/api/consistency/database-matrix')
    .then(async response => {
      if (!response.ok) throw new Error('Could not read sites');
      data = await response.json() as Matrix;
    })
    .catch(() => { error = 'The site matrix is unavailable.'; })
    .finally(draw);
}
